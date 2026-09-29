import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AmbassadorType } from '../../types';
import { useData } from '../../context/DataContext';

interface AmbassadorTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambassadorTypeToEdit?: AmbassadorType | null;
}

export const AmbassadorTypeModal: React.FC<AmbassadorTypeModalProps> = ({
  isOpen,
  onClose,
  ambassadorTypeToEdit
}) => {
  const { addAmbassadorType, updateAmbassadorType, teachers } = useData();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [focus, setFocus] = useState('');
  const [description, setDescription] = useState('');
  const [coachName, setCoachName] = useState('');
  const [tasksText, setTasksText] = useState('');
  const [goalsText, setGoalsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ambassadorTypeToEdit) {
      setName(ambassadorTypeToEdit.name);
      setShortName(ambassadorTypeToEdit.shortName);
      setFocus(ambassadorTypeToEdit.focus);
      setDescription(ambassadorTypeToEdit.description);
      setCoachName(ambassadorTypeToEdit.coachName);
      setTasksText(ambassadorTypeToEdit.tasks?.join('\n') || '');
      setGoalsText(ambassadorTypeToEdit.goals?.join('\n') || '');
    } else {
      setName('');
      setShortName('');
      setFocus('');
      setDescription('');
      setCoachName('');
      setTasksText('');
      setGoalsText('');
    }
  }, [ambassadorTypeToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) return;

    setIsSubmitting(true);
    try {
      if (ambassadorTypeToEdit) {
        await updateAmbassadorType(ambassadorTypeToEdit.id, {
          name,
          shortName,
          focus,
          description,
          coachName: coachName || 'Guru Pembina',
          goals: goalsText.split('\n').map((g) => g.trim()).filter(Boolean),
          tasks: tasksText.split('\n').map((t) => t.trim()).filter(Boolean),
        });
      } else {
        const code = 'duta_' + shortName.toLowerCase().replace(/\s+/g, '_');
        await addAmbassadorType({
          code,
          name,
          shortName,
          icon: 'Award',
          badgeColor: 'emerald',
          focus,
          description,
          coachName: coachName || 'Guru Pembina',
          goals: goalsText.split('\n').map((g) => g.trim()).filter(Boolean),
          tasks: tasksText.split('\n').map((t) => t.trim()).filter(Boolean),
          isActive: true,
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
      title={ambassadorTypeToEdit ? 'Edit Bidang Duta Sekolah' : 'Tambah Jenis Duta Baru'}
      subtitle={
        ambassadorTypeToEdit
          ? 'Perbarui informasi fokus, pembina, tugas, dan tujuan Duta SEKAR MELATI'
          : 'Buat bidang kepemimpinan Duta SEKAR MELATI baru sesuai kebutuhan sekolah'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Duta *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Duta Disiplin & Tata Tertib"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Singkat / Panggilan *
            </label>
            <input
              type="text"
              required
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Contoh: Duta Disiplin"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fokus Utama *
            </label>
            <input
              type="text"
              required
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Contoh: Ketertiban upacara, seragam, dan tepat waktu"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Guru / Pembina Ahli
            </label>
            <input
              type="text"
              list="duta-coach-suggestions"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Pilih atau ketik nama guru / pembina ahli..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
            <datalist id="duta-coach-suggestions">
              {teachers.map((t) => (
                <option
                  key={t.id}
                  value={t.fullName}
                  label={`${t.fullName} (${t.teacherType === 'external' ? `Pembina Luar - ${t.organization || 'Eksternal'}` : t.position})`}
                />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Deskripsi Singkat Bidang Duta:
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan peran dan perwujudan kepemimpinan murid..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tugas & Aksi Duta (1 per baris):
            </label>
            <textarea
              rows={3}
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              placeholder="Mengajak teman baris rapi&#10;Memberikan contoh teladan"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tujuan Program (1 per baris):
            </label>
            <textarea
              rows={3}
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
              placeholder="Membiasakan budaya tertib&#10;Melatih kepedulian bersama"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : ambassadorTypeToEdit ? 'Simpan Perubahan' : 'Tambah Duta Baru'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
