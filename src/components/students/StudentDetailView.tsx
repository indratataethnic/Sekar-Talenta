import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { StudentProfileCardModal } from './StudentProfileCardModal';

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

  // New observation state
  const [obsNotes, setObsNotes] = useState('');
  const [obsGrowth, setObsGrowth] = useState('');
  const [obsRecommendations, setObsRecommendations] = useState('');
  const [isSavingObs, setIsSavingObs] = useState(false);
  const [obsSuccessNotice, setObsSuccessNotice] = useState(false);

  // Student specific data queries
  const interests = studentInterests.filter((i) => i.studentId === student.id);
  const myAmbassadors = ambassadorMembers.filter((m) => m.studentId === student.id);
  const myEkskuls = extracurricularMembers.filter((m) => m.studentId === student.id);
  const myPortfolios = portfolios.filter((p) => p.studentId === student.id);
  const myAchievements = achievements.filter((a) => a.studentId === student.id);
  const myObservations = teacherObservations.filter((o) => o.studentId === student.id);

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
              {myAmbassadors.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 text-[10px] font-bold border border-purple-400/40">
                  🎖️ {myAmbassadors[0].ambassadorTypeName}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{student.fullName}</h2>
            <p className="text-xs text-emerald-200">
              NISN: <span className="font-mono font-bold text-white">{student.nisn}</span> • Gender: {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Keanggotaan Duta SEKAR MELATI (Kepemimpinan Murid)
            </h3>
          </div>

          {myAmbassadors.length === 0 ? (
            <Card className="text-center py-10 text-slate-500 text-xs">
              Murid saat ini belum ditugaskan dalam korps Duta Sekolah.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAmbassadors.map((amb) => (
                <Card key={amb.id} className="border-l-4 border-l-purple-600 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="purple">{amb.ambassadorTypeName}</Badge>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{amb.roleTitle || 'Anggota Kader'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Guru Pembina: {amb.coachName || 'Bapak/Ibu Pembina'}</p>
                    </div>
                    <Badge variant="emerald" dot>
                      {amb.status.toUpperCase()}
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
      )}

      {/* Tab 4: Ekstrakurikuler */}
      {activeTab === 'ekskul' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Keikutsertaan Ekstrakurikuler
            </h3>
          </div>

          {myEkskuls.length === 0 ? (
            <Card className="text-center py-10 text-slate-500 text-xs">
              Murid belum terdaftar pada kegiatan ekstrakurikuler.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEkskuls.map((ek) => (
                <Card key={ek.id} className="border-l-4 border-l-blue-600 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{ek.extracurricularName}</h4>
                      <p className="text-xs text-slate-500">Tanggal Daftar: {ek.joinedAt}</p>
                    </div>
                    <Badge variant="blue">{ek.status.toUpperCase()}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Persentase Kehadiran:</span>
                    <span className="font-extrabold text-emerald-700">{ek.attendancePercentage || 100}%</span>
                  </div>

                  {ek.coachNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                      Catatan Pembina: "{ek.coachNotes}"
                    </p>
                  )}
                </Card>
              ))}
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
    </div>
  );
};
