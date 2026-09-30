import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  UploadCloud,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  School,
  Sparkles,
  FileSpreadsheet,
  Award,
  Layers,
  LayoutGrid,
  List,
  Printer,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Phone,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { isClassMatching } from '../../utils/classUtils';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StudentFormModal } from './StudentFormModal';
import { CsvImportModal } from './CsvImportModal';
import { StudentDetailView } from './StudentDetailView';
import { StudentProfileCardModal } from './StudentProfileCardModal';
import { validateStudentExtracurriculars, StudentEkskulValidation, ComplianceStatus } from '../../utils/ruleValidation';

export const StudentListView: React.FC = () => {
  const {
    students,
    classes,
    deleteStudent,
    deleteAllStudents,
    studentInterests,
    ambassadorMembers,
    extracurricularMembers,
    ambassadorTypes,
    extracurriculars,
    schoolProfile
  } = useData();

  const { canManageStudents, canEditStudent, isSuperAdmin, isGuruKelas, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(() => {
    if (isGuruKelas && currentUser?.assignedClass) return currentUser.assignedClass;
    return 'ALL';
  });

  // Sync selectedClass if user is Guru Kelas
  React.useEffect(() => {
    if (isGuruKelas && currentUser?.assignedClass) {
      setSelectedClass(currentUser.assignedClass);
    }
  }, [isGuruKelas, currentUser?.assignedClass]);

  const isClassLocked = isGuruKelas && !!currentUser?.assignedClass;
  const effectiveClass = isClassLocked ? currentUser.assignedClass : selectedClass;

  const [selectedGender, setSelectedGender] = useState('ALL');
  const [interestFilter, setInterestFilter] = useState<'ALL' | 'MAPPED' | 'UNMAPPED'>('ALL');
  const [ambassadorFilter, setAmbassadorFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [ekskulFilter, setEkskulFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | ComplianceStatus | 'NO_ELECTIVE'>('ALL');
  const [selectedEkskul, setSelectedEkskul] = useState<string>('ALL');
  const [selectedAmbassador, setSelectedAmbassador] = useState<string>('ALL');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'nisn' | 'class'>('name_asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected student for detail view or modal
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllStudents();
      setIsDeleteAllModalOpen(false);
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Set of students who have filled interest
  const mappedStudentIds = useMemo(() => new Set(studentInterests.map((i) => i.studentId)), [studentInterests]);
  const ambassadorStudentIds = useMemo(() => new Set(ambassadorMembers.filter((m) => m.status === 'aktif').map((m) => m.studentId)), [ambassadorMembers]);
  const ekskulStudentIds = useMemo(() => new Set(extracurricularMembers.filter((m) => m.status === 'aktif').map((m) => m.studentId)), [extracurricularMembers]);

  // Students scoped for metrics: if Guru Kelas, strictly scope metrics to their class
  const classScopedStudents = useMemo(() => {
    if (isClassLocked) {
      return students.filter((s) => isClassMatching(s.classId, currentUser.assignedClass));
    }
    return students;
  }, [students, isClassLocked, currentUser?.assignedClass]);

  // Pre-calculate extracurricular & ambassador compliance for all students
  const maxElective = schoolProfile.maxElectiveExtracurricular || 2;
  const studentComplianceMap = useMemo(() => {
    const map = new Map<string, StudentEkskulValidation>();
    for (const s of students) {
      map.set(
        s.id,
        validateStudentExtracurriculars(
          s,
          extracurricularMembers,
          maxElective,
          schoolProfile.currentAcademicYear
        )
      );
    }
    return map;
  }, [students, extracurricularMembers, maxElective, schoolProfile.currentAcademicYear]);

  // Metric stats
  const totalStudents = classScopedStudents.length;
  const countLaki = classScopedStudents.filter((s) => s.gender === 'L').length;
  const countPerempuan = classScopedStudents.filter((s) => s.gender === 'P').length;
  const countMapped = classScopedStudents.filter((s) => mappedStudentIds.has(s.id)).length;
  const countAmbassadors = classScopedStudents.filter((s) => ambassadorStudentIds.has(s.id)).length;
  const countEkskul = classScopedStudents.filter((s) => ekskulStudentIds.has(s.id)).length;
  const mappedPercentage = totalStudents > 0 ? Math.round((countMapped / totalStudents) * 100) : 0;

  // Compliance metric stats
  const countMemenuhi = classScopedStudents.filter((s) => studentComplianceMap.get(s.id)?.status === 'Memenuhi Ketentuan').length;
  const countBelumMemenuhi = classScopedStudents.filter((s) => studentComplianceMap.get(s.id)?.status === 'Belum Memenuhi').length;
  const countMelebihiBatas = classScopedStudents.filter((s) => studentComplianceMap.get(s.id)?.status === 'Melebihi Batas').length;
  const countPengecualian = classScopedStudents.filter((s) => studentComplianceMap.get(s.id)?.status === 'Pengecualian').length;
  const countNoElective = classScopedStudents.filter((s) => studentComplianceMap.get(s.id)?.isElectiveUnderMin).length;

  // Filter students
  const filteredStudents = useMemo(() => {
    let result = students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        (s.nis && s.nis.includes(q)) ||
        (s.parentName && s.parentName.toLowerCase().includes(q));

      const matchesClass = isClassLocked
        ? isClassMatching(s.classId, currentUser.assignedClass)
        : selectedClass === 'ALL' || isClassMatching(s.classId, selectedClass);
      const matchesGender = selectedGender === 'ALL' || s.gender === selectedGender;
      
      const isMapped = mappedStudentIds.has(s.id);
      const matchesInterest =
        interestFilter === 'ALL' ||
        (interestFilter === 'MAPPED' && isMapped) ||
        (interestFilter === 'UNMAPPED' && !isMapped);

      const isAmbassador = ambassadorStudentIds.has(s.id);
      const matchesAmbassador =
        ambassadorFilter === 'ALL' ||
        (ambassadorFilter === 'YES' && isAmbassador) ||
        (ambassadorFilter === 'NO' && !isAmbassador);

      const isEkskul = ekskulStudentIds.has(s.id);
      const matchesEkskul =
        ekskulFilter === 'ALL' ||
        (ekskulFilter === 'YES' && isEkskul) ||
        (ekskulFilter === 'NO' && !isEkskul);

      const comp = studentComplianceMap.get(s.id);
      const matchesCompliance =
        complianceFilter === 'ALL' ||
        (complianceFilter === 'NO_ELECTIVE' && comp?.isElectiveUnderMin) ||
        comp?.status === complianceFilter;

      const matchesSpecificEkskul =
        selectedEkskul === 'ALL' ||
        extracurricularMembers.some(
          (m) =>
            m.studentId === s.id &&
            m.status === 'aktif' &&
            (m.extracurricularId === selectedEkskul || m.extracurricularName.toLowerCase() === selectedEkskul.toLowerCase())
        );

      const matchesSpecificAmbassador =
        selectedAmbassador === 'ALL' ||
        ambassadorMembers.some(
          (m) =>
            m.studentId === s.id &&
            m.status === 'aktif' &&
            (m.ambassadorTypeId === selectedAmbassador || m.ambassadorTypeName.toLowerCase() === selectedAmbassador.toLowerCase())
        );

      const matchesYear =
        selectedAcademicYear === 'ALL' ||
        s.academicYear === selectedAcademicYear;

      return (
        matchesSearch &&
        matchesClass &&
        matchesGender &&
        matchesInterest &&
        matchesAmbassador &&
        matchesEkskul &&
        matchesCompliance &&
        matchesSpecificEkskul &&
        matchesSpecificAmbassador &&
        matchesYear
      );
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name_asc') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'name_desc') return b.fullName.localeCompare(a.fullName);
      if (sortBy === 'nisn') return a.nisn.localeCompare(b.nisn);
      if (sortBy === 'class') return a.classId.localeCompare(b.classId);
      return 0;
    });

    return result;
  }, [
    students,
    searchQuery,
    selectedClass,
    selectedGender,
    interestFilter,
    ambassadorFilter,
    ekskulFilter,
    complianceFilter,
    selectedEkskul,
    selectedAmbassador,
    selectedAcademicYear,
    sortBy,
    isClassLocked,
    currentUser?.assignedClass,
    mappedStudentIds,
    ambassadorStudentIds,
    ekskulStudentIds,
    studentComplianceMap,
    extracurricularMembers,
    ambassadorMembers
  ]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCsv = () => {
    const headers = [
      'NISN',
      'Nama Murid',
      'Kelas',
      'Jenis Kelamin',
      'Nama Orang Tua',
      'No WA Orang Tua',
      'Alamat'
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.nisn}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.classId}"`,
      s.gender,
      `"${(s.parentName || '').replace(/"/g, '""')}"`,
      `"${s.parentPhone || ''}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_murid_sekar_talenta_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (viewingStudent) {
    return (
      <StudentDetailView
        student={viewingStudent}
        onBack={() => setViewingStudent(null)}
        onEdit={(s) => {
          setEditingStudent(s);
          setIsFormOpen(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            Data Murid UPT SDN Karanganyar
          </h2>
          <p className="text-xs text-slate-500">
            Pangkalan data peserta didik, profil perkembangan bakat, penugasan duta, dan riwayat prestasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" /> Ekspor CSV
          </button>

          {canManageStudents && (
            <>
              {students.length > 0 && (
                <button
                  onClick={() => setIsDeleteAllModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 shadow-2xs"
                  title="Hapus Seluruh Data Murid"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Hapus Semua Data
                </button>
              )}

              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/60 text-xs font-bold transition-all active:scale-95"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-700" /> Impor CSV
              </button>

              <button
                onClick={() => {
                  setEditingStudent(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm shadow-emerald-800/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Tambah Murid
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Total Murid</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{totalStudents}</p>
          <span className="text-[10px] text-slate-400">Terdaftar aktif</span>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Laki-laki (L)</span>
            <span className="text-xs font-bold text-blue-700">👦</span>
          </div>
          <p className="text-xl font-black text-blue-900 mt-1">{countLaki}</p>
          <span className="text-[10px] text-slate-400">{totalStudents > 0 ? Math.round((countLaki / totalStudents) * 100) : 0}% dari total</span>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-rose-500/10 to-pink-500/5 border-rose-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Perempuan (P)</span>
            <span className="text-xs font-bold text-rose-700">👧</span>
          </div>
          <p className="text-xl font-black text-rose-900 mt-1">{countPerempuan}</p>
          <span className="text-[10px] text-slate-400">{totalStudents > 0 ? Math.round((countPerempuan / totalStudents) * 100) : 0}% dari total</span>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Bakat Terpetakan</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-900 mt-1">{countMapped} <span className="text-xs text-amber-700">({mappedPercentage}%)</span></p>
          <span className="text-[10px] text-slate-400">{totalStudents - countMapped} belum asesmen</span>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Kader Duta</span>
            <Award className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-xl font-black text-purple-900 mt-1">{countAmbassadors}</p>
          <span className="text-[10px] text-slate-400">Duta SEKAR MELATI</span>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 border-cyan-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Anggota Ekskul</span>
            <Layers className="w-4 h-4 text-cyan-700" />
          </div>
          <p className="text-xl font-black text-cyan-900 mt-1">{countEkskul}</p>
          <span className="text-[10px] text-slate-400">Terdaftar di ekskul</span>
        </Card>
      </div>

      {/* Filter, Search & View Controls */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama murid, NISN, NIS, wali..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Class Filter */}
          <div className="sm:col-span-2">
            {isClassLocked ? (
              <div className="px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 font-bold flex items-center justify-between shadow-2xs">
                <span className="truncate">👩‍🏫 {currentUser.assignedClass}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold flex-shrink-0">
                  Rombel Anda
                </span>
              </div>
            ) : (
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-semibold text-slate-700 bg-slate-50/50"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Gender Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium text-slate-700 bg-slate-50/50"
            >
              <option value="ALL">Semua Gender</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium text-slate-700 bg-slate-50/50"
            >
              <option value="name_asc">Urut Nama (A - Z)</option>
              <option value="name_desc">Urut Nama (Z - A)</option>
              <option value="nisn">Urut NISN</option>
              <option value="class">Urut Rombel Kelas</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'table'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Tampilan Kartu Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Filter Khusus:</span>
          <button
            onClick={() => setInterestFilter(interestFilter === 'MAPPED' ? 'ALL' : 'MAPPED')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              interestFilter === 'MAPPED'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ✨ Sudah Terpetakan Minat ({countMapped})
          </button>
          <button
            onClick={() => setInterestFilter(interestFilter === 'UNMAPPED' ? 'ALL' : 'UNMAPPED')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              interestFilter === 'UNMAPPED'
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ⏳ Belum Asesmen Minat ({totalStudents - countMapped})
          </button>
          <button
            onClick={() => setAmbassadorFilter(ambassadorFilter === 'YES' ? 'ALL' : 'YES')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              ambassadorFilter === 'YES'
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🎖️ Duta Aktif ({countAmbassadors})
          </button>
          <button
            onClick={() => setEkskulFilter(ekskulFilter === 'YES' ? 'ALL' : 'YES')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              ekskulFilter === 'YES'
                ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🏸 Ekskul Aktif ({countEkskul})
          </button>
          {(interestFilter !== 'ALL' || ambassadorFilter !== 'ALL' || ekskulFilter !== 'ALL' || searchQuery || selectedClass !== 'ALL' || selectedGender !== 'ALL') && (
            <button
              onClick={() => {
                setInterestFilter('ALL');
                setAmbassadorFilter('ALL');
                setEkskulFilter('ALL');
                setSearchQuery('');
                setSelectedClass('ALL');
                setSelectedGender('ALL');
              }}
              className="text-[11px] text-emerald-700 hover:underline font-bold ml-2"
            >
              Reset Filter
            </button>
          )}
        </div>
      </Card>

      {/* Grid View Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedStudents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
              Tidak ada data murid yang sesuai kriteria pencarian.
            </div>
          ) : (
            paginatedStudents.map((student) => {
              const isMapped = mappedStudentIds.has(student.id);
              const isAmb = ambassadorStudentIds.has(student.id);
              const isEk = ekskulStudentIds.has(student.id);

              return (
                <Card
                  key={student.id}
                  className="p-4 hover:shadow-md transition-all border-slate-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  onClick={() => setViewingStudent(student)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="relative">
                        <img
                          src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.fullName)}`}
                          alt=""
                          className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${student.gender === 'L' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                      </div>
                      <span className="font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px]">
                        {student.classId}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-emerald-800 transition-colors">
                        {student.fullName}
                      </h4>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                        NISN: {student.nisn}
                      </p>
                    </div>

                    {/* Badges Status */}
                    <div className="flex flex-wrap gap-1">
                      {isMapped ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold">
                          ✨ Terpetakan
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[9px] font-medium">
                          Belum Asesmen
                        </span>
                      )}
                      {isAmb && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[9px] font-bold">
                          🎖️ Duta
                        </span>
                      )}
                      {isEk && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 text-[9px] font-bold">
                          🏸 Ekskul
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setPrintingStudent(student)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Cetak Kartu Profil"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingStudent(student)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px] hover:bg-emerald-100 transition-colors"
                      >
                        7 Tab Detail
                      </button>
                      {canEditStudent(student) && (
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setIsFormOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Table View Mode */}
      {viewMode === 'table' && (
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Murid</th>
                  <th className="p-4">NISN</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">L/P</th>
                  <th className="p-4">Status Rekam Potensi</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada data murid yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => {
                    const isMapped = mappedStudentIds.has(student.id);
                    const isAmb = ambassadorStudentIds.has(student.id);
                    const isEk = ekskulStudentIds.has(student.id);

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                        onClick={() => setViewingStudent(student)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.fullName)}`}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                {student.fullName}
                              </p>
                              {student.parentName && (
                                <p className="text-[11px] text-slate-400">Ortu: {student.parentName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-700">
                          <div>{student.nisn}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                            {student.classId}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-600">
                          {student.gender === 'L' ? (
                            <span className="text-blue-700">L</span>
                          ) : (
                            <span className="text-rose-700">P</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isMapped ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-bold">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Minat Terisi
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                                Belum Asesmen
                              </span>
                            )}
                            {isAmb && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                                Duta
                              </span>
                            )}
                            {isEk && (
                              <span className="px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-bold">
                                Ekskul
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPrintingStudent(student)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Cetak Kartu Profil Resmi"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setViewingStudent(student)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Lihat 7 Tab Detail Murid"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {canEditStudent(student) && (
                              <button
                                onClick={() => {
                                  setEditingStudent(student);
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="Edit Data Murid"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {isSuperAdmin && (
                              <button
                                onClick={() => setDeletingStudentId(student.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Hapus Murid"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            <span>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} murid
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        studentToEdit={editingStudent}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

      <StudentProfileCardModal
        isOpen={!!printingStudent}
        onClose={() => setPrintingStudent(null)}
        student={printingStudent}
      />

      <ConfirmDialog
        isOpen={!!deletingStudentId}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={() => {
          if (deletingStudentId) {
            deleteStudent(deletingStudentId);
            setDeletingStudentId(null);
          }
        }}
        title="Hapus Data Murid?"
        message="Data murid beserta riwayat minat dan keikutsertaan ekskul/duta akan dihapus secara permanen."
        type="danger"
        confirmText="Hapus Murid"
      />

      <ConfirmDialog
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAll}
        title="Hapus Seluruh Data Murid?"
        message={`PERINGATAN: Anda akan menghapus seluruh (${students.length}) data murid yang tersimpan di sistem. Seluruh pemetaan bakat minat, keanggotaan duta, dan ekskul terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        confirmText={isDeletingAll ? 'Menghapus Semua...' : 'Ya, Hapus Semua Data Murid'}
      />
    </div>
  );
};
