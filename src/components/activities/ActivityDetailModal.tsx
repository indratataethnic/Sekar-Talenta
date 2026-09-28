import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Sparkles,
  Award
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Activity } from '../../types';
import { Badge } from '../common/Badge';

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onRecordAttendance?: () => void;
  canRecord?: boolean;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  onClose,
  activity,
  onRecordAttendance,
  canRecord,
}) => {
  if (!activity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity.title}
      subtitle={`${activity.referenceName} • PJ: ${activity.personInCharge}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Status & Timing Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                activity.type === 'duta'
                  ? 'purple'
                  : activity.type === 'ekstrakurikuler'
                  ? 'blue'
                  : 'emerald'
              }
            >
              {activity.referenceName}
            </Badge>
            <Badge
              variant={
                activity.status === 'selesai'
                  ? 'emerald'
                  : activity.status === 'berlangsung'
                  ? 'amber'
                  : 'slate'
              }
            >
              {activity.status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {activity.dateTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {activity.location}
            </span>
          </div>
        </div>

        {/* Objectives */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-1">Tujuan Kegiatan:</h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
            {activity.objectives || 'Meningkatkan pemahaman materi dan keterampilan murid.'}
          </p>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-1">Deskripsi Kegiatan:</h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
            {activity.description || 'Tidak ada deskripsi rinci.'}
          </p>
        </div>

        {/* Outcomes & Reflections */}
        {activity.outcomeNotes && (
          <div>
            <h4 className="text-xs font-bold text-emerald-950 mb-1">Hasil & Capaian:</h4>
            <p className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 italic">
              "{activity.outcomeNotes}"
            </p>
          </div>
        )}

        {activity.reflectionNotes && (
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">Refleksi Pembina:</h4>
            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl italic">
              "{activity.reflectionNotes}"
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {canRecord && onRecordAttendance && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordAttendance();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs transition-colors shadow-2xs"
              >
                📝 Buka Pencatatan Presensi
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
