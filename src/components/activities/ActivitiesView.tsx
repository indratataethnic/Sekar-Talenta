import React, { useState } from 'react';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  List,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';
import { Activity, ActivityType } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ActivityFormModal } from './ActivityFormModal';
import { ActivityDetailModal } from './ActivityDetailModal';
import { AttendanceRecorderModal } from './AttendanceRecorderModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const ActivitiesView: React.FC = () => {
  const { activities, deleteActivity } = useData();
  const { canRecordAttendance, isSuperAdmin, isPembina, isGuruKelas } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [recordingActivity, setRecordingActivity] = useState<Activity | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);

  const filteredActivities = activities.filter((act) => {
    const matchesType = selectedType === 'ALL' || act.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || act.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-700" />
            Jadwal Kegiatan & Presensi Pertemuan
          </h2>
          <p className="text-xs text-slate-500">
            Agenda Duta Sekolah, latihan rutin ekstrakurikuler, dan pencatatan presensi kehadiran murid.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/60">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Daftar"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kalender"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          {(isSuperAdmin || isPembina || isGuruKelas) && (
            <button
              onClick={() => {
                setEditingActivity(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" /> Buat Agenda Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Jenis Program:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Program (Duta, Ekskul, Sekolah)</option>
              <option value="ekstrakurikuler">Ekstrakurikuler</option>
              <option value="duta">Duta SEKAR MELATI</option>
              <option value="sekolah">Acara Terpadu Sekolah</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Status Kegiatan:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="rencana">Rencana Mendatang</option>
              <option value="berlangsung">Sedang Berlangsung</option>
              <option value="selesai">Sudah Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* List View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <Card className="text-center py-12 text-slate-400 text-xs">
              Tidak ada agenda kegiatan yang cocok dengan kriteria filter.
            </Card>
          ) : (
            filteredActivities.map((act) => (
              <Card
                key={act.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
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
                    <Badge
                      variant={
                        act.status === 'selesai'
                          ? 'emerald'
                          : act.status === 'berlangsung'
                          ? 'amber'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {act.status.toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{act.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-1">{act.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" /> {act.dateTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {act.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> PJ: {act.personInCharge}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                  <button
                    onClick={() => setViewingActivity(act)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail
                  </button>

                  {canRecordAttendance && (
                    <button
                      onClick={() => setRecordingActivity(act)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold transition-colors shadow-2xs"
                    >
                      📝 Catat Presensi
                    </button>
                  )}

                  {(isSuperAdmin || isPembina) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingActivity(act);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Agenda"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingActivityId(act.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Calendar Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((act) => (
            <Card key={act.id} className="p-4 space-y-2 border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">{act.dateTime}</span>
                <Badge variant={act.status === 'selesai' ? 'emerald' : 'amber'} size="sm">
                  {act.status}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{act.title}</h4>
              <p className="text-xs text-slate-500">{act.referenceName} • {act.location}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setViewingActivity(act)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Lihat Detail
                </button>
                {canRecordAttendance && (
                  <button
                    onClick={() => setRecordingActivity(act)}
                    className="text-xs font-bold text-amber-700 hover:underline"
                  >
                    Presensi
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ActivityFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingActivity(null);
        }}
        activityToEdit={editingActivity}
      />

      <ActivityDetailModal
        isOpen={!!viewingActivity}
        onClose={() => setViewingActivity(null)}
        activity={viewingActivity}
        onRecordAttendance={() => {
          if (viewingActivity) setRecordingActivity(viewingActivity);
        }}
        canRecord={canRecordAttendance}
      />

      {recordingActivity && (
        <AttendanceRecorderModal
          isOpen={!!recordingActivity}
          onClose={() => setRecordingActivity(null)}
          activity={recordingActivity}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingActivityId}
        onClose={() => setDeletingActivityId(null)}
        onConfirm={() => {
          if (deletingActivityId) {
            deleteActivity(deletingActivityId);
            setDeletingActivityId(null);
          }
        }}
        title="Hapus Agenda Kegiatan?"
        message="Agenda kegiatan ini akan dihapus dari jadwal sekolah."
        type="danger"
        confirmText="Hapus Kegiatan"
      />
    </div>
  );
};
