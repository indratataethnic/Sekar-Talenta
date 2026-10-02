import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { ExtracurricularMember, Extracurricular, Student } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Users,
  FileText,
  Zap,
  Filter,
  Search,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';

interface ExtracurricularBatchGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  extracurricular: Extracurricular | null;
  members: ExtracurricularMember[];
}

type GradeType = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';

interface StudentDraftGrade {
  memberId: string;
  studentId: string;
  studentName: string;
  classId: string;
  attendancePercentage: number;
  grade: GradeType;
  reportDescription: string;
  isAlreadyGraded: boolean;
}

export const ExtracurricularBatchGradeModal: React.FC<ExtracurricularBatchGradeModalProps> = ({
  isOpen,
  onClose,
  extracurricular,
  members
}) => {
  const { schoolProfile, students, updateBatchExtracurricularMembers } = useData();
  const { currentUser } = useAuth();

  const [autoMode, setAutoMode] = useState<'attendance' | 'template'>('attendance');
  const [selectedGrade, setSelectedGrade] = useState<GradeType>('Sangat Baik');
  const [templateText, setTemplateText] = useState<string>(
    '{nama} sangat aktif, tekun, dan bersemangat mengikuti kegiatan {ekskul}, menunjukkan penguasaan keterampilan yang baik serta kedisiplinan tinggi ({presensi}%).'
  );
  const [onlyUnassessed, setOnlyUnassessed] = useState<boolean>(true);
  const [academicYear, setAcademicYear] = useState<string>(schoolProfile.currentAcademicYear);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(schoolProfile.currentSemester);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [drafts, setDrafts] = useState<Record<string, StudentDraftGrade>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Generate auto grade helper
  const generateSingleGrade = (
    member: ExtracurricularMember,
    st?: Student
  ): { grade: GradeType; reportDescription: string } => {
    const sName = st?.fullName || member.studentName;
    const ekName = extracurricular?.name || member.extracurricularName || 'Ekstrakurikuler';
    const presensi = member.attendancePercentage ?? 100;

    if (autoMode === 'template') {
      const desc = templateText
        .replace(/\{nama\}/gi, sName)
        .replace(/\{ekskul\}/gi, ekName)
        .replace(/\{presensi\}/gi, `${presensi}`);
      return { grade: selectedGrade, reportDescription: desc };
    }

    // Attendance-based auto grade
    if (presensi >= 85) {
      return {
        grade: 'Sangat Baik',
        reportDescription: `${sName} sangat aktif, tekun, dan bersemangat dalam latihan ${ekName}, menunjukkan penguasaan keterampilan teknis yang sangat baik serta disiplin kehadiran (${presensi}%).`
      };
    } else if (presensi >= 70) {
      return {
        grade: 'Baik',
        reportDescription: `${sName} aktif dan konsisten mengikuti kegiatan ${ekName}, serta mampu bekerjasama dengan baik bersama tim dengan tingkat kehadiran ${presensi}%.`
      };
    } else {
      return {
        grade: 'Cukup',
        reportDescription: `${sName} cukup aktif mengikuti latihan ${ekName} dengan tingkat kehadiran ${presensi}%, perlu ditingkatkan lagi konsistensi kehadirannya.`
      };
    }
  };

  // Populate drafts on modal open or parameter change
  useEffect(() => {
    if (!isOpen || members.length === 0) return;

    const initialDrafts: Record<string, StudentDraftGrade> = {};
    members.forEach((m) => {
      const st = students.find((s) => s.id === m.studentId);
      const isGraded = Boolean(m.grade && m.grade.trim().length > 0);

      let g: GradeType = (m.grade as GradeType) || 'Sangat Baik';
      let desc = m.reportDescription || '';

      // If not graded or not enforcing existing, generate
      if (!isGraded) {
        const auto = generateSingleGrade(m, st);
        g = auto.grade;
        desc = auto.reportDescription;
      }

      initialDrafts[m.id] = {
        memberId: m.id,
        studentId: m.studentId,
        studentName: st?.fullName || m.studentName,
        classId: st?.classId || m.classId,
        attendancePercentage: m.attendancePercentage ?? 100,
        grade: g,
        reportDescription: desc,
        isAlreadyGraded: isGraded
      };
    });

    setDrafts(initialDrafts);
    setAcademicYear(schoolProfile.currentAcademicYear);
    setSemester(schoolProfile.currentSemester);
    setSuccessNotice(null);
  }, [isOpen, members, extracurricular, schoolProfile]);

  // Execute Auto Generate over drafts
  const handleRunAutoGenerate = () => {
    const updated = { ...drafts };
    members.forEach((m) => {
      const st = students.find((s) => s.id === m.studentId);
      const cur = updated[m.id];
      if (!cur) return;

      // Skip if onlyUnassessed is true and it's already graded
      if (onlyUnassessed && cur.isAlreadyGraded && m.grade) {
        return;
      }

      const auto = generateSingleGrade(m, st);
      updated[m.id] = {
        ...cur,
        grade: auto.grade,
        reportDescription: auto.reportDescription
      };
    });
    setDrafts(updated);
  };

  // Draft change handler
  const handleDraftChange = (memberId: string, field: 'grade' | 'reportDescription', value: any) => {
    setDrafts((prev) => {
      const cur = prev[memberId];
      if (!cur) return prev;
      return {
        ...prev,
        [memberId]: {
          ...cur,
          [field]: value
        }
      };
    });
  };

  // Filtered members for display table
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const st = students.find((s) => s.id === m.studentId);
      const name = (st?.fullName || m.studentName).toLowerCase();
      const nis = (st?.nisn || st?.nis || m.studentNis || '').toLowerCase();
      const cls = (st?.classId || m.classId).toLowerCase();
      return name.includes(q) || nis.includes(q) || cls.includes(q);
    });
  }, [members, students, searchQuery]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(drafts).length === 0) return;

    setIsSubmitting(true);
    setSuccessNotice(null);

    try {
      const updatesList = members.map((m) => {
        const d = drafts[m.id];
        return {
          id: m.id,
          updates: {
            grade: d ? d.grade : 'Sangat Baik',
            reportDescription: d ? d.reportDescription : '',
            evaluatedBy: currentUser?.displayName || 'Guru / Pembina Ekskul',
            academicYear,
            semester
          }
        };
      });

      await updateBatchExtracurricularMembers(updatesList);
      setSuccessNotice(`Berhasil menyimpan penilaian massal untuk ${updatesList.length} murid.`);

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving batch grades:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Penilaian Otomatis Massal Ekstrakurikuler"
      subtitle={`Pemberian nilai & narasi kualitatif rapor serentak untuk seluruh murid ${extracurricular?.name || ''}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successNotice && (
          <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Configurations Header */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tahun Pelajaran:
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold bg-white focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Semester Rapor:
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold bg-white focus:outline-emerald-600"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          {/* Mode Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Metode Penilaian Otomatis:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAutoMode('attendance')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  autoMode === 'attendance'
                    ? 'bg-emerald-700 text-white border-emerald-800 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Zap className={`w-4 h-4 flex-shrink-0 ${autoMode === 'attendance' ? 'text-amber-300' : 'text-emerald-600'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">Otomatis Berdasarkan Presensi</p>
                  <p className={`text-[10px] ${autoMode === 'attendance' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Predikat & narasi disesuaikan dengan % kehadiran murid
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAutoMode('template')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  autoMode === 'template'
                    ? 'bg-blue-700 text-white border-blue-800 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className={`w-4 h-4 flex-shrink-0 ${autoMode === 'template' ? 'text-amber-300' : 'text-blue-600'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">Template Serentak (Satu Predikat)</p>
                  <p className={`text-[10px] ${autoMode === 'template' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Terapkan predikat & narasi kustom untuk seluruh murid
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Template Controls if Template Mode */}
          {autoMode === 'template' && (
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2.5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-blue-900 mb-1">
                    Predikat Pilihan:
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as GradeType)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-blue-300 font-bold bg-white text-blue-950"
                  >
                    <option value="Sangat Baik">Sangat Baik (A / SB)</option>
                    <option value="Baik">Baik (B)</option>
                    <option value="Cukup">Cukup (C)</option>
                    <option value="Perlu Bimbingan">Perlu Bimbingan (PB)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] font-bold text-blue-900 mb-1">
                    Template Narasi (Gunakan tag <code>&#123;nama&#125;</code>, <code>&#123;ekskul&#125;</code>, <code>&#123;presensi&#125;</code>):
                  </label>
                  <input
                    type="text"
                    value={templateText}
                    onChange={(e) => setTemplateText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-300 font-medium bg-white focus:outline-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={onlyUnassessed}
                onChange={(e) => setOnlyUnassessed(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>Hanya terapkan pada murid yang belum memiliki nilai</span>
            </label>

            <button
              type="button"
              onClick={handleRunAutoGenerate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-2xs transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> ⚡ Terpkan Auto-Generate Ke Tabel
            </button>
          </div>
        </div>

        {/* Live Draft Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-4 h-4 text-emerald-700" /> Pratinjau & Edit Hasil Penilaian ({filteredMembers.length} Murid):
              </h4>
            </div>

            <div className="w-48 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari murid..."
                className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px] z-10">
                <tr>
                  <th className="p-2.5 w-10 text-center">No</th>
                  <th className="p-2.5 w-44">Nama Murid & Rombel</th>
                  <th className="p-2.5 w-20 text-center">Kehadiran</th>
                  <th className="p-2.5 w-36">Predikat Nilai</th>
                  <th className="p-2.5">Deskripsi Narasi Kualitatif Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      Tidak ada data murid yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m, idx) => {
                    const d = drafts[m.id];
                    if (!d) return null;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 leading-tight">{d.studentName}</p>
                          <span className="text-[10px] text-slate-500 font-semibold">{d.classId}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
                            {d.attendancePercentage}%
                          </span>
                        </td>
                        <td className="p-2.5">
                          <select
                            value={d.grade}
                            onChange={(e) => handleDraftChange(m.id, 'grade', e.target.value as GradeType)}
                            className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
                          >
                            <option value="Sangat Baik">Sangat Baik (SB)</option>
                            <option value="Baik">Baik (B)</option>
                            <option value="Cukup">Cukup (C)</option>
                            <option value="Perlu Bimbingan">Perlu Bimbingan (PB)</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <textarea
                            rows={2}
                            value={d.reportDescription}
                            onChange={(e) => handleDraftChange(m.id, 'reportDescription', e.target.value)}
                            className="w-full p-2 text-[11px] rounded-lg border border-slate-300 focus:outline-emerald-600 font-medium leading-tight bg-slate-50/50"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500 font-medium">
            Total <strong>{members.length} murid</strong> terdaftar pada kegiatan ini.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || members.length === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan Nilai...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Simpan Penilaian Massal ({members.length} Murid)
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
