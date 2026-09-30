import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ExtracurricularMember, Extracurricular } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Award, CheckCircle2, User, FileText, Check } from 'lucide-react';

interface ExtracurricularGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ExtracurricularMember | null;
  extracurricular: Extracurricular | null;
}

export const ExtracurricularGradeModal: React.FC<ExtracurricularGradeModalProps> = ({
  isOpen,
  onClose,
  member,
  extracurricular,
}) => {
  const { updateExtracurricularMember, schoolProfile } = useData();
  const { currentUser } = useAuth();

  const [grade, setGrade] = useState<'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan'>('Sangat Baik');
  const [attendancePercentage, setAttendancePercentage] = useState<number>(100);
  const [reportDescription, setReportDescription] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(schoolProfile.currentAcademicYear);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(schoolProfile.currentSemester);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    if (isOpen && member) {
      setGrade(member.grade || 'Sangat Baik');
      setAttendancePercentage(member.attendancePercentage !== undefined ? member.attendancePercentage : 100);
      setReportDescription(member.reportDescription || generateDefaultDescription(member.studentName, extracurricular?.name || member.extracurricularName, member.grade || 'Sangat Baik'));
      setAcademicYear(member.academicYear || schoolProfile.currentAcademicYear);
      setSemester(member.semester || schoolProfile.currentSemester);
      setSuccessNotice(false);
      setErrorNotice('');
    }
  }, [isOpen, member, extracurricular, schoolProfile]);

  function generateDefaultDescription(
    stName: string,
    ekName: string,
    selectedGrade: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan'
  ): string {
    const sName = stName || 'Murid';
    const eName = ekName || 'ekstrakurikuler';

    if (selectedGrade === 'Sangat Baik') {
      return `${sName} sangat aktif dan bersemangat mengikuti latihan ${eName}, menunjukkan penguasaan keterampilan serta disiplin yang sangat baik.`;
    } else if (selectedGrade === 'Baik') {
      return `${sName} aktif mengikuti latihan ${eName} dan mampu menguasai teknik dasar dengan baik serta menunjukkan sikap tekun.`;
    } else if (selectedGrade === 'Cukup') {
      return `${sName} cukup aktif mengikuti latihan ${eName} dan perlu terus meningkatkan konsistensi kehadiran serta latihan mandiri.`;
    } else {
      return `${sName} perlu pendampingan dan motivasi tambahan dalam mengikuti latihan ${eName} agar lebih percaya diri.`;
    }
  }

  const handleGenerateDescription = () => {
    if (!member) return;
    const desc = generateDefaultDescription(member.studentName, extracurricular?.name || member.extracurricularName, grade);
    setReportDescription(desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!reportDescription.trim()) {
      setErrorNotice('Deskripsi capaian rapor wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice('');
    try {
      await updateExtracurricularMember(member.id, {
        grade,
        attendancePercentage: Number(attendancePercentage) || 100,
        reportDescription: reportDescription.trim(),
        academicYear,
        semester,
        evaluatedBy: currentUser?.displayName || 'Guru Pembina',
        evaluatedAt: new Date().toISOString()
      });

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error saving grade:', err);
      setErrorNotice(err?.message || 'Terjadi kesalahan saat menyimpan nilai rapor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Nilai & Deskripsi Rapor Ekstrakurikuler"
      subtitle={`Penilaian Rapor Kurikulum Merdeka - UPT SD Negeri Karanganyar`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorNotice && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorNotice}
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Nilai dan deskripsi rapor berhasil disimpan ke Cloud Database!
          </div>
        )}

        {/* Member Header Info */}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
            {member.studentName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-slate-900 truncate">{member.studentName}</h4>
            <p className="text-[11px] text-slate-500">
              Rombel: <strong className="text-emerald-800">{member.classId}</strong> • NIS: {member.studentNis}
            </p>
            <p className="text-[11px] text-emerald-900 font-bold mt-0.5">
              Kegiatan: {extracurricular?.name || member.extracurricularName}
            </p>
          </div>
        </div>

        {/* Period & Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Pelajaran *</label>
            <input
              type="text"
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Semester *</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
        </div>

        {/* Predicate Grade Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Predikat Capaian Rapor *</span>
            <span className="text-[11px] text-emerald-800 font-semibold">Skala Kurikulum Merdeka</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { val: 'Sangat Baik', label: '⭐ Sangat Baik (A)', color: 'bg-emerald-700 text-white border-emerald-800' },
                { val: 'Baik', label: '👍 Baik (B)', color: 'bg-blue-600 text-white border-blue-700' },
                { val: 'Cukup', label: '🌱 Cukup (C)', color: 'bg-amber-500 text-white border-amber-600' },
                { val: 'Perlu Bimbingan', label: '⚠️ Perlu Bimbingan (D)', color: 'bg-rose-600 text-white border-rose-700' }
              ] as const
            ).map((opt) => {
              const isSelected = grade === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    setGrade(opt.val);
                    // auto generate matching description on change if empty or auto
                    const newDesc = generateDefaultDescription(member.studentName, extracurricular?.name || member.extracurricularName, opt.val);
                    setReportDescription(newDesc);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? `${opt.color} shadow-xs ring-2 ring-emerald-500`
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attendance Percentage */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Persentase Kehadiran Latihan (%):
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              value={attendancePercentage}
              onChange={(e) => setAttendancePercentage(Number(e.target.value))}
              className="w-28 px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
            <span className="text-xs font-semibold text-slate-500">
              {attendancePercentage >= 85 ? '🟢 Kehadiran Sangat Baik' : attendancePercentage >= 70 ? '🔵 Kehadiran Cukup Baik' : '🔴 Perlu Ditingkatkan'}
            </span>
          </div>
        </div>

        {/* Report Narrative Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              Deskripsi Capaian Rapor (Narasi Kualitatif):
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Generate Narasi
            </button>
          </div>
          <textarea
            required
            rows={3}
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Tuliskan narasi capaian kualitatif murid untuk Rapor..."
            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium leading-relaxed"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Nilai Rapor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
