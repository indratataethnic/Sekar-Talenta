import React, { useState, useEffect } from 'react';
import { Teacher } from '../../types';
import { Modal } from '../common/Modal';
import { UserCheck, RefreshCw, Phone, Mail, Award, Briefcase, Hash } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: Teacher | null;
}

const COMMON_POSITIONS = [
  'Kepala Sekolah',
  'Guru Kelas 1 A',
  'Guru Kelas 1 B',
  'Guru Kelas 2 A',
  'Guru Kelas 2 B',
  'Guru Kelas 3 A',
  'Guru Kelas 3 B',
  'Guru Kelas 4 A',
  'Guru Kelas 4 B',
  'Guru Kelas 5 A',
  'Guru Kelas 5 B',
  'Guru Kelas 6 A',
  'Guru Kelas 6 B',
  'Guru PJOK (Penjasorkes)',
  'Guru Pendidikan Agama Islam (PAI)',
  'Guru Bahasa Inggris',
  'Guru Penggerak & IT',
  'Tenaga Administrasi Sekolah',
  'Pustakawan Sekolah'
];

const COMMON_DUTIES = [
  'Penanggung Jawab Utama Program SEKAR TALENTA',
  'Koordinator Inovasi SEKAR TALENTA & Pembina Duta Digital',
  'Ketua TPPK & Pembina Duta TPPK',
  'Pembina Duta Literasi & Pengelola Pojok Baca',
  'Pembina Duta Adiwiyata',
  'Pembina Duta Karakter & Tata Krama',
  'Pembina Pramuka Siaga',
  'Pembina Pramuka Penggalang',
  'Koordinator UKS & Pembina Dokter Kecil',
  'Koordinator Ekstrakurikuler',
  'Koordinator P5 (Projek Penguatan Profil Pelajar Pancasila)',
  'Pembina Ekskul Seni Tari Tradisional',
  'Pembina Ekskul Seni Lukis & Mewarnai',
  'Pelatih Bulu Tangkis & Koordinator O2SN',
  'Pembina Ekskul Futsal & Atletik',
  'Pembina Ekskul Robotik & Coding',
  'Pembina Ekskul Olimpiade Matematika & Sains',
  'Bendahara BOS',
  'Operator Dapodik'
];

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  teacherToEdit
}) => {
  const { addTeacher, updateTeacher } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    nip: '',
    position: 'Guru Kelas 4 A',
    additionalDuties: '',
    phone: '',
    email: '',
    avatarUrl: '',
    isActive: true
  });

  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('');

  useEffect(() => {
    if (teacherToEdit) {
      setFormData({
        fullName: teacherToEdit.fullName,
        nip: teacherToEdit.nip || '',
        position: teacherToEdit.position,
        additionalDuties: teacherToEdit.additionalDuties || '',
        phone: teacherToEdit.phone || '',
        email: teacherToEdit.email || '',
        avatarUrl: teacherToEdit.avatarUrl || '',
        isActive: teacherToEdit.isActive
      });
      setIsCustomPosition(!COMMON_POSITIONS.includes(teacherToEdit.position));
      setAvatarSeed(teacherToEdit.fullName);
    } else {
      setFormData({
        fullName: '',
        nip: '',
        position: 'Guru Kelas 1 A',
        additionalDuties: '',
        phone: '',
        email: '',
        avatarUrl: '',
        isActive: true
      });
      setIsCustomPosition(false);
      setAvatarSeed(Math.random().toString(36).substring(7));
    }
  }, [teacherToEdit, isOpen]);

  const handleGenerateAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    setFormData((prev) => ({
      ...prev,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newSeed)}`
    }));
  };

  const currentAvatarPreview =
    formData.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      formData.fullName || avatarSeed || 'teacher'
    )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.position.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        nip: formData.nip.trim() || undefined,
        position: formData.position.trim(),
        additionalDuties: formData.additionalDuties.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        avatarUrl: formData.avatarUrl || currentAvatarPreview,
        isActive: formData.isActive
      };

      if (teacherToEdit) {
        await updateTeacher(teacherToEdit.id, payload);
      } else {
        await addTeacher(payload);
      }
      onClose();
    } catch (err) {
      console.error('Error saving teacher:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacherToEdit ? 'Edit Data Guru & Tenaga Pendidik' : 'Tambah Guru / Tenaga Pendidik Baru'}
      subtitle="Sistem Rekam Jejak Pendidik & Pembina SEKAR TALENTA UPT SDN Karanganyar"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <img
            src={currentAvatarPreview}
            alt="Avatar Guru"
            className="w-16 h-16 rounded-2xl object-cover bg-white p-1 border-2 border-emerald-600 shadow-xs flex-shrink-0"
          />
          <div className="flex-1 space-y-1">
            <span className="text-xs font-bold text-slate-800">Foto / Avatar Profil Guru</span>
            <p className="text-[11px] text-slate-500">Avatar otomatis digenerate atau gunakan tombol acak untuk variasi.</p>
            <button
              type="button"
              onClick={handleGenerateAvatar}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" /> Acak Avatar Baru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Guru & Gelar <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Contoh: Ibu Ratna Dewi, S.Pd."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 focus:border-emerald-600 font-medium"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* NIP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              NIP / NUPTK <span className="text-[11px] font-normal text-slate-400">(Opsional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder="Contoh: 19870420 201001 2 015"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-emerald-600 focus:border-emerald-600"
              />
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Status Keaktifan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Keaktifan</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="teacherStatus"
                  checked={formData.isActive === true}
                  onChange={() => setFormData({ ...formData, isActive: true })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                🟢 Aktif Mengajar
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="teacherStatus"
                  checked={formData.isActive === false}
                  onChange={() => setFormData({ ...formData, isActive: false })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                ⚪ Non-Aktif / Purna
              </label>
            </div>
          </div>

          {/* Jabatan */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Jabatan Utama <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomPosition(!isCustomPosition)}
                className="text-[11px] text-emerald-700 hover:underline font-bold"
              >
                {isCustomPosition ? 'Pilih dari Daftar Jabatan' : '+ Tulis Jabatan Kustom'}
              </button>
            </div>
            {isCustomPosition ? (
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ketik jabatan, misal: Guru Pendamping Khusus"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 font-medium"
                />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            ) : (
              <div className="relative">
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 font-medium text-slate-800 bg-white"
                >
                  {COMMON_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            )}
          </div>

          {/* Tugas Tambahan */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tugas Tambahan <span className="text-[11px] font-normal text-slate-400">(Pembina, Koordinator, Tim Khusus)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="duties-list"
                value={formData.additionalDuties}
                onChange={(e) => setFormData({ ...formData, additionalDuties: e.target.value })}
                placeholder="Contoh: Pembina Duta TPPK & Koordinator P5"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 font-medium"
              />
              <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <datalist id="duties-list">
                {COMMON_DUTIES.map((duty, idx) => (
                  <option key={idx} value={duty} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Nomor WhatsApp / HP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              No. Telepon / WhatsApp <span className="text-[11px] font-normal text-slate-400">(Opsional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-emerald-600"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email <span className="text-[11px] font-normal text-slate-400">(Opsional)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guru@guru.sd.belajar.id"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : teacherToEdit ? 'Simpan Perubahan' : 'Tambah Guru'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
