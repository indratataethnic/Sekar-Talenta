import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Extracurricular, ExtracurricularCoach } from '../../types';
import { useData } from '../../context/DataContext';
import {
  Plus,
  Trash2,
  School,
  Globe2,
  Building2,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  UserCheck
} from 'lucide-react';

interface ExtracurricularFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ekskulToEdit?: Extracurricular | null;
}

const COMMON_ROLES = [
  'Pembina Utama',
  'Pembina Pendamping',
  'Pelatih Teknis',
  'Instruktur Ahli',
  'Koreografer Tari',
  'Pelatih Olahraga / Fisik',
  'Pelatih Vokal & Tabuhan',
  'Pembina Putra',
  'Pembina Putri',
  'Asisten Pelatih'
];

export const ExtracurricularFormModal: React.FC<ExtracurricularFormModalProps> = ({
  isOpen,
  onClose,
  ekskulToEdit,
}) => {
  const { addExtracurricular, updateExtracurricular, teachers } = useData();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Keagamaan' | 'Kepanduan' | 'Teknologi' | 'Seni Budaya' | 'Olahraga'>('Seni Budaya');
  const [description, setDescription] = useState('');
  const [dayTimeSchedule, setDayTimeSchedule] = useState('Jumat, 14.00 - 15.30 WIB');
  const [location, setLocation] = useState('Ruang Serbaguna');
  const [capacity, setCapacity] = useState(30);
  const [goalsText, setGoalsText] = useState('');
  const [coaches, setCoaches] = useState<ExtracurricularCoach[]>([
    {
      name: '',
      role: 'Pembina Utama',
      type: 'internal',
      organization: '',
      phone: ''
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ekskulToEdit) {
      setName(ekskulToEdit.name);
      setCategory(ekskulToEdit.category || 'Seni Budaya');
      setDescription(ekskulToEdit.description || '');
      setDayTimeSchedule(ekskulToEdit.dayTimeSchedule || 'Jumat, 14.00 - 15.30 WIB');
      setLocation(ekskulToEdit.location || 'Ruang Serbaguna');
      setCapacity(ekskulToEdit.capacity || 30);
      setGoalsText(ekskulToEdit.goals?.join('\n') || '');

      if (ekskulToEdit.coaches && ekskulToEdit.coaches.length > 0) {
        setCoaches(
          ekskulToEdit.coaches.map((c) => ({
            name: c.name || '',
            role: c.role || 'Pembina Utama',
            type: c.type || 'internal',
            organization: c.organization || '',
            phone: c.phone || ''
          }))
        );
      } else if (ekskulToEdit.coachName) {
        // Parse possible multiple coaches separated by & or create single coach
        const parts = ekskulToEdit.coachName.split('&').map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          setCoaches(
            parts.map((pName, idx) => {
              const matchedTeacher = teachers.find(
                (t) => t.fullName.toLowerCase() === pName.toLowerCase()
              );
              return {
                name: pName,
                role: idx === 0 ? 'Pembina Utama' : 'Pembina Pendamping',
                type: matchedTeacher?.teacherType || (pName.toLowerCase().includes('sanggar') || pName.toLowerCase().includes('pengrajin') || pName.toLowerCase().includes('pelatih') ? 'external' : 'internal'),
                organization: matchedTeacher?.organization || '',
                phone: idx === 0 ? ekskulToEdit.coachPhone || '' : ''
              };
            })
          );
        } else {
          const matchedTeacher = teachers.find(
            (t) => t.fullName.toLowerCase() === ekskulToEdit.coachName.toLowerCase()
          );
          setCoaches([
            {
              name: ekskulToEdit.coachName,
              role: 'Pembina Utama',
              type: matchedTeacher?.teacherType || 'internal',
              organization: matchedTeacher?.organization || '',
              phone: ekskulToEdit.coachPhone || ''
            }
          ]);
        }
      } else {
        setCoaches([
          {
            name: '',
            role: 'Pembina Utama',
            type: 'internal',
            organization: '',
            phone: ''
          }
        ]);
      }
    } else {
      setName('');
      setCategory('Seni Budaya');
      setDescription('');
      setDayTimeSchedule('Jumat, 14.00 - 15.30 WIB');
      setLocation('Ruang Serbaguna');
      setCapacity(30);
      setGoalsText('');
      setCoaches([
        {
          name: '',
          role: 'Pembina Utama',
          type: 'internal',
          organization: '',
          phone: ''
        }
      ]);
    }
  }, [ekskulToEdit, isOpen, teachers]);

  const handleAddCoach = () => {
    setCoaches((prev) => [
      ...prev,
      {
        name: '',
        role: prev.length === 0 ? 'Pembina Utama' : 'Pembina Pendamping',
        type: 'internal',
        organization: '',
        phone: ''
      }
    ]);
  };

  const handleRemoveCoach = (index: number) => {
    if (coaches.length <= 1) return;
    setCoaches((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCoachChange = (index: number, field: keyof ExtracurricularCoach, value: any) => {
    setCoaches((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      // Auto-detect teacher data when selecting name
      if (field === 'name') {
        const matched = teachers.find(
          (t) => t.fullName.toLowerCase() === String(value).trim().toLowerCase()
        );
        if (matched) {
          current.type = matched.teacherType || 'internal';
          if (matched.organization) {
            current.organization = matched.organization;
          }
          if (matched.position && !current.role) {
            current.role = matched.position;
          }
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filter coaches with non-empty names
    const validCoaches = coaches
      .map((c) => ({
        ...c,
        name: c.name.trim(),
        role: c.role?.trim() || 'Pembina',
        organization: c.type === 'external' ? c.organization?.trim() : undefined,
        phone: c.phone?.trim()
      }))
      .filter((c) => c.name.length > 0);

    const primaryCoachName = validCoaches.map((c) => c.name).join(' & ') || 'Belum Ditentukan';
    const primaryPhone = validCoaches.find((c) => c.phone)?.phone || '';

    setIsSubmitting(true);
    try {
      const code = ekskulToEdit?.code || name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      if (ekskulToEdit) {
        await updateExtracurricular(ekskulToEdit.id, {
          name,
          category,
          description,
          coachName: primaryCoachName,
          coaches: validCoaches,
          coachPhone: primaryPhone,
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
          coachName: primaryCoachName,
          coaches: validCoaches,
          coachPhone: primaryPhone,
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
      subtitle="Kelola profil, jadwal, pembina/pelatih multi-personil (internal/eksternal), dan capaian materi"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Data Pokok Ekstrakurikuler */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Layers className="w-4 h-4 text-emerald-700" /> Informasi Dasar Kegiatan
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Ekstrakurikuler *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Seni Tari Tradisional, Robotika, dll."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white font-medium"
              >
                <option value="Keagamaan">Keagamaan</option>
                <option value="Kepanduan">Kepanduan</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Seni Budaya">Seni Budaya</option>
                <option value="Olahraga">Olahraga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hari & Waktu Latihan</label>
              <input
                type="text"
                value={dayTimeSchedule}
                onChange={(e) => setDayTimeSchedule(e.target.value)}
                placeholder="Contoh: Sabtu, 08.00 - 10.00 WIB"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Latihan</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Ruang Serbaguna / Lapangan"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kuota Maksimal Murid</label>
              <input
                type="number"
                min={5}
                max={200}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tim Pembina & Pelatih (Bisa > 1 & Internal/Eksternal) */}
        <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <UserCheck className="w-4 h-4 text-emerald-700" /> Tim Pembina / Pelatih ({coaches.length} Personil)
              </div>
              <p className="text-[11px] text-emerald-700/80">
                Bisa lebih dari 1 pembina: kombinasi guru sekolah (internal) dan instruktur luar (eksternal).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddCoach}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Pembina
            </button>
          </div>

          {/* Datalist for suggestions */}
          <datalist id="coach-teacher-suggestions">
            {teachers.map((t) => (
              <option
                key={t.id}
                value={t.fullName}
                label={`${t.fullName} (${t.teacherType === 'external' ? `🌐 Eksternal - ${t.organization || 'Luar Sekolah'}` : `🏫 Guru Internal - ${t.position}`})`}
              />
            ))}
          </datalist>

          <datalist id="coach-role-presets">
            {COMMON_ROLES.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>

          <div className="space-y-3 pt-1">
            {coaches.map((coach, index) => (
              <div
                key={index}
                className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-3 transition-all"
              >
                {/* Header per coach */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {index === 0 ? 'Pembina Utama' : `Pembina / Pelatih #${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Internal / External Toggle */}
                    <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleCoachChange(index, 'type', 'internal')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
                          coach.type !== 'external'
                            ? 'bg-white text-emerald-800 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <School className="w-3 h-3 text-emerald-600" /> Guru Internal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCoachChange(index, 'type', 'external')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
                          coach.type === 'external'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Globe2 className="w-3 h-3" /> Pelatih Luar
                      </button>
                    </div>

                    {coaches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCoach(index)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Pembina Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Inputs per coach */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Pembina / Pelatih *
                    </label>
                    <input
                      type="text"
                      required
                      list="coach-teacher-suggestions"
                      value={coach.name}
                      onChange={(e) => handleCoachChange(index, 'name', e.target.value)}
                      placeholder="Pilih dari daftar guru atau ketik nama baru..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Peran / Jabatan Pembinaan
                    </label>
                    <input
                      type="text"
                      list="coach-role-presets"
                      value={coach.role || ''}
                      onChange={(e) => handleCoachChange(index, 'role', e.target.value)}
                      placeholder="Contoh: Pembina Utama, Pelatih Teknis, Koreografer"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                    />
                  </div>

                  {coach.type === 'external' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-amber-600" /> Asal Lembaga / Sanggar / Klub *
                      </label>
                      <input
                        type="text"
                        value={coach.organization || ''}
                        onChange={(e) => handleCoachChange(index, 'organization', e.target.value)}
                        placeholder="Contoh: Sanggar Seni Tari Suropati, Klub Olahraga, dll."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-amber-50/40 focus:outline-amber-600"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <School className="w-3 h-3 text-emerald-600" /> Status Kepegawaian
                      </label>
                      <div className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                        Pendidik / Tenaga Kependidikan UPT SDN Karanganyar
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> No. WhatsApp / Kontak (Opsional)
                    </label>
                    <input
                      type="text"
                      value={coach.phone || ''}
                      onChange={(e) => handleCoachChange(index, 'phone', e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Deskripsi & Target Capaian */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Kegiatan:</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Gambaran umum kurikulum dan aktivitas latihan mingguan..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target & Sasaran Pembelajaran (1 per baris):
          </label>
          <textarea
            rows={3}
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            placeholder="Menguasai teknik dasar wiraga dan wirama&#10;Menyiapkan tim untuk pentas seni sekolah dan lomba FLS2N"
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data Ekstrakurikuler'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
