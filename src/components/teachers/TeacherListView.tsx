import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Teacher } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TeacherFormModal } from './TeacherFormModal';
import { TeacherDetailModal } from './TeacherDetailModal';
import { TeacherCsvImportModal } from './TeacherCsvImportModal';
import {
  GraduationCap,
  Plus,
  Download,
  Upload,
  Search,
  Trash2,
  Edit2,
  Eye,
  Phone,
  Mail,
  Award,
  Briefcase,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export const TeacherListView: React.FC = () => {
  const { teachers, deleteTeacher, deleteAllTeachers, schoolProfile } = useData();
  const { role } = useAuth();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtered & Searched Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchSearch =
        searchTerm === '' ||
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.nip && teacher.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
        teacher.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.additionalDuties &&
          teacher.additionalDuties.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPosition =
        positionFilter === 'ALL' || teacher.position === positionFilter;

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && teacher.isActive) ||
        (statusFilter === 'INACTIVE' && !teacher.isActive);

      return matchSearch && matchPosition && matchStatus;
    });
  }, [teachers, searchTerm, positionFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(start, start + itemsPerPage);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  // Statistics
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.isActive).length;
  const dutyTeachers = teachers.filter((t) => t.additionalDuties && t.additionalDuties.trim().length > 0).length;
  const homeroomTeachers = teachers.filter((t) => t.position.toLowerCase().includes('guru kelas')).length;

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

  // Export CSV
  const handleExportCsv = () => {
    if (teachers.length === 0) return;

    const headers = ['No', 'Nama Guru', 'NIP', 'Jabatan', 'Tugas Tambahan', 'No Telepon', 'Email', 'Status'];
    const rows = teachers.map((t, idx) => [
      idx + 1,
      `"${t.fullName.replace(/"/g, '""')}"`,
      `"${(t.nip || '-').replace(/"/g, '""')}"`,
      `"${t.position.replace(/"/g, '""')}"`,
      `"${(t.additionalDuties || '-').replace(/"/g, '""')}"`,
      `"${(t.phone || '-').replace(/"/g, '""')}"`,
      `"${(t.email || '-').replace(/"/g, '""')}"`,
      t.isActive ? 'Aktif' : 'Non-Aktif'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_guru_${schoolProfile.npsn}_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <GraduationCap className="w-6 h-6 text-emerald-700" /> Data Guru & Tenaga Pendidik
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {teachers.length} Guru
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar tenaga pendidik, wali kelas, guru mata pelajaran, dan pembina talenta {schoolProfile.name}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {teachers.length > 0 && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
              title="Cetak Daftar Guru"
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
                  title="Hapus Seluruh Data Guru"
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
                <Plus className="w-3.5 h-3.5" /> Tambah Guru
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
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Pendidik</p>
              <h3 className="text-xl font-black text-slate-900">{totalTeachers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Guru Kelas</p>
              <h3 className="text-xl font-black text-slate-900">{homeroomTeachers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Tugas Khusus/Pembina</p>
              <h3 className="text-xl font-black text-slate-900">{dutyTeachers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Status Aktif</p>
              <h3 className="text-xl font-black text-slate-900">{activeTeachers}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama guru, NIP, jabatan, atau tugas tambahan..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium bg-slate-50/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
              <option value="ALL">Semua Jabatan</option>
              {uniquePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium text-slate-700 bg-slate-50/50"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif Mengajar</option>
              <option value="INACTIVE">Non-Aktif / Purna</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table: No, Nama Guru, Jabatan, Tugas Tambahan, Aksi */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">Nama Guru</th>
                <th className="p-4">Jabatan</th>
                <th className="p-4">Tugas Tambahan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Tidak ada data guru yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((teacher, index) => {
                  const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTeacherForDetail(teacher)}
                    >
                      {/* No */}
                      <td className="p-4 text-center font-bold text-slate-500">
                        {itemNumber}
                      </td>

                      {/* Nama Guru */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              teacher.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                teacher.fullName
                              )}`
                            }
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                              {teacher.fullName}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              {teacher.nip ? (
                                <span className="font-mono text-[10px] text-slate-400">
                                  NIP: {teacher.nip}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Non-NIP</span>
                              )}
                              {teacher.phone && (
                                <span className="font-mono text-[10px] text-emerald-600 flex items-center gap-0.5">
                                  <Phone className="w-2.5 h-2.5" /> {teacher.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Jabatan */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-[11px]">
                          <Briefcase className="w-3 h-3 text-emerald-700" />
                          {teacher.position}
                        </span>
                      </td>

                      {/* Tugas Tambahan */}
                      <td className="p-4 max-w-xs">
                        {teacher.additionalDuties ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-semibold leading-relaxed">
                            <Award className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="line-clamp-2">{teacher.additionalDuties}</span>
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
                            title="Lihat Detail Profil Guru"
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
                                title="Edit Data Guru"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingTeacherId(teacher.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Hapus Data Guru"
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
              Menampilkan {paginatedTeachers.length} dari {filteredTeachers.length} data guru
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
        title="Hapus Data Guru?"
        message="Data guru yang dipilih akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan."
        type="danger"
        confirmText="Hapus Guru"
      />

      {/* Delete All Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAll}
        title="Hapus Seluruh Data Guru?"
        message={`PERINGATAN: Anda akan menghapus seluruh (${teachers.length}) data guru yang tersimpan di sistem. Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        confirmText={isDeletingAll ? 'Menghapus Semua...' : 'Ya, Hapus Semua Data Guru'}
      />
    </div>
  );
};
