import React, { useState } from 'react';
import {
  Layers,
  ArrowLeft,
  Users,
  Plus,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Calendar,
  Award,
  Trash2,
  Edit2,
  UserCheck,
  School,
  Globe2,
  Building2,
  Sparkles
} from 'lucide-react';
import { Extracurricular, ExtracurricularMember, ExtracurricularCoach } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ExtracurricularRegisterModal } from './ExtracurricularRegisterModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ExtracurricularDetailViewProps {
  extracurricular: Extracurricular;
  onBack: () => void;
  onEdit: () => void;
}

export const ExtracurricularDetailView: React.FC<ExtracurricularDetailViewProps> = ({
  extracurricular,
  onBack,
  onEdit,
}) => {
  const {
    extracurricularMembers,
    activities,
    achievements,
    removeExtracurricularMember
  } = useData();

  const { canManageExtracurriculars } = useAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'goals' | 'activities' | 'achievements'>('members');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const members = extracurricularMembers.filter((m) => m.extracurricularId === extracurricular.id);
  const myActivities = activities.filter((a) => a.referenceId === extracurricular.id);
  const myAchievements = achievements.filter((ach) =>
    ach.category.toLowerCase().includes(extracurricular.name.toLowerCase())
  );

  const capacity = extracurricular.capacity || 30;
  const capacityPercent = Math.min(100, Math.round((members.length / capacity) * 100));

  const coachList: ExtracurricularCoach[] =
    extracurricular.coaches && extracurricular.coaches.length > 0
      ? extracurricular.coaches
      : [
          {
            name: extracurricular.coachName || 'Pembina',
            role: 'Pembina Utama',
            type: 'internal',
            phone: extracurricular.coachPhone
          }
        ];

  return (
    <div className="space-y-6 pb-12">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Ekstrakurikuler
        </button>

        {canManageExtracurriculars && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Ekstrakurikuler
          </button>
        )}
      </div>

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center p-3 border border-white/20 flex-shrink-0">
            <Layers className="w-8 h-8 text-amber-300" />
          </div>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-xs font-extrabold">
                {extracurricular.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-300" />
                {coachList.length} Pembina / Pelatih
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">{extracurricular.name}</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-3xl">
              {extracurricular.description}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-emerald-200 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> {extracurricular.dayTimeSchedule}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-300" /> {extracurricular.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Team of Coaches (Tim Pembina & Pelatih) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tim Pembina & Pelatih Kegiatan</h3>
              <p className="text-xs text-slate-500">
                Pendidik sekolah & instruktur ahli yang mendampingi dan melatih murid
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            {coachList.length} Personil
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {coachList.map((coach, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 transition-all flex items-start gap-3.5 group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                  coach.type === 'external'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {coach.type === 'external' ? (
                  <Globe2 className="w-5 h-5 text-amber-700" />
                ) : (
                  <School className="w-5 h-5 text-emerald-700" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {coach.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      coach.type === 'external'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {coach.type === 'external' ? '🌐 Pelatih Eksternal' : '🏫 Guru Internal'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> {coach.role || 'Pembina'}
                  </span>

                  {coach.type === 'external' && coach.organization && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200 font-medium">
                      <Building2 className="w-3 h-3 text-amber-600" /> {coach.organization}
                    </span>
                  )}
                </div>

                {coach.phone && (
                  <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{coach.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capacity Indicator Card */}
      <Card className="p-4 bg-slate-50 border-slate-200/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-700">Keterisian Kuota Peserta:</span>
          <span className="font-extrabold text-emerald-800">
            {members.length} dari {capacity} Murid ({capacityPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              capacityPercent >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </Card>

      {/* Tabs Navigation */}
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
          <span>Peserta Terdaftar ({members.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'goals'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Target & Materi</span>
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
          <span>Pertemuan Latihan ({myActivities.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'achievements'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Prestasi ({myAchievements.length})</span>
        </button>
      </div>

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Murid Terdaftar</h3>
              <p className="text-xs text-slate-500">Rekap keaktifan & kehadiran latihan</p>
            </div>
            {canManageExtracurriculars && (
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Daftarkan Murid
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <Card className="text-center py-8 text-slate-500 text-xs">
              Belum ada murid yang terdaftar pada ekstrakurikuler ini.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{member.studentName}</h4>
                      <p className="text-xs text-slate-500">{member.classId} • NIS: {member.studentNis}</p>
                    </div>
                    <Badge variant="blue" size="sm">
                      {member.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Tingkat Kehadiran:</span>
                    <span className="font-extrabold text-emerald-700">
                      {member.attendancePercentage || 100}%
                    </span>
                  </div>

                  {member.coachNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                      "{member.coachNotes}"
                    </p>
                  )}

                  {canManageExtracurriculars && (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => setDeletingMemberId(member.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Goals */}
      {activeTab === 'goals' && (
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Target & Sasaran Capaian</h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {extracurricular.goals.map((goal, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tab: Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Jadwal & Riwayat Pertemuan Latihan</h3>
          {myActivities.length === 0 ? (
            <Card className="text-center py-8 text-slate-500 text-xs">
              Belum ada pertemuan yang diagendakan.
            </Card>
          ) : (
            myActivities.map((act) => (
              <Card key={act.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                  <p className="text-xs text-slate-500">{act.dateTime} • {act.location}</p>
                </div>
                <Badge variant={act.status === 'selesai' ? 'emerald' : 'blue'}>
                  {act.status.toUpperCase()}
                </Badge>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Prestasi Ekstrakurikuler</h3>
          {myAchievements.length === 0 ? (
            <Card className="text-center py-8 text-slate-500 text-xs">
              Belum ada data prestasi khusus untuk ekstrakurikuler ini.
            </Card>
          ) : (
            myAchievements.map((ach) => (
              <Card key={ach.id} className="p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="amber">{ach.rank}</Badge>
                  <span className="text-xs text-slate-400">{ach.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{ach.title}</h4>
                <p className="text-xs text-slate-500">{ach.studentName} ({ach.classId})</p>
              </Card>
            ))
          )}
        </div>
      )}

      <ExtracurricularRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        extracurricular={extracurricular}
      />

      <ConfirmDialog
        isOpen={!!deletingMemberId}
        onClose={() => setDeletingMemberId(null)}
        onConfirm={() => {
          if (deletingMemberId) {
            removeExtracurricularMember(deletingMemberId);
            setDeletingMemberId(null);
          }
        }}
        title="Hapus Keikutsertaan Murid?"
        message="Murid akan dikeluarkan dari daftar anggota ekstrakurikuler ini."
        type="danger"
        confirmText="Hapus Peserta"
      />
    </div>
  );
};
