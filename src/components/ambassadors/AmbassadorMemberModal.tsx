import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AmbassadorMember, AmbassadorType, Student } from '../../types';
import { useData } from '../../context/DataContext';
import { StudentSelector } from '../common/StudentSelector';

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
  const { students, addAmbassadorMember, updateAmbassadorMember, schoolProfile } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [roleTitle, setRoleTitle] = useState('Anggota Tim Duta');
  const [assignedYear, setAssignedYear] = useState(schoolProfile.currentAcademicYear);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [status, setStatus] = useState<'aktif' | 'selesai' | 'alumni'>('aktif');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state on modal open or memberToEdit changes
  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (memberToEdit) {
        await updateAmbassadorMember(memberToEdit.id, {
          roleTitle,
          assignedYear,
          reflectionNotes,
          status
        });
      } else {
        const student = students.find((s) => s.id === selectedStudentId);
        if (!student) {
          alert('Silakan pilih murid terlebih dahulu.');
          setIsSubmitting(false);
          return;
        }
        await addAmbassadorMember({
          studentId: student.id,
          studentName: student.fullName,
          studentNis: student.nis || student.nisn,
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
            <p className="text-[11px] text-slate-500">{memberToEdit.classId} • NIS: {memberToEdit.studentNis}</p>
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
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Penugasan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
