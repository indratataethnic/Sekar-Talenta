import React from 'react';
import { Teacher } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Briefcase, Award, Hash, Calendar, Sparkles, Flag, Trophy, Building2, Globe2, School } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getEffectiveTeacherDuties, getDetectedTeacherDutiesBreakdown } from '../../utils/teacherUtils';

interface TeacherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onEdit?: (teacher: Teacher) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onEdit
}) => {
  const { ambassadorTypes, extracurriculars } = useData();

  if (!teacher) return null;

  const isExternal = teacher.teacherType === 'external';
  const effectiveDuties = getEffectiveTeacherDuties(teacher, ambassadorTypes, extracurriculars);
  const detectedBreakdown = getDetectedTeacherDutiesBreakdown(teacher.fullName, ambassadorTypes, extracurriculars);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isExternal ? 'Profil Pembina / Pelatih Eksternal' : 'Profil Guru & Tenaga Pendidik'}
      subtitle={isExternal ? `Pembina Ahli Luar Sekolah - ${teacher.organization || 'Mitra Sekolah'}` : 'UPT SD Negeri Karanganyar Kota Pasuruan'}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Banner Profile Card */}
        <div className={`flex items-center gap-4 p-4 rounded-2xl text-white shadow-md ${
          isExternal
            ? 'bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900'
            : 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900'
        }`}>
          <img
            src={
              teacher.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(teacher.fullName)}`
            }
            alt={teacher.fullName}
            className={`w-18 h-18 rounded-2xl object-cover bg-white/10 p-1 border-2 shadow-md flex-shrink-0 ${
              isExternal ? 'border-purple-300' : 'border-amber-300'
            }`}
          />
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={teacher.isActive ? 'emerald' : 'slate'} dot>
                {teacher.isActive ? 'Aktif Membina' : 'Non-Aktif'}
              </Badge>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${
                isExternal ? 'bg-purple-400/20 text-purple-200 border border-purple-400/40' : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
              }`}>
                {isExternal ? <Globe2 className="w-3 h-3" /> : <School className="w-3 h-3" />}
                {isExternal ? 'Pembina Luar (Eksternal)' : 'Pendidik Internal'}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base leading-snug truncate">
              {teacher.fullName}
            </h3>
            <p className={`text-xs font-semibold flex items-center gap-1.5 ${isExternal ? 'text-purple-200' : 'text-amber-300'}`}>
              <Briefcase className="w-3.5 h-3.5" /> {teacher.position}
            </p>
          </div>
        </div>

        {/* Data List */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 divide-y divide-slate-200 text-xs">
          {/* Asal Lembaga / Sanggar jika Eksternal */}
          {isExternal && teacher.organization && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-purple-600" /> Asal Lembaga / Sanggar / Klub
              </span>
              <span className="font-bold text-purple-900 bg-purple-100/80 px-2.5 py-1 rounded-lg border border-purple-200">
                {teacher.organization}
              </span>
            </div>
          )}

          {/* Jenis Kelamin */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="text-xs">⚧</span> Jenis Kelamin
            </span>
            <span className={`font-bold px-2 py-0.5 rounded-lg border text-xs flex items-center gap-1 ${
              teacher.gender === 'P'
                ? 'text-rose-700 bg-rose-50 border-rose-200'
                : 'text-blue-700 bg-blue-50 border-blue-200'
            }`}>
              {teacher.gender === 'P' ? '👩 Perempuan (P)' : '👨 Laki-laki (L)'}
            </span>
          </div>

          {/* NIP / No. Identitas */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> {isExternal ? 'No. Lisensi / ID Pelatih' : 'NIP / NUPTK'}
            </span>
            <span className="font-mono font-bold text-slate-800">
              {teacher.nip || (isExternal ? '-' : 'Belum diisi / Non-PNS')}
            </span>
          </div>

          {/* Jabatan / Peran */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {isExternal ? 'Peran Pembina' : 'Jabatan Utama'}
            </span>
            <span className={`font-bold px-2.5 py-1 rounded-md border ${
              isExternal
                ? 'text-purple-800 bg-purple-50 border-purple-200'
                : 'text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}>
              {teacher.position}
            </span>
          </div>

          {/* Tugas Tambahan & Pembinaan */}
          <div className="py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4 text-amber-500" /> Tugas Pembinaan & Tambahan
              </span>
              {detectedBreakdown.length > 0 && (
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Terhubung Otomatis
                </span>
              )}
            </div>

            <div className="font-medium text-slate-800 bg-amber-50/90 border border-amber-200 p-3 rounded-xl text-xs space-y-2">
              {effectiveDuties ? (
                <p className="font-bold text-slate-900 leading-relaxed">
                  {effectiveDuties}
                </p>
              ) : (
                <p className="text-slate-400 italic">Tidak ada penugasan tambahan.</p>
              )}

              {/* Detected duties list badges */}
              {detectedBreakdown.length > 0 && (
                <div className="pt-2 border-t border-amber-200/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    Detail Integrasi Otomatis:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {detectedBreakdown.map((duty, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-800 border border-amber-300 shadow-2xs"
                      >
                        {duty.type === 'duta' ? (
                          <Flag className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Trophy className="w-3 h-3 text-emerald-600" />
                        )}
                        <span>{duty.dutyLabel}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terdaftar Sejak */}
          <div className="py-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Input Data
            </span>
            <span className="text-slate-500 font-mono">
              {new Date(teacher.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(teacher);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Edit Profil
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-colors ${
              isExternal ? 'bg-purple-700 hover:bg-purple-800' : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
