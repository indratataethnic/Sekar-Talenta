import React from 'react';
import {
  Users,
  Award,
  Layers,
  Sparkles,
  CalendarDays,
  FolderHeart,
  TrendingUp,
  CheckCircle2,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Compass,
  Star,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from './StatCard';
import { DashboardCharts } from './DashboardCharts';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, role, isMurid, isGuruKelas, isPembina, isKepalaSekolah, isSuperAdmin } = useAuth();
  const {
    students,
    ambassadorTypes,
    ambassadorMembers,
    extracurriculars,
    extracurricularMembers,
    talentCategories,
    activities,
    portfolios,
    achievements,
    announcements
  } = useData();

  // Statistics calculation
  const totalStudents = students.length;
  const totalAmbassadors = ambassadorMembers.length;
  const totalAmbassadorTypes = ambassadorTypes.length;
  const totalTalentCategories = talentCategories.length;
  const totalExtracurriculars = extracurriculars.length;
  const totalEkskulParticipants = extracurricularMembers.length;
  const totalActivitiesDone = activities.filter((a) => a.status === 'selesai').length;
  const totalPortfoliosAndAchievements = portfolios.length + achievements.length;

  const upcomingActivities = activities
    .filter((a) => a.status === 'rencana' || a.status === 'berlangsung')
    .slice(0, 3);

  // Murid specific statistics
  const currentStudent = isMurid ? students.find((s) => s.id === currentUser?.studentId) || students[0] : null;
  const myDuta = currentStudent ? ambassadorMembers.filter((m) => m.studentId === currentStudent.id) : [];
  const myEkskul = currentStudent ? extracurricularMembers.filter((m) => m.studentId === currentStudent.id) : [];
  const myPortfolios = currentStudent ? portfolios.filter((p) => p.studentId === currentStudent.id) : [];
  const myAchievements = currentStudent ? achievements.filter((a) => a.studentId === currentStudent.id) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/60 text-amber-300 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEKAR TALENTA • UPT SDN Karanganyar Kota Pasuruan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isMurid
              ? 'Selamat Datang di Portal Murid & Orang Tua!'
              : role === 'guru_kelas'
              ? `Selamat Datang di Portal Guru Kelas (${currentUser?.assignedClass || '4A'})!`
              : role === 'pembina'
              ? 'Selamat Datang di Portal Pembina Duta & Ekskul!'
              : 'Selamat Datang di Portal Super Admin!'}
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 mt-2 leading-relaxed">
            {isMurid
              ? 'Jelajahi minat dan bakatmu, aktif berkontribusi di Duta Sekolah & Ekstrakurikuler, dan abadikan setiap karyamu!'
              : 'Platform digital terintegrasi untuk eksplorasi karakter, pemetaan potensi, kepemimpinan Duta Sekolah, dan rekam jejak prestasi murid.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {isMurid ? (
              <>
                <button
                  onClick={() => onNavigate('talents')}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Mulai Eksplorasi Minatku
                </button>
                <button
                  onClick={() => onNavigate('portfolios')}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm border border-emerald-600/80 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <FolderHeart className="w-4 h-4" /> Lihat Portofolioku
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('students')}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" /> Kelola Data Murid
                </button>
                <button
                  onClick={() => onNavigate('reports')}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm border border-emerald-600/80 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" /> Lihat Laporan Sekolah
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Murid Custom Hero Cards if Murid */}
      {isMurid && currentStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase">Kelas Saya</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{currentStudent.classId}</p>
                <p className="text-[11px] text-slate-500">NISN: {currentStudent.nisn}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                {currentStudent.classId.replace('Kelas ', '')}
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-800 uppercase">Duta Sekolah</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {myDuta.length > 0 ? myDuta[0].ambassadorTypeName : 'Belum Bergabung'}
                </p>
                <p className="text-[11px] text-slate-500">{myDuta.length > 0 ? 'Kader Aktif' : 'Pendaftaran Terbuka'}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase">Ekstrakurikuler</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{myEkskul.length} Ekskul</p>
                <p className="text-[11px] text-slate-500">
                  {myEkskul.map((e) => e.extracurricularName.split(' ')[0]).join(', ') || 'Belum Terdaftar'}
                </p>
              </div>
              <Layers className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase">Karya & Prestasi</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{myPortfolios.length + myAchievements.length} Portofolio</p>
                <p className="text-[11px] text-slate-500">{myAchievements.length} Penghargaan</p>
              </div>
              <Star className="w-8 h-8 text-amber-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Murid"
          value={totalStudents}
          subtitle="Terdaftar di 12 Rombel Kelas"
          icon={Users}
          variant="emerald"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Anggota Duta"
          value={totalAmbassadors}
          subtitle={`${totalAmbassadorTypes} Bidang Duta SEKAR MELATI`}
          icon={Award}
          variant="purple"
          onClick={() => onNavigate('ambassadors')}
        />
        <StatCard
          title="Peserta Ekskul"
          value={totalEkskulParticipants}
          subtitle={`${totalExtracurriculars} Pilihan Kegiatan Terbuka`}
          icon={Layers}
          variant="blue"
          onClick={() => onNavigate('extracurriculars')}
        />
        <StatCard
          title="Karya & Prestasi"
          value={totalPortfoliosAndAchievements}
          subtitle={`${totalActivitiesDone} Kegiatan Berhasil Selesai`}
          icon={FolderHeart}
          variant="amber"
          onClick={() => onNavigate('portfolios')}
        />
      </div>

      {/* Charts Section */}
      <DashboardCharts />

      {/* Two Column Grid: Upcoming Activities & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Activities (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
                Jadwal & Agenda Mendatang
              </h3>
              <p className="text-xs text-slate-500">Pertemuan pembinaan, latihan ekskul, dan aksi sekolah</p>
            </div>
            <button
              onClick={() => onNavigate('activities')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingActivities.length === 0 ? (
              <Card className="text-center py-8 text-slate-500 text-sm">
                Belum ada jadwal kegiatan mendatang.
              </Card>
            ) : (
              upcomingActivities.map((act) => (
                <Card key={act.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          act.type === 'duta'
                            ? 'purple'
                            : act.type === 'ekstrakurikuler'
                            ? 'blue'
                            : 'emerald'
                        }
                      >
                        {act.referenceName}
                      </Badge>
                      <span className="text-xs text-slate-500 font-medium">
                        📍 {act.location}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">{act.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{act.description}</p>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg">
                      {act.dateTime}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">PJ: {act.personInCharge}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Announcements & Core Principles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-600" />
              Pengumuman Sekolah
            </h3>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <Card key={ann.id} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant={ann.category === 'duta' ? 'purple' : ann.category === 'ekskul' ? 'blue' : 'amber'}>
                    {ann.category.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{ann.publishedAt}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{ann.title}</h4>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{ann.content}</p>
                <div className="mt-2 text-[10px] font-semibold text-slate-400">
                  Oleh: {ann.authorName}
                </div>
              </Card>
            ))}
          </div>

          {/* Educational Principles Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-950 text-emerald-100 text-xs space-y-2 border border-emerald-800/40">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" /> Prinsip SEKAR TALENTA
            </div>
            <ul className="space-y-1.5 text-emerald-200/90 text-[11px]">
              <li>✨ Berpusat pada potensi unik setiap murid.</li>
              <li>🌱 Tanpa pelabelan kaku atau peringkat yang mempermalukan anak.</li>
              <li>🛡️ Kesempatan adil & perlindungan rasa aman di sekolah.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
