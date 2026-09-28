import React, { useState } from 'react';
import {
  ShieldCheck,
  Leaf,
  BookMarked,
  HeartPulse,
  MonitorSmartphone,
  Smile,
  Award,
  ArrowLeft,
  Users,
  Plus,
  CheckCircle,
  FileText,
  Calendar,
  AlertTriangle,
  HeartHandshake,
  Trash2,
  Edit2
} from 'lucide-react';
import { AmbassadorType, AmbassadorMember, AmbassadorProgram } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AmbassadorMemberModal } from './AmbassadorMemberModal';
import { AmbassadorProgramModal } from './AmbassadorProgramModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AmbassadorDetailViewProps {
  ambassadorType: AmbassadorType;
  onBack: () => void;
  onEdit?: () => void;
}

export const AmbassadorDetailView: React.FC<AmbassadorDetailViewProps> = ({
  ambassadorType,
  onBack,
  onEdit,
}) => {
  const {
    ambassadorMembers,
    ambassadorPrograms,
    activities,
    removeAmbassadorMember,
    deleteAmbassadorProgram
  } = useData();

  const { canManageAmbassadorType, isSuperAdmin } = useAuth();
  const canManageThisAmbassador = isSuperAdmin || canManageAmbassadorType(ambassadorType.id) || canManageAmbassadorType(ambassadorType.code);

  const [activeTab, setActiveTab] = useState<'guidelines' | 'members' | 'programs' | 'activities'>('members');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AmbassadorMember | null>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AmbassadorProgram | null>(null);

  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);

  const myMembers = ambassadorMembers.filter((m) => m.ambassadorTypeId === ambassadorType.id);
  const myPrograms = ambassadorPrograms.filter((p) => p.ambassadorTypeId === ambassadorType.id);
  const myActivities = activities.filter((a) => a.referenceId === ambassadorType.id);

  const getDutaIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 text-rose-300" />;
      case 'Leaf':
        return <Leaf className="w-8 h-8 text-emerald-300" />;
      case 'BookMarked':
        return <BookMarked className="w-8 h-8 text-amber-300" />;
      case 'HeartPulse':
        return <HeartPulse className="w-8 h-8 text-red-300" />;
      case 'MonitorSmartphone':
        return <MonitorSmartphone className="w-8 h-8 text-indigo-300" />;
      case 'Smile':
        return <Smile className="w-8 h-8 text-sky-300" />;
      default:
        return <Award className="w-8 h-8 text-amber-300" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Duta
        </button>

        {canManageThisAmbassador && onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Data Bidang Duta
          </button>
        )}
      </div>

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center p-3 border border-white/20 flex-shrink-0">
            {getDutaIcon(ambassadorType.icon)}
          </div>
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-extrabold">
                DUTA SEKAR MELATI
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold">
                Pembina: {ambassadorType.coachName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{ambassadorType.name}</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-3xl">
              {ambassadorType.description}
            </p>
          </div>
        </div>
      </div>

      {/* TPPK Protocol Box if TPPK */}
      {ambassadorType.code === 'duta_tppk' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Pedoman Perlindungan & Etika Duta TPPK:</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Duta TPPK fokus pada <strong>kampanye edukasi berteman ramah, teladan positif, dan pencegahan perundungan</strong>. Sesuai kebijakan perlindungan anak, anggota Duta TPPK <em>tidak berwenang menginterogasi, menyelidiki, atau mengakses detail rahasia kasus</em>. Segala laporan kasus ditangani langsung oleh Guru BK dan Tim TPPK Resmi Sekolah.
          </p>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'members'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Anggota Kader ({myMembers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'programs'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Program Kerja ({myPrograms.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'guidelines'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Tujuan & Tugas Duta</span>
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'activities'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Aktivitas & Riwayat ({myActivities.length})</span>
        </button>
      </div>

          {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Anggota Duta Terpilih</h3>
              <p className="text-xs text-slate-500">Perwakilan murid teladan dari setiap jenjang kelas</p>
            </div>
            {canManageThisAmbassador && (
              <button
                onClick={() => {
                  setEditingMember(null);
                  setIsMemberModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Tugaskan Anggota
              </button>
            )}
          </div>

          {myMembers.length === 0 ? (
            <Card className="text-center py-8 text-slate-500 text-xs">
              Belum ada anggota yang ditugaskan pada bidang Duta ini.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myMembers.map((member) => (
                <Card key={member.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{member.studentName}</h4>
                      <p className="text-xs text-slate-500">{member.classId} • NIS: {member.studentNis}</p>
                    </div>
                    <Badge variant="purple" size="sm">
                      {member.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800">
                    👑 {member.roleTitle || 'Anggota Tim'}
                  </div>

                  {member.reflectionNotes && (
                    <p className="text-xs text-slate-600 italic bg-purple-50/50 p-2 rounded-lg border border-purple-100">
                      "{member.reflectionNotes}"
                    </p>
                  )}

                  {canManageThisAmbassador && (
                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setIsMemberModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Peran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingMemberId(member.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus Penugasan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Programs */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Program Kerja & Rencana Aksi</h3>
              <p className="text-xs text-slate-500">Inisiatif dan kampanye kepemimpinan murid</p>
            </div>
            {canManageThisAmbassador && (
              <button
                onClick={() => {
                  setEditingProgram(null);
                  setIsProgramModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Program Kerja
              </button>
            )}
          </div>

          {myPrograms.length === 0 ? (
            <Card className="text-center py-8 text-slate-500 text-xs">
              Belum ada program kerja yang dibuat.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPrograms.map((prog) => (
                <Card key={prog.id} className="space-y-2 border-l-4 border-l-purple-600">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{prog.title}</h4>
                    <Badge variant={prog.status === 'berjalan' ? 'emerald' : 'slate'} size="sm">
                      {prog.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>
                  <div className="text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
                    <p>🎯 Target: {prog.targetAudience}</p>
                    <p>🗓️ Periode: {prog.period}</p>
                  </div>

                  {canManageThisAmbassador && (
                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingProgram(prog);
                          setIsProgramModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProgramId(prog.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Guidelines & Duties */}
      {activeTab === 'guidelines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Tugas & Aksi Nyata Duta
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {ambassadorType.tasks.map((task, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" /> Tujuan Pengembangan Karakter
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {ambassadorType.goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Tab: Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Riwayat Pertemuan & Aksi Duta</h3>
          {myActivities.length === 0 ? (
            <Card className="text-center py-8 text-slate-500 text-xs">
              Belum ada catatan agenda kegiatan untuk Duta ini.
            </Card>
          ) : (
            myActivities.map((act) => (
              <Card key={act.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                  <p className="text-xs text-slate-500">{act.dateTime} • Lokasi: {act.location}</p>
                </div>
                <Badge variant={act.status === 'selesai' ? 'emerald' : 'blue'}>
                  {act.status.toUpperCase()}
                </Badge>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <AmbassadorMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        ambassadorType={ambassadorType}
        memberToEdit={editingMember}
      />

      <AmbassadorProgramModal
        isOpen={isProgramModalOpen}
        onClose={() => {
          setIsProgramModalOpen(false);
          setEditingProgram(null);
        }}
        ambassadorType={ambassadorType}
        programToEdit={editingProgram}
      />

      <ConfirmDialog
        isOpen={!!deletingMemberId}
        onClose={() => setDeletingMemberId(null)}
        onConfirm={() => {
          if (deletingMemberId) {
            removeAmbassadorMember(deletingMemberId);
            setDeletingMemberId(null);
          }
        }}
        title="Hapus Penugasan Anggota?"
        message="Murid akan dinonaktifkan dari daftar kepengurusan Duta ini."
        type="danger"
        confirmText="Hapus Penugasan"
      />

      <ConfirmDialog
        isOpen={!!deletingProgramId}
        onClose={() => setDeletingProgramId(null)}
        onConfirm={() => {
          if (deletingProgramId) {
            deleteAmbassadorProgram(deletingProgramId);
            setDeletingProgramId(null);
          }
        }}
        title="Hapus Program Kerja?"
        message="Program kerja ini akan dihapus dari arsip Duta Sekolah."
        type="danger"
        confirmText="Hapus Program"
      />
    </div>
  );
};
