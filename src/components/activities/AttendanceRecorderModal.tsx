import React, { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Activity, AttendanceRecord, AttendanceStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface AttendanceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
}

export const AttendanceRecorderModal: React.FC<AttendanceRecorderModalProps> = ({
  isOpen,
  onClose,
  activity,
}) => {
  const {
    students,
    extracurricularMembers,
    ambassadorMembers,
    saveAttendanceSession,
    attendanceSessions
  } = useData();
  const { currentUser } = useAuth();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Determine participant roster
    let initialRoster: { studentId: string; studentName: string; classId: string }[] = [];

    if (activity.type === 'ekstrakurikuler') {
      const members = extracurricularMembers.filter((m) => m.extracurricularId === activity.referenceId);
      initialRoster = members.map((m) => ({
        studentId: m.studentId,
        studentName: m.studentName,
        classId: m.classId,
      }));
    } else if (activity.type === 'duta') {
      const members = ambassadorMembers.filter((m) => m.ambassadorTypeId === activity.referenceId);
      initialRoster = members.map((m) => ({
        studentId: m.studentId,
        studentName: m.studentName,
        classId: m.classId,
      }));
    } else {
      // General school event - default to top active students
      initialRoster = students.slice(0, 10).map((s) => ({
        studentId: s.id,
        studentName: s.fullName,
        classId: s.classId,
      }));
    }

    // Fallback if roster is empty
    if (initialRoster.length === 0) {
      initialRoster = students.slice(0, 6).map((s) => ({
        studentId: s.id,
        studentName: s.fullName,
        classId: s.classId,
      }));
    }

    setRecords(
      initialRoster.map((r) => ({
        studentId: r.studentId,
        studentName: r.studentName,
        classId: r.classId,
        status: 'hadir',
        notes: '',
      }))
    );
  }, [isOpen, activity, extracurricularMembers, ambassadorMembers, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, notes } : r))
    );
  };

  const handleSetAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'hadir' })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAttendanceSession({
        activityId: activity.id,
        activityTitle: activity.title,
        date,
        referenceType: activity.type === 'duta' ? 'duta' : 'ekstrakurikuler',
        referenceId: activity.referenceId,
        referenceName: activity.referenceName,
        records,
        recordedBy: currentUser?.displayName || 'Guru Pembina',
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'hadir').length;
  const permissionCount = records.filter((r) => r.status === 'izin').length;
  const sickCount = records.filter((r) => r.status === 'sakit').length;
  const absentCount = records.filter((r) => r.status === 'alpa').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pencatatan Presensi Pertemuan"
      subtitle={`${activity.title} • ${activity.referenceName}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Tanggal Pertemuan:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-xl border border-slate-300 font-medium bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetAllPresent}
              className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200 transition-colors"
            >
              Setel Semua Hadir
            </button>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            Hadir: {presentCount}
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold">
            Izin: {permissionCount}
          </div>
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold">
            Sakit: {sickCount}
          </div>
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
            Alpa: {absentCount}
          </div>
        </div>

        {/* Table Roster */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-3">Nama Murid</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Status Kehadiran</th>
                <th className="p-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr key={record.studentId} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{record.studentName}</td>
                  <td className="p-3 text-slate-500">{record.classId}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(record.studentId, 'hadir')}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                          record.status === 'hadir'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(record.studentId, 'izin')}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                          record.status === 'izin'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                        }`}
                      >
                        Izin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(record.studentId, 'sakit')}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                          record.status === 'sakit'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                        }`}
                      >
                        Sakit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(record.studentId, 'alpa')}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                          record.status === 'alpa'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                        }`}
                      >
                        Alpa
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={record.notes || ''}
                      onChange={(e) => handleNotesChange(record.studentId, e.target.value)}
                      placeholder="Catatan..."
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 focus:outline-emerald-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Presensi Pertemuan'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
