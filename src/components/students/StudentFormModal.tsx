import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';
import { Sparkles, RefreshCw, User, MapPin, Heart } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
}) => {
  const { classes, addStudent, updateStudent, schoolProfile, students } = useData();

  const [formData, setFormData] = useState({
    nisn: '',
    nis: '',
    fullName: '',
    gender: 'L' as 'L' | 'P',
    birthPlace: 'Pasuruan',
    birthDate: '2014-01-01',
    classId: 'Kelas 4A',
    academicYear: schoolProfile.currentAcademicYear,
    avatarUrl: '',
    isActive: true,
    parentName: '',
    parentPhone: '',
    address: '',
    notes: '',
  });

  const [avatarSeed, setAvatarSeed] = useState('');
  const [avatarStyle, setAvatarStyle] = useState<'bottts' | 'adventurer' | 'fun-emoji' | 'lorelei'>('bottts');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        nisn: studentToEdit.nisn,
        nis: studentToEdit.nis,
        fullName: studentToEdit.fullName,
        gender: studentToEdit.gender,
        birthPlace: studentToEdit.birthPlace,
        birthDate: studentToEdit.birthDate,
        classId: studentToEdit.classId,
        academicYear: studentToEdit.academicYear,
        avatarUrl: studentToEdit.avatarUrl || '',
        isActive: studentToEdit.isActive,
        parentName: studentToEdit.parentName || '',
        parentPhone: studentToEdit.parentPhone || '',
        address: studentToEdit.address || '',
        notes: studentToEdit.notes || '',
      });
      setAvatarSeed(studentToEdit.fullName);
    } else {
      setFormData({
        nisn: '',
        nis: '',
        fullName: '',
        gender: 'L',
        birthPlace: 'Pasuruan',
        birthDate: '2014-01-01',
        classId: classes[0]?.name || 'Kelas 1A',
        academicYear: schoolProfile.currentAcademicYear,
        avatarUrl: '',
        isActive: true,
        parentName: '',
        parentPhone: '',
        address: '',
        notes: '',
      });
      setAvatarSeed(Math.random().toString(36).substring(7));
    }
    setErrorMsg('');
  }, [studentToEdit, isOpen, classes, schoolProfile]);

  const currentAvatarPreview =
    formData.avatarUrl ||
    `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed || formData.fullName || 'student')}`;

  const handleGenerateAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(2, 9));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMsg('Nama lengkap murid wajib diisi.');
      return;
    }
    if (!formData.nisn.trim()) {
      setErrorMsg('NISN wajib diisi.');
      return;
    }

    // Check duplicate NISN if creating new
    if (!studentToEdit) {
      const duplicateNisn = students.find((s) => s.nisn === formData.nisn.trim());
      if (duplicateNisn) {
        setErrorMsg(`NISN ${formData.nisn} sudah terdaftar atas nama ${duplicateNisn.fullName}. Pastikan NISN unik.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (studentToEdit) {
        await updateStudent(studentToEdit.id, {
          ...formData,
          avatarUrl: formData.avatarUrl || currentAvatarPreview,
        });
      } else {
        await addStudent({
          ...formData,
          avatarUrl: currentAvatarPreview,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan data murid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Data Murid' : 'Tambah Murid Baru'}
      subtitle="Masukkan biodata murid UPT SD Negeri Karanganyar Kota Pasuruan"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Avatar Generator Box */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
          <img
            src={currentAvatarPreview}
            alt="Avatar Preview"
            className="w-16 h-16 rounded-2xl object-cover bg-white p-1 border-2 border-emerald-600 shadow-xs flex-shrink-0"
          />
          <div className="flex-1 space-y-1.5">
            <span className="text-xs font-bold text-slate-800">Foto / Avatar Murid</span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={avatarStyle}
                onChange={(e) => setAvatarStyle(e.target.value as any)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 bg-white"
              >
                <option value="bottts">Robot Bottts</option>
                <option value="adventurer">Karakter Adventurer</option>
                <option value="fun-emoji">Fun Emoji</option>
                <option value="lorelei">Ilustrasi Lorelei</option>
              </select>
              <button
                type="button"
                onClick={handleGenerateAvatar}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs"
              >
                <RefreshCw className="w-3 h-3 text-emerald-700" /> Acak Avatar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Murid *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                if (!studentToEdit) setAvatarSeed(e.target.value);
              }}
              placeholder="Contoh: Ahmad Fauzan Pratama"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rombongan Belajar (Kelas) *
            </label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 focus:border-emerald-600 font-medium text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.homeroomTeacherName || 'Wali Kelas'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">NISN (10 Digit) *</label>
            <input
              type="text"
              required
              maxLength={10}
              value={formData.nisn}
              onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
              placeholder="Contoh: 0145892301"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === 'L'}
                  onChange={() => setFormData({ ...formData, gender: 'L' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                👦 Laki-laki (L)
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === 'P'}
                  onChange={() => setFormData({ ...formData, gender: 'P' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                👧 Perempuan (P)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
            <input
              type="text"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              placeholder="Nama Ayah/Ibu"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kontak / WhatsApp</label>
            <input
              type="text"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              placeholder="081234567890"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tempat Tinggal / Domisili</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Contoh: Jl. Pahlawan No. 12, Kel. Pekuncen, Kec. Panggungrejo, Pasuruan"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan & Karakteristik Murid</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Karakteristik murid, hobi awal, minat spesifik, atau catatan kesehatan..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : studentToEdit ? 'Simpan Perubahan' : 'Tambah Murid'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
