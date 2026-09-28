import React from 'react';
import {
  Printer,
  X,
  Sparkles,
  Award,
  Layers,
  FolderHeart,
  CheckCircle2,
  Calendar,
  Phone,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';

interface StudentProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentProfileCardModal: React.FC<StudentProfileCardModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const {
    schoolProfile,
    studentInterests,
    ambassadorMembers,
    extracurricularMembers,
    portfolios,
    achievements,
    teacherObservations
  } = useData();

  if (!isOpen || !student) return null;

  const interests = studentInterests.filter((i) => i.studentId === student.id);
  const myAmbassadors = ambassadorMembers.filter((m) => m.studentId === student.id && m.status === 'aktif');
  const myEkskuls = extracurricularMembers.filter((m) => m.studentId === student.id && m.status === 'aktif');
  const myPortfolios = portfolios.filter((p) => p.studentId === student.id);
  const myAchievements = achievements.filter((a) => a.studentId === student.id);
  const myObservations = teacherObservations.filter((o) => o.studentId === student.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Modal Action Bar - Hidden in Print */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Pratinjau Kartu Portofolio & Bakat Murid</h3>
              <p className="text-[11px] text-slate-400">Siap cetak resmi format standar UPT SD Negeri Karanganyar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" /> Cetak Lembar Profil
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 sm:p-10 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-6 space-y-6 text-slate-800 text-xs">
          
          {/* Official Letterhead (KOP SURAT) */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-xl shadow-xs border border-emerald-600 flex-shrink-0">
                ST
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-600">
                  Pemerintah Kota Pasuruan • Dinas Pendidikan dan Kebudayaan
                </h4>
                <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                  {schoolProfile.name.toUpperCase()}
                </h2>
                <p className="text-[10px] text-slate-500">
                  NPSN: {schoolProfile.npsn} • {schoolProfile.address}, {schoolProfile.city}
                </p>
                <p className="text-[10px] text-emerald-800 font-bold italic mt-0.5">
                  Sistem Informasi Rekam Jejak Bakat, Minat & Duta Sekolah (SEKAR TALENTA)
                </p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="inline-block px-4 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider border border-slate-300">
                LEMBAR PORTOFOLIO & REKAM JEJAK BAKAT MINAT MURID
              </span>
            </div>
          </div>

          {/* Student Header & Bio */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
            <div className="sm:col-span-3 flex flex-col items-center justify-center text-center">
              <img
                src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.fullName)}`}
                alt={student.fullName}
                className="w-24 h-24 rounded-2xl object-cover bg-white p-1 border-2 border-emerald-600 shadow-sm"
              />
              <span className="mt-2 px-2.5 py-0.5 rounded-md bg-emerald-800 text-white font-bold text-[10px]">
                {student.classId}
              </span>
            </div>

            <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Nama Lengkap</span>
                <p className="font-black text-slate-900 text-sm">{student.fullName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">NISN</span>
                <p className="font-mono font-bold text-slate-800">{student.nisn}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Jenis Kelamin</span>
                <p className="font-medium text-slate-800">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Orang Tua / Wali</span>
                <p className="font-medium text-slate-800">{student.parentName || '-'} {student.parentPhone ? `(${student.parentPhone})` : ''}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Alamat Domisili</span>
                <p className="font-medium text-slate-800 truncate">{student.address || '-'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Tahun Pelajaran / Semester</span>
                <p className="font-bold text-emerald-800">{student.academicYear} ({schoolProfile.currentSemester})</p>
              </div>
            </div>
          </div>

          {/* Section 1: Pemetaan Minat & Potensi */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1. Rekam Hasil Eksplorasi Bakat & Minat
            </h4>
            {interests.length === 0 ? (
              <p className="text-slate-400 italic py-2">Belum ada isian kuesioner minat murid.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {interests.map((int) => (
                  <div key={int.id} className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{int.subcategory}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {int.interestLevel.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Bidang: {int.categoryName}</p>
                    {int.notes && (
                      <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded">
                        "{int.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Duta Sekolah & Ekstrakurikuler Aktif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                2. Penugasan Duta Sekolah (SEKAR MELATI)
              </h4>
              {myAmbassadors.length === 0 ? (
                <p className="text-slate-400 italic py-1">Tidak sedang bertugas sebagai duta sekolah.</p>
              ) : (
                myAmbassadors.map((amb) => (
                  <div key={amb.id} className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950">{amb.ambassadorTypeName}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        AKTIF
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Peran: {amb.roleTitle || 'Kader Duta'} • Pembina: {amb.coachName || 'Guru Pembina'}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                3. Kegiatan Ekstrakurikuler
              </h4>
              {myEkskuls.length === 0 ? (
                <p className="text-slate-400 italic py-1">Belum mengikuti ekstrakurikuler.</p>
              ) : (
                myEkskuls.map((ek) => (
                  <div key={ek.id} className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950">{ek.extracurricularName}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        Kehadiran {ek.attendancePercentage || 100}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Terdaftar sejak: {ek.joinedAt}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Portofolio Karya & Prestasi */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <FolderHeart className="w-3.5 h-3.5 text-rose-500" />
              4. Karya Portofolio & Piagam Prestasi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {myAchievements.map((ach) => (
                <div key={ach.id} className="p-2 rounded-xl border border-amber-200 bg-amber-50/40">
                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[9px] font-extrabold">
                    PRESTASI: {ach.rank} ({ach.level})
                  </span>
                  <p className="font-bold text-slate-900 text-[11px] mt-1">{ach.title}</p>
                  <p className="text-[10px] text-slate-500">{ach.eventName} • {ach.date}</p>
                </div>
              ))}
              {myPortfolios.slice(0, 2).map((port) => (
                <div key={port.id} className="p-2 rounded-xl border border-slate-200 bg-white">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 text-[9px] font-extrabold">
                    KARYA: {port.category.toUpperCase()}
                  </span>
                  <p className="font-bold text-slate-900 text-[11px] mt-1">{port.title}</p>
                  <p className="text-[10px] text-slate-600 line-clamp-1">{port.description}</p>
                </div>
              ))}
              {myAchievements.length === 0 && myPortfolios.length === 0 && (
                <p className="text-slate-400 italic text-[11px] col-span-2 py-1">Belum ada karya atau prestasi yang terarsip.</p>
              )}
            </div>
          </div>

          {/* Section 4: Catatan Pengamatan & Pertumbuhan Karakter */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              5. Catatan Pengamatan & Rekomendasi Guru
            </h4>
            {myObservations.length === 0 ? (
              <p className="text-slate-400 italic py-1">Belum ada catatan pengamatan guru semester ini.</p>
            ) : (
              myObservations.slice(0, 2).map((obs) => (
                <div key={obs.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-slate-700 italic">"{obs.observationNotes}"</p>
                  {obs.characterGrowthNotes && (
                    <p className="text-[10px] text-emerald-800 font-bold">
                      🌟 Perkembangan Karakter: {obs.characterGrowthNotes}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400">Pengamat: {obs.teacherName} ({obs.observedDate})</p>
                </div>
              ))
            )}
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala UPT SD Negeri Karanganyar</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic text-slate-300 text-xs">[ Tanda Tangan & Cap ]</span>
              </div>
              <p className="font-black text-slate-900 underline">{schoolProfile.principalName}</p>
              <p className="text-[10px] text-slate-500">NIP. {schoolProfile.principalNip}</p>
            </div>

            <div>
              <p className="text-slate-500">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900">Guru / Wali {student.classId}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic text-slate-300 text-xs">[ Tanda Tangan ]</span>
              </div>
              <p className="font-black text-slate-900 underline">Ibu Ratna Dewi, S.Pd.</p>
              <p className="text-[10px] text-slate-500">NIP. 19820415 200801 2 015</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
