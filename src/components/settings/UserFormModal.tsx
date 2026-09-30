import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Eye, EyeOff } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
}) => {
  const { createUser, updateUser } = useAuth();
  const { classes, ambassadorTypes, extracurriculars } = useData();

  const [role, setRole] = useState<UserRole>('guru_kelas');
  const [password, setPassword] = useState('sekarmelati');
  const [showPassword, setShowPassword] = useState(false);
  const [assignedClass, setAssignedClass] = useState('Kelas 4A');
  const [assignedAmbassadorType, setAssignedAmbassadorType] = useState('duta_tppk');
  const [assignedExtracurricularId, setAssignedExtracurricularId] = useState(extracurriculars[0]?.id || 'ekskul_tahfidz');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const getRoleDisplayName = (r: UserRole): string => {
    switch (r) {
      case 'super_admin': return 'Super Admin';
      case 'guru_kelas': return 'Guru Kelas';
      case 'pembina': return 'Pembina';
      case 'murid': return 'Murid / Orang Tua';
      default: return r;
    }
  };

  useEffect(() => {
    if (userToEdit) {
      setRole(userToEdit.role);
      setPassword(userToEdit.password || 'sekarmelati');
      setAssignedClass(userToEdit.assignedClass || classes[0]?.name || 'Kelas 4A');
      setAssignedAmbassadorType(userToEdit.assignedAmbassadorType || 'duta_tppk');
      setAssignedExtracurricularId(userToEdit.assignedExtracurricularId || extracurriculars[0]?.id || 'ekskul_tahfidz');
      setStatus(userToEdit.status);
    } else {
      setRole('guru_kelas');
      setPassword('sekarmelati');
      setAssignedClass(classes[0]?.name || 'Kelas 4A');
      setAssignedAmbassadorType(ambassadorTypes[0]?.code || 'duta_tppk');
      setAssignedExtracurricularId(extracurriculars[0]?.id || 'ekskul_tahfidz');
      setStatus('active');
    }
    setErrMsg('');
  }, [userToEdit, isOpen, classes, ambassadorTypes, extracurriculars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const displayName = getRoleDisplayName(role);
      const email = `${role}@sdnkaranganyar.sch.id`;

      if (userToEdit) {
        await updateUser(userToEdit.id, {
          displayName,
          email,
          role,
          password: password || undefined,
          assignedClass: role === 'guru_kelas' ? assignedClass : undefined,
          assignedAmbassadorType: role === 'pembina' ? assignedAmbassadorType : undefined,
          assignedExtracurricularId: role === 'pembina' ? assignedExtracurricularId : undefined,
          status
        });
      } else {
        await createUser({
          displayName,
          email,
          role,
          password: password || 'sekarmelati',
          assignedClass: role === 'guru_kelas' ? assignedClass : undefined,
          assignedAmbassadorType: role === 'pembina' ? assignedAmbassadorType : undefined,
          assignedExtracurricularId: role === 'pembina' ? assignedExtracurricularId : undefined,
          status,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`
        });
      }
      onClose();
    } catch (err: any) {
      setErrMsg(err.message || 'Gagal menyimpan akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? 'Edit Kata Sandi & Status Peran' : 'Tambah Akun Peran'}
      subtitle="Kelola kata sandi dan status aktif peran pengguna"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {errMsg}
          </div>
        )}

        <div className="space-y-3.5">
          {/* Peran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Peran Pengguna *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold text-slate-800"
            >
              <option value="super_admin">👑 Super Admin (Akses Penuh)</option>
              <option value="guru_kelas">👩‍🏫 Guru Kelas (Wali Kelas)</option>
              <option value="pembina">🛡️ Pembina (Duta & Ekskul)</option>
              <option value="murid">🎒 Murid / Orang Tua (Bebas Akses)</option>
            </select>
          </div>

          {/* Conditional Scopes based on role */}
          {role === 'guru_kelas' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tugas Rombel Kelas:
              </label>
              <select
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-semibold text-emerald-800"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === 'pembina' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bidang Duta:
                </label>
                <select
                  value={assignedAmbassadorType}
                  onChange={(e) => setAssignedAmbassadorType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                >
                  <option value="">- Tidak Ada -</option>
                  {ambassadorTypes.map((d) => (
                    <option key={d.id} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bidang Ekskul:
                </label>
                <select
                  value={assignedExtracurricularId}
                  onChange={(e) => setAssignedExtracurricularId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                >
                  <option value="">- Tidak Ada -</option>
                  {extracurriculars.map((ek) => (
                    <option key={ek.id} value={ek.id}>
                      {ek.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Kata Sandi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi (Password) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                autoComplete="new-password"
                className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
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
            {isSubmitting ? 'Menyimpan...' : userToEdit ? 'Simpan Perubahan' : 'Buat Akun Peran'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
