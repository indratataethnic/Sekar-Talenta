import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Upload, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
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

  const sampleTemplate = `No,Nama Guru,NIP,Jabatan,Tugas Tambahan,No Telepon,Email
1,H. Sudarsono S.Pd. M.M.,19680512 199303 1 008,Kepala Sekolah,Penanggung Jawab Utama Program SEKAR TALENTA,081234567001,sudarsono.uptsdnkaranganyar@gmail.com
2,Indartha Meiputra S.Pd.,19850114 200902 1 003,Guru Penggerak & IT,Koordinator Inovasi SEKAR TALENTA & Pembina Duta Digital,081234567002,indartha.meiputra22@admin.sd.belajar.id
3,Ibu Ratna Dewi S.Pd.,19870420 201001 2 015,Guru Kelas 4 A,Pembina Seni Tari & Koordinator P5,081234567003,ratnadewi@guru.sd.belajar.id
4,Bapak Ahmad Fauzi S.Pd.,19890815 201403 1 005,Guru Pendidikan Agama Islam (PAI),Ketua TPPK & Pembina Duta TPPK,081234567004,ahmadfauzi@guru.sd.belajar.id
5,Bapak Rian Hidayat S.Pd.Kor.,19881009 201402 1 004,Guru PJOK (Penjasorkes),Pelatih Bulu Tangkis & Koordinator O2SN,081234567016,rianhidayat@guru.sd.belajar.id`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_data_guru_upt_sdn_karanganyar.csv');
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

    const nameIdx = findIndex(['nama guru', 'nama', 'guru']);
    const nipIdx = findIndex(['nip', 'nuptk']);
    const positionIdx = findIndex(['jabatan', 'tugas']);
    const dutiesIdx = findIndex(['tugas tambahan', 'tambahan', 'pembina']);
    const phoneIdx = findIndex(['telepon', 'no wa', 'wa', 'hp', 'kontak']);
    const emailIdx = findIndex(['email', 'surel']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV split considering quotes
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
      const nip = (nipIdx !== -1 ? row[nipIdx] : row[2])?.replace(/^"|"$/g, '').trim();
      const position = (positionIdx !== -1 ? row[positionIdx] : row[3])?.replace(/^"|"$/g, '').trim() || 'Guru';
      const additionalDuties = (dutiesIdx !== -1 ? row[dutiesIdx] : row[4])?.replace(/^"|"$/g, '').trim();
      const phone = (phoneIdx !== -1 ? row[phoneIdx] : row[5])?.replace(/^"|"$/g, '').trim();
      const email = (emailIdx !== -1 ? row[emailIdx] : row[6])?.replace(/^"|"$/g, '').trim();

      if (fullName) {
        parsedTeachers.push({
          fullName,
          nip: nip || undefined,
          position,
          additionalDuties: additionalDuties || undefined,
          phone: phone || undefined,
          email: email || undefined,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
          isActive: true
        });
      }
    }

    if (parsedTeachers.length === 0) {
      setResultMsg({
        type: 'error',
        text: 'Tidak ada baris data guru yang valid terbaca. Pastikan kolom "Nama Guru" terisi.'
      });
      return;
    }

    setPreviewTeachers(parsedTeachers);
    setResultMsg({
      type: 'success',
      text: `Berhasil memindai ${parsedTeachers.length} data guru siap diimpor.`
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
        text: `Sukses! ${count} data guru telah berhasil dimasukkan ke sistem.`
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
      title="Impor Data Guru (CSV / Excel)"
      subtitle="Unggah berkas spreadsheet guru & tenaga pendidik UPT SDN Karanganyar"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Template info banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" /> Format Kolom CSV Standar
            </h4>
            <p className="text-[11px] text-slate-600">
              Format kolom: <strong>No, Nama Guru, NIP, Jabatan, Tugas Tambahan, No Telepon, Email</strong>
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
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
          <input
            type="file"
            accept=".csv, text/csv, application/vnd.ms-excel"
            onChange={handleFileChange}
            id="csv-teacher-upload"
            className="hidden"
          />
          <label htmlFor="csv-teacher-upload" className="cursor-pointer space-y-2 block">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {file ? file.name : 'Klik untuk memilih berkas CSV data guru'}
            </p>
            <p className="text-[11px] text-slate-400">Mendukung format berkas .csv (Pemisah tanda koma)</p>
          </label>
        </div>

        {/* Message Alert */}
        {resultMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Pratinjau Data ({previewTeachers.length} Guru Terdeteksi):
              </span>
              <span className="text-[11px] text-slate-400">Menampilkan 5 baris pertama</span>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100/80 text-[11px] uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="p-2.5">No</th>
                    <th className="p-2.5">Nama Guru</th>
                    <th className="p-2.5">NIP</th>
                    <th className="p-2.5">Jabatan</th>
                    <th className="p-2.5">Tugas Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewTeachers.slice(0, 5).map((t, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-800">{t.fullName}</td>
                      <td className="p-2.5 font-mono text-slate-600">{t.nip || '-'}</td>
                      <td className="p-2.5 text-emerald-800 font-semibold">{t.position}</td>
                      <td className="p-2.5 text-slate-600">{t.additionalDuties || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={previewTeachers.length === 0 || isProcessing}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isProcessing ? 'Mengimpor...' : `Impor ${previewTeachers.length} Data Guru`}
          </button>
        </div>
      </div>
    </Modal>
  );
};
