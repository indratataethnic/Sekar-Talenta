import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Extracurricular, Student } from '../../types';
import { useData } from '../../context/DataContext';
import { StudentSelector } from '../common/StudentSelector';

interface ExtracurricularRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  extracurricular?: Extracurricular | null;
  student?: Student | null;
}

export const ExtracurricularRegisterModal: React.FC<ExtracurricularRegisterModalProps> = ({
  isOpen,
  onClose,
  extracurricular,
  student,
}) => {
  const { students, extracurriculars, registerExtracurricularMember, extracurricularMembers } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedEkskulId, setSelectedEkskulId] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrMsg('');
      setCoachNotes('');
      if (student) {
        setSelectedStudentId(student.id);
        setSelectedEkskulId(extracurriculars[0]?.id || '');
      } else if (extracurricular) {
        setSelectedEkskulId(extracurricular.id);
        if (students.length > 0) {
          setSelectedStudentId(students[0].id);
        } else {
          setSelectedStudentId('');
        }
      }
    }
  }, [isOpen, extracurricular, student, students, extracurriculars]);

  const activeEkskul = extracurricular || extracurriculars.find((e) => e.id === selectedEkskulId) || extracurriculars[0];
  const targetStudent = student || students.find((s) => s.id === selectedStudentId);

  const currentMembers = activeEkskul ? extracurricularMembers.filter((m) => m.extracurricularId === activeEkskul.id) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!activeEkskul) {
      setErrMsg('Silakan pilih kegiatan ekstrakurikuler.');
      return;
    }

    if (!targetStudent) {
      setErrMsg('Silakan pilih murid yang didaftarkan terlebih dahulu.');
      return;
    }

    // Check if already registered
    const already = currentMembers.find((m) => m.studentId === targetStudent.id && m.status === 'aktif');
    if (already) {
      setErrMsg(`Murid "${targetStudent.fullName}" sudah terdaftar aktif di ekstrakurikuler ${activeEkskul.name}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerExtracurricularMember({
        extracurricularId: activeEkskul.id,
        extracurricularName: activeEkskul.name,
        studentId: targetStudent.id,
        studentName: targetStudent.fullName,
        studentNis: targetStudent.nis || targetStudent.nisn,
        classId: targetStudent.classId,
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'aktif',
        attendancePercentage: 100,
        coachNotes: coachNotes || 'Anggota baru terdaftar',
      });
      onClose();
      setCoachNotes('');
      setErrMsg('');
    } catch (err: any) {
      console.error('Error registering extracurricular member:', err);
      setErrMsg(err?.message || 'Gagal menyimpan pendaftaran ekstrakurikuler. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pendaftaran ${activeEkskul ? activeEkskul.name : 'Ekstrakurikuler'}`}
      subtitle={
        activeEkskul
          ? `Kapasitas: ${currentMembers.length}/${activeEkskul.capacity || 500} Murid Terdaftar`
          : 'Pilih murid dan ekstrakurikuler'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {errMsg}
          </div>
        )}

        {/* If student prop was provided, pick Extracurricular; otherwise pick Student */}
        {student ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 block">Murid Terpilih:</span>
              <p className="text-xs font-black text-slate-900">{student.fullName} ({student.classId})</p>
              <p className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Ekstrakurikuler yang Diikuti *
              </label>
              <select
                value={selectedEkskulId}
                onChange={(e) => setSelectedEkskulId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
              >
                {extracurriculars.map((ek) => {
                  const mCount = extracurricularMembers.filter((m) => m.extracurricularId === ek.id && m.status === 'aktif').length;
                  return (
                    <option key={ek.id} value={ek.id}>
                      {ek.name} ({ek.category}) • {mCount}/{ek.capacity || 500} Peserta
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        ) : (
          <StudentSelector
            selectedStudentId={selectedStudentId}
            onSelectStudent={(st: Student) => setSelectedStudentId(st.id)}
            label="Pilih Murid yang Didaftarkan (Cari Berdasarkan Kelas / Nama)"
            required
          />
        )}

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
