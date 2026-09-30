import React, { useState, useMemo } from 'react';
import {
  User,
  Sparkles,
  Award,
  Layers,
  FolderHeart,
  CalendarCheck,
  LineChart,
  ArrowLeft,
  Calendar,
  Phone,
  CheckCircle,
  Clock,
  ShieldCheck,
  Star,
  Plus,
  HeartHandshake,
  Printer,
  Compass,
  Zap,
  TrendingUp,
  BookmarkCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  History,
  ShieldAlert
} from 'lucide-react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { StudentProfileCardModal } from './StudentProfileCardModal';
import { ExtracurricularRegisterModal } from '../extracurriculars/ExtracurricularRegisterModal';
import { validateStudentExtracurriculars } from '../../utils/ruleValidation';

interface StudentDetailViewProps {
  student: Student;
  onBack: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, onBack, onEdit }) => {
  const {
    studentInterests,
    ambassadorMembers,
    extracurricularMembers,
    portfolios,
    achievements,
    attendanceSessions,
    teacherObservations,
    addObservation,
    talentCategories,
    schoolProfile
  } = useData();

  const { canVerifyPortfolio, isGuruKelas, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'talents' | 'ambassador' | 'ekskul' | 'portfolio' | 'history' | 'growth'>('profile');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isRegisterEkskulOpen, setIsRegisterEkskulOpen] = useState(false);

  // New observation state
  const [obsNotes, setObsNotes] = useState('');
  const [obsGrowth, setObsGrowth] = useState('');
  const [obsRecommendations, setObsRecommendations] = useState('');
  const [isSavingObs, setIsSavingObs] = useState(false);
  const [obsSuccessNotice, setObsSuccessNotice] = useState(false);

  // Student specific data queries
  const interests = studentInterests.filter((i) => i.studentId === student.id);
  const myAmbassadors = ambassadorMembers.filter((m) => m.studentId === student.id);
  const activeAmbassadors = myAmbassadors.filter((m) => m.status === 'aktif');
  const pastAmbassadors = myAmbassadors.filter((m) => m.status !== 'aktif');
  const myEkskuls = extracurricularMembers.filter((m) => m.studentId === student.id);
  const myPortfolios = portfolios.filter((p) => p.studentId === student.id);
  const myAchievements = achievements.filter((a) => a.studentId === student.id);
  const myObservations = teacherObservations.filter((o) => o.studentId === student.id);

  // Extracurricular Rule Validation
  const compliance = useMemo(() => {
    return validateStudentExtracurriculars(
      student,
      extracurricularMembers,
      schoolProfile.maxElectiveExtracurricular || 2,
      schoolProfile.currentAcademicYear
    );
  }, [student, extracurricularMembers, schoolProfile.maxElectiveExtracurricular, schoolProfile.currentAcademicYear]);

  // Attendance history
  const attendedActivities: { activityTitle: string; date: string; status: string; type: string }[] = [];
  attendanceSessions.forEach((session) => {
    const record = session.records.find((r) => r.studentId === student.id);
    if (record) {
      attendedActivities.push({
        activityTitle: session.activityTitle || session.referenceName,
        date: session.date,
        status: record.status,
        type: session.referenceType
      });
    }
  });

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsNotes.trim()) return;
    setIsSavingObs(true);
    try {
      await addObservation({
        studentId: student.id,
        studentName: student.fullName,
        classId: student.classId,
        teacherId: currentUser?.id || 'guru',
        teacherName: currentUser?.displayName || 'Guru Kelas',
        observationNotes: obsNotes,
        talentRecommendations: obsRecommendations.split(',').map((s) => s.trim()).filter(Boolean),
        characterGrowthNotes: obsGrowth,
        observedDate: new Date().toISOString().split('T')[0],
        academicYear: student.academicYear,
        semester: schoolProfile.currentSemester
      });
      setObsNotes('');
      setObsGrowth('');
      setObsRecommendations('');
      setObsSuccessNotice(true);
      setTimeout(() => setObsSuccessNotice(false), 3000);
    } finally {
      setIsSavingObs(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '1. Profil', icon: User },
    { id: 'talents', label: '2. Bakat & Minat', icon: Sparkles, count: interests.length },
    { id: 'ambassador', label: '3. Duta Sekolah', icon: Award, count: myAmbassadors.length },
    { id: 'ekskul', label: '4. Ekstrakurikuler', icon: Layers, count: myEkskuls.length },
    { id: 'portfolio', label: '5. Karya & Prestasi', icon: FolderHeart, count: myPortfolios.length + myAchievements.length },
    { id: 'history', label: '6. Riwayat Kegiatan', icon: CalendarCheck, count: attendedActivities.length },
    { id: 'growth', label: '7. Catatan Guru', icon: LineChart, count: myObservations.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Murid
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-emerald-700" /> Cetak Lembar Profil Resmi
          </button>
          <button
            onClick={() => onEdit(student)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            Edit Profil Murid
          </button>
        </div>
      </div>

      {/* Student Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 text-white relative overflow-hidden shadow-lg border border-emerald-700/40">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.fullName)}`}
            alt={student.fullName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-white/10 p-1 border-2 border-amber-300 shadow-md flex-shrink-0"
          />
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-extrabold">
                {student.classId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600 text-emerald-100 text-xs font-semibold">
                TP {student.academicYear} • Semester {schoolProfile.currentSemester}
              </span>
              {/* Status Kepatuhan Aturan Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border shadow-2xs ${
                  compliance.status === 'Memenuhi Ketentuan'
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400'
                    : compliance.status === 'Pengecualian'
                    ? 'bg-purple-500/25 text-purple-200 border-purple-400'
                    : compliance.status === 'Melebihi Batas'
                    ? 'bg-rose-500/25 text-rose-200 border-rose-400'
                    : 'bg-amber-500/25 text-amber-200 border-amber-400'
                }`}
              >
                📋 Aturan: {compliance.status}
              </span>
              {activeAmbassadors.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 text-[10px] font-bold border border-purple-400/40">
                  🎖️ {activeAmbassadors[0].ambassadorTypeName}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{student.fullName}</h2>
            <p className="text-xs text-emerald-200">
              NISN: <span className="font-mono font-bold text-white">{student.nisn}</span> • Gender: {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • Ekskul: <strong className="text-white">{compliance.compulsoryJoined.length} Wajib</strong>, <strong className="text-white">{compliance.electiveCount}/{compliance.maxElectiveAllowed} Pilihan</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-emerald-900 text-amber-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profil */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              Informasi Akademik & Identitas
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="font-bold text-slate-800">{student.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">NISN</span>
                <span className="font-mono font-bold text-slate-800">{student.nisn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Jenis Kelamin</span>
                <span className="font-bold text-slate-800">
                  {student.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Rombongan Belajar</span>
                <span className="font-bold text-emerald-800">{student.classId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Keaktifan</span>
                <Badge variant={student.isActive ? 'emerald' : 'slate'} dot>
                  {student.isActive ? 'Aktif Bersekolah' : 'Non-Aktif'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              Kontak Orang Tua & Catatan Khusus
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Orang Tua / Wali</span>
                <span className="font-bold text-slate-800">{student.parentName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">No. Telepon / WA</span>
                <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {student.parentPhone || '-'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Alamat Tempat Tinggal</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px]">{student.address || '-'}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-1 font-semibold">Catatan Administratif / Observasi Awal:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed italic border border-slate-200/60">
                  "{student.notes || 'Belum ada catatan administratif tambahan.'}"
                </p>
              </div>
            </div>
          </Card>

          {/* Card: Status Kepatuhan Aturan Ekstrakurikuler & Duta */}
          <Card className="md:col-span-2 space-y-4 border-2 border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Status Kepatuhan Aturan Ekstrakurikuler & Duta
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Penilaian otomatis berdasarkan tingkat {student.classId} dan Tahun Pelajaran {schoolProfile.currentAcademicYear}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black border shadow-xs inline-flex items-center gap-1.5 ${
                  compliance.status === 'Memenuhi Ketentuan'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : compliance.status === 'Pengecualian'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : compliance.status === 'Melebihi Batas'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {compliance.status === 'Memenuhi Ketentuan' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : compliance.status === 'Pengecualian' ? (
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                {compliance.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10.5px] font-bold text-slate-500 block uppercase">1. Kewajiban Ekskul Kelas</span>
                <p className="text-xs font-black text-slate-800">
                  {compliance.compulsoryRequiredNames.join(' & ')}
                </p>
                <p className="text-[10.5px] text-slate-500">
                  Status: {compliance.isCompulsoryComplete ? (
                    <strong className="text-emerald-700">✓ Lengkap ({compliance.compulsoryJoined.length} Diikuti)</strong>
                  ) : (
                    <strong className="text-amber-700">⚠️ Kurang: {compliance.compulsoryMissingNames.join(', ')}</strong>
                  )}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10.5px] font-bold text-slate-500 block uppercase">2. Ekskul Pilihan</span>
                <p className="text-xs font-black text-slate-800">
                  {compliance.electiveCount} dari Maksimal {compliance.maxElectiveAllowed}
                </p>
                <p className="text-[10.5px] text-slate-500">
                  {compliance.isElectiveUnderMin ? (
                    <strong className="text-amber-700">⚠️ Belum memilih (Min. 1)</strong>
                  ) : compliance.isElectiveExceeded ? (
                    <strong className="text-rose-700">⛔ Melebihi Kuota Maksimal</strong>
                  ) : (
                    <strong className="text-emerald-700">✓ Sesuai Kuota Pilihan</strong>
                  )}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10.5px] font-bold text-slate-500 block uppercase">3. Keanggotaan Duta</span>
                <p className="text-xs font-black text-slate-800 truncate">
                  {activeAmbassadors.length > 0 ? activeAmbassadors[0].ambassadorTypeName : 'Belum Ada Duta Aktif'}
                </p>
                <p className="text-[10.5px] text-slate-500">
                  {activeAmbassadors.length > 0 ? (
                    <strong className="text-purple-700">✓ 1 Duta Aktif ({activeAmbassadors[0].assignedYear})</strong>
                  ) : (
                    <span>Tersedia untuk ditugaskan</span>
                  )}
                  {pastAmbassadors.length > 0 && ` • ${pastAmbassadors.length} Riwayat`}
                </p>
              </div>
            </div>

            {compliance.reasons.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block text-[11px] text-amber-950">Catatan Evaluasi Sistem:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {compliance.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {compliance.hasException && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                <span className="font-black block text-[11px] text-purple-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-600" /> Catatan Dispensasi / Pengecualian Resmi:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {compliance.exceptionReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Bakat & Minat */}
      {activeTab === 'talents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Hasil Eksplorasi Minat & Peta Potensi
              </h3>
              <p className="text-xs text-slate-500">
                Eksplorasi minat berorientasi pengembangan potensi, bukan tes kemampuan permanen.
              </p>
            </div>
          </div>

          {interests.length === 0 ? (
            <Card className="text-center py-10 text-slate-500 text-xs space-y-2">
              <Compass className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
              <p className="font-bold text-slate-700">Murid belum melakukan eksplorasi minat terpadu.</p>
              <p className="text-slate-400">Silakan kunjungi menu "Bakat & Minat" untuk memandu murid memilih potensi favoritnya.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interests.map((int) => (
                <Card key={int.id} className="border-l-4 border-l-emerald-600 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="emerald">{int.categoryName}</Badge>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{int.subcategory}</h4>
                    </div>
                    <Badge
                      variant={
                        int.interestLevel === 'sangat_tertarik'
                          ? 'amber'
                          : int.interestLevel === 'tertarik'
                          ? 'blue'
                          : 'teal'
                      }
                    >
                      {int.interestLevel === 'sangat_tertarik' ? '⭐ SANGAT TERTARIK' : int.interestLevel === 'tertarik' ? '👍 TERTARIK' : '🌱 INGIN MENCOBA'}
                    </Badge>
                  </div>

                  {int.desiredActivities && int.desiredActivities.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        Aktivitas Praktik Favorit:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {int.desiredActivities.map((act, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-md text-[11px] font-medium"
                          >
                            ✓ {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {int.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      Harapan/Cerita: "{int.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Tahun Ajaran: {int.academicYear} ({int.semester})</span>
                    <span>Terekam: {new Date(int.submittedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Duta Sekolah */}
      {activeTab === 'ambassador' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Keanggotaan Duta SEKAR MELATI (Kepemimpinan Murid)
              </h3>
              <p className="text-xs text-slate-500">
                Aturan: Setiap murid hanya diperbolehkan memiliki maksimal 1 keanggotaan Duta aktif dalam satu periode.
              </p>
            </div>
          </div>

          {/* Bagian 1: Duta Aktif Saat Ini */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Keanggotaan Duta Aktif Periode Ini ({activeAmbassadors.length}/1)
            </h4>

            {activeAmbassadors.length === 0 ? (
              <Card className="text-center py-6 text-slate-500 text-xs bg-slate-50/60 border border-slate-200">
                Murid saat ini belum memiliki penugasan Duta aktif untuk periode {schoolProfile.currentAcademicYear}.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAmbassadors.map((amb) => (
                  <Card key={amb.id} className="border-l-4 border-l-emerald-600 space-y-3 bg-gradient-to-br from-white to-purple-50/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="purple">{amb.ambassadorTypeName}</Badge>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-1">{amb.roleTitle || 'Anggota Kader'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Guru Pembina: {amb.coachName || 'Bapak/Ibu Pembina'}</p>
                      </div>
                      <Badge variant="emerald" dot>
                        AKTIF MENJABAT
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <p>Periode: <strong>{amb.assignedYear}</strong> (Mulai {amb.startDate})</p>
                      {amb.reflectionNotes && (
                        <div className="mt-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-purple-950 italic">
                          Refleksi Diri: "{amb.reflectionNotes}"
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Bagian 2: Riwayat Keanggotaan Duta Sebelumnya */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" /> Riwayat Penugasan Duta Terdahulu ({pastAmbassadors.length} Periode)
            </h4>

            {pastAmbassadors.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada riwayat penugasan Duta pada periode sebelumnya.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pastAmbassadors.map((amb) => (
                  <Card key={amb.id} className="border-l-4 border-l-slate-400 space-y-2 bg-slate-50/70 opacity-90">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="slate">{amb.ambassadorTypeName}</Badge>
                        <h5 className="text-xs font-bold text-slate-800 mt-1">{amb.roleTitle || 'Anggota Kader'}</h5>
                        <p className="text-[11px] text-slate-500">Periode: {amb.assignedYear}</p>
                      </div>
                      <Badge variant="slate">
                        {amb.status.toUpperCase()}
                      </Badge>
                    </div>
                    {amb.endDate && (
                      <p className="text-[11px] text-slate-500">Masa Tugas: {amb.startDate} s/d {amb.endDate}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Ekstrakurikuler */}
      {activeTab === 'ekskul' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Keikutsertaan Ekstrakurikuler ({myEkskuls.length} Total)
              </h3>
              <p className="text-xs text-slate-500">
                Wajib Kelas {compliance.gradeLevel}: <strong className="text-slate-800">{compliance.compulsoryRequiredNames.join(', ')}</strong> • Kuota Pilihan: <strong className="text-slate-800">{compliance.electiveCount}/{compliance.maxElectiveAllowed}</strong>
              </p>
            </div>

            <button
              onClick={() => setIsRegisterEkskulOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" /> Daftarkan ke Ekstrakurikuler
            </button>
          </div>

          {/* Status Alert Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            compliance.status === 'Memenuhi Ketentuan'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : compliance.status === 'Pengecualian'
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : compliance.status === 'Melebihi Batas'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black text-xs block">
                Status Keikutsertaan: {compliance.status}
              </span>
              <p className="text-[11px] leading-relaxed">
                {compliance.statusDescription}
              </p>
            </div>
          </div>

          {myEkskuls.length === 0 ? (
            <Card className="text-center py-10 text-slate-500 text-xs space-y-3">
              <p>Murid belum terdaftar pada kegiatan ekstrakurikuler.</p>
              <button
                onClick={() => setIsRegisterEkskulOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" /> Daftarkan Ke Ekstrakurikuler Sekarang
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEkskuls.map((ek) => {
                const isWajib = ek.isCompulsory || compliance.compulsoryJoined.some((c) => c.id === ek.id);
                return (
                  <Card
                    key={ek.id}
                    className={`border-l-4 space-y-3 ${
                      isWajib ? 'border-l-blue-600 bg-blue-50/10' : 'border-l-emerald-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {isWajib ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200">
                              ★ EKSTRAKURIKULER WAJIB
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              🎯 EKSTRAKURIKULER PILIHAN
                            </span>
                          )}
                          {ek.isException && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">
                              DISPENSASI
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">{ek.extracurricularName}</h4>
                        <p className="text-xs text-slate-500">Terdaftar sejak: {ek.joinedAt} • TP: {ek.academicYear || schoolProfile.currentAcademicYear}</p>
                      </div>
                      <Badge variant={ek.status === 'aktif' ? 'emerald' : 'slate'} dot>
                        {ek.status.toUpperCase()}
                      </Badge>
                    </div>

                    {ek.isException && ek.exceptionReason && (
                      <div className="p-2 rounded-xl bg-purple-50 text-[11px] text-purple-900 border border-purple-200">
                        <strong>Catatan Dispensasi:</strong> "{ek.exceptionReason}"
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Kehadiran Latihan:</span>
                      <span className="font-extrabold text-emerald-700">{ek.attendancePercentage || 100}%</span>
                    </div>

                    {/* Report Card Grade & Description Section */}
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" /> Nilai Rapor (Kurikulum Merdeka):
                        </span>
                        {ek.grade ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-300 text-amber-950 font-black text-xs shadow-2xs">
                            {ek.grade}
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-semibold text-slate-400 italic bg-white px-2 py-0.5 rounded">
                            Belum Dinilai Pembina
                          </span>
                        )}
                      </div>

                      {ek.reportDescription ? (
                        <div className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-amber-100">
                          "{ek.reportDescription}"
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Menunggu masukan penilaian dan deskripsi capaian dari Guru Pembina.
                        </p>
                      )}
                    </div>

                    {ek.coachNotes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                        Catatan Pembina: "{ek.coachNotes}"
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Karya & Prestasi */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-emerald-700" />
              Galeri Portofolio & Karya Mandiri
            </h3>
            {myPortfolios.length === 0 ? (
              <Card className="text-center py-6 text-slate-500 text-xs">
                Belum ada dokumentasi portofolio atau karya yang diunggah.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPortfolios.map((port) => (
                  <Card key={port.id} className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="emerald">{port.category.replace('_', ' ').toUpperCase()}</Badge>
                      {port.isVerified ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Menunggu Verifikasi
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{port.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{port.description}</p>
                    {port.reflection && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                        Refleksi Diri: "{port.reflection}"
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Tanggal: {port.date}</span>
                      <span>Guru Pendamping: {port.coachOrTeacherName || '-'}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Piagam Prestasi & Penghargaan Lomba
            </h3>
            {myAchievements.length === 0 ? (
              <Card className="text-center py-6 text-slate-500 text-xs">
                Belum ada piagam penghargaan yang tercatat.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myAchievements.map((ach) => (
                  <Card key={ach.id} className="bg-gradient-to-br from-amber-500/10 to-emerald-500/5 border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="amber">{ach.rank}</Badge>
                      <span className="text-xs font-bold text-slate-500 capitalize">Tingkat {ach.level}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{ach.title}</h4>
                    <p className="text-xs text-slate-600">{ach.eventName}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-amber-100">
                      <span>Tanggal: {ach.date}</span>
                      <span>Pembimbing: {ach.coachName || '-'}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Riwayat Kegiatan */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-700" />
            Rekapitulasi Kehadiran & Partisipasi Pertemuan
          </h3>
          {attendedActivities.length === 0 ? (
            <Card className="text-center py-10 text-slate-500 text-xs">
              Belum ada riwayat pertemuan presensi yang tercatat untuk murid ini.
            </Card>
          ) : (
            <div className="space-y-2">
              {attendedActivities.map((item, idx) => (
                <Card key={idx} className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.activityTitle}</h4>
                      <p className="text-[11px] text-slate-400">Tanggal: {item.date} • Bidang: {item.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'hadir' ? 'emerald' : item.status === 'izin' ? 'amber' : 'rose'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Catatan Guru */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-teal-700" />
              Catatan Pengamatan & Rekomendasi Guru
            </h3>
            {myObservations.length === 0 ? (
              <Card className="text-center py-6 text-slate-500 text-xs">
                Belum ada catatan pengamatan guru untuk murid ini.
              </Card>
            ) : (
              myObservations.map((obs) => (
                <Card key={obs.id} className="space-y-2 border-l-4 border-l-teal-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">Pengamat: {obs.teacherName}</span>
                    <span className="text-[11px] text-slate-400">{obs.observedDate}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">"{obs.observationNotes}"</p>
                  {obs.characterGrowthNotes && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <strong>Perkembangan Karakter:</strong> {obs.characterGrowthNotes}
                    </div>
                  )}
                  {obs.talentRecommendations && obs.talentRecommendations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-500">Rekomendasi:</span>
                      {obs.talentRecommendations.map((rec, i) => (
                        <Badge key={i} variant="blue" size="sm">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Teacher Form to add observation */}
          {canVerifyPortfolio && (
            <Card className="p-5 border-emerald-200 bg-emerald-50/30 space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                Tambah Catatan Pengamatan & Pertumbuhan Murid
              </h4>
              <form onSubmit={handleSaveObservation} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Pengamatan Keterampilan & Interaksi:
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={obsNotes}
                    onChange={(e) => setObsNotes(e.target.value)}
                    placeholder="Tuliskan apresiasi, ketertarikan yang diamati, atau kemajuan belajar..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Perkembangan Karakter & Kepemimpinan:
                  </label>
                  <input
                    type="text"
                    value={obsGrowth}
                    onChange={(e) => setObsGrowth(e.target.value)}
                    placeholder="Contoh: Semakin mandiri, santun dalam berbicara, suka menolong teman"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rekomendasi Pengembangan (pisahkan dengan koma):
                  </label>
                  <input
                    type="text"
                    value={obsRecommendations}
                    onChange={(e) => setObsRecommendations(e.target.value)}
                    placeholder="Contoh: Seni Tari Tradisional, TIK & Coding, Duta TPPK"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>

                {obsSuccessNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Catatan pengamatan guru berhasil disimpan!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSavingObs}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  {isSavingObs ? 'Menyimpan...' : 'Simpan Catatan Pengamatan'}
                </button>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Print Profile Card Modal */}
      <StudentProfileCardModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        student={student}
      />

      {/* Register Extracurricular Modal for this Student */}
      <ExtracurricularRegisterModal
        isOpen={isRegisterEkskulOpen}
        onClose={() => setIsRegisterEkskulOpen(false)}
        student={student}
      />
    </div>
  );
};
