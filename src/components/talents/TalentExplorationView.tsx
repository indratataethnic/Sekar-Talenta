import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Palette,
  Activity,
  BookOpen,
  PenTool,
  Laptop,
  Users,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Filter,
  Layers,
  HeartHandshake,
  Award,
  Search,
  Plus,
  Trash2,
  Compass,
  Zap,
  UserCheck,
  Printer,
  ChevronRight,
  ShieldCheck,
  Star,
  Flame,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { InterestLevel, Student } from '../../types';

export const TalentExplorationView: React.FC = () => {
  const {
    talentCategories,
    studentInterests,
    submitInterest,
    deleteInterest,
    students,
    classes,
    teacherObservations,
    addObservation,
    schoolProfile,
    ambassadorTypes,
    extracurriculars,
    addAmbassadorMember,
    registerExtracurricularMember,
    ambassadorMembers,
    extracurricularMembers
  } = useData();

  const { currentUser, isMurid, isGuruKelas, isSuperAdmin } = useAuth();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'explore' | 'matrix' | 'recommendations' | 'observations'>('explore');

  // Interactive Exploration Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (isMurid && currentUser?.studentId) return currentUser.studentId;
    if (isGuruKelas && currentUser?.assignedClass) {
      const classStudents = students.filter((s) => s.classId === currentUser.assignedClass);
      return classStudents[0]?.id || students[0]?.id || '';
    }
    return students[0]?.id || '';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(talentCategories[0]?.id || 'cat_seni_budaya');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [interestLevel, setInterestLevel] = useState<InterestLevel>('sangat_tertarik');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Filters for Matrix & Recommendations
  const [matrixClassFilter, setMatrixClassFilter] = useState(() => {
    if (isGuruKelas && currentUser?.assignedClass) return currentUser.assignedClass;
    return 'ALL';
  });
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');

  // Observation Form State
  const [obsStudentId, setObsStudentId] = useState(students[0]?.id || '');
  const [obsNotes, setObsNotes] = useState('');
  const [obsGrowth, setObsGrowth] = useState('');
  const [obsRecommendations, setObsRecommendations] = useState('');
  const [isSavingObs, setIsSavingObs] = useState(false);
  const [obsSuccessNotice, setObsSuccessNotice] = useState(false);

  // Recommendation Quick Assign Feedback
  const [assignedNotice, setAssignedNotice] = useState<string | null>(null);

  const activeCategoryObj = talentCategories.find((c) => c.id === selectedCategory) || talentCategories[0];
  const currentStudentObj = students.find((s) => s.id === selectedStudentId);

  // Student's saved interests
  const currentStudentSavedInterests = useMemo(() => {
    return studentInterests.filter((i) => i.studentId === selectedStudentId);
  }, [studentInterests, selectedStudentId]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette':
        return <Palette className="w-5 h-5 text-emerald-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-amber-600" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-purple-600" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-cyan-600" />;
      case 'Users':
        return <Users className="w-5 h-5 text-indigo-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-600" />;
    }
  };

  const handleToggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleSaveInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentObj) return;

    const sub = selectedSubcategory || activeCategoryObj.subcategories[0] || activeCategoryObj.name;

    await submitInterest({
      studentId: currentStudentObj.id,
      studentName: currentStudentObj.fullName,
      classId: currentStudentObj.classId,
      categoryId: activeCategoryObj.id,
      categoryName: activeCategoryObj.name,
      subcategory: sub,
      interestLevel,
      desiredActivities: selectedActivities.length > 0 ? selectedActivities : [sub],
      notes: customNotes,
      academicYear: schoolProfile.currentAcademicYear,
      semester: schoolProfile.currentSemester,
    });

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3500);
    setCustomNotes('');
    setSelectedActivities([]);
  };

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find((s) => s.id === obsStudentId);
    if (!targetStudent || !obsNotes.trim()) return;

    setIsSavingObs(true);
    try {
      await addObservation({
        studentId: targetStudent.id,
        studentName: targetStudent.fullName,
        classId: targetStudent.classId,
        teacherId: currentUser?.id || 'guru',
        teacherName: currentUser?.displayName || 'Guru Pengamat',
        observationNotes: obsNotes,
        talentRecommendations: obsRecommendations.split(',').map((s) => s.trim()).filter(Boolean),
        characterGrowthNotes: obsGrowth,
        observedDate: new Date().toISOString().split('T')[0],
        academicYear: schoolProfile.currentAcademicYear,
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

  // Smart Matching Recommendation Logic
  const getSmartRecommendationsForInterest = (catId: string, subcategory: string) => {
    const recDutas: string[] = [];
    const recEkskuls: string[] = [];

    const lowerSub = subcategory.toLowerCase();
    const lowerCat = catId.toLowerCase();

    if (lowerSub.includes('tari') || lowerSub.includes('musik') || lowerSub.includes('batik') || lowerCat.includes('seni')) {
      recDutas.push('Duta Sahabat & Harmoni');
      recEkskuls.push('Seni Tari Tradisional', 'Membatik Karanganyar');
    }
    if (lowerSub.includes('sepak') || lowerSub.includes('futsal') || lowerSub.includes('lari') || lowerSub.includes('voli') || lowerCat.includes('olahraga')) {
      recDutas.push('Duta Kesehatan & Kebugaran');
      recEkskuls.push('Futsal & Olahraga Ketangkasan');
    }
    if (lowerSub.includes('komputer') || lowerSub.includes('scratch') || lowerSub.includes('coding') || lowerSub.includes('canva') || lowerCat.includes('teknologi')) {
      recDutas.push('Duta Digital & Media Edukasi');
      recEkskuls.push('Robotik & Coding Sederhana');
    }
    if (lowerSub.includes('baca') || lowerSub.includes('cerita') || lowerSub.includes('pidato') || lowerCat.includes('literasi')) {
      recDutas.push('Duta Literasi & Mading');
      recEkskuls.push('Jurnalistik Cilik & Sastra');
    }
    if (lowerSub.includes('lingkungan') || lowerSub.includes('kebersihan') || lowerSub.includes('tanaman')) {
      recDutas.push('Duta Lingkungan & Adiwiyata');
      recEkskuls.push('Pramuka Siaga & Penggalang');
    }
    if (lowerSub.includes('tahfidz') || lowerSub.includes('agama') || lowerSub.includes('spiritual')) {
      recDutas.push('Duta Sahabat & Harmoni');
      recEkskuls.push('Tahfidz Al-Qur\'an & Tilawah');
    }
    if (recDutas.length === 0) recDutas.push('Duta TPPK & Anti Perundungan');
    if (recEkskuls.length === 0) recEkskuls.push('Pramuka Siaga & Penggalang');

    return { recDutas, recEkskuls };
  };

  // Filtered Interests for Matrix
  const filteredInterests = useMemo(() => {
    return studentInterests.filter((si) => {
      const matchesClass = matrixClassFilter === 'ALL' || si.classId === matrixClassFilter;
      const matchesSearch =
        !matrixSearchQuery ||
        si.studentName.toLowerCase().includes(matrixSearchQuery.toLowerCase()) ||
        si.subcategory.toLowerCase().includes(matrixSearchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [studentInterests, matrixClassFilter, matrixSearchQuery]);

  // Students in selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => matrixClassFilter === 'ALL' || s.classId === matrixClassFilter);
  }, [students, matrixClassFilter]);

  const mappedStudentIdsInClass = useMemo(() => {
    return new Set(filteredInterests.map((i) => i.studentId));
  }, [filteredInterests]);

  const unmappedStudentsInClass = useMemo(() => {
    return classStudents.filter((s) => !mappedStudentIdsInClass.has(s.id));
  }, [classStudents, mappedStudentIdsInClass]);

  // Handle Quick Assign from Recommendation Tab
  const handleQuickAssignAmbassador = async (student: Student, dutaName: string) => {
    const ambType = ambassadorTypes.find((t) => t.name.toLowerCase().includes(dutaName.toLowerCase()) || dutaName.toLowerCase().includes(t.name.toLowerCase())) || ambassadorTypes[0];
    await addAmbassadorMember({
      studentId: student.id,
      studentName: student.fullName,
      studentNis: student.nis || student.nisn,
      classId: student.classId,
      ambassadorTypeId: ambType.id,
      ambassadorTypeCode: ambType.code,
      ambassadorTypeName: ambType.name,
      assignedYear: student.academicYear,
      startDate: new Date().toISOString().split('T')[0],
      coachName: ambType.coachName,
      status: 'aktif',
      roleTitle: `Kader ${ambType.shortName}`
    });
    setAssignedNotice(`${student.fullName} berhasil ditugaskan sebagai ${ambType.name}!`);
    setTimeout(() => setAssignedNotice(null), 3000);
  };

  const handleQuickAssignEkskul = async (student: Student, ekskulName: string) => {
    const targetEk = extracurriculars.find((e) => e.name.toLowerCase().includes(ekskulName.toLowerCase()) || ekskulName.toLowerCase().includes(e.name.toLowerCase())) || extracurriculars[0];
    await registerExtracurricularMember({
      extracurricularId: targetEk.id,
      extracurricularName: targetEk.name,
      studentId: student.id,
      studentName: student.fullName,
      studentNis: student.nis || student.nisn,
      classId: student.classId,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'aktif',
      attendancePercentage: 100
    });
    setAssignedNotice(`${student.fullName} berhasil didaftarkan ke ekskul ${targetEk.name}!`);
    setTimeout(() => setAssignedNotice(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Pemetaan Bakat, Minat & Karakter Murid
          </h2>
          <p className="text-xs text-slate-500">
            Mengenali spektrum potensi murid UPT SDN Karanganyar tanpa pelabelan permanen (Prinsip Kurikulum Merdeka).
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'explore'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            🎨 Eksplorasi Minat
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            📊 Peta Sebaran ({filteredInterests.length})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            🎯 Penyaluran Duta & Ekskul
          </button>
          <button
            onClick={() => setActiveTab('observations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'observations'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            📝 Observasi Guru ({teacherObservations.length})
          </button>
        </div>
      </div>

      {assignedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {assignedNotice}
        </div>
      )}

      {/* Tab 1: Formulir Eksplorasi Minat (Kid-friendly interactive questionnaire) */}
      {activeTab === 'explore' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Category Selector */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              7 Bidang Potensi & Minat
            </h3>
            <div className="space-y-2">
              {talentCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory(cat.subcategories[0] || '');
                      setSelectedActivities([]);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-700 shadow-md translate-x-1'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${
                        isSelected ? 'bg-emerald-900 text-amber-300' : 'bg-slate-100'
                      }`}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold leading-tight">{cat.name}</h4>
                      <p
                        className={`text-[11px] mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        {cat.subcategories.join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Explorer Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-5 border-emerald-200/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                    {getCategoryIcon(activeCategoryObj.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{activeCategoryObj.name}</h3>
                    <p className="text-xs text-slate-500">{activeCategoryObj.description}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveInterest} className="space-y-5">
                {/* Murid Selector */}
                {!isMurid && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Murid yang Melakukan Eksplorasi:
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-emerald-600 bg-slate-50/50"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.classId} - NISN: {s.nisn})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subcategory choices */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Aktivitas atau Topik yang Paling Ingin Dipelajari:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCategoryObj.subcategories.map((sub) => {
                      const isSelected = selectedSubcategory === sub;
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => setSelectedSubcategory(sub)}
                          className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{sub}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level of Interest */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Tingkat Antusiasme Murid:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setInterestLevel('sangat_tertarik')}
                      className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                        interestLevel === 'sangat_tertarik'
                          ? 'bg-amber-50 text-amber-900 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ⭐ Sangat Tertarik
                      <p className="text-[10px] font-normal text-slate-400 mt-0.5">Ingin berlatih rutin & tekun</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterestLevel('tertarik')}
                      className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                        interestLevel === 'tertarik'
                          ? 'bg-blue-50 text-blue-900 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      👍 Tertarik
                      <p className="text-[10px] font-normal text-slate-400 mt-0.5">Senang saat berkegiatan</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterestLevel('ingin_mencoba')}
                      className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                        interestLevel === 'ingin_mencoba'
                          ? 'bg-teal-50 text-teal-900 border-teal-500 ring-2 ring-teal-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🌱 Ingin Mencoba
                      <p className="text-[10px] font-normal text-slate-400 mt-0.5">Penasaran pengalaman baru</p>
                    </button>
                  </div>
                </div>

                {/* Additional thoughts & dreams */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cerita, Cita-cita, atau Harapan Murid (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Contoh: Saya ingin bisa membuat game Scratch sendiri atau tampil menari saat purnawiyata..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>

                {/* Live Recommendation Hint */}
                {(() => {
                  const sub = selectedSubcategory || activeCategoryObj.subcategories[0] || '';
                  const rec = getSmartRecommendationsForInterest(activeCategoryObj.id, sub);
                  return (
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        Penyaluran Terkait yang Disarankan:
                      </div>
                      <p className="text-[11px] text-slate-600">
                        🎖️ Duta Terkait: <strong>{rec.recDutas.join(', ')}</strong> • 🏸 Ekskul Terkait: <strong>{rec.recEkskuls.join(', ')}</strong>
                      </p>
                    </div>
                  );
                })()}

                {isSavedNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Pilihan eksplorasi minat berhasil disimpan ke database rekam potensi murid!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  Simpan Pilihan Eksplorasi Minat Murid Ini
                </button>
              </form>
            </Card>

            {/* Current Student's Saved Interests History */}
            {currentStudentObj && (
              <Card className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Riwayat Pilihan Minat: {currentStudentObj.fullName}</span>
                  <Badge variant="emerald">{currentStudentSavedInterests.length} Minat Tercatat</Badge>
                </h4>
                {currentStudentSavedInterests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Murid ini belum menyimpan pilihan eksplorasi minat.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentStudentSavedInterests.map((si) => (
                      <div key={si.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{si.subcategory}</p>
                          <p className="text-[10px] text-slate-500">{si.categoryName}</p>
                          <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-1 inline-block">
                            {si.interestLevel.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteInterest(si.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Minat Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Peta Minat & Analisis Sebaran (School & Class Matrix) */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Top Filter Controls */}
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Peta Sebaran Minat & Potensi Murid</h3>
              <p className="text-xs text-slate-500">Melihat pemetaan minat untuk perencanaan kegiatan sekolah dan rombel</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={matrixSearchQuery}
                  onChange={(e) => setMatrixSearchQuery(e.target.value)}
                  placeholder="Cari murid / topik..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <select
                value={matrixClassFilter}
                onChange={(e) => setMatrixClassFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 bg-white"
              >
                <option value="ALL">Semua Kelas (1A - 6B)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Status Progress Pemetaan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-emerald-50/40 border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">Status Pemetaan Rombel ({matrixClassFilter})</span>
                <span className="font-extrabold text-xs text-emerald-800">
                  {mappedStudentIdsInClass.size} dari {classStudents.length} Murid ({classStudents.length > 0 ? Math.round((mappedStudentIdsInClass.size / classStudents.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${classStudents.length > 0 ? (mappedStudentIdsInClass.size / classStudents.length) * 100 : 0}%` }}
                />
              </div>
            </Card>

            <Card className="p-4 bg-amber-50/40 border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950">Murid Belum Terpetakan:</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {unmappedStudentsInClass.length} murid di rombel ini belum mengisi kuesioner minat.
                </p>
              </div>
              {unmappedStudentsInClass.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedStudentId(unmappedStudentsInClass[0].id);
                    setActiveTab('explore');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  Pandu {unmappedStudentsInClass[0].fullName.split(' ')[0]}
                </button>
              )}
            </Card>
          </div>

          {/* Category Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {talentCategories.map((cat) => {
              const matches = filteredInterests.filter((si) => si.categoryId === cat.id);
              return (
                <Card key={cat.id} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                    </div>
                    <Badge variant="emerald">{matches.length} Murid</Badge>
                  </div>

                  {matches.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center">Belum ada murid di filter ini</p>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {matches.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs hover:bg-emerald-50/50 transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{item.studentName}</p>
                            <p className="text-[10px] text-slate-400">{item.classId} • {item.subcategory}</p>
                          </div>
                          <Badge
                            size="sm"
                            variant={
                              item.interestLevel === 'sangat_tertarik'
                                ? 'amber'
                                : item.interestLevel === 'tertarik'
                                ? 'blue'
                                : 'teal'
                            }
                          >
                            {item.interestLevel === 'sangat_tertarik' ? '⭐ Sangat' : item.interestLevel === 'tertarik' ? '👍 Tertarik' : '🌱 Mencoba'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Rekomendasi Penyaluran Cerdas (Auto-Matching to Duta & Ekskul) */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Matriks Penyaluran Potensi ke Duta SEKAR MELATI & Ekstrakurikuler
              </h3>
              <p className="text-xs text-slate-500">
                Pencocokan otomatis minat murid dengan wadah pengembangan bakat dan kepemimpinan sekolah.
              </p>
            </div>

            <select
              value={matrixClassFilter}
              onChange={(e) => setMatrixClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 bg-white self-start sm:self-auto"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            {filteredInterests.length === 0 ? (
              <Card className="text-center py-10 text-slate-400 text-xs">
                Belum ada data minat murid yang terpetakan pada filter ini.
              </Card>
            ) : (
              filteredInterests.map((interest) => {
                const targetStudent = students.find((s) => s.id === interest.studentId);
                const { recDutas, recEkskuls } = getSmartRecommendationsForInterest(interest.categoryId, interest.subcategory);
                
                const isAlreadyAmbassador = ambassadorMembers.some((m) => m.studentId === interest.studentId && m.status === 'aktif');
                const isAlreadyEkskul = extracurricularMembers.some((m) => m.studentId === interest.studentId && m.status === 'aktif');

                return (
                  <Card key={interest.id} className="p-4 space-y-3 border-l-4 border-l-amber-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{interest.studentName}</h4>
                          <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                            {interest.classId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Minat Terpilih: <strong className="text-emerald-800">{interest.subcategory}</strong> ({interest.categoryName}) • Antusiasme: {interest.interestLevel.replace('_', ' ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAlreadyAmbassador ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold">
                            ✓ Duta Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                            Belum Duta
                          </span>
                        )}
                        {isAlreadyEkskul ? (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 text-[10px] font-bold">
                            ✓ Ekskul Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                            Belum Ekskul
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Recommendations & 1-Click Action */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                      {/* Duta Recommendation */}
                      <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
                        <span className="font-bold text-purple-950 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-purple-700" /> Rekomendasi Duta Sekolah:
                        </span>
                        <p className="text-[11px] text-purple-900 font-semibold">{recDutas[0]}</p>
                        {targetStudent && !isAlreadyAmbassador && (
                          <button
                            onClick={() => handleQuickAssignAmbassador(targetStudent, recDutas[0])}
                            className="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] shadow-2xs transition-all active:scale-95"
                          >
                            + Tugaskan Jadi Duta
                          </button>
                        )}
                      </div>

                      {/* Ekskul Recommendation */}
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
                        <span className="font-bold text-blue-950 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-blue-700" /> Rekomendasi Ekstrakurikuler:
                        </span>
                        <p className="text-[11px] text-blue-900 font-semibold">{recEkskuls[0]}</p>
                        {targetStudent && !isAlreadyEkskul && (
                          <button
                            onClick={() => handleQuickAssignEkskul(targetStudent, recEkskuls[0])}
                            className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[10px] shadow-2xs transition-all active:scale-95"
                          >
                            + Daftarkan ke Ekskul
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Catatan Observasi Guru */}
      {activeTab === 'observations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Observation Form for Teachers */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border-emerald-200 bg-emerald-50/20 space-y-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                Input Catatan Pengamatan Guru
              </h3>
              <p className="text-xs text-slate-500">
                Dokumentasikan apresiasi, ketekunan, dan potensi yang teramati selama kegiatan belajar.
              </p>

              <form onSubmit={handleSaveObservation} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Murid:
                  </label>
                  <select
                    value={obsStudentId}
                    onChange={(e) => setObsStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white font-medium"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.classId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Keterampilan & Interaksi Murid *:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={obsNotes}
                    onChange={(e) => setObsNotes(e.target.value)}
                    placeholder="Contoh: Menunjukkan ketertarikan tinggi saat praktik eksperimen IPA, teliti dalam mencatat..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Perkembangan Karakter & Sikap Sosial:
                  </label>
                  <input
                    type="text"
                    value={obsGrowth}
                    onChange={(e) => setObsGrowth(e.target.value)}
                    placeholder="Contoh: Suka menolong teman, percaya diri tampil di depan kelas"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rekomendasi Wadah Bakat (pisahkan koma):
                  </label>
                  <input
                    type="text"
                    value={obsRecommendations}
                    onChange={(e) => setObsRecommendations(e.target.value)}
                    placeholder="Contoh: Duta Digital, Robotik & Coding, Membatik"
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
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingObs ? 'Menyimpan...' : 'Simpan Catatan Pengamatan'}
                </button>
              </form>
            </Card>
          </div>

          {/* Observations List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Arsip Catatan Pengamatan Guru ({teacherObservations.length})
            </h3>
            {teacherObservations.length === 0 ? (
              <Card className="text-center py-10 text-slate-400 text-xs">
                Belum ada arsip catatan pengamatan guru.
              </Card>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {teacherObservations.map((obs) => (
                  <Card key={obs.id} className="p-4 space-y-2 border-l-4 border-l-emerald-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{obs.studentName}</h4>
                        <span className="text-[11px] text-slate-400">{obs.classId} • Pengamat: {obs.teacherName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{obs.observedDate}</span>
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl italic leading-relaxed">
                      "{obs.observationNotes}"
                    </p>
                    {obs.characterGrowthNotes && (
                      <p className="text-xs text-emerald-900 bg-emerald-50 p-2 rounded-lg font-medium">
                        🌟 Karakter: {obs.characterGrowthNotes}
                      </p>
                    )}
                    {obs.talentRecommendations && obs.talentRecommendations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-slate-500 font-bold">Rekomendasi:</span>
                        {obs.talentRecommendations.map((r, idx) => (
                          <Badge key={idx} variant="blue" size="sm">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
