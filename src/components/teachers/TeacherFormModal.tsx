import React, { useState, useEffect, useMemo } from 'react';
import { Teacher } from '../../types';
import { Modal } from '../common/Modal';
import { UserCheck, RefreshCw, Award, Briefcase, Hash, Sparkles, Trophy, Flag, Info, Building2, Globe2, School } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getDetectedTeacherDutiesBreakdown } from '../../utils/teacherUtils';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: Teacher | null;
}

const COMMON_INTERNAL_POSITIONS = [
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

const COMMON_EXTERNAL_POSITIONS = [
  'Pelatih Ekstrakurikuler',
  'Instruktur & Koreografer Seni Tari',
  'Pelatih Olahraga Prestasi (O2SN)',
  'Pelatih Bulu Tangkis',
  'Pelatih Futsal & Sepak Bola',
  'Instruktur Bela Diri & Pencak Silat',
  'Instruktur Bela Diri Karate / Taekwondo',
  'Instruktur Robotik & Coding Anak',
  'Pelatih Drumband & Seni Musik',
  'Instruktur Seni Lukis & Kaligrafi',
  'Instruktur Tilawatil Qur\'an & Qiroati',
  'Fasilitator / Narasumber Ahli Duta Talenta'
];

const COMMON_MANUAL_DUTIES = [
  'Penanggung Jawab Utama Program SEKAR TALENTA',
  'Koordinator Inovasi SEKAR TALENTA',
  'Ketua TPPK (Tim Pencegahan & Penanganan Kekerasan)',
  'Koordinator P5 (Projek Penguatan Profil Pelajar Pancasila)',
  'Koordinator UKS & Dokter Kecil',
  'Koordinator Asesmen Nasional (ANBK)',
  'Koordinator Ekstrakurikuler',
  'Pengelola Perpustakaan & Pojok Baca',
  'Bendahara BOS',
  'Operator Dapodik'
];

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  teacherToEdit
}) => {
  const { addTeacher, updateTeacher, ambassadorTypes, extracurriculars } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [teacherType, setTeacherType] = useState<'internal' | 'external'>('internal');
  const [organization, setOrganization] = useState('');

  const [formData, setFormData] = useState<{
    fullName: string;
    gender: 'L' | 'P';
    nip: string;
    position: string;
    additionalDuties: string;
    avatarUrl: string;
    isActive: boolean;
  }>({
    fullName: '',
    gender: 'L',
    nip: '',
    position: 'Guru Kelas 4 A',
    additionalDuties: '',
    avatarUrl: '',
    isActive: true
  });

  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('');

  useEffect(() => {
    if (teacherToEdit) {
      const type = teacherToEdit.teacherType || 'internal';
      setTeacherType(type);
      setOrganization(teacherToEdit.organization || '');
      setFormData({
        fullName: teacherToEdit.fullName,
        gender: teacherToEdit.gender || 'L',
        nip: teacherToEdit.nip || '',
        position: teacherToEdit.position,
        additionalDuties: teacherToEdit.additionalDuties || '',
        avatarUrl: teacherToEdit.avatarUrl || '',
        isActive: teacherToEdit.isActive
      });

      const positionList = type === 'internal' ? COMMON_INTERNAL_POSITIONS : COMMON_EXTERNAL_POSITIONS;
      setIsCustomPosition(!positionList.includes(teacherToEdit.position));
      setAvatarSeed(teacherToEdit.fullName);
    } else {
      setTeacherType('internal');
      setOrganization('');
      setFormData({
        fullName: '',
        gender: 'L',
        nip: '',
        position: 'Guru Kelas 1 A',
        additionalDuties: '',
        avatarUrl: '',
        isActive: true
      });
      setIsCustomPosition(false);
      setAvatarSeed(Math.random().toString(36).substring(7));
    }
  }, [teacherToEdit, isOpen]);

  // Detected automatic duties from Duta and Ekskul
  const detectedDuties = useMemo(() => {
    return getDetectedTeacherDutiesBreakdown(formData.fullName, ambassadorTypes, extracurriculars);
  }, [formData.fullName, ambassadorTypes, extracurriculars]);

  const handleTypeChange = (newType: 'internal' | 'external') => {
    setTeacherType(newType);
    if (newType === 'external') {
      if (!COMMON_EXTERNAL_POSITIONS.includes(formData.position)) {
        setFormData((prev) => ({ ...prev, position: 'Pelatih Ekstrakurikuler' }));
      }
    } else {
      if (!COMMON_INTERNAL_POSITIONS.includes(formData.position)) {
        setFormData((prev) => ({ ...prev, position: 'Guru Kelas 1 A' }));
      }
    }
    setIsCustomPosition(false);
  };

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
      const payload: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'> = {
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        nip: formData.nip.trim() || undefined,
        position: formData.position.trim(),
        additionalDuties: formData.additionalDuties.trim() || undefined,
        teacherType,
        organization: teacherType === 'external' ? organization.trim() || undefined : undefined,
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
      console.error('Error saving teacher/coach:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPositionList = teacherType === 'internal' ? COMMON_INTERNAL_POSITIONS : COMMON_EXTERNAL_POSITIONS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacherToEdit ? 'Edit Data Pendidik & Pembina' : 'Tambah Guru / Pembina Baru'}
      subtitle="Sistem Rekam Jejak Guru Sekolah & Pembina Luar SEKAR TALENTA UPT SDN Karanganyar"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipe Pendidik / Pembina Selector */}
        <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleTypeChange('internal')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              teacherType === 'internal'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4 text-emerald-700" />
            <span>🏫 Guru / Tendik Internal Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('external')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              teacherType === 'external'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4 text-purple-200" />
            <span>🌐 Pembina / Pelatih Luar (Eksternal)</span>
          </button>
        </div>

        {/* Avatar Section */}
        <div className={`flex items-center gap-4 p-3 rounded-2xl border ${
          teacherType === 'external' ? 'bg-purple-50/60 border-purple-100' : 'bg-emerald-50/60 border-emerald-100'
        }`}>
          <img
            src={currentAvatarPreview}
            alt="Avatar Guru/Pembina"
            className={`w-16 h-16 rounded-2xl object-cover bg-white p-1 border-2 shadow-xs flex-shrink-0 ${
              teacherType === 'external' ? 'border-purple-600' : 'border-emerald-600'
            }`}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Foto / Avatar Profil</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                teacherType === 'external' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {teacherType === 'external' ? 'Pembina Luar' : 'Guru Internal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Avatar otomatis digenerate atau gunakan tombol acak.</p>
            <button
              type="button"
              onClick={handleGenerateAvatar}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${teacherType === 'external' ? 'text-purple-700' : 'text-emerald-700'}`} /> Acak Avatar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap & Gelar / Sapaan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={teacherType === 'external' ? 'Contoh: Kak Dimas Prasetya, S.Sn. atau Sensei Budi' : 'Contoh: Ibu Ratna Dewi, S.Pd.'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 focus:border-emerald-600 font-medium"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                  formData.gender === 'L'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="teacherGender"
                  checked={formData.gender === 'L'}
                  onChange={() => setFormData({ ...formData, gender: 'L' })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>👨 Laki-laki (L)</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                  formData.gender === 'P'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="teacherGender"
                  checked={formData.gender === 'P'}
                  onChange={() => setFormData({ ...formData, gender: 'P' })}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>👩 Perempuan (P)</span>
              </label>
            </div>
          </div>

          {/* Asal Lembaga / Sanggar / Klub (Khusus Pembina Eksternal) */}
          {teacherType === 'external' && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Asal Lembaga / Sanggar / Klub / Komunitas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Contoh: Sanggar Seni Tari Suropati Pasuruan, Dojo Bela Diri Karanganyar, dll."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-purple-300 bg-purple-50/30 text-xs focus:outline-purple-600 font-medium"
                />
                <Building2 className="w-4 h-4 text-purple-600 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* NIP / No. Identitas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {teacherType === 'external' ? 'No. Lisensi / Sertifikat / ID Pelatih' : 'NIP / NUPTK'}{' '}
              <span className="text-[11px] font-normal text-slate-400">(Opsional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder={teacherType === 'external' ? 'Contoh: LIS-TARI-2024 / -' : 'Contoh: 19870420 201001 2 015'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-emerald-600"
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
                🟢 Aktif Membina
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="teacherStatus"
                  checked={formData.isActive === false}
                  onChange={() => setFormData({ ...formData, isActive: false })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                ⚪ Non-Aktif
              </label>
            </div>
          </div>

          {/* Jabatan / Peran Utama */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {teacherType === 'external' ? 'Peran / Jabatan Pembina' : 'Jabatan Utama'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomPosition(!isCustomPosition)}
                className="text-[11px] text-emerald-700 hover:underline font-bold"
              >
                {isCustomPosition ? 'Pilih dari Daftar' : '+ Tulis Jabatan Kustom'}
              </button>
            </div>
            {isCustomPosition ? (
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ketik peran, misal: Instruktur Panahan Tradisional"
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
                  {currentPositionList.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            )}
          </div>

          {/* Tugas Tambahan Section */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Tugas Tambahan Lainnya <span className="text-[11px] font-normal text-slate-400">(Opsional / Manual)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="duties-list"
                value={formData.additionalDuties}
                onChange={(e) => setFormData({ ...formData, additionalDuties: e.target.value })}
                placeholder="Contoh: Koordinator Persiapan Lomba FLS2N"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 font-medium"
              />
              <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <datalist id="duties-list">
                {COMMON_MANUAL_DUTIES.map((duty, idx) => (
                  <option key={idx} value={duty} />
                ))}
              </datalist>
            </div>

            {/* Otomatis dari Pembina Ekstrakurikuler atau Koordinator Duta Info Card */}
            {detectedDuties.length > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tugas Pembinaan Terdeteksi Otomatis dari Sistem:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detectedDuties.map((duty, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-800 border border-amber-300 shadow-2xs"
                    >
                      {duty.type === 'duta' ? (
                        <Flag className="w-3 h-3 text-rose-500" />
                      ) : (
                        <Trophy className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{duty.dutyLabel}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-amber-700 leading-normal">
                  *Tugas di atas terhubung secara otomatis saat nama pembina dipilih pada menu Ekstrakurikuler atau Duta Sekolah.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Info Otomatisasi:</strong> Tugas tambahan sebagai Pembina Ekstrakurikuler atau Koordinator Duta Sekolah akan otomatis terhubung saat nama guru/pembina dipilih pada menu Duta Sekolah atau Ekstrakurikuler.
                </span>
              </div>
            )}
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
            className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${
              teacherType === 'external' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {isSubmitting ? 'Menyimpan...' : teacherToEdit ? 'Simpan Perubahan' : 'Tambah Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
