import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AmbassadorType, AmbassadorProgram } from '../../types';
import { useData } from '../../context/DataContext';

interface AmbassadorProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambassadorType: AmbassadorType;
  programToEdit?: AmbassadorProgram | null;
}

export const AmbassadorProgramModal: React.FC<AmbassadorProgramModalProps> = ({
  isOpen,
  onClose,
  ambassadorType,
  programToEdit,
}) => {
  const { addAmbassadorProgram, updateAmbassadorProgram, schoolProfile } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('Seluruh Murid Kelas 1-6 SDN Karanganyar');
  const [period, setPeriod] = useState(`Semester ${schoolProfile.currentSemester} ${schoolProfile.currentAcademicYear}`);
  const [status, setStatus] = useState<'perencanaan' | 'berjalan' | 'selesai' | 'dibatalkan'>('berjalan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (programToEdit) {
      setTitle(programToEdit.title);
      setDescription(programToEdit.description || '');
      setTargetAudience(programToEdit.targetAudience || 'Seluruh Murid Kelas 1-6 SDN Karanganyar');
      setPeriod(programToEdit.period || `Semester ${schoolProfile.currentSemester} ${schoolProfile.currentAcademicYear}`);
      setStatus(programToEdit.status || 'berjalan');
    } else {
      setTitle('');
      setDescription('');
      setTargetAudience('Seluruh Murid Kelas 1-6 SDN Karanganyar');
      setPeriod(`Semester ${schoolProfile.currentSemester} ${schoolProfile.currentAcademicYear}`);
      setStatus('berjalan');
    }
  }, [programToEdit, isOpen, schoolProfile.currentSemester, schoolProfile.currentAcademicYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (programToEdit) {
        await updateAmbassadorProgram(programToEdit.id, {
          title,
          description,
          targetAudience,
          period,
          status
        });
      } else {
        await addAmbassadorProgram({
          ambassadorTypeId: ambassadorType.id,
          ambassadorTypeName: ambassadorType.name,
          title,
          description,
          targetAudience,
          period,
          status,
          coachName: ambassadorType.coachName
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
      title={programToEdit ? 'Edit Program Kerja' : `Buat Program Kerja ${ambassadorType.shortName}`}
      subtitle="Rencanakan agenda aksi nyata dan kampanye inspiratif"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama / Judul Program Kerja *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Gerakan Sahabat Ramah Karanganyar"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Deskripsi & Rangkaian Aksi:
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan tujuan, media kampanye, dan pelibatan kawan-kawan di sekolah..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Sasaran Peserta / Target Audiens:
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Periode</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Program</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="perencanaan">Perencanaan</option>
              <option value="berjalan">Sedang Berjalan</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
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
            {isSubmitting ? 'Menyimpan...' : 'Simpan Program'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
