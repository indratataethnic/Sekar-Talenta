import React from 'react';
import { Teacher } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Briefcase, Award, Phone, Mail, Hash, Calendar, CheckCircle2, MessageCircle } from 'lucide-react';

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
  if (!teacher) return null;

  const getWaLink = (phone?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    const formatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    return `https://wa.me/${formatted}`;
  };

  const waLink = getWaLink(teacher.phone);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Guru & Tenaga Pendidik"
      subtitle="UPT SD Negeri Karanganyar Kota Pasuruan"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Banner Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white shadow-md">
          <img
            src={
              teacher.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(teacher.fullName)}`
            }
            alt={teacher.fullName}
            className="w-18 h-18 rounded-2xl object-cover bg-white/10 p-1 border-2 border-amber-300 shadow-md flex-shrink-0"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant={teacher.isActive ? 'emerald' : 'slate'} dot>
                {teacher.isActive ? 'Aktif Mengajar' : 'Non-Aktif'}
              </Badge>
            </div>
            <h3 className="font-extrabold text-white text-base leading-snug truncate">
              {teacher.fullName}
            </h3>
            <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-300" /> {teacher.position}
            </p>
          </div>
        </div>

        {/* Data List */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 divide-y divide-slate-200 text-xs">
          {/* NIP */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> NIP / NUPTK
            </span>
            <span className="font-mono font-bold text-slate-800">
              {teacher.nip || 'Belum diisi / Non-PNS'}
            </span>
          </div>

          {/* Jabatan */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Jabatan
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {teacher.position}
            </span>
          </div>

          {/* Tugas Tambahan */}
          <div className="py-2.5 flex flex-col gap-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Tugas Tambahan / Pembina
            </span>
            <div className="font-bold text-slate-800 bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl text-xs">
              {teacher.additionalDuties || 'Tidak ada penugasan tambahan.'}
            </div>
          </div>

          {/* Kontak WhatsApp */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> No. Telepon / WA
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-800">
                {teacher.phone || '-'}
              </span>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-700" /> Chat WA
                </a>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Resmi
            </span>
            <span className="font-medium text-slate-800">
              {teacher.email ? (
                <a href={`mailto:${teacher.email}`} className="text-emerald-700 hover:underline">
                  {teacher.email}
                </a>
              ) : (
                '-'
              )}
            </span>
          </div>

          {/* Terdaftar Sejak */}
          <div className="py-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Input
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
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
