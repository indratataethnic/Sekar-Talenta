import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Upload, Download, CheckCircle2, AlertCircle, FileText, Globe2, School } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Teacher } from '../../types';

interface TeacherCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherCsvImportModal: React.FC<TeacherCsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importTeachersCsv } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [previewTeachers, setPreviewTeachers] = useState<Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sampleTemplate = `No,Nama Guru / Pembina,Jenis Kelamin (L/P),Tipe (Internal/Eksternal),Asal Lembaga / Sanggar,NIP / ID Lisensi,Jabatan / Peran,Tugas Tambahan
1,H. Sudarsono S.Pd. M.M.,L,Internal,-,19680512 199303 1 008,Kepala Sekolah,Penanggung Jawab Utama Program SEKAR TALENTA
2,Indartha Meiputra S.Pd.,L,Internal,-,19850114 200902 1 003,Guru Penggerak & IT,Koordinator Inovasi SEKAR TALENTA
3,Ibu Ratna Dewi S.Pd.,P,Internal,-,19870420 201001 2 015,Guru Kelas 4 A,Koordinator P5
4,Kak Dimas Prasetya S.Sn.,L,Eksternal,Sanggar Seni Tari Suropati Pasuruan,LIS-TARI-01,Instruktur & Koreografer Seni Tari,Pembina Tari Tradisional
5,Sensei Budi Santoso,L,Eksternal,Dojo Bela Diri Karanganyar,LIS-BD-02,Pelatih Bela Diri Karate & Silat,Pelatih O2SN Karate`;

  const handleDownloadTemplate = () => {
    // Add UTF-8 BOM for Microsoft Excel compatibility
    const blob = new Blob(['\uFEFF' + sampleTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_data_guru_dan_pembina_upt_sdn_karanganyar.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setResultMsg({ type: 'error', text: 'Berkas CSV kosong atau tidak memiliki baris data.' });
      return;
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const parsedTeachers: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // Helper find index
    const findIndex = (keywords: string[]) =>
      header.findIndex((h) => keywords.some((k) => h.includes(k)));

    const nameIdx = findIndex(['nama guru', 'nama pembina', 'nama']);
    const genderIdx = findIndex(['jenis kelamin', 'kelamin', 'gender', 'l/p', 'jk', 'sex']);
    const typeIdx = findIndex(['tipe', 'kategori', 'jenis']);
    const orgIdx = findIndex(['asal lembaga', 'sanggar', 'klub', 'lembaga', 'instansi']);
    const nipIdx = findIndex(['nip', 'nuptk', 'id', 'lisensi']);
    const positionIdx = findIndex(['jabatan', 'peran', 'posisi']);
    const dutiesIdx = findIndex(['tugas tambahan', 'tambahan', 'pembina', 'tugas']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const row: string[] = [];
      let inQuotes = false;
      let cur = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      row.push(cur.trim());

      const fullName = (nameIdx !== -1 ? row[nameIdx] : row[1])?.replace(/^"|"$/g, '').trim();

      // Parse gender
      let gender: 'L' | 'P' = 'L';
      if (genderIdx !== -1 && row[genderIdx]) {
        const rawGender = row[genderIdx].replace(/^"|"$/g, '').trim().toUpperCase();
        if (rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') || rawGender.includes('WANITA') || rawGender.includes('FEMALE')) {
          gender = 'P';
        } else {
          gender = 'L';
        }
      } else if (fullName) {
        const lowerName = fullName.toLowerCase();
        if (lowerName.startsWith('ibu') || lowerName.startsWith('bu ') || lowerName.startsWith('ustadzah') || lowerName.includes('dewi') || lowerName.includes('siti') || lowerName.includes('rahayu') || lowerName.includes('safitri') || lowerName.includes('kusuma')) {
          gender = 'P';
        }
      }

      const rawType = (typeIdx !== -1 ? row[typeIdx] : '')?.replace(/^"|"$/g, '').trim().toLowerCase();
      const isExternal = rawType.includes('eksternal') || rawType.includes('luar') || rawType.includes('external');
      const teacherType: 'internal' | 'external' = isExternal ? 'external' : 'internal';

      const organization = (orgIdx !== -1 ? row[orgIdx] : '')?.replace(/^"|"$/g, '').trim();
      const nip = (nipIdx !== -1 ? row[nipIdx] : (row.length === 5 ? row[2] : ''))?.replace(/^"|"$/g, '').trim();
      const position = (positionIdx !== -1 ? row[positionIdx] : (row.length === 5 ? row[3] : ''))?.replace(/^"|"$/g, '').trim() || (isExternal ? 'Pelatih Ekstrakurikuler' : 'Guru');
      const additionalDuties = (dutiesIdx !== -1 ? row[dutiesIdx] : (row.length === 5 ? row[4] : ''))?.replace(/^"|"$/g, '').trim();

      if (fullName) {
        parsedTeachers.push({
          fullName,
          gender,
          teacherType,
          organization: (isExternal && organization && organization !== '-') ? organization : undefined,
          nip: (nip && nip !== '-') ? nip : undefined,
          position,
          additionalDuties: (additionalDuties && additionalDuties !== '-') ? additionalDuties : undefined,
          avatarUrl: '',
          isActive: true
        });
      }
    }

    if (parsedTeachers.length === 0) {
      setResultMsg({
        type: 'error',
        text: 'Tidak ada baris data yang valid terbaca. Pastikan kolom "Nama" terisi.'
      });
      return;
    }

    setPreviewTeachers(parsedTeachers);
    setResultMsg({
      type: 'success',
      text: `Berhasil memindai ${parsedTeachers.length} data pendidik/pembina siap diimpor.`
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResultMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      parseCsvText(content);
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (previewTeachers.length === 0) return;
    setIsProcessing(true);
    try {
      const count = await importTeachersCsv(previewTeachers);
      setResultMsg({
        type: 'success',
        text: `Sukses! ${count} data guru & pembina telah berhasil dimasukkan ke sistem.`
      });
      setTimeout(() => {
        onClose();
        setPreviewTeachers([]);
        setFile(null);
      }, 1200);
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: 'Gagal mengimpor: ' + err.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Impor Data Guru & Pembina (CSV / Excel)"
      subtitle="Unggah berkas spreadsheet pendidik internal dan pembina luar UPT SDN Karanganyar"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Template info banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" /> Format Kolom CSV Fleksibel
            </h4>
            <p className="text-[11px] text-slate-600">
              Format kolom: <strong>No, Nama, Jenis Kelamin (L/P), Tipe (Internal/Eksternal), Asal Lembaga, NIP/ID, Jabatan, Tugas Tambahan</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold shadow-2xs transition-all active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Format Template
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50/60 text-center transition-colors">
          <input
            type="file"
            accept=".csv,text/csv,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="hidden"
            id="csv-teacher-upload"
          />
          <label htmlFor="csv-teacher-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {file ? file.name : 'Klik untuk memilih berkas CSV'}
              </span>
              <span className="text-[11px] text-slate-500">Mendukung guru sekolah maupun pembina eksternal sanggar/klub</span>
            </div>
          </label>
        </div>

        {/* Status Message */}
        {resultMsg && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              resultMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
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

        {/* Preview Table */}
        {previewTeachers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Pratinjau Data ({previewTeachers.length} Baris):
              </span>
              <span className="text-[11px] text-slate-500">Otomatis mendeteksi tipe internal sekolah dan pembina luar</span>
            </div>
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5">No</th>
                    <th className="p-2.5">Nama</th>
                    <th className="p-2.5">L/P</th>
                    <th className="p-2.5">Tipe</th>
                    <th className="p-2.5">Asal Lembaga</th>
                    <th className="p-2.5">Jabatan / Peran</th>
                    <th className="p-2.5">Tugas Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewTeachers.map((t, idx) => {
                    const isExt = t.teacherType === 'external';
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{t.fullName}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.gender === 'P'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {t.gender === 'P' ? 'P' : 'L'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {isExt ? (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                              Eksternal
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                              Internal
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600">{t.organization || '-'}</td>
                        <td className="p-2.5 text-slate-700">{t.position}</td>
                        <td className="p-2.5 text-slate-600">{t.additionalDuties || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={previewTeachers.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Menyimpan ke Sistem...' : `Impor ${previewTeachers.length} Data`}
          </button>
        </div>
      </div>
    </Modal>
  );
};
