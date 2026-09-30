import React, { useState } from 'react';
import {
  Settings,
  School,
  Users,
  ShieldCheck,
  History,
  Database,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Edit2,
  Search,
  Key,
  Cloud,
  Check,
  X,
  RefreshCw,
  Sparkles,
  Server
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { UserFormModal } from './UserFormModal';
import { User } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';

export const SettingsView: React.FC = () => {
  const {
    schoolProfile,
    updateSchoolProfile,
    auditLogs,
    exportAllDataAsJson,
    importAllDataFromJson,
    isCloudConnected,
    testCloudConnection,
    seedInitialDataToFirestore,
    purgeOnlyDummyData,
    clearAllDemoData
  } = useData();

  const { allUsers, isSuperAdmin, deleteUser, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'matrix' | 'logs' | 'database'>('database');

  // School profile form state
  const [profileForm, setProfileForm] = useState(schoolProfile);
  const [isSaved, setIsSaved] = useState(false);

  // User management modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Audit logs search & filter
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('ALL');

  // Cloud test state
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudTestResult, setCloudTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);
  const [isPurgingDummy, setIsPurgingDummy] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [isSeedDialogOpen, setIsSeedDialogOpen] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  // JSON Restore
  const [restoreText, setRestoreText] = useState('');
  const [restoreMsg, setRestoreMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profileForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestCloudConnection = async () => {
    setIsTestingCloud(true);
    setCloudTestResult(null);
    try {
      const ok = await testCloudConnection();
      if (ok) {
        setCloudTestResult({
          success: true,
          msg: `Koneksi ke Google Cloud Firestore (${firebaseConfig.firestoreDatabaseId}) aktif dan terhubung secara langsung!`
        });
      } else {
        setCloudTestResult({
          success: false,
          msg: 'Tidak dapat menjangkau server Firestore saat ini.'
        });
      }
    } catch (err: any) {
      setCloudTestResult({
        success: false,
        msg: 'Uji koneksi gagal: ' + err.message
      });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleSeedToFirestore = async () => {
    setIsSeedingFirestore(true);
    setSeedResult(null);
    try {
      await seedInitialDataToFirestore();
      setSeedResult('Semua data master (murid, duta, ekskul, minat, portofolio) berhasil diunggah ke Cloud Firestore!');
      setTimeout(() => setSeedResult(null), 4000);
    } catch (err: any) {
      setSeedResult('Gagal sinkronisasi ke Firestore: ' + err.message);
    } finally {
      setIsSeedingFirestore(false);
      setIsSeedDialogOpen(false);
    }
  };

  const handlePurgeDummyData = async () => {
    setIsPurgingDummy(true);
    setSeedResult(null);
    try {
      await purgeOnlyDummyData();
      setSeedResult('Semua data dummy bawaan sistem berhasil dibersihkan dari database.');
      setTimeout(() => setSeedResult(null), 4000);
    } catch (err: any) {
      setSeedResult('Gagal membersihkan data dummy: ' + err.message);
    } finally {
      setIsPurgingDummy(false);
      setIsPurgeDialogOpen(false);
    }
  };

  const handleClearAllData = async () => {
    setIsClearingAll(true);
    setSeedResult(null);
    try {
      await clearAllDemoData();
      setSeedResult('Seluruh database berhasil dikosongkan. Anda dapat mulai mengisi data riil sekolah.');
      setTimeout(() => setSeedResult(null), 4000);
    } catch (err: any) {
      setSeedResult('Gagal mengosongkan database: ' + err.message);
    } finally {
      setIsClearingAll(false);
      setIsClearAllDialogOpen(false);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_sekar_talenta_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = async () => {
    if (!restoreText.trim()) return;
    try {
      await importAllDataFromJson(restoreText);
      setRestoreMsg({ type: 'success', text: 'Database berhasil dipulihkan dari berkas cadangan!' });
      setRestoreText('');
      setTimeout(() => setRestoreMsg(null), 3000);
    } catch (err: any) {
      setRestoreMsg({ type: 'error', text: err.message || 'Gagal memulihkan database.' });
    }
  };

  const handleRestoreFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRestoreText(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesQuery =
      log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.entityType.toLowerCase().includes(logSearch.toLowerCase());
    const matchesAction = logActionFilter === 'ALL' || log.action === logActionFilter;
    return matchesQuery && matchesAction;
  });

  const permissionsMatrix = [
    { feature: 'Manajemen Akun Pengguna & RBAC', superAdmin: true, kepsek: false, guruKelas: false, pembina: false, murid: false },
    { feature: 'Kelola Master Data Seluruh Murid', superAdmin: true, kepsek: false, guruKelas: false, pembina: false, murid: false },
    { feature: 'Kelola Data Murid di Rombel Kelas Sendiri', superAdmin: true, kepsek: false, guruKelas: true, pembina: false, murid: false },
    { feature: 'Lihat Seluruh Data Murid & Prestasi', superAdmin: true, kepsek: true, guruKelas: true, pembina: true, murid: false },
    { feature: 'Input Pengamatan & Rekomendasi Karakter', superAdmin: true, kepsek: false, guruKelas: true, pembina: true, murid: false },
    { feature: 'Kelola Anggota & Program Duta Sekolah', superAdmin: true, kepsek: false, guruKelas: false, pembina: true, murid: false },
    { feature: 'Kelola Ekstrakurikuler & Jadwal Latihan', superAdmin: true, kepsek: false, guruKelas: false, pembina: true, murid: false },
    { feature: 'Pencatatan Presensi Kehadiran Pertemuan', superAdmin: true, kepsek: false, guruKelas: true, pembina: true, murid: false },
    { feature: 'Verifikasi Portofolio & Piagam Prestasi', superAdmin: true, kepsek: true, guruKelas: true, pembina: true, murid: false },
    { feature: 'Eksplorasi Minat Pribadi & Unggah Karya Murid', superAdmin: true, kepsek: false, guruKelas: false, pembina: false, murid: true },
    { feature: 'Ekspor Laporan Resmi & Analisis Sekolah', superAdmin: true, kepsek: true, guruKelas: false, pembina: false, murid: false },
    { feature: 'Akses Dokumen Rahasia Kasus TPPK Khusus', superAdmin: true, kepsek: true, guruKelas: false, pembina: false, murid: false },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-700" />
            Pengaturan & Pangkalan Data Cloud
          </h2>
          <p className="text-xs text-slate-500">
            Konfigurasi profil sekolah, Google Cloud Firestore, Firebase Auth, RBAC, dan audit log.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'database'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            ☁️ Cloud Firestore
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            🏫 Profil Sekolah
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              👥 Manajemen Akun ({allUsers.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            🛡️ Matriks Hak Akses
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            📜 Audit Log
          </button>
        </div>
      </div>

      {/* Tab: Cloud Firestore & Database Management */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Cloud Connection Status Card */}
          <Card className="p-6 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white border-emerald-700 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-800/80 border border-emerald-600 text-amber-300">
                  <Cloud className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight text-white">Google Cloud Firestore Backend</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40">
                      TERHUBUNG
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">
                    Proyek Firebase: <strong className="font-mono text-white">{firebaseConfig.projectId}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestCloudConnection}
                  disabled={isTestingCloud}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isTestingCloud ? 'animate-spin' : ''}`} />
                  {isTestingCloud ? 'Menguji...' : 'Uji Koneksi Firestore'}
                </button>
                <button
                  onClick={() => setIsSeedDialogOpen(true)}
                  disabled={isSeedingFirestore}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSeedingFirestore ? 'Mengunggah...' : 'Sinkronkan Data Awal ke Firestore'}
                </button>
              </div>
            </div>

            {/* Config metadata breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-800/60 text-xs">
              <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 uppercase font-bold">Firestore Database ID</span>
                <p className="font-mono font-bold text-white text-[11px] truncate mt-0.5">
                  {firebaseConfig.firestoreDatabaseId}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 uppercase font-bold">Auth Domain</span>
                <p className="font-mono font-bold text-white text-[11px] truncate mt-0.5">
                  {firebaseConfig.authDomain}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 uppercase font-bold">Keamanan & RBAC Rules</span>
                <p className="font-bold text-emerald-200 text-[11px] mt-0.5">
                  ✓ Terpasang (TPPK Restricted, ABAC)
                </p>
              </div>
            </div>

            {cloudTestResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  cloudTestResult.success
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                }`}
              >
                {cloudTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                {cloudTestResult.msg}
              </div>
            )}

            {seedResult && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                {seedResult}
              </div>
            )}
          </Card>

          {/* Backup & Restore Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Download className="w-5 h-5 text-emerald-700" />
                <h4>Pencadangan (Backup) Data JSON</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unduh seluruh pangkalan data aplikasi (data murid, duta, ekskul, presensi, portofolio) sebagai arsip JSON mandiri untuk dicadangkan secara aman.
              </p>

              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                Unduh Cadangan Lengkap (.json)
              </button>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Upload className="w-5 h-5 text-blue-700" />
                <h4>Pemulihan (Restore) Data JSON</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unggah berkas cadangan JSON untuk memulihkan seluruh struktur data sekolah secara instan ke dalam sistem.
              </p>

              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFileUpload}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
              />

              {restoreText && (
                <button
                  onClick={handleRestoreBackup}
                  className="block px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
                >
                  Jalankan Pemulihan Data
                </button>
              )}

              {restoreMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    restoreMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {restoreMsg.text}
                </div>
              )}
            </Card>
          </div>

          {/* Data Cleanup & Maintenance Card */}
          <Card className="p-6 space-y-4 border-rose-200 bg-rose-50/30">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <Trash2 className="w-5 h-5 text-rose-700" />
              <h4>Pembersihan & Pengosongan Data (Database Maintenance)</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gunakan opsi di bawah ini jika terdapat data dummy/contoh otomatis yang ingin dibersihkan dari Cloud Firestore tanpa mengganggu data riil yang telah Anda masukkan secara manual.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsPurgeDialogOpen(true)}
                disabled={isPurgingDummy}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {isPurgingDummy ? 'Membersihkan...' : 'Bersihkan Data Dummy Bawaan Saja'}
              </button>

              <button
                onClick={() => setIsClearAllDialogOpen(true)}
                disabled={isClearingAll}
                className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isClearingAll ? 'Mengosongkan...' : 'Kosongkan Seluruh Database (Mulai dari Nol)'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Profil Sekolah */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Identitas Lembaga Pendidikan</h3>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Profil Berhasil Disimpan
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Satuan Pendidikan</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={profileForm.npsn}
                  onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={profileForm.principalName}
                  onChange={(e) => setProfileForm({ ...profileForm, principalName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={profileForm.principalNip}
                  onChange={(e) => setProfileForm({ ...profileForm, principalNip: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Pelajaran Aktif</label>
                <input
                  type="text"
                  value={profileForm.currentAcademicYear}
                  onChange={(e) => setProfileForm({ ...profileForm, currentAcademicYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester Aktif</label>
                <select
                  value={profileForm.currentSemester}
                  onChange={(e) => setProfileForm({ ...profileForm, currentSemester: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Semboyan / Tagline Sekolah</label>
                <input
                  type="text"
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 italic"
                />
              </div>

              {/* Aturan & Kebijakan Ekstrakurikuler & Duta */}
              <div className="sm:col-span-2 mt-4 p-5 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 rounded-2xl border-2 border-emerald-200 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" /> Aturan Keikutsertaan Ekstrakurikuler & Duta Sekolah
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Konfigurasi pembatasan keikutsertaan yang divalidasi sistem dan diamankan di database
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-1.5">
                    <label className="block text-xs font-black text-slate-800">
                      Batas Maksimal Ekstrakurikuler Pilihan (per Murid) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        required
                        value={profileForm.maxElectiveExtracurricular ?? 2}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            maxElectiveExtracurricular: Math.max(1, parseInt(e.target.value, 10) || 2)
                          })
                        }
                        className="w-28 px-3 py-2 text-sm font-black text-emerald-900 rounded-xl border-2 border-emerald-400 focus:outline-emerald-600 bg-emerald-50/30 text-center"
                      />
                      <span className="text-xs text-slate-600 font-medium">
                        kegiatan pilihan / murid (bawaan: <strong>2</strong>)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                      ⚠️ Ekstrakurikuler wajib (Pramuka & TIK) <strong>tidak dihitung</strong> sebagai bagian dari kuota batas ini.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-[11px] text-slate-600 space-y-2">
                    <span className="font-bold text-slate-800 block text-xs">Ketentuan Baku Sistem Sekolah:</span>
                    <ul className="space-y-1 list-disc list-inside text-[11px]">
                      <li><strong className="text-slate-800">Pramuka Wajib:</strong> Murid Kelas 1 s/d Kelas 5</li>
                      <li><strong className="text-slate-800">TIK Wajib:</strong> Murid Kelas 4 s/d Kelas 6</li>
                      <li><strong className="text-slate-800">Minimal Pilihan:</strong> Minimal 1 ekskul pilihan</li>
                      <li><strong className="text-slate-800">Duta Sekolah:</strong> Maksimal 1 Duta aktif per murid dalam 1 periode</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Simpan Profil & Aturan Sekolah
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && isSuperAdmin && (
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Akun Pengguna Terdaftar</h3>
              <p className="text-xs text-slate-500">Kelola kredensial kata sandi dan status aktif setiap peran</p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" /> Tambah Akun Peran
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Peran</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Kata Sandi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => {
                  const getRoleLabel = (role: string) => {
                    switch (role) {
                      case 'super_admin': return '👑 Super Admin';
                      case 'guru_kelas': return `👩‍🏫 Guru Kelas (${u.assignedClass || '4A'})`;
                      case 'pembina': return '🛡️ Pembina';
                      case 'murid': return '🎒 Murid / Orang Tua';
                      default: return role.replace('_', ' ').toUpperCase();
                    }
                  };

                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Badge variant={u.status === 'active' ? 'emerald' : 'slate'} size="sm" dot>
                          {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                          {u.role === 'murid' ? 'Bebas Akses (Tanpa Password)' : '•••••••• (Tersimpan Aman)'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Akun & Kata Sandi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingUserId(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Hak Akses Matrix */}
      {activeTab === 'matrix' && (
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Matriks Hak Akses Berbasis Peran (RBAC)</h3>
            <p className="text-xs text-slate-500">Membatasi wewenang baca/tulis/kelola sesuai tupoksi pendidik & tenaga kependidikan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="p-3.5">Modul / Fitur</th>
                  <th className="p-3.5 text-center">Super Admin</th>
                  <th className="p-3.5 text-center">Kepala Sekolah</th>
                  <th className="p-3.5 text-center">Guru Kelas</th>
                  <th className="p-3.5 text-center">Pembina Duta/Ekskul</th>
                  <th className="p-3.5 text-center">Murid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-semibold text-slate-800">{item.feature}</td>
                    <td className="p-3.5 text-center">{item.superAdmin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{item.kepsek ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{item.guruKelas ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{item.pembina ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{item.murid ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <Card className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catatan Audit Log Aktivitas Sistem</h3>
              <p className="text-xs text-slate-500">Merekam setiap aksi administratif & transaksi data</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logActionFilter}
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
              >
                <option value="ALL">Semua Aksi</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="VERIFY">VERIFY</option>
                <option value="RECORD">RECORD</option>
                <option value="IMPORT">IMPORT</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Cari log..."
                  className="pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Peran</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Entitas</th>
                  <th className="p-3">Detail Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td className="p-3 font-bold text-slate-800 font-sans">{log.userName}</td>
                    <td className="p-3">
                      <Badge size="sm" variant="slate">
                        {log.userRole}
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-emerald-700">{log.action}</td>
                    <td className="p-3 text-purple-700">{log.entityType}</td>
                    <td className="p-3 font-sans text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        userToEdit={editingUser}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={!!deletingUserId}
        onClose={() => setDeletingUserId(null)}
        onConfirm={() => {
          if (deletingUserId) {
            deleteUser(deletingUserId);
            setDeletingUserId(null);
          }
        }}
        title="Hapus Akun Pengguna?"
        message="Akun pengguna ini akan dihapus dari sistem."
        type="danger"
        confirmText="Hapus Akun"
      />

      {/* Confirm Purge Dummy Data Dialog */}
      <ConfirmDialog
        isOpen={isPurgeDialogOpen}
        onClose={() => setIsPurgeDialogOpen(false)}
        onConfirm={handlePurgeDummyData}
        title="Bersihkan Semua Data Dummy / Bawaan?"
        message="Tindakan ini akan menghapus seluruh data demonstrasi/dummy bawaan dari Cloud Firestore dan aplikasi. Data murid atau entri riil yang Anda buat sendiri TIDAK akan terhapus."
        type="danger"
        confirmText="Ya, Bersihkan Data Dummy"
      />

      {/* Confirm Clear All Database Dialog */}
      <ConfirmDialog
        isOpen={isClearAllDialogOpen}
        onClose={() => setIsClearAllDialogOpen(false)}
        onConfirm={handleClearAllData}
        title="Kosongkan Seluruh Database?"
        message="PERINGATAN: Tindakan ini akan mengosongkan SELURUH isi pangkalan data (murid, kelas, ekskul, presensi, portofolio) dari Cloud Firestore dan penyimpanan lokal. Pastikan Anda telah mengunduh berkas cadangan JSON sebelum melanjutkan."
        type="danger"
        confirmText="Ya, Kosongkan Seluruh Database"
      />

      {/* Confirm Manual Seed Data Dialog */}
      <ConfirmDialog
        isOpen={isSeedDialogOpen}
        onClose={() => setIsSeedDialogOpen(false)}
        onConfirm={handleSeedToFirestore}
        title="Sinkronkan Data Standar ke Cloud Firestore?"
        message="Tindakan ini akan mengunggah data master dan demonstrasi awal UPT SDN Karanganyar ke Cloud Firestore secara manual."
        type="info"
        confirmText="Ya, Sinkronkan Data"
      />
    </div>
  );
};
