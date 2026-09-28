import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, ShieldCheck, CheckCircle2, Camera } from 'lucide-react';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser, role } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    updateCurrentUser({
      displayName,
      phone,
      avatarUrl
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const getRoleBadgeVariant = (r: string | null) => {
    switch (r) {
      case 'super_admin': return 'amber';
      case 'kepala_sekolah': return 'emerald';
      case 'guru_kelas': return 'blue';
      case 'pembina': return 'purple';
      default: return 'sky';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Akun Pengguna"
      subtitle="Perbarui data pribadi dan informasi kontak"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <img
            src={
              avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName || 'User')}`
            }
            alt=""
            className="w-16 h-16 rounded-2xl object-cover bg-emerald-100 border-2 border-emerald-500 shadow-xs"
          />
          <div className="space-y-1">
            <Badge variant={getRoleBadgeVariant(role)} size="sm">
              {role?.replace('_', ' ').toUpperCase()}
            </Badge>
            <p className="text-xs font-bold text-slate-800">{currentUser?.email}</p>
            {currentUser?.assignedClass && (
              <p className="text-[11px] text-slate-500">Rombel: {currentUser.assignedClass}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Lengkap & Gelar *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nomor Telepon / WhatsApp
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            URL Foto Profil (Opsional)
          </label>
          <div className="relative">
            <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
            />
          </div>
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            Profil Anda berhasil diperbarui!
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Tutup
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};
