import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  School,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  FileText
} from 'lucide-react';

interface ExtracurricularReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
  defaultEkskulId?: string;
}

export const ExtracurricularReportExportModal: React.FC<ExtracurricularReportExportModalProps> = ({
  isOpen,
  onClose,
  defaultClassId,
  defaultEkskulId,
}) => {
  const {
    schoolProfile,
    classes,
    extracurriculars,
    extracurricularMembers,
    students
  } = useData();

  const { isGuruKelas, currentUser } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (defaultClassId) return defaultClassId;
    if (isGuruKelas && currentUser?.assignedClass) return currentUser.assignedClass;
    return 'ALL';
  });

  const [selectedEkskul, setSelectedEkskul] = useState<string>(defaultEkskulId || 'ALL');
  const [exportFormat, setExportFormat] = useState<'erapor_csv' | 'print_doc'>('erapor_csv');

  // Filter members based on selected class & ekskul
  const filteredData = useMemo(() => {
    return extracurricularMembers.filter((m) => {
      const matchClass = selectedClass === 'ALL' || m.classId === selectedClass;
      const matchEkskul =
        selectedEkskul === 'ALL' ||
        m.extracurricularId === selectedEkskul ||
        m.extracurricularName?.toLowerCase().includes(selectedEkskul.toLowerCase());
      return matchClass && matchEkskul;
    });
  }, [extracurricularMembers, selectedClass, selectedEkskul]);

  // Export to CSV (Formatted for e-Rapor Dapodik / Excel)
  const handleExportCsv = () => {
    const headers = [
      'No',
      'NISN',
      'NIS',
      'Nama Murid',
      'Kelas',
      'Nama Ekstrakurikuler',
      'Predikat Nilai',
      'Persentase Kehadiran',
      'Deskripsi Capaian Rapor',
      'Penilai / Guru Pembina',
      'Tahun Pelajaran',
      'Semester'
    ];

    const rows = filteredData.map((m, idx) => {
      const st = students.find((s) => s.id === m.studentId);
      return [
        idx + 1,
        `"${st?.nisn || m.studentNis || ''}"`,
        `"${st?.nis || m.studentNis || ''}"`,
        `"${m.studentName}"`,
        `"${m.classId}"`,
        `"${m.extracurricularName}"`,
        `"${m.grade || 'Belum Dinilai'}"`,
        `"${m.attendancePercentage || 100}%"`,
        `"${(m.reportDescription || '').replace(/"/g, '""')}"`,
        `"${m.evaluatedBy || ''}"`,
        `"${m.academicYear || schoolProfile.currentAcademicYear}"`,
        `"${m.semester || schoolProfile.currentSemester}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const classNameClean = selectedClass === 'ALL' ? 'Semua_Kelas' : selectedClass.replace(/\s+/g, '_');
    link.setAttribute('download', `Rekap_Nilai_Rapor_Ekskul_${classNameClean}_${schoolProfile.currentAcademicYear.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print / PDF
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ekspor Nilai Rapor Ekstrakurikuler"
      subtitle="Siap ekspor format CSV e-Rapor & Cetak PDF Resmi UPT SD Negeri Karanganyar"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Format Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setExportFormat('erapor_csv')}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-2 ${
              exportFormat === 'erapor_csv'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              </div>
              {exportFormat === 'erapor_csv' && (
                <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                  TERPILIH
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Format Excel / CSV e-Rapor</h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Format tabel siap salin/unggah ke sistem e-Rapor Dikdasmen & Dapodik.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setExportFormat('print_doc')}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-2 ${
              exportFormat === 'print_doc'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Printer className="w-5 h-5 text-blue-700" />
              </div>
              {exportFormat === 'print_doc' && (
                <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                  TERPILIH
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Format Cetak / PDF Lembar Rekap</h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Dokumen fisik resmi dengan Kop Surat & kolom Tanda Tangan Guru Kelas & Kasek.
              </p>
            </div>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-emerald-700" /> Rombongan Belajar (Kelas):
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isGuruKelas && !!currentUser?.assignedClass}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 disabled:opacity-75"
            >
              <option value="ALL">🔍 Semua Kelas ({extracurricularMembers.length} Data Penilaian)</option>
              {classes.map((c) => {
                const count = extracurricularMembers.filter((m) => m.classId === c.name).length;
                return (
                  <option key={c.id} value={c.name}>
                    {c.name} ({count} Data Penilaian)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Kegiatan Ekstrakurikuler:
            </label>
            <select
              value={selectedEkskul}
              onChange={(e) => setSelectedEkskul(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-emerald-600"
            >
              <option value="ALL">🌟 Semua Ekstrakurikuler</option>
              {extracurriculars.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Preview Summary Box */}
        <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-800">
              Total Data Siap Diekspor: <strong className="text-emerald-800">{filteredData.length} Murid</strong>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
            {filteredData.filter((m) => m.grade).length} Terpenuhi Nilainya
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>

          {exportFormat === 'erapor_csv' ? (
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredData.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Unduh File CSV e-Rapor
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePrint}
              disabled={filteredData.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" /> Cetak Lembar Rekap Resmi
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
