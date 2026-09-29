import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Extracurricular, Student } from '../../types';
import { useData } from '../../context/DataContext';
import { StudentSelector } from '../common/StudentSelector';

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

  useEffect(() => {
    if (isOpen) {
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
      setErrMsg('');
      setCoachNotes('');
    }
  }, [isOpen, students]);

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

        <StudentSelector
          selectedStudentId={selectedStudentId}
          onSelectStudent={(st: Student) => setSelectedStudentId(st.id)}
          label="Pilih Murid yang Didaftarkan (Cari Berdasarkan Kelas / Nama)"
          required
        />

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
