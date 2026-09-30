import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Teacher } from '../../types';
import { Card } from '../common/Card';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TeacherFormModal } from './TeacherFormModal';
import { TeacherDetailModal } from './TeacherDetailModal';
import { TeacherCsvImportModal } from './TeacherCsvImportModal';
import { getEffectiveTeacherDuties, getTeacherAvatarUrl } from '../../utils/teacherUtils';
import {
  GraduationCap,
  Plus,
  Download,
  Upload,
  Search,
  Trash2,
  Edit2,
  Eye,
  Award,
  Briefcase,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  Globe2,
  School,
  Building2
} from 'lucide-react';

export const TeacherListView: React.FC = () => {
  const { teachers, ambassadorTypes, extracurriculars, deleteTeacher, deleteAllTeachers, schoolProfile } = useData();
  const { role } = useAuth();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'internal' | 'external'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const canManageTeachers = role === 'super_admin' || role === 'kepala_sekolah';

  // Available unique positions for filter
  const uniquePositions = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.position) set.add(t.position);
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Map teachers with effective duties (auto-derived from Duta & Ekskul + manual)
  const teachersWithDuties = useMemo(() => {
    return teachers.map((teacher) => {
      const effectiveDuties = getEffectiveTeacherDuties(teacher, ambassadorTypes, extracurriculars);
      return {
        ...teacher,
        effectiveDuties
      };
    });
  }, [teachers, ambassadorTypes, extracurriculars]);

  // Filtered & Searched Teachers
  const filteredTeachers = useMemo(() => {
    return teachersWithDuties.filter((teacher) => {
      const isExternal = teacher.teacherType === 'external';

      const matchType =
        typeFilter === 'ALL' ||
        (typeFilter === 'internal' && !isExternal) ||
        (typeFilter === 'external' && isExternal);

      const matchSearch =
        searchTerm === '' ||
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.nip && teacher.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.organization && teacher.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        teacher.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.effectiveDuties &&
          teacher.effectiveDuties.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchGender =
        genderFilter === 'ALL' || teacher.gender === genderFilter;

      const matchPosition =
        positionFilter === 'ALL' || teacher.position === positionFilter;

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && teacher.isActive) ||
        (statusFilter === 'INACTIVE' && !teacher.isActive);

      return matchType && matchSearch && matchGender && matchPosition && matchStatus;
    });
  }, [teachersWithDuties, typeFilter, genderFilter, searchTerm, positionFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(start, start + itemsPerPage);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  // Statistics
  const totalTeachers = teachers.length;
  const internalTeachers = teachers.filter((t) => t.teacherType !== 'external').length;
  const externalCoaches = teachers.filter((t) => t.teacherType === 'external').length;
  const dutyTeachers = teachersWithDuties.filter((t) => t.effectiveDuties && t.effectiveDuties.trim().length > 0).length;

  // Single delete
  const handleDeleteTeacher = async () => {
    if (!deletingTeacherId) return;
    await deleteTeacher(deletingTeacherId);
    setDeletingTeacherId(null);
  };

  // Delete all
  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllTeachers();
      setIsDeleteAllModalOpen(false);
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Export CSV / Excel with UTF-8 BOM
  const handleExportCsv = () => {
    if (teachers.length === 0) return;

    const headers = [
      'No',
      'Nama Pendidik/Pembina',
      'Jenis Kelamin (L/P)',
      'Tipe',
      'Asal Lembaga/Sanggar',
      'NIP/ID Lisensi',
      'Jabatan/Peran',
      'Tugas Tambahan (Otomatis & Manual)',
      'Status'
    ];
    const rows = teachersWithDuties.map((t, idx) => [
      idx + 1,
      `"${t.fullName.replace(/"/g, '""')}"`,
      `"${t.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}"`,
      `"${t.teacherType === 'external' ? 'Pembina Luar (Eksternal)' : 'Guru Internal'}"`,
      `"${(t.organization || '-').replace(/"/g, '""')}"`,
      `"${(t.nip || '-').replace(/"/g, '""')}"`,
      `"${t.position.replace(/"/g, '""')}"`,
      `"${(t.effectiveDuties || '-').replace(/"/g, '""')}"`,
      t.isActive ? 'Aktif' : 'Non-Aktif'
    ]);

    // Prepend UTF-8 BOM for Microsoft Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_guru_dan_pembina_${schoolProfile.npsn || 'upt_sdn_karanganyar'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-700" /> Data Guru & Pembina
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {teachers.length} Pendidik & Pembina
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar tenaga pendidik internal sekolah dan pembina/pelatih ahli dari luar sekolah {schoolProfile.name}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {teachers.length > 0 && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
              title="Cetak Daftar Guru & Pembina"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" /> Cetak
            </button>
          )}

          <button
            onClick={handleExportCsv}
            disabled={teachers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            title="Ekspor CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" /> Ekspor CSV
          </button>

          {canManageTeachers && (
            <>
              {teachers.length > 0 && (
                <button
                  onClick={() => setIsDeleteAllModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 shadow-2xs"
                  title="Hapus Seluruh Data"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Hapus Semua Data
                </button>
              )}

              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/60 text-xs font-bold transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" /> Impor CSV
              </button>

              <button
                onClick={() => {
                  setEditingTeacher(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Guru / Pembina
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Pendidik & Pembina</p>
              <h3 className="text-xl font-black text-slate-900">{totalTeachers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <School className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Guru Internal</p>
              <h3 className="text-xl font-black text-slate-900">{internalTeachers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Pembina Luar / Eksternal</p>
              <h3 className="text-xl font-black text-purple-900">{externalCoaches}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Tugas Khusus / Pembina</p>
              <h3 className="text-xl font-black text-slate-900">{dutyTeachers}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Type Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setTypeFilter('ALL');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            typeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua ({teachers.length})
        </button>

        <button
          onClick={() => {
            setTypeFilter('internal');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            typeFilter === 'internal'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <School className="w-3.5 h-3.5" />
          <span>🏫 Guru & Tendik Internal ({internalTeachers})</span>
        </button>

        <button
          onClick={() => {
            setTypeFilter('external');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            typeFilter === 'external'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>🌐 Pembina / Pelatih Luar ({externalCoaches})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, asal sanggar/klub, NIP, jabatan, atau tugas..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium bg-slate-50/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Gender Filter */}
          <div className="sm:col-span-2">
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium text-slate-700 bg-slate-50/50"
            >
              <option value="ALL">Semua L/P</option>
              <option value="L">👨 Laki-laki (L)</option>
              <option value="P">👩 Perempuan (P)</option>
            </select>
          </div>

          {/* Position Filter */}
          <div className="sm:col-span-3">
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium text-slate-700 bg-slate-50/50"
            >
              <option value="ALL">Semua Jabatan & Peran</option>
              {uniquePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium text-slate-700 bg-slate-50/50"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif Membina</option>
              <option value="INACTIVE">Non-Aktif</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table: No, Nama Guru/Pembina, L/P, Kategori & Asal, Jabatan, Tugas Tambahan, Aksi */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">Nama & Asal Pendidik</th>
                <th className="p-4 text-center w-20">L/P</th>
                <th className="p-4">Jabatan / Peran</th>
                <th className="p-4">Tugas Tambahan / Pembinaan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Tidak ada data yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((teacher, index) => {
                  const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const isExternal = teacher.teacherType === 'external';

                  return (
                    <tr
                      key={teacher.id}
                      className={`transition-colors group cursor-pointer ${
                        isExternal ? 'hover:bg-purple-50/40' : 'hover:bg-emerald-50/40'
                      }`}
                      onClick={() => setSelectedTeacherForDetail(teacher)}
                    >
                      {/* No */}
                      <td className="p-4 text-center font-bold text-slate-500">
                        {itemNumber}
                      </td>

                      {/* Nama & Asal Pendidik */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              teacher.avatarUrl ||
                              getTeacherAvatarUrl(teacher.gender, teacher.fullName)
                            }
                            alt=""
                            className={`w-10 h-10 rounded-xl object-cover p-0.5 border flex-shrink-0 ${
                              isExternal ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-slate-100'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-bold transition-colors ${
                                isExternal ? 'text-purple-950 group-hover:text-purple-800' : 'text-slate-900 group-hover:text-emerald-800'
                              }`}>
                                {teacher.fullName}
                              </p>
                              {isExternal ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                                  <Globe2 className="w-2.5 h-2.5" /> Pembina Luar
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                  Internal
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              {isExternal && teacher.organization && (
                                <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                                  <Building2 className="w-2.5 h-2.5 text-purple-500" /> {teacher.organization}
                                </span>
                              )}
                              {teacher.nip ? (
                                <span className="font-mono text-[10px] text-slate-400">
                                  {isExternal ? 'ID/Lisensi:' : 'NIP:'} {teacher.nip}
                                </span>
                              ) : !isExternal && (
                                <span className="text-[10px] text-slate-400 italic">Non-NIP</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* L/P */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          teacher.gender === 'P'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {teacher.gender === 'P' ? '👩 P' : '👨 L'}
                        </span>
                      </td>

                      {/* Jabatan / Peran */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-[11px] border ${
                          isExternal
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200/80'
                        }`}>
                          <Briefcase className={`w-3 h-3 ${isExternal ? 'text-purple-700' : 'text-emerald-700'}`} />
                          {teacher.position}
                        </span>
                      </td>

                      {/* Tugas Tambahan (Otomatis & Manual) */}
                      <td className="p-4 max-w-xs">
                        {teacher.effectiveDuties ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-semibold leading-relaxed">
                            <Award className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="line-clamp-2">{teacher.effectiveDuties}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedTeacherForDetail(teacher)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManageTeachers && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingTeacher(teacher);
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="Edit Data"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingTeacherId(teacher.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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

        {/* Table Footer with Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 text-xs bg-slate-50/50">
            <span className="text-slate-500">
              Menampilkan {paginatedTeachers.length} dari {filteredTeachers.length} data pendidik & pembina
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      <TeacherFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTeacher(null);
        }}
        teacherToEdit={editingTeacher}
      />

      {/* Detail Modal */}
      <TeacherDetailModal
        isOpen={!!selectedTeacherForDetail}
        onClose={() => setSelectedTeacherForDetail(null)}
        teacher={selectedTeacherForDetail}
        onEdit={(teacher) => {
          setEditingTeacher(teacher);
          setIsFormOpen(true);
        }}
      />

      {/* CSV Import Modal */}
      <TeacherCsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

      {/* Single Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTeacherId}
        onClose={() => setDeletingTeacherId(null)}
        onConfirm={handleDeleteTeacher}
        title="Hapus Data Guru / Pembina?"
        message="Data yang dipilih akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan."
        type="danger"
        confirmText="Hapus Data"
      />

      {/* Delete All Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAll}
        title="Hapus Seluruh Data Guru & Pembina?"
        message={`PERINGATAN: Anda akan menghapus seluruh (${teachers.length}) data pendidik dan pembina yang tersimpan di sistem. Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        confirmText={isDeletingAll ? 'Menghapus Semua...' : 'Ya, Hapus Semua Data'}
      />
    </div>
  );
};
