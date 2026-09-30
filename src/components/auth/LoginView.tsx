import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  School,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  UserCheck,
  GraduationCap,
  Award,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Logo } from '../common/Logo';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { loginByRole } = useAuth();
  const { classes } = useData();
  
  // Selected educator role for login with password
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'guru_kelas' | 'pembina'>('super_admin');
  const [selectedClass, setSelectedClass] = useState<string>('Kelas 4A');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // Handle direct login for Murid / Orang Tua (no password needed)
  const handleMuridDirectLogin = async () => {
    setIsLoading(true);
    setErrMsg('');
    try {
      await loginByRole('murid');
    } catch (err: any) {
      setErrMsg(err.message || 'Gagal masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password-based login for educators (Guru Kelas, Super Admin, Pembina) - no email or name required!
  const handleEducatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrMsg('');
    try {
      await loginByRole(selectedRole, password, selectedRole === 'guru_kelas' ? selectedClass : undefined);
    } catch (err: any) {
      setErrMsg(err.message || 'Kata sandi salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const educatorRoles = [
    {
      id: 'super_admin' as const,
      label: 'Super Admin',
      desc: 'Akses penuh seluruh modul data, konfigurasi & audit',
      icon: '👑'
    },
    {
      id: 'guru_kelas' as const,
      label: 'Guru Kelas',
      desc: 'Input pengamatan bakat & catatan perkembangan murid',
      icon: '👩‍🏫'
    },
    {
      id: 'pembina' as const,
      label: 'Pembina',
      desc: 'Kelola Duta SEKAR MELATI, ekstrakurikuler & presensi',
      icon: '🛡️'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-2xl overflow-hidden border border-emerald-900/50">
        {/* Left Column: School Identity & Instant Murid / Ortu Entry */}
        <div className="lg:col-span-6 bg-gradient-to-b from-emerald-900 to-teal-950 p-6 sm:p-8 text-white flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Logo size="lg" variant="dark" />
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                Sistem Eksplorasi Karakter, Bakat, Minat, dan Talenta Murid
              </h3>
              <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-semibold text-amber-300">
                Kenali Potensi • Kembangkan Bakat • Tumbuhkan Kepemimpinan
              </div>
              <p className="text-[11px] text-emerald-100/80 leading-relaxed pt-1 border-t border-white/10">
                Portal resmi terintegrasi UPT SD Negeri Karanganyar, Kota Pasuruan.
              </p>
            </div>

            {/* DIRECT ACCESS: Murid / Orang Tua (Tanpa Login / Bebas Akses) */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" /> Akses Murid & Orang Tua:
              </div>

              <button
                type="button"
                onClick={handleMuridDirectLogin}
                disabled={isLoading}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-left shadow-lg shadow-amber-950/30 transition-all active:scale-98 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎒</span>
                    <div>
                      <h4 className="font-black text-sm text-amber-950 flex items-center gap-1.5">
                        Masuk sebagai Murid / Orang Tua
                      </h4>
                      <p className="text-[11px] font-semibold text-amber-900/80 mt-0.5">
                        ✓ Bebas Akses (Tanpa Nama & Tanpa Kata Sandi)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-950 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
                </div>
              </button>
              <p className="text-[11px] text-emerald-200/80 px-1">
                Murid dan wali murid dapat langsung mengeksplorasi minat anak, jadwal kegiatan, dan portofolio karya.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300/60 flex items-center justify-between pt-4 border-t border-emerald-800/60">
            <span>UPT SDN Karanganyar Pasuruan</span>
            <span>SEKAR TALENTA 2.0</span>
          </div>
        </div>

        {/* Right Column: Educator Roles Login by Password (No Name & No Email) */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center bg-white space-y-5">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-700" />
              Masuk Pendidik & Pengelola
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pilih peran Anda dan masukkan kata sandi (tanpa nama & email).
            </p>
          </div>

          {errMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errMsg}
            </div>
          )}

          <form onSubmit={handleEducatorLogin} className="space-y-4">
            {/* Step 1: Role Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                1. Pilih Peran:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {educatorRoles.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => {
                        setSelectedRole(r.id);
                        setPassword('');
                        setErrMsg('');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{r.icon}</span>
                        <div>
                          <p className="text-xs font-extrabold">{r.label}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{r.desc}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Class Selector when Guru Kelas is selected */}
            {selectedRole === 'guru_kelas' && (
              <div className="space-y-1.5 bg-blue-50/70 p-3 rounded-2xl border border-blue-200 animate-in fade-in">
                <label className="block text-xs font-bold text-blue-900">
                  Pilih Rombel Kelas Anda:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 bg-white focus:outline-blue-600 font-bold text-blue-950"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Tingkat {c.grade})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 2: Password Input (No Email Needed) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                2. Kata Sandi:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  autoComplete="current-password"
                  className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600 font-medium"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Memverifikasi...' : `Masuk sebagai ${selectedRole === 'super_admin' ? 'Super Admin' : selectedRole === 'guru_kelas' ? `Guru Kelas (${selectedClass})` : 'Pembina'}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Informasi Akses:
            </p>
            <p>
              Guru Kelas cukup memilih kelas dan memasukkan kata sandi tanpa perlu nama atau email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
