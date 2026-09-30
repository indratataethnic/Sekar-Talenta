import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Printer,
  Download,
  Filter,
  School,
  Calendar,
  Sparkles,
  Users,
  Award,
  Layers,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  Search
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { isClassMatching } from '../../utils/classUtils';
import { validateStudentExtracurriculars, ComplianceStatus, StudentEkskulValidation, isPramukaEkskul, isTikEkskul } from '../../utils/ruleValidation';

export const ReportsView: React.FC = () => {
  const {
    schoolProfile,
    classes,
    students,
    talentCategories,
    studentInterests,
    ambassadorTypes,
    ambassadorMembers,
    ambassadorPrograms,
    extracurriculars,
    extracurricularMembers,
    activities,
    attendanceSessions,
    portfolios,
    achievements
  } = useData();

  const { isGuruKelas, currentUser } = useAuth();

  // Filters state
  const [selectedReportType, setSelectedReportType] = useState<string>('compliance_audit');
  const [filterClass, setFilterClass] = useState<string>(() => {
    if (isGuruKelas && currentUser?.assignedClass) return currentUser.assignedClass;
    return 'ALL';
  });

  React.useEffect(() => {
    if (isGuruKelas && currentUser?.assignedClass) {
      setFilterClass(currentUser.assignedClass);
    }
  }, [isGuruKelas, currentUser?.assignedClass]);

  const [filterAcademicYear, setFilterAcademicYear] = useState<string>(schoolProfile.currentAcademicYear);
  const [filterSemester, setFilterSemester] = useState<string>(schoolProfile.currentSemester);
  const [filterComplianceStatus, setFilterComplianceStatus] = useState<string>('ALL');
  const [filterEkskulId, setFilterEkskulId] = useState<string>('ALL');
  const [filterAmbassadorId, setFilterAmbassadorId] = useState<string>('ALL');
  const [filterParticipationStatus, setFilterParticipationStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const reportTypes = [
    { id: 'compliance_audit', label: '1. Audit Kepatuhan Ekskul & Duta Sekolah', icon: ShieldCheck },
    { id: 'ekskul_participation', label: '2. Keikutsertaan Ekstrakurikuler', icon: Layers },
    { id: 'duta_members', label: '3. Data Anggota & Riwayat Duta Sekolah', icon: Award },
    { id: 'talent_mapping', label: '4. Pemetaan Bakat & Minat Murid', icon: Sparkles },
    { id: 'attendance_recap', label: '5. Rekapitulasi Presensi Kegiatan', icon: Calendar },
    { id: 'portfolio_achievements', label: '6. Portofolio & Prestasi Murid', icon: Award },
    { id: 'participation_equity', label: '7. Pemerataan Kesempatan Murid', icon: Users },
    { id: 'school_program_summary', label: '8. Rekap Perkembangan Program Sekolah', icon: TrendingUp },
  ];

  const maxElective = schoolProfile.maxElectiveExtracurricular || 2;

  // Pre-calculate compliance and membership data for all students
  const studentAuditList = useMemo(() => {
    return students.map((s) => {
      const validation = validateStudentExtracurriculars(
        s,
        extracurricularMembers,
        maxElective,
        filterAcademicYear || schoolProfile.currentAcademicYear
      );

      const activeAmbassador = ambassadorMembers.find(
        (m) =>
          m.studentId === s.id &&
          m.status === 'aktif' &&
          (!filterAcademicYear || m.assignedYear === filterAcademicYear)
      );

      const allAmbassadorList = ambassadorMembers.filter((m) => m.studentId === s.id);
      const studentEkskuls = extracurricularMembers.filter(
        (m) => m.studentId === s.id && m.status === 'aktif'
      );

      return {
        student: s,
        validation,
        activeAmbassador,
        allAmbassadorList,
        studentEkskuls
      };
    });
  }, [students, extracurricularMembers, ambassadorMembers, maxElective, filterAcademicYear, schoolProfile.currentAcademicYear]);

  // Filter students for the compliance audit
  const filteredAuditList = useMemo(() => {
    return studentAuditList.filter((item) => {
      const s = item.student;
      const v = item.validation;

      // Class filter
      if (filterClass !== 'ALL' && !isClassMatching(s.classId, filterClass)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesNis = (s.nis || '').includes(q) || (s.nisn || '').includes(q);
        const matchesClass = s.classId.toLowerCase().includes(q);
        if (!matchesName && !matchesNis && !matchesClass) return false;
      }

      // Compliance status filter
      if (filterComplianceStatus !== 'ALL') {
        if (filterComplianceStatus === 'MEMENUHI' && v.status !== 'Memenuhi Ketentuan') return false;
        if (filterComplianceStatus === 'BELUM_MEMENUHI' && v.status !== 'Belum Memenuhi') return false;
        if (filterComplianceStatus === 'MELEBIHI' && v.status !== 'Melebihi Batas') return false;
        if (filterComplianceStatus === 'PENGECUALIAN' && v.status !== 'Pengecualian') return false;
        if (filterComplianceStatus === 'NO_ELECTIVE' && !v.isElectiveUnderMin) return false;
        if (filterComplianceStatus === 'MISSING_COMPULSORY' && v.isCompulsoryComplete) return false;
      }

      // Extracurricular filter
      if (filterEkskulId !== 'ALL') {
        const hasEkskul = item.studentEkskuls.some(
          (m) => m.extracurricularId === filterEkskulId || m.extracurricularName.toLowerCase() === filterEkskulId.toLowerCase()
        );
        if (!hasEkskul) return false;
      }

      // Ambassador filter
      if (filterAmbassadorId !== 'ALL') {
        const hasAmbassador = item.allAmbassadorList.some(
          (m) => m.ambassadorTypeId === filterAmbassadorId || m.ambassadorTypeCode === filterAmbassadorId
        );
        if (!hasAmbassador) return false;
      }

      return true;
    });
  }, [studentAuditList, filterClass, searchQuery, filterComplianceStatus, filterEkskulId, filterAmbassadorId]);

  // Scoped metrics for compliance
  const scopedForMetrics = useMemo(() => {
    return studentAuditList.filter((item) => {
      if (filterClass !== 'ALL') return isClassMatching(item.student.classId, filterClass);
      return true;
    });
  }, [studentAuditList, filterClass]);

  const countTotal = scopedForMetrics.length;
  const countMemenuhi = scopedForMetrics.filter((i) => i.validation.status === 'Memenuhi Ketentuan').length;
  const countBelumMemenuhi = scopedForMetrics.filter((i) => i.validation.status === 'Belum Memenuhi').length;
  const countMelebihiBatas = scopedForMetrics.filter((i) => i.validation.status === 'Melebihi Batas').length;
  const countPengecualian = scopedForMetrics.filter((i) => i.validation.status === 'Pengecualian').length;
  const countNoElective = scopedForMetrics.filter((i) => i.validation.isElectiveUnderMin).length;
  const countMissingCompulsory = scopedForMetrics.filter((i) => !i.validation.isCompulsoryComplete).length;
  const percentPatuh = countTotal > 0 ? Math.round((countMemenuhi / countTotal) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `laporan_sekar_talenta_${selectedReportType}.csv`;

    if (selectedReportType === 'compliance_audit') {
      headers = [
        'No',
        'Nama Murid',
        'NISN',
        'Kelas',
        'Tingkat',
        'Status Kepatuhan Aturan',
        'Ekskul Wajib Terpenuhi',
        'Ekskul Wajib Kurang',
        'Jumlah Pilihan Diikuti',
        'Batas Maks Pilihan',
        'Daftar Ekskul Pilihan',
        'Status Duta Aktif',
        'Memiliki Pengecualian',
        'Alasan Pengecualian / Evaluasi'
      ];
      rows = filteredAuditList.map((item, idx) => {
        const s = item.student;
        const v = item.validation;
        return [
          String(idx + 1),
          `"${s.fullName}"`,
          `"${s.nisn}"`,
          `"${s.classId}"`,
          String(v.gradeLevel),
          `"${v.status}"`,
          `"${v.compulsoryJoined.map((c) => c.extracurricularName).join('; ') || 'None'}"`,
          `"${v.compulsoryMissingNames.join('; ') || 'Lengkap'}"`,
          String(v.electiveCount),
          String(v.maxElectiveAllowed),
          `"${v.electiveJoined.map((e) => e.extracurricularName).join('; ') || 'Belum Ada'}"`,
          `"${item.activeAmbassador ? `${item.activeAmbassador.ambassadorTypeName} (${item.activeAmbassador.roleTitle || 'Anggota'})` : 'Tidak Aktif'}"`,
          v.hasException ? 'Ya' : 'Tidak',
          `"${v.reasons.concat(v.exceptionReasons).join(' | ')}"`
        ];
      });
    } else if (selectedReportType === 'duta_members') {
      headers = ['ID', 'Nama Murid', 'Kelas', 'NIS', 'Bidang Duta', 'Peran Khusus', 'Status', 'Tahun Penugasan', 'Pembina'];
      rows = ambassadorMembers
        .filter((m) => {
          if (filterClass !== 'ALL' && !isClassMatching(m.classId, filterClass)) return false;
          if (filterAmbassadorId !== 'ALL' && m.ambassadorTypeId !== filterAmbassadorId && m.ambassadorTypeCode !== filterAmbassadorId) return false;
          if (filterParticipationStatus !== 'ALL' && m.status !== filterParticipationStatus) return false;
          if (filterAcademicYear && m.assignedYear && m.assignedYear !== filterAcademicYear) return false;
          return true;
        })
        .map((m, idx) => [
          String(idx + 1),
          `"${m.studentName}"`,
          `"${m.classId}"`,
          `"${m.studentNis}"`,
          `"${m.ambassadorTypeName}"`,
          `"${m.roleTitle || ''}"`,
          m.status,
          m.assignedYear,
          `"${m.coachName || ''}"`
        ]);
    } else if (selectedReportType === 'ekskul_participation') {
      headers = ['No', 'Nama Murid', 'Kelas', 'Ekstrakurikuler', 'Kehadiran %', 'Nilai Rapor', 'Deskripsi Capaian Rapor', 'Penilai', 'Status', 'Dispensasi'];
      rows = extracurricularMembers
        .filter((m) => {
          if (filterClass !== 'ALL' && !isClassMatching(m.classId, filterClass)) return false;
          if (filterEkskulId !== 'ALL' && m.extracurricularId !== filterEkskulId && m.extracurricularName.toLowerCase() !== filterEkskulId.toLowerCase()) return false;
          if (filterParticipationStatus !== 'ALL' && m.status !== filterParticipationStatus) return false;
          return true;
        })
        .map((m, idx) => [
          String(idx + 1),
          `"${m.studentName}"`,
          `"${m.classId}"`,
          `"${m.extracurricularName}"`,
          `${m.attendancePercentage || 100}%`,
          `"${m.grade || 'Belum Dinilai'}"`,
          `"${m.reportDescription || ''}"`,
          `"${m.evaluatedBy || ''}"`,
          m.status,
          m.isException ? `"${m.exceptionReason || 'Izin Resmi'}"` : 'Tidak'
        ]);
    } else if (selectedReportType === 'talent_mapping') {
      headers = ['ID', 'Nama Murid', 'Kelas', 'Kategori Minat', 'Topik Khusus', 'Tingkat Ketertarikan', 'Aktivitas Diminati', 'Tahun/Semester'];
      rows = studentInterests.map((i) => [
        i.id,
        `"${i.studentName}"`,
        `"${i.classId}"`,
        `"${i.categoryName}"`,
        `"${i.subcategory}"`,
        i.interestLevel,
        `"${i.desiredActivities?.join('; ') || ''}"`,
        `"${i.academicYear} ${i.semester}"`
      ]);
    } else {
      headers = ['ID', 'Judul', 'Nama Murid', 'Kelas', 'Kategori', 'Tanggal'];
      rows = portfolios.map((p) => [
        p.id,
        `"${p.title}"`,
        `"${p.studentName}"`,
        `"${p.classId}"`,
        p.category,
        p.date
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-emerald-700" />
            Laporan & Analisis Kepatuhan Aturan
          </h2>
          <p className="text-xs text-slate-500">
            Monitoring audit keikutsertaan ekstrakurikuler wajib, kuota pilihan, penugasan Duta, dan rekapitulasi capaian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-700" /> Ekspor Spreadsheet (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan Resmi (PDF)
          </button>
        </div>
      </div>

      {/* Main Filter Section */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Format Laporan:
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-bold text-slate-800"
            >
              {reportTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Rombongan Belajar (Kelas):
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              disabled={isGuruKelas && !!currentUser?.assignedClass}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Rombel (1A - 6B)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Tahun Pelajaran:
            </label>
            <input
              type="text"
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Cari Nama Murid / NISN:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari murid..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Secondary Filter Row: Filters based on report selection */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {selectedReportType === 'compliance_audit' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Status Kepatuhan Aturan:
              </label>
              <select
                value={filterComplianceStatus}
                onChange={(e) => setFilterComplianceStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-semibold"
              >
                <option value="ALL">Semua Status Kepatuhan</option>
                <option value="MEMENUHI">✓ Memenuhi Ketentuan</option>
                <option value="BELUM_MEMENUHI">⚠️ Belum Memenuhi (Umum)</option>
                <option value="NO_ELECTIVE">🎯 Belum Memilih Ekskul Pilihan (0)</option>
                <option value="MISSING_COMPULSORY">⛺ Belum Mengikuti Ekskul Wajib</option>
                <option value="MELEBIHI">⛔ Melebihi Batas Maksimal (&gt;{maxElective})</option>
                <option value="PENGECUALIAN">🛡️ Pengecualian / Dispensasi Khusus</option>
              </select>
            </div>
          )}

          {(selectedReportType === 'compliance_audit' || selectedReportType === 'ekskul_participation') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Filter Ekstrakurikuler:
              </label>
              <select
                value={filterEkskulId}
                onChange={(e) => setFilterEkskulId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
              >
                <option value="ALL">Semua Ekstrakurikuler</option>
                {extracurriculars.map((e) => {
                  const isWajib = isPramukaEkskul(e.id) || isPramukaEkskul(e.name) || isTikEkskul(e.id) || isTikEkskul(e.name);
                  return (
                    <option key={e.id} value={e.id}>
                      {e.name} ({isWajib ? 'Wajib Tingkat Tertentu' : 'Pilihan'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {(selectedReportType === 'compliance_audit' || selectedReportType === 'duta_members') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Filter Jenis Duta Sekolah:
              </label>
              <select
                value={filterAmbassadorId}
                onChange={(e) => setFilterAmbassadorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
              >
                <option value="ALL">Semua Jenis Duta</option>
                {ambassadorTypes.map((at) => (
                  <option key={at.id} value={at.id}>
                    {at.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedReportType === 'ekskul_participation' || selectedReportType === 'duta_members') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Status Keanggotaan:
              </label>
              <select
                value={filterParticipationStatus}
                onChange={(e) => setFilterParticipationStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
              >
                <option value="ALL">Semua Status Keanggotaan</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai / Purna Tugas</option>
                <option value="alumni">Alumni</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Summary KPI Cards for Audit */}
      {selectedReportType === 'compliance_audit' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => setFilterComplianceStatus('ALL')}
            className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterComplianceStatus === 'ALL'
                ? 'border-slate-800 shadow-xs ring-2 ring-slate-800/10'
                : 'border-slate-200 hover:border-slate-400'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 block">Total Murid</span>
            <p className="text-xl font-black text-slate-900">{countTotal}</p>
            <span className="text-[10px] text-slate-500 font-medium">{percentPatuh}% Memenuhi</span>
          </div>

          <div
            onClick={() => setFilterComplianceStatus('MEMENUHI')}
            className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterComplianceStatus === 'MEMENUHI'
                ? 'border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                : 'border-emerald-200 hover:border-emerald-400'
            }`}
          >
            <span className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
              Memenuhi
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            <p className="text-xl font-black text-emerald-700">{countMemenuhi}</p>
            <span className="text-[10px] text-emerald-600 font-medium">✓ Wajib & Pilihan Sesuai</span>
          </div>

          <div
            onClick={() => setFilterComplianceStatus('NO_ELECTIVE')}
            className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterComplianceStatus === 'NO_ELECTIVE'
                ? 'border-amber-600 shadow-xs ring-2 ring-amber-500/20'
                : 'border-amber-200 hover:border-amber-400'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
              Belum Ada Pilihan
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </span>
            <p className="text-xl font-black text-amber-800">{countNoElective}</p>
            <span className="text-[10px] text-amber-700 font-medium">Wajib pilih min. 1</span>
          </div>

          <div
            onClick={() => setFilterComplianceStatus('MELEBIHI')}
            className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterComplianceStatus === 'MELEBIHI'
                ? 'border-rose-600 shadow-xs ring-2 ring-rose-500/20'
                : 'border-rose-200 hover:border-rose-400'
            }`}
          >
            <span className="text-[11px] font-bold text-rose-900 flex items-center justify-between">
              Melebihi Batas
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            </span>
            <p className="text-xl font-black text-rose-800">{countMelebihiBatas}</p>
            <span className="text-[10px] text-rose-600 font-medium">&gt; {maxElective} Ekskul Pilihan</span>
          </div>

          <div
            onClick={() => setFilterComplianceStatus('PENGECUALIAN')}
            className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
              filterComplianceStatus === 'PENGECUALIAN'
                ? 'border-purple-600 shadow-xs ring-2 ring-purple-500/20'
                : 'border-purple-200 hover:border-purple-400'
            }`}
          >
            <span className="text-[11px] font-bold text-purple-900 flex items-center justify-between">
              Dispensasi Khusus
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            </span>
            <p className="text-xl font-black text-purple-800">{countPengecualian}</p>
            <span className="text-[10px] text-purple-600 font-medium">Izin resmi tercatat</span>
          </div>
        </div>
      )}

      {/* Printable Report Document Container */}
      <Card className="p-6 sm:p-8 space-y-6 border-slate-300 bg-white" id="printable-report">
        {/* Official Kop Surat Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
            PEMERINTAH KOTA PASURUAN • DINAS PENDIDIKAN DAN KEBUDAYAAN
          </p>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
            {schoolProfile.name}
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            {schoolProfile.address}, {schoolProfile.city} • NPSN: {schoolProfile.npsn}
          </p>
          <p className="text-xs font-extrabold text-emerald-800 pt-1 tracking-wide uppercase">
            LAPORAN SEKAR TALENTA — SISTEM EKSPLORASI BAKAT, MINAT, DUTA SEKOLAH & EKSTRAKURIKULER
          </p>
        </div>

        {/* Report Metadata Info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100 gap-2">
          <div>
            <span>Format: </span>
            <strong className="text-slate-900 capitalize">
              {reportTypes.find((r) => r.id === selectedReportType)?.label}
            </strong>
          </div>
          <div>
            <span>Tahun Pelajaran: </span>
            <strong className="text-slate-900">{filterAcademicYear}</strong> • Semester:{' '}
            <strong className="text-slate-900">{filterSemester}</strong>
          </div>
          <div>
            <span>Rombongan Belajar: </span>
            <strong className="text-slate-900">
              {filterClass === 'ALL' ? 'Semua Rombel' : filterClass}
            </strong>
          </div>
        </div>

        {/* 1. AUDIT KEPATUHAN EKSTRAKURIKULER & DUTA TABLE */}
        {selectedReportType === 'compliance_audit' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="p-3">No</th>
                    <th className="p-3">Nama Murid & NISN</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Ekskul Wajib</th>
                    <th className="p-3">Ekskul Pilihan ({maxElective} Maks)</th>
                    <th className="p-3">Duta Sekolah Aktif</th>
                    <th className="p-3">Status Kepatuhan</th>
                    <th className="p-3">Evaluasi / Alasan Dispensasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAuditList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                        Tidak ada data murid yang sesuai kriteria filter kepatuhan saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditList.map((item, idx) => {
                      const s = item.student;
                      const v = item.validation;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">
                            <div>{s.fullName}</div>
                            <span className="text-[10px] text-slate-500 font-mono">NISN: {s.nisn}</span>
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">{s.classId}</td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              {v.compulsoryRequiredNames.map((wajibName) => {
                                const isJoined = v.compulsoryJoined.some((j) =>
                                  j.extracurricularName.toLowerCase().includes(wajibName.toLowerCase())
                                );
                                return (
                                  <div key={wajibName} className="flex items-center gap-1.5 text-[11px]">
                                    {isJoined ? (
                                      <span className="text-emerald-700 font-bold">✓ {wajibName}</span>
                                    ) : (
                                      <span className="text-amber-700 font-bold">⚠️ Belum ({wajibName})</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <span
                                className={`text-[11px] font-black px-2 py-0.5 rounded-full inline-block ${
                                  v.isElectiveUnderMin
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : v.isElectiveExceeded
                                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}
                              >
                                {v.electiveCount} / {v.maxElectiveAllowed} Pilihan
                              </span>
                              {v.electiveJoined.length > 0 && (
                                <p className="text-[10.5px] text-slate-600 leading-tight">
                                  {v.electiveJoined.map((e) => e.extracurricularName).join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {item.activeAmbassador ? (
                              <div className="space-y-0.5">
                                <span className="font-bold text-purple-900 text-[11px] block">
                                  🎖️ {item.activeAmbassador.ambassadorTypeName}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {item.activeAmbassador.roleTitle || 'Anggota'} ({item.activeAmbassador.assignedYear})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Tidak aktif Duta</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10.5px] font-black inline-flex items-center gap-1 border ${
                                v.status === 'Memenuhi Ketentuan'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : v.status === 'Pengecualian'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : v.status === 'Melebihi Batas'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {v.status === 'Memenuhi Ketentuan' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : v.status === 'Pengecualian' ? (
                                <ShieldAlert className="w-3 h-3 text-purple-600" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                              )}
                              {v.status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] max-w-xs text-slate-600">
                            {v.hasException && (
                              <div className="text-purple-900 font-bold mb-0.5">
                                🛡️ {v.exceptionReasons.join('; ')}
                              </div>
                            )}
                            {v.reasons.length > 0 ? (
                              <span className="text-slate-500">{v.reasons.join('; ')}</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Seluruh ketentuan terpenuhi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. EKSTRAKURIKULER PARTICIPATION TABLE */}
        {selectedReportType === 'ekskul_participation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Murid</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Ekstrakurikuler</th>
                  <th className="p-3">Kehadiran (%)</th>
                  <th className="p-3">Nilai Rapor</th>
                  <th className="p-3">Deskripsi Capaian</th>
                  <th className="p-3">Dispensasi</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {extracurricularMembers
                  .filter((m) => {
                    if (filterClass !== 'ALL' && !isClassMatching(m.classId, filterClass)) return false;
                    if (filterEkskulId !== 'ALL' && m.extracurricularId !== filterEkskulId && m.extracurricularName.toLowerCase() !== filterEkskulId.toLowerCase()) return false;
                    if (filterParticipationStatus !== 'ALL' && m.status !== filterParticipationStatus) return false;
                    return true;
                  })
                  .map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{m.studentName}</td>
                      <td className="p-3 text-slate-600">{m.classId}</td>
                      <td className="p-3 font-semibold text-blue-900">{m.extracurricularName}</td>
                      <td className="p-3 font-bold text-emerald-700">{m.attendancePercentage || 100}%</td>
                      <td className="p-3">
                        {m.grade ? (
                          <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-black text-[11px]">
                            {m.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Dinilai</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 font-medium max-w-xs leading-relaxed">
                        {m.reportDescription ? `"${m.reportDescription}"` : <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="p-3">
                        {m.isException ? (
                          <span className="text-purple-700 font-bold text-[10.5px]">
                            🛡️ {m.exceptionReason || 'Izin Dispensasi'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10.5px]">Reguler</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={m.status === 'aktif' ? 'emerald' : 'slate'} size="sm">
                          {m.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. DUTA SEKOLAH MEMBERS TABLE */}
        {selectedReportType === 'duta_members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Murid</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Bidang Duta</th>
                  <th className="p-3">Peran Penugasan</th>
                  <th className="p-3">Periode Tahun</th>
                  <th className="p-3">Pembina</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ambassadorMembers
                  .filter((m) => {
                    if (filterClass !== 'ALL' && !isClassMatching(m.classId, filterClass)) return false;
                    if (filterAmbassadorId !== 'ALL' && m.ambassadorTypeId !== filterAmbassadorId && m.ambassadorTypeCode !== filterAmbassadorId) return false;
                    if (filterParticipationStatus !== 'ALL' && m.status !== filterParticipationStatus) return false;
                    if (filterAcademicYear && m.assignedYear && m.assignedYear !== filterAcademicYear) return false;
                    return true;
                  })
                  .map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{m.studentName}</td>
                      <td className="p-3 text-slate-600">{m.classId}</td>
                      <td className="p-3 font-semibold text-purple-900">{m.ambassadorTypeName}</td>
                      <td className="p-3 text-slate-700 font-medium">{m.roleTitle || 'Anggota Tim'}</td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{m.assignedYear}</td>
                      <td className="p-3 text-slate-600">{m.coachName || '-'}</td>
                      <td className="p-3">
                        <Badge variant={m.status === 'aktif' ? 'purple' : 'slate'} size="sm">
                          {m.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. TALENT MAPPING TABLE */}
        {selectedReportType === 'talent_mapping' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Murid</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Kategori Minat</th>
                  <th className="p-3">Sub-kategori / Topik</th>
                  <th className="p-3">Tingkat Minat</th>
                  <th className="p-3">Catatan Harapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentInterests
                  .filter((i) => filterClass === 'ALL' || isClassMatching(i.classId, filterClass))
                  .map((i, idx) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{i.studentName}</td>
                      <td className="p-3 text-slate-600">{i.classId}</td>
                      <td className="p-3 font-semibold text-emerald-800">{i.categoryName}</td>
                      <td className="p-3 font-medium text-slate-800">{i.subcategory}</td>
                      <td className="p-3">
                        <Badge variant="amber" size="sm">
                          {i.interestLevel.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-600 italic">"{i.notes || '-'}"</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PORTFOLIO & ACHIEVEMENTS TABLE */}
        {selectedReportType === 'portfolio_achievements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">No</th>
                  <th className="p-3">Judul Karya / Prestasi</th>
                  <th className="p-3">Nama Murid</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Status Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {portfolios
                  .filter((p) => filterClass === 'ALL' || isClassMatching(p.classId, filterClass))
                  .map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{p.title}</td>
                      <td className="p-3 font-semibold text-slate-800">{p.studentName}</td>
                      <td className="p-3 text-slate-600">{p.classId}</td>
                      <td className="p-3">
                        <Badge variant="amber" size="sm">
                          {p.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{p.date}</td>
                      <td className="p-3">
                        {p.isVerified ? (
                          <span className="text-emerald-700 font-bold">✓ Terverifikasi</span>
                        ) : (
                          <span className="text-amber-600">Menunggu</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. OTHER GENERAL ACTIVITY REPORT TABLES */}
        {['duta_activity', 'attendance_recap', 'participation_equity', 'school_program_summary'].includes(selectedReportType) && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800 mb-2">Ringkasan Statistik Program:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-slate-400">Total Murid Aktif</p>
                  <p className="text-lg font-black text-slate-800">{students.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-slate-400">Total Kader Duta</p>
                  <p className="text-lg font-black text-purple-700">{ambassadorMembers.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-slate-400">Peserta Ekskul</p>
                  <p className="text-lg font-black text-blue-700">{extracurricularMembers.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-slate-400">Karya & Prestasi</p>
                  <p className="text-lg font-black text-amber-600">{portfolios.length + achievements.length}</p>
                </div>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Kegiatan / Program</th>
                  <th className="p-3">Bidang</th>
                  <th className="p-3">Waktu Pelaksanaan</th>
                  <th className="p-3">Lokasi</th>
                  <th className="p-3">Penanggung Jawab</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{a.title}</td>
                    <td className="p-3 font-semibold text-emerald-800">{a.referenceName}</td>
                    <td className="p-3 text-slate-600">{a.dateTime}</td>
                    <td className="p-3 text-slate-600">{a.location}</td>
                    <td className="p-3 text-slate-600">{a.personInCharge}</td>
                    <td className="p-3">
                      <Badge variant={a.status === 'selesai' ? 'emerald' : 'amber'} size="sm">
                        {a.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures Section */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800 mt-1">Kepala UPT SDN Karanganyar</p>
            <div className="h-16" />
            <p className="font-bold text-slate-900 underline">{schoolProfile.principalName}</p>
            <p className="text-slate-500 font-mono text-[11px]">NIP. {schoolProfile.principalNip}</p>
          </div>

          <div>
            <p className="text-slate-500">
              Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-bold text-slate-800 mt-1">Koordinator Program SEKAR TALENTA</p>
            <div className="h-16" />
            <p className="font-bold text-slate-900 underline">Indartha Meiputra, S.Pd.</p>
            <p className="text-slate-500 text-[11px]">Admin & Pengembang Sistem</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
