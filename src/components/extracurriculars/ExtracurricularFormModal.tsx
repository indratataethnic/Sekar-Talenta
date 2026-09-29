import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Extracurricular } from '../../types';
import { useData } from '../../context/DataContext';

interface ExtracurricularFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ekskulToEdit?: Extracurricular | null;
}

export const ExtracurricularFormModal: React.FC<ExtracurricularFormModalProps> = ({
  isOpen,
  onClose,
  ekskulToEdit,
}) => {
  const { addExtracurricular, updateExtracurricular, teachers } = useData();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('Seni Budaya');
  const [description, setDescription] = useState('');
  const [coachName, setCoachName] = useState('');
  const [coachPhone, setCoachPhone] = useState('');
  const [dayTimeSchedule, setDayTimeSchedule] = useState('Jumat, 14.00 - 15.30 WIB');
  const [location, setLocation] = useState('Ruang Serbaguna');
  const [capacity, setCapacity] = useState(30);
  const [goalsText, setGoalsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ekskulToEdit) {
      setName(ekskulToEdit.name);
      setCategory(ekskulToEdit.category || 'Seni Budaya');
      setDescription(ekskulToEdit.description || '');
      setCoachName(ekskulToEdit.coachName || '');
      setCoachPhone(ekskulToEdit.coachPhone || '');
      setDayTimeSchedule(ekskulToEdit.dayTimeSchedule || 'Jumat, 14.00 - 15.30 WIB');
      setLocation(ekskulToEdit.location || 'Ruang Serbaguna');
      setCapacity(ekskulToEdit.capacity || 30);
      setGoalsText(ekskulToEdit.goals?.join('\n') || '');
    } else {
      setName('');
      setCategory('Seni Budaya');
      setDescription('');
      setCoachName('');
      setCoachPhone('');
      setDayTimeSchedule('Jumat, 14.00 - 15.30 WIB');
      setLocation('Ruang Serbaguna');
      setCapacity(30);
      setGoalsText('');
    }
  }, [ekskulToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const code = ekskulToEdit?.code || name.toLowerCase().replace(/\s+/g, '_');
      if (ekskulToEdit) {
        await updateExtracurricular(ekskulToEdit.id, {
          name,
          category,
          description,
          coachName,
          coachPhone,
          dayTimeSchedule,
          location,
          capacity: Number(capacity),
          goals: goalsText.split('\n').map((g) => g.trim()).filter(Boolean)
        });
      } else {
        await addExtracurricular({
          code,
          name,
          category,
          icon: 'Layers',
          badgeColor: 'blue',
          description,
          coachName,
          coachPhone,
          dayTimeSchedule,
          location,
          capacity: Number(capacity),
          goals: goalsText.split('\n').map((g) => g.trim()).filter(Boolean),
          isActive: true
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
      title={ekskulToEdit ? 'Edit Data Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}
      subtitle="Kelola jadwal, pelatih, kuota murid, dan target materi"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Ekstrakurikuler *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Panahan Tradisional"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kategori *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="Keagamaan">Keagamaan</option>
              <option value="Kepanduan">Kepanduan</option>
              <option value="Teknologi">Teknologi</option>
              <option value="Seni Budaya">Seni Budaya</option>
              <option value="Olahraga">Olahraga</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pembina / Pelatih *</label>
            <input
              type="text"
              required
              list="coach-suggestions"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Pilih atau ketik nama guru / pelatih ahli"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
            <datalist id="coach-suggestions">
              {teachers.map((t) => (
                <option
                  key={t.id}
                  value={t.fullName}
                  label={`${t.fullName} (${t.teacherType === 'external' ? `Pembina Luar - ${t.organization || 'Eksternal'}` : t.position})`}
                />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">No. Kontak Pelatih</label>
            <input
              type="text"
              value={coachPhone}
              onChange={(e) => setCoachPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hari & Waktu Latihan</label>
            <input
              type="text"
              value={dayTimeSchedule}
              onChange={(e) => setDayTimeSchedule(e.target.value)}
              placeholder="Contoh: Sabtu, 08.00 - 10.00 WIB"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Latihan</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ruang Prakarya / Halaman"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Kegiatan:</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Gambaran umum aktivitas latihan..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target & Tujuan Pembelajaran (1 per baris):
          </label>
          <textarea
            rows={3}
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            placeholder="Menguasai teknik dasar&#10;Melatih kekompakan tim"
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
            {isSubmitting ? 'Menyimpan...' : 'Simpan Ekstrakurikuler'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
