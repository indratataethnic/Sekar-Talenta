import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { AmbassadorMember, AmbassadorType, Student } from '../../types';
import { useData } from '../../context/DataContext';
import { StudentSelector } from '../common/StudentSelector';
import { checkAmbassadorAssignment } from '../../utils/ruleValidation';

interface AmbassadorMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambassadorType: AmbassadorType;
  memberToEdit?: AmbassadorMember | null;
}

export const AmbassadorMemberModal: React.FC<AmbassadorMemberModalProps> = ({
  isOpen,
  onClose,
  ambassadorType,
  memberToEdit,
}) => {
  const { students, addAmbassadorMember, updateAmbassadorMember, ambassadorMembers, schoolProfile } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [roleTitle, setRoleTitle] = useState('Anggota Tim Duta');
  const [assignedYear, setAssignedYear] = useState(schoolProfile.currentAcademicYear);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [status, setStatus] = useState<'aktif' | 'selesai' | 'alumni'>('aktif');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize state on modal open or memberToEdit changes
  useEffect(() => {
    setErrorMessage('');
    if (memberToEdit) {
      setSelectedStudentId(memberToEdit.studentId);
      setRoleTitle(memberToEdit.roleTitle || 'Anggota Tim Duta');
      setAssignedYear(memberToEdit.assignedYear || schoolProfile.currentAcademicYear);
      setReflectionNotes(memberToEdit.reflectionNotes || '');
      setStatus(memberToEdit.status || 'aktif');
    } else {
      setSelectedStudentId(students[0]?.id || '');
      setRoleTitle('Anggota Tim Duta');
      setAssignedYear(schoolProfile.currentAcademicYear);
      setReflectionNotes('');
      setStatus('aktif');
    }
  }, [memberToEdit, isOpen, students, schoolProfile.currentAcademicYear]);

  // Validation: Only 1 active ambassador role per student in the same period
  const validation = useMemo(() => {
    if (!selectedStudentId) return { isAllowed: true };
    // If editing and status is not changing to active, allow
    if (memberToEdit && status !== 'aktif') return { isAllowed: true };
    return checkAmbassadorAssignment(
      selectedStudentId,
      assignedYear,
      ambassadorMembers,
      memberToEdit?.id
    );
  }, [selectedStudentId, assignedYear, ambassadorMembers, memberToEdit, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!memberToEdit && !validation.isAllowed) {
      setErrorMessage(validation.errorMessage || 'Murid sudah memiliki keanggotaan Duta aktif pada periode ini.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (memberToEdit) {
        await updateAmbassadorMember(memberToEdit.id, {
          roleTitle,
          assignedYear,
          reflectionNotes,
          status,
          endDate: status !== 'aktif' ? new Date().toISOString().split('T')[0] : undefined
        });
      } else {
        const student = students.find((s) => s.id === selectedStudentId);
        if (!student) {
          setErrorMessage('Silakan pilih murid terlebih dahulu.');
          setIsSubmitting(false);
          return;
        }
        await addAmbassadorMember({
          studentId: student.id,
          studentName: student.fullName,
          studentNis: student.nisn || student.nis || '',
          classId: student.classId,
          ambassadorTypeId: ambassadorType.id,
          ambassadorTypeCode: ambassadorType.code,
          ambassadorTypeName: ambassadorType.name,
          assignedYear,
          startDate: new Date().toISOString().split('T')[0],
          coachName: ambassadorType.coachName,
          status: 'aktif',
          roleTitle,
          reflectionNotes,
          contributionsCount: 1,
        });
      }
      onClose();
    } catch (err: any) {
      console.error('Error assigning ambassador member:', err);
      setErrorMessage(err?.message || 'Gagal menyimpan data keanggotaan Duta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Penugasan Duta' : `Penugasan Anggota ${ambassadorType.shortName}`}
      subtitle="Pilih murid dan berikan amanah peran kepemimpinan"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {!memberToEdit ? (
          <StudentSelector
            selectedStudentId={selectedStudentId}
            onSelectStudent={(st: Student) => setSelectedStudentId(st.id)}
            label="Pilih Murid (Cari Berdasarkan Kelas / Nama)"
            required
          />
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-800">{memberToEdit.studentName}</p>
            <p className="text-[11px] text-slate-500">
              {memberToEdit.classId} • NISN: {students.find((s) => s.id === memberToEdit.studentId)?.nisn || memberToEdit.studentNis || '-'}
            </p>
          </div>
        )}

        {/* Peringatan jika murid sudah aktif di duta lain pada periode yang sama */}
        {!memberToEdit && !validation.isAllowed && (
          <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-rose-900">
                  Pelanggaran Aturan Keanggotaan Duta Sekolah
                </h4>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {validation.errorMessage}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-rose-700 font-medium pl-7">
              💡 Saran: Jika masa tugas murid pada duta sebelumnya telah selesai, ubah status keanggotaan lamanya menjadi <strong>"Selesai / Alumni"</strong> terlebih dahulu agar dapat didaftarkan ke Duta baru.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Judul Peran / Penugasan Khusus *
          </label>
          <input
            type="text"
            required
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Contoh: Koordinator Kampanye Ramah Teman Kelas 4"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tahun Penugasan
            </label>
            <input
              type="text"
              value={assignedYear}
              onChange={(e) => setAssignedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai Tugas</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Catatan Komitmen & Refleksi Awal:
          </label>
          <textarea
            rows={2}
            value={reflectionNotes}
            onChange={(e) => setReflectionNotes(e.target.value)}
            placeholder="Harapan dan kesediaan murid dalam menjalankan peran Duta..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!memberToEdit && !validation.isAllowed)}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs active:scale-95 transition-all ${
              !memberToEdit && !validation.isAllowed
                ? 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50'
            }`}
          >
            {isSubmitting
              ? 'Menyimpan...'
              : !memberToEdit && !validation.isAllowed
              ? 'Aturan Duta Terlanggar'
              : 'Simpan Penugasan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
