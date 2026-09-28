import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Calendar,
  School,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeTab }) => {
  const { currentUser, role, logout } = useAuth();
  const { schoolProfile, announcements } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Pemantauan';
      case 'students':
        return 'Data & Perkembangan Murid';
      case 'teachers':
        return 'Data Guru & Tenaga Pendidik';
      case 'talents':
        return 'Eksplorasi Bakat & Minat';
      case 'ambassadors':
        return 'Duta SEKAR MELATI';
      case 'extracurriculars':
        return 'Pengelolaan Ekstrakurikuler';
      case 'activities':
        return 'Jadwal & Presensi Pertemuan';
      case 'portfolios':
        return 'Portofolio & Prestasi Murid';
      case 'reports':
        return 'Laporan & Analisis Perkembangan';
      case 'announcements':
        return 'Papan Pengumuman Sekolah';
      case 'settings':
        return 'Pengaturan Sistem & Audit Log';
      default:
        return 'SEKAR TALENTA';
    }
  };

  const getRoleDisplay = () => {
    switch (role) {
      case 'super_admin':
        return { icon: '👑', label: 'Super Admin', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'guru_kelas':
        return { icon: '👩‍🏫', label: `Guru Kelas (${currentUser?.assignedClass || '4A'})`, color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'pembina':
        return { icon: '🛡️', label: 'Pembina', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'murid':
        return { icon: '🎒', label: 'Murid / Orang Tua', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      default:
        return { icon: '👤', label: 'Pengguna', color: 'bg-slate-100 text-slate-900 border-slate-300' };
    }
  };

  const roleInfo = getRoleDisplay();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Trigger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 lg:hidden transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{getPageTitle(activeTab)}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                <School className="w-3.5 h-3.5 text-emerald-700" />
                {schoolProfile.name}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                TP {schoolProfile.currentAcademicYear} ({schoolProfile.currentSemester})
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Notifications, Role Badge, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {announcements.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" /> Pengumuman Terbaru
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {announcements.length} Info
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                  {announcements.slice(0, 4).map((ann) => (
                    <div key={ann.id} className="py-2.5 hover:bg-slate-50 rounded-lg px-2 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 leading-snug">{ann.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{ann.publishedAt}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Status Pill (No Personal Name or Email) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${roleInfo.color}`}
            >
              <span>{roleInfo.icon}</span>
              <span className="hidden sm:inline">{roleInfo.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-slate-100 mb-1 text-center">
                  <span className="text-2xl block mb-1">{roleInfo.icon}</span>
                  <p className="text-xs font-black text-slate-800">{roleInfo.label}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Sesi Aktif</p>
                </div>

                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Keluar Sesi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
