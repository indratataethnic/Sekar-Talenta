import React, { useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

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

  // Filters
  const [selectedReportType, setSelectedReportType] = useState<string>('duta_members');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>(schoolProfile.currentAcademicYear);
  const [filterSemester, setFilterSemester] = useState<string>(schoolProfile.currentSemester);

  const reportTypes = [
    { id: 'duta_members', label: '1. Data Anggota Duta Sekolah', icon: Award },
    { id: 'duta_activity', label: '2. Keaktifan & Program Duta', icon: Sparkles },
    { id: 'talent_mapping', label: '3. Pemetaan Bakat & Minat Murid', icon: Sparkles },
    { id: 'ekskul_participation', label: '4. Keikutsertaan Ekstrakurikuler', icon: Layers },
    { id: 'attendance_recap', label: '5. Rekapitulasi Presensi Kegiatan', icon: Calendar },
    { id: 'portfolio_achievements', label: '6. Portofolio & Prestasi Murid', icon: Award },
    { id: 'participation_equity', label: '7. Pemerataan Kesempatan Murid', icon: Users },
    { id: 'school_program_summary', label: '8. Rekap Perkembangan Program Sekolah', icon: TrendingUp },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `laporan_sekar_talenta_${selectedReportType}.csv`;

    if (selectedReportType === 'duta_members') {
      headers = ['ID', 'Nama Murid', 'Kelas', 'NIS', 'Bidang Duta', 'Peran Khusus', 'Status', 'Tahun Penugasan', 'Pembina'];
      rows = ambassadorMembers.map((m) => [
        m.id,
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
      headers = ['ID', 'Nama Murid', 'Kelas', 'Ekstrakurikuler', 'Kehadiran %', 'Status', 'Catatan Pelatih'];
      rows = extracurricularMembers.map((m) => [
        m.id,
        `"${m.studentName}"`,
        `"${m.classId}"`,
        `"${m.extracurricularName}"`,
        `${m.attendancePercentage || 100}%`,
        m.status,
        `"${m.coachNotes || ''}"`
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
            Laporan & Analisis Data Perkembangan Murid
          </h2>
          <p className="text-xs text-slate-500">
            Pusat laporan evaluasi, rekapitulasi Duta Sekolah, ekskul, presensi, dan portofolio UPT SDN Karanganyar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-700" /> Ekspor Spreadsheet
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan (PDF)
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Pilih Format Laporan:
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
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Rombongan Belajar (Kelas):
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Kelas (1A - 6B)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
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
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Semester:
            </label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Printable Report Container */}
      <Card className="p-6 sm:p-8 space-y-6 border-slate-300 bg-white" id="printable-report">
        {/* Official Header Kop Laporan */}
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

        {/* Report Metadata */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
          <div>
            <span>Format: </span>
            <strong className="text-slate-900 capitalize">
              {reportTypes.find((r) => r.id === selectedReportType)?.label}
            </strong>
          </div>
          <div>
            <span>Tahun Ajaran / Semester: </span>
            <strong className="text-slate-900">
              {filterAcademicYear} ({filterSemester})
            </strong>
          </div>
          <div>
            <span>Filter Rombel: </span>
            <strong className="text-slate-900">
              {filterClass === 'ALL' ? 'Semua Kelas' : filterClass}
            </strong>
          </div>
        </div>

        {/* Report Content Table based on Selected Type */}
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
                  <th className="p-3">Pembina</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ambassadorMembers
                  .filter((m) => filterClass === 'ALL' || m.classId === filterClass)
                  .map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{m.studentName}</td>
                      <td className="p-3 text-slate-600">{m.classId}</td>
                      <td className="p-3 font-semibold text-purple-900">{m.ambassadorTypeName}</td>
                      <td className="p-3 text-slate-700">{m.roleTitle || 'Anggota Tim'}</td>
                      <td className="p-3 text-slate-600">{m.coachName || '-'}</td>
                      <td className="p-3">
                        <Badge variant="purple" size="sm">
                          {m.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

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
                  <th className="p-3">Status</th>
                  <th className="p-3">Catatan Pembina</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {extracurricularMembers
                  .filter((m) => filterClass === 'ALL' || m.classId === filterClass)
                  .map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{m.studentName}</td>
                      <td className="p-3 text-slate-600">{m.classId}</td>
                      <td className="p-3 font-semibold text-blue-900">{m.extracurricularName}</td>
                      <td className="p-3 font-bold text-emerald-700">{m.attendancePercentage || 100}%</td>
                      <td className="p-3">
                        <Badge variant="blue" size="sm">
                          {m.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-600 italic">{m.coachNotes || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

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
                  .filter((i) => filterClass === 'ALL' || i.classId === filterClass)
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
                  .filter((p) => filterClass === 'ALL' || p.classId === filterClass)
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

        {/* Generic Table Fallback for other report types */}
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
            <p className="text-slate-500">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
