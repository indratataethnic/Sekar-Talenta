import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { Achievement } from '../../types';
import { useData } from '../../context/DataContext';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievementToEdit?: Achievement | null;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  achievementToEdit,
}) => {
  const { students, addAchievement, updateAchievement } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState(
    achievementToEdit?.studentId || students[0]?.id || ''
  );
  const [title, setTitle] = useState(achievementToEdit?.title || '');
  const [eventName, setEventName] = useState(achievementToEdit?.eventName || '');
  const [level, setLevel] = useState<'sekolah' | 'kecamatan' | 'kota' | 'provinsi' | 'nasional'>(
    achievementToEdit?.level || 'kota'
  );
  const [rank, setRank] = useState<any>(achievementToEdit?.rank || 'Juara 1');
  const [category, setCategory] = useState(achievementToEdit?.category || 'Seni Budaya');
  const [date, setDate] = useState(achievementToEdit?.date || new Date().toISOString().split('T')[0]);
  const [coachName, setCoachName] = useState(achievementToEdit?.coachName || '');
  const [notes, setNotes] = useState(achievementToEdit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student || !title.trim()) return;

    setIsSubmitting(true);
    try {
      if (achievementToEdit) {
        await updateAchievement(achievementToEdit.id, {
          title,
          eventName,
          level,
          rank,
          category,
          date,
          coachName,
          notes
        });
      } else {
        await addAchievement({
          studentId: student.id,
          studentName: student.fullName,
          classId: student.classId,
          title,
          eventName,
          level,
          rank,
          category,
          date,
          coachName,
          notes
        });
        // Fire celebratory confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
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
      title={achievementToEdit ? 'Edit Prestasi & Penghargaan' : 'Catat Prestasi & Penghargaan Baru'}
      subtitle="Apresiasi pencapaian lomba, festival, atau kejuaraan murid"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Pilih Murid Berprestasi *
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
            Judul Prestasi / Capaian *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Juara 1 Lomba Seni Tari Kreasi FLS2N"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Ajang / Event / Kejuaraan *
          </label>
          <input
            type="text"
            required
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Contoh: FLS2N Kota Pasuruan 2024"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Ajang *</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="sekolah">Tingkat Sekolah</option>
              <option value="kecamatan">Tingkat Kecamatan</option>
              <option value="kota">Tingkat Kota Pasuruan</option>
              <option value="provinsi">Tingkat Provinsi</option>
              <option value="nasional">Tingkat Nasional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Peringkat / Capaian *</label>
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="Juara 1">Juara 1</option>
              <option value="Juara 2">Juara 2</option>
              <option value="Juara 3">Juara 3</option>
              <option value="Harapan 1">Harapan 1</option>
              <option value="Harapan 2">Harapan 2</option>
              <option value="Partisipan Terbaik">Partisipan Terbaik</option>
              <option value="Apresiasi">Apresiasi Khusus</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pendamping</label>
            <input
              type="text"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Nama Guru Pembina"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
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
            className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Prestasi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
