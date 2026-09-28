import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Extracurricular } from '../../types';
import { useData } from '../../context/DataContext';

interface ExtracurricularRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  extracurricular: Extracurricular;
}

export const ExtracurricularRegisterModal: React.FC<ExtracurricularRegisterModalProps> = ({
  isOpen,
  onClose,
  extracurricular,
}) => {
  const { students, registerExtracurricularMember, extracurricularMembers } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [coachNotes, setCoachNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const currentMembers = extracurricularMembers.filter((m) => m.extracurricularId === extracurricular.id);
  const isFull = extracurricular.capacity ? currentMembers.length >= extracurricular.capacity : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    // Check if already registered
    const already = currentMembers.find((m) => m.studentId === student.id);
    if (already) {
      setErrMsg('Murid ini sudah terdaftar pada ekstrakurikuler ini.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerExtracurricularMember({
        extracurricularId: extracurricular.id,
        extracurricularName: extracurricular.name,
        studentId: student.id,
        studentName: student.fullName,
        studentNis: student.nis || student.nisn,
        classId: student.classId,
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'aktif',
        attendancePercentage: 100,
        coachNotes: coachNotes || 'Anggota baru terdaftar',
      });
      onClose();
      setCoachNotes('');
      setErrMsg('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pendaftaran ${extracurricular.name}`}
      subtitle={`Kapasitas: ${currentMembers.length}/${extracurricular.capacity || 30} Murid`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {errMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Pilih Murid yang Didaftarkan *
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-emerald-600"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.classId} - NISN: {s.nisn})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Catatan Minat / Pengalaman Awal:
          </label>
          <textarea
            rows={2}
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            placeholder="Catatan motivasi atau persetujuan orang tua..."
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
            {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Murid'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
