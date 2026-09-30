import React, { useMemo } from 'react';
import {
  Users,
  Award,
  Layers,
  Sparkles,
  CalendarDays,
  FolderHeart,
  TrendingUp,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Compass,
  Star,
  CheckCircle2,
  GraduationCap,
  AlertTriangle,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isClassMatching } from '../../utils/classUtils';
import { StatCard } from './StatCard';
import { DashboardCharts } from './DashboardCharts';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { validateStudentExtracurriculars } from '../../utils/ruleValidation';

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
    announcements,
    schoolProfile
  } = useData();

  // ONLY Guru Kelas is scoped to their specific assigned class
  // Murid / Ortu, Super Admin, Kepala Sekolah, and Pembina view overall school data
  const isClassScoped = isGuruKelas && !isMurid && !!currentUser?.assignedClass;
  const assignedClass = currentUser?.assignedClass || '';
  const myClassStudents = isClassScoped
    ? students.filter((s) => isClassMatching(s.classId, assignedClass))
    : students;
  const myClassStudentIds = useMemo(() => new Set(myClassStudents.map((s) => s.id)), [myClassStudents]);

  // Statistics calculation
  const totalStudents = myClassStudents.length;
  const totalAmbassadors = isClassScoped
    ? ambassadorMembers.filter((m) => myClassStudentIds.has(m.studentId)).length
    : ambassadorMembers.length;
  const totalAmbassadorTypes = ambassadorTypes.length;
  const totalTalentCategories = talentCategories.length;
  const totalExtracurriculars = extracurriculars.length;
  const totalEkskulParticipants = isClassScoped
    ? extracurricularMembers.filter((m) => myClassStudentIds.has(m.studentId)).length
    : extracurricularMembers.length;
  const totalActivitiesDone = activities.filter((a) => a.status === 'selesai').length;
  const totalPortfoliosAndAchievements = isClassScoped
    ? portfolios.filter((p) => myClassStudentIds.has(p.studentId)).length + achievements.filter((a) => myClassStudentIds.has(a.studentId)).length
    : portfolios.length + achievements.length;

  // Extracurricular & Ambassador Rule Compliance
  const maxElective = schoolProfile.maxElectiveExtracurricular || 2;
  const studentValidations = useMemo(() => {
    return myClassStudents.map((s) =>
      validateStudentExtracurriculars(
        s,
        extracurricularMembers,
        maxElective,
        schoolProfile.currentAcademicYear
      )
    );
  }, [myClassStudents, extracurricularMembers, maxElective, schoolProfile.currentAcademicYear]);

  const countMemenuhi = studentValidations.filter((v) => v.status === 'Memenuhi Ketentuan').length;
  const countBelumMemenuhi = studentValidations.filter((v) => v.status === 'Belum Memenuhi').length;
  const countMelebihiBatas = studentValidations.filter((v) => v.status === 'Melebihi Batas').length;
  const countPengecualian = studentValidations.filter((v) => v.status === 'Pengecualian').length;

  const countMissingElective = studentValidations.filter((v) => v.isElectiveUnderMin).length;
  const countMissingCompulsory = studentValidations.filter((v) => !v.isCompulsoryComplete).length;
  const percentMemenuhi = totalStudents > 0 ? Math.round((countMemenuhi / totalStudents) * 100) : 0;

  const upcomingActivities = activities
    .filter((a) => a.status === 'rencana' || a.status === 'berlangsung')
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 border border-emerald-600/70 text-amber-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SEKAR TALENTA • Sistem Eksplorasi Karakter, Bakat, Minat, dan Talenta Murid</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-amber-400/40 text-amber-200 text-xs font-semibold">
              Kenali Potensi • Kembangkan Bakat • Tumbuhkan Kepemimpinan
            </div>
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
              ? 'Jelajahi seluruh program pengembangan potensi, ekstrakurikuler, kepemimpinan Duta Sekolah, dan karya inspiratif murid UPT SDN Karanganyar!'
              : 'Platform digital terintegrasi untuk eksplorasi karakter, pemetaan potensi, kepemimpinan Duta Sekolah, dan rekam jejak prestasi murid.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {isMurid ? (
              <>
                <button
                  onClick={() => onNavigate('talents')}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Jelajahi Bakat & Minat
                </button>
                <button
                  onClick={() => onNavigate('ambassadors')}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> Duta Sekolah
                </button>
                <button
                  onClick={() => onNavigate('extracurriculars')}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" /> Ekstrakurikuler
                </button>
                <button
                  onClick={() => onNavigate('portfolios')}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm border border-emerald-600/80 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <FolderHeart className="w-4 h-4" /> Portofolio & Karya
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

      {/* Main Overall Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          key="stat-students"
          title={isClassScoped ? `Murid ${assignedClass}` : "Total Murid Sekolah"}
          value={totalStudents}
          subtitle={isClassScoped ? `Terdaftar aktif di rombel Anda` : "Terdaftar di 12 Rombel Kelas"}
          icon={Users}
          variant="emerald"
          onClick={() => onNavigate(isMurid ? 'talents' : 'students')}
        />
        <StatCard
          key="stat-ambassadors"
          title={isClassScoped ? `Kader Duta ${assignedClass}` : "Anggota Duta Sekolah"}
          value={totalAmbassadors}
          subtitle={isClassScoped ? `Dari rombel ${assignedClass}` : `${totalAmbassadorTypes} Bidang Duta SEKAR MELATI`}
          icon={Award}
          variant="purple"
          onClick={() => onNavigate('ambassadors')}
        />
        <StatCard
          key="stat-ekskul"
          title={isClassScoped ? `Peserta Ekskul ${assignedClass}` : "Peserta Ekstrakurikuler"}
          value={totalEkskulParticipants}
          subtitle={isClassScoped ? `Murid rombel aktif berkegiatan` : `${totalExtracurriculars} Pilihan Kegiatan Terbuka`}
          icon={Layers}
          variant="blue"
          onClick={() => onNavigate('extracurriculars')}
        />
        <StatCard
          key="stat-portfolios"
          title={isClassScoped ? `Karya Murid ${assignedClass}` : "Karya & Piagam Prestasi"}
          value={totalPortfoliosAndAchievements}
          subtitle={isClassScoped ? `Karya & sertifikat murid Anda` : `${totalActivitiesDone} Kegiatan Selesai Terlaksana`}
          icon={FolderHeart}
          variant="amber"
          onClick={() => onNavigate('portfolios')}
        />
      </div>

      {/* Monitoring Kepatuhan Aturan Ekstrakurikuler & Duta */}
      <Card className="p-5 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 border-2 border-emerald-200/80 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-700 text-white shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Monitoring Aturan Ekstrakurikuler & Duta Sekolah
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                  {percentMemenuhi}% Patuh
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pramuka (Wajib 1-5) • TIK (Wajib 4-6) • Min. 1 Pilihan • Maks. {maxElective} Pilihan • Maks. 1 Duta Aktif/Periode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> Laporan Rinci
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5" /> Lihat di Data Murid
            </button>
          </div>
        </div>

        {/* 4 Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Memenuhi Ketentuan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-800">{countMemenuhi}</p>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              ✓ Ekskul wajib & pilihan lengkap
            </span>
          </div>

          <div
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Belum Memenuhi</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-900">{countBelumMemenuhi}</p>
            <span className="text-[10px] text-amber-700 font-semibold block truncate">
              {countMissingCompulsory > 0 ? `${countMissingCompulsory} kurang wajib` : ''}
              {countMissingCompulsory > 0 && countMissingElective > 0 ? ' • ' : ''}
              {countMissingElective > 0 ? `${countMissingElective} belum pilih ekskul` : ''}
              {countMissingCompulsory === 0 && countMissingElective === 0 ? 'Perlu dilengkapi' : ''}
            </span>
          </div>

          <div
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-sm cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Melebihi Batas</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-900">{countMelebihiBatas}</p>
            <span className="text-[10px] text-rose-600 font-semibold block">
              Lebih dari {maxElective} ekskul pilihan
            </span>
          </div>

          <div
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-sm cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Pengecualian / Dispensasi</span>
              <ShieldAlert className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-900">{countPengecualian}</p>
            <span className="text-[10px] text-purple-600 font-semibold block">
              Izin resmi alasan tersimpan
            </span>
          </div>
        </div>
      </Card>

      {/* Charts Section: School-Wide Talent & Activity Overview */}
      <DashboardCharts />

      {/* Two Column Grid: Upcoming Activities & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Activities (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
                Jadwal & Agenda Sekolah Mendatang
              </h3>
              <p className="text-xs text-slate-500">Pertemuan pembinaan, latihan ekstrakurikuler, dan aksi sekolah</p>
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
              upcomingActivities.map((act, idx) => (
                <Card key={act.id ? `act-${act.id}` : `act-idx-${idx}`} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              Pengumuman Terbaru
            </h3>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 2).map((ann, idx) => (
              <Card key={ann.id ? `ann-${ann.id}` : `ann-idx-${idx}`} className="p-4 space-y-2 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <Badge variant={ann.category === 'duta' ? 'purple' : ann.category === 'ekskul' ? 'blue' : 'emerald'} size="sm">
                    {ann.category.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ann.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
              </Card>
            ))}

            {/* SEKAR TALENTA Mascot & Mission Card */}
            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Prinsip Utama SEKAR TALENTA</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Setiap murid di UPT SDN Karanganyar memiliki keunikan dan potensi unggul. Program ini mewadahi eksplorasi, kepemimpinan Duta Sekolah, dan ketekunan ekstrakurikuler tanpa pelabelan permanen.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
