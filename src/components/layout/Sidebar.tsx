import React from 'react';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Award,
  Layers,
  CalendarDays,
  FolderHeart,
  FileBarChart2,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) => {
  const { currentUser, role, logout, switchRole, isSuperAdmin, isGuruKelas, isPembina, isMurid } = useAuth();

  const getRoleBadge = (r: UserRole | null) => {
    switch (r) {
      case 'super_admin':
        return { label: 'Super Admin', color: 'bg-amber-400 text-amber-950 font-black' };
      case 'guru_kelas':
        return { label: 'Guru Kelas', color: 'bg-blue-400 text-blue-950 font-black' };
      case 'pembina':
        return { label: 'Pembina', color: 'bg-purple-400 text-purple-950 font-black' };
      case 'murid':
        return { label: 'Murid / Orang Tua', color: 'bg-sky-400 text-sky-950 font-black' };
      default:
        return { label: 'Pengguna', color: 'bg-slate-300 text-slate-800' };
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, roles: ['super_admin', 'guru_kelas', 'pembina', 'murid'] },
    { id: 'students', label: 'Data Murid', icon: Users, roles: ['super_admin', 'guru_kelas', 'pembina'] },
    { id: 'teachers', label: 'Data Guru', icon: GraduationCap, roles: ['super_admin', 'guru_kelas', 'pembina'] },
    { id: 'talents', label: 'Bakat & Minat', icon: Sparkles, roles: ['super_admin', 'guru_kelas', 'pembina', 'murid'], badge: isMurid ? 'Eksplorasi' : undefined },
    { id: 'ambassadors', label: 'Duta Sekolah', icon: Award, roles: ['super_admin', 'guru_kelas', 'pembina', 'murid'] },
    { id: 'extracurriculars', label: 'Ekstrakurikuler', icon: Layers, roles: ['super_admin', 'guru_kelas', 'pembina', 'murid'] },
    { id: 'activities', label: 'Jadwal & Presensi', icon: CalendarDays, roles: ['super_admin', 'guru_kelas', 'pembina', 'murid'] },
    { id: 'portfolios', label: 'Portofolio & Prestasi', icon: FolderHeart, roles: ['super_admin', 'guru_kelas', 'pembina', 'murid'] },
    { id: 'reports', label: 'Laporan & Analitik', icon: FileBarChart2, roles: ['super_admin', 'guru_kelas', 'pembina'] },
    { id: 'announcements', label: 'Pengumuman', icon: Megaphone, roles: ['super_admin', 'guru_kelas', 'pembina', 'murid'] },
    { id: 'settings', label: 'Pengaturan & Log', icon: Settings, roles: ['super_admin'] },
  ];

  const allowedNavItems = navItems.filter((item) => role && item.roles.includes(role));
  const roleBadge = getRoleBadge(role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-slate-100 flex flex-col border-r border-emerald-800/40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-800/50 bg-emerald-950/40">
          <Logo size="md" variant="dark" />
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
            Menu Utama
          </div>

          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50 font-semibold translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-amber-300' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Role Switcher for 4 clean roles */}
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-emerald-900/30 border border-emerald-700/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Ganti Peran Cepat:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <button
              onClick={() => switchRole('super_admin')}
              className={`p-1.5 rounded-lg text-left transition-colors ${role === 'super_admin' ? 'bg-amber-400 text-amber-950 font-bold' : 'text-slate-300 hover:bg-emerald-800/60'}`}
            >
              👑 Super Admin
            </button>
            <button
              onClick={() => switchRole('guru_kelas')}
              className={`p-1.5 rounded-lg text-left transition-colors ${role === 'guru_kelas' ? 'bg-amber-400 text-amber-950 font-bold' : 'text-slate-300 hover:bg-emerald-800/60'}`}
            >
              👩‍🏫 Guru Kelas
            </button>
            <button
              onClick={() => switchRole('pembina')}
              className={`p-1.5 rounded-lg text-left transition-colors ${role === 'pembina' ? 'bg-amber-400 text-amber-950 font-bold' : 'text-slate-300 hover:bg-emerald-800/60'}`}
            >
              🛡️ Pembina
            </button>
            <button
              onClick={() => switchRole('murid')}
              className={`p-1.5 rounded-lg text-left transition-colors ${role === 'murid' ? 'bg-amber-400 text-amber-950 font-bold' : 'text-slate-300 hover:bg-emerald-800/60'}`}
            >
              🎒 Murid / Ortu
            </button>
          </div>
        </div>

        {/* Active Role & Logout */}
        <div className="p-3 border-t border-emerald-800/40 bg-emerald-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-base">
              {role === 'super_admin' ? '👑' : role === 'guru_kelas' ? '👩‍🏫' : role === 'pembina' ? '🛡️' : '🎒'}
            </span>
            <div>
              <p className="text-xs font-bold text-white leading-none">
                {role === 'super_admin' ? 'Super Admin' : role === 'guru_kelas' ? `Guru Kelas (${currentUser?.assignedClass || '4A'})` : role === 'pembina' ? 'Pembina' : 'Murid / Orang Tua'}
              </p>
              <p className="text-[10px] text-emerald-300/70 mt-0.5">Sesi Aktif</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
            title="Keluar Sesi"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
