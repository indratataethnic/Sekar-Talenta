import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Download, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importStudentsCsv, schoolProfile, classes } = useData();
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sampleTemplate = `NISN,Nama Murid,Kelas,Jenis Kelamin,Nama Orang Tua,No WA Orang Tua,Alamat
0123456791,Muhammad Rizky Pratama,Kelas 1 A,L,Bapak Pratama,081234567801,Jl. Pahlawan No. 12 Kota Pasuruan
0123456792,Aulia Zahra Ramadhani,Kelas 1 B,P,Ibu Ramadhani,081234567802,Jl. Diponegoro No. 45 Kota Pasuruan
0123456793,Daffa Al Farizi,Kelas 2 A,L,Bapak Al Farizi,081234567803,Jl. Veteran No. 8 Kota Pasuruan
0123456794,Naila Putri Salsabila,Kelas 4 B,P,Ibu Salsabila,081234567804,Jl. Panglima Sudirman No. 20 Kota Pasuruan`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_murid_sekar_talenta.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  // Helper to split CSV row respecting quoted values
  const parseCsvLine = (line: string, delimiter: string = ','): string[] => {
    const values: string[] = [];
    let currentVal = '';
    let insideQuote = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          currentVal += '"';
          i++; // Skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === delimiter && !insideQuote) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());
    return values;
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setResultMsg({ type: 'error', text: 'Silakan unggah file CSV atau tempel teks data CSV terlebih dahulu.' });
      return;
    }

    setIsProcessing(true);
    setResultMsg(null);

    try {
      const rawLines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (rawLines.length < 2) {
        throw new Error('Format CSV tidak valid. Harus memiliki 1 baris judul kolom (header) dan minimal 1 baris data murid.');
      }

      // Detect delimiter (, or ;)
      const firstLine = rawLines[0];
      const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

      const rawHeaders = parseCsvLine(rawLines[0], delimiter).map((h) =>
        h.toLowerCase().replace(/[^a-z0-9]/g, '')
      );

      // Map header indices
      let nisnIdx = rawHeaders.findIndex((h) => h.includes('nisn'));
      let nameIdx = rawHeaders.findIndex((h) => h.includes('nama') || h.includes('fullname') || h.includes('murid') || h.includes('siswa'));
      let classIdx = rawHeaders.findIndex((h) => h.includes('kelas') || h.includes('rombel') || h.includes('class'));
      let genderIdx = rawHeaders.findIndex((h) => h.includes('kelamin') || h.includes('gender') || h.includes('jk') || h === 'lp');
      let parentNameIdx = rawHeaders.findIndex((h) => h.includes('orangtua') || h.includes('wali') || h.includes('parent'));
      let parentPhoneIdx = rawHeaders.findIndex((h) => h.includes('wa') || h.includes('telepon') || h.includes('phone') || h.includes('kontak') || h.includes('hp'));
      let addressIdx = rawHeaders.findIndex((h) => h.includes('alamat') || h.includes('address') || h.includes('domisili'));

      // If headers match exact standard positions when not detected by name
      if (nisnIdx === -1) nisnIdx = 0;
      if (nameIdx === -1) nameIdx = 1;
      if (classIdx === -1) classIdx = 2;
      if (genderIdx === -1) genderIdx = 3;
      if (parentNameIdx === -1) parentNameIdx = 4;
      if (parentPhoneIdx === -1) parentPhoneIdx = 5;
      if (addressIdx === -1) addressIdx = 6;

      const parsedStudents: any[] = [];
      const existingClasses = classes.map((c) => c.name);

      for (let i = 1; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        const cols = parseCsvLine(line, delimiter);
        const nisnVal = (cols[nisnIdx] || '').replace(/[^0-9]/g, '');
        const nameVal = (cols[nameIdx] || '').trim();
        let classVal = (cols[classIdx] || '').trim();
        const rawGender = (cols[genderIdx] || '').toUpperCase().trim();
        const parentNameVal = (cols[parentNameIdx] || '').trim();
        const parentPhoneVal = (cols[parentPhoneIdx] || '').trim();
        const addressVal = (cols[addressIdx] || '').trim();

        if (!nameVal && !nisnVal) continue;

        // Normalize gender
        let gender: 'L' | 'P' = 'L';
        if (rawGender.startsWith('P') || rawGender === 'PEREMPUAN' || rawGender === 'WANITA') {
          gender = 'P';
        }

        // Normalize class into standard format e.g. "Kelas 1 A", "Kelas 2 B"
        if (classVal) {
          const classClean = classVal.replace(/^kelas\s*/i, '').trim();
          const match = classClean.match(/^(\d+)\s*([a-zA-Z]+)?$/);
          if (match) {
            const grade = match[1];
            const letter = (match[2] || 'A').toUpperCase();
            classVal = `Kelas ${grade} ${letter}`;
          } else if (!classVal.toLowerCase().startsWith('kelas')) {
            classVal = `Kelas ${classVal}`;
          }
        }
        if (!classVal || (!existingClasses.includes(classVal) && !classVal.match(/Kelas \d\s*[A-Z]/i))) {
          classVal = classes[0]?.name || 'Kelas 1 A';
        }

        parsedStudents.push({
          nisn: nisnVal || `00${Date.now().toString().slice(-8)}${i}`,
          nis: `4${Math.floor(100 + Math.random() * 900)}`,
          fullName: nameVal || `Murid Baru ${i}`,
          gender,
          birthPlace: 'Pasuruan',
          birthDate: '2014-01-01',
          classId: classVal,
          academicYear: schoolProfile.currentAcademicYear,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nameVal || `murid_${i}`)}`,
          isActive: true,
          parentName: parentNameVal,
          parentPhone: parentPhoneVal,
          address: addressVal,
          notes: 'Diimpor dari berkas CSV'
        });
      }

      if (parsedStudents.length === 0) {
        throw new Error('Tidak ada baris data murid yang valid ditemukan pada berkas CSV.');
      }

      const count = await importStudentsCsv(parsedStudents);
      setResultMsg({
        type: 'success',
        text: `Berhasil mengimpor ${count} data murid ke dalam sistem SEKAR TALENTA.`
      });
      setTimeout(() => {
        onClose();
        setResultMsg(null);
        setCsvText('');
      }, 1500);
    } catch (err: any) {
      setResultMsg({ type: 'error', text: err.message || 'Gagal memproses berkas CSV.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Impor Data Murid (CSV)"
      subtitle="Format: NISN, Nama Murid, Kelas, Jenis Kelamin, Nama Orang Tua, No WA Orang Tua, Alamat"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Template download notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Format Kolom Standar SEKAR TALENTA:
              </p>
              <p className="text-[11px] text-emerald-800">
                NISN, Nama Murid, Kelas, Jenis Kelamin (L/P), Nama Orang Tua, No WA, Alamat
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Template CSV
          </button>
        </div>

        {/* Upload file box */}
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 text-center transition-colors bg-slate-50/50">
          <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-800">Pilih berkas spreadsheet CSV dari perangkat</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mendukung pemisah koma (,) atau titik-koma (;)</p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="mt-2.5 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
          />
        </div>

        {/* Text area fallback */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Atau Tempelkan (Paste) Teks CSV di Bawah Ini:
          </label>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`NISN,Nama Murid,Kelas,Jenis Kelamin,Nama Orang Tua,No WA Orang Tua,Alamat\n0123456791,Muhammad Rizky Pratama,Kelas 4A,L,Bapak Pratama,081234567801,Jl. Pahlawan No. 12 Pasuruan`}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
          />
        </div>

        {resultMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              resultMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {resultMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{resultMsg.text}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isProcessing}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Memproses Impor...' : 'Mulai Impor Data Murid'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
