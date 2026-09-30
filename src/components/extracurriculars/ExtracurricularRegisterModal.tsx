import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Users,
  School,
  CheckSquare,
  Square,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Extracurricular, Student } from '../../types';
import { useData } from '../../context/DataContext';
import { StudentSelector } from '../common/StudentSelector';
import {
  checkExtracurricularRegistration,
  extractGradeLevel,
  isPramukaEkskul,
  isTikEkskul
} from '../../utils/ruleValidation';
import { isClassMatching } from '../../utils/classUtils';

interface ExtracurricularRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  extracurricular?: Extracurricular | null;
  student?: Student | null;
  initialMode?: 'individual' | 'class';
}

export const ExtracurricularRegisterModal: React.FC<ExtracurricularRegisterModalProps> = ({
  isOpen,
  onClose,
  extracurricular,
  student,
  initialMode = 'individual'
}) => {
  const {
    students,
    classes,
    extracurriculars,
    registerExtracurricularMember,
    registerBatchExtracurricularMembers,
    extracurricularMembers,
    schoolProfile
  } = useData();

  // Registration Mode: 'individual' (1 murid) vs 'class' (1 rombel sekaligus)
  const [regMode, setRegMode] = useState<'individual' | 'class'>('individual');

  // Individual mode state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedEkskulId, setSelectedEkskulId] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [isException, setIsException] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');

  // Class mode state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [classCoachNotes, setClassCoachNotes] = useState('');
  const [classIsException, setClassIsException] = useState(false);
  const [classExceptionReason, setClassExceptionReason] = useState('');
  const [joinDate, setJoinDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // General state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active extracurricular resolution
  const activeEkskul =
    extracurricular ||
    extracurriculars.find((e) => e.id === selectedEkskulId) ||
    extracurriculars[0];

  const currentMembers = useMemo(() => {
    if (!activeEkskul) return [];
    return extracurricularMembers.filter(
      (m) => m.extracurricularId === activeEkskul.id && m.status === 'aktif'
    );
  }, [activeEkskul, extracurricularMembers]);

  const maxElective = schoolProfile.maxElectiveExtracurricular || 2;

  // Initialize state on open
  useEffect(() => {
    if (isOpen) {
      setErrMsg('');
      setSuccessMsg('');
      setCoachNotes('');
      setIsException(false);
      setExceptionReason('');
      setJoinDate(new Date().toISOString().split('T')[0]);

      if (student) {
        setRegMode('individual');
        setSelectedStudentId(student.id);
        setSelectedEkskulId(extracurriculars[0]?.id || '');
      } else {
        setRegMode(initialMode || 'individual');
        if (extracurricular) {
          setSelectedEkskulId(extracurricular.id);
        } else if (extracurriculars.length > 0) {
          setSelectedEkskulId(extracurriculars[0].id);
        }

        if (students.length > 0) {
          setSelectedStudentId(students[0].id);
        }

        // Default class for class mode
        const defaultClass = classes[0]?.name || (students[0]?.classId || 'Kelas 1 A');
        setSelectedClass(defaultClass);
        setClassCoachNotes(`Pendaftaran kolektif ${defaultClass}`);
        setClassIsException(false);
        setClassExceptionReason('');
      }
    }
  }, [isOpen, extracurricular, student, students, extracurriculars, classes, initialMode]);

  // Update selected students in class mode when selectedClass or activeEkskul changes
  useEffect(() => {
    if (isOpen && regMode === 'class' && selectedClass && activeEkskul) {
      const classStudents = students.filter((s) => isClassMatching(s.classId, selectedClass));
      const activeStudentIdsInEkskul = new Set(
        currentMembers.map((m) => m.studentId)
      );
      // Pre-select all students in class who are not yet registered
      const newSelected = new Set<string>();
      classStudents.forEach((s) => {
        if (!activeStudentIdsInEkskul.has(s.id)) {
          newSelected.add(s.id);
        }
      });
      setSelectedStudentIds(newSelected);
      setClassCoachNotes(`Pendaftaran kolektif ${selectedClass} TP ${schoolProfile.currentAcademicYear}`);
    }
  }, [isOpen, regMode, selectedClass, activeEkskul, currentMembers, students, schoolProfile.currentAcademicYear]);

  // Individual Mode Validation
  const targetStudent = student || students.find((s) => s.id === selectedStudentId);
  const gradeLevel = targetStudent ? extractGradeLevel(targetStudent.classId) : 1;

  const ruleCheck = useMemo(() => {
    if (!targetStudent || !activeEkskul) return null;
    return checkExtracurricularRegistration(
      targetStudent,
      activeEkskul.id,
      activeEkskul.name,
      extracurricularMembers,
      maxElective,
      schoolProfile.currentAcademicYear
    );
  }, [targetStudent, activeEkskul, extracurricularMembers, maxElective, schoolProfile.currentAcademicYear]);

  // Class Mode Analysis
  const classGradeLevel = useMemo(() => extractGradeLevel(selectedClass), [selectedClass]);

  const isClassEkskulCompulsory = useMemo(() => {
    if (!activeEkskul) return false;
    const isPramuka = isPramukaEkskul(activeEkskul.id) || isPramukaEkskul(activeEkskul.name);
    const isTik = isTikEkskul(activeEkskul.id) || isTikEkskul(activeEkskul.name);
    return (
      (isPramuka && classGradeLevel >= 1 && classGradeLevel <= 5) ||
      (isTik && classGradeLevel >= 4 && classGradeLevel <= 6)
    );
  }, [activeEkskul, classGradeLevel]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => isClassMatching(s.classId, selectedClass));
  }, [students, selectedClass]);

  const activeStudentIdSet = useMemo(() => {
    return new Set(currentMembers.map((m) => m.studentId));
  }, [currentMembers]);

  // Pre-analyze students in the class
  const classStudentsAnalysis = useMemo(() => {
    return classStudents.map((st) => {
      const isAlreadyActive = activeStudentIdSet.has(st.id);
      const studentGrade = extractGradeLevel(st.classId);

      // Count active electives of this student
      const activeElectives = extracurricularMembers.filter((m) => {
        if (m.studentId !== st.id || m.status !== 'aktif') return false;
        const mP = isPramukaEkskul(m.extracurricularId) || isPramukaEkskul(m.extracurricularName);
        const mT = isTikEkskul(m.extracurricularId) || isTikEkskul(m.extracurricularName);
        const mComp = (mP && studentGrade >= 1 && studentGrade <= 5) || (mT && studentGrade >= 4 && studentGrade <= 6);
        return !mComp;
      });

      const currentElectiveCount = activeElectives.length;
      const willExceedLimit = !isClassEkskulCompulsory && currentElectiveCount >= maxElective;

      return {
        student: st,
        isAlreadyActive,
        currentElectiveCount,
        willExceedLimit
      };
    });
  }, [classStudents, activeStudentIdSet, extracurricularMembers, isClassEkskulCompulsory, maxElective]);

  const unassignedCount = classStudentsAnalysis.filter((c) => !c.isAlreadyActive).length;
  const alreadyAssignedCount = classStudentsAnalysis.filter((c) => c.isAlreadyActive).length;

  const selectedCount = selectedStudentIds.size;

  // Selected students who exceed elective limit
  const selectedExceededStudents = useMemo(() => {
    if (isClassEkskulCompulsory) return [];
    return classStudentsAnalysis.filter(
      (c) => selectedStudentIds.has(c.student.id) && c.willExceedLimit
    );
  }, [classStudentsAnalysis, selectedStudentIds, isClassEkskulCompulsory]);

  // Capacity check
  const capacity = activeEkskul?.capacity || 500;
  const remainingCapacity = Math.max(0, capacity - currentMembers.length);

  // Toggle single student in class mode
  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Select all unassigned students in class
  const handleSelectAllUnassigned = () => {
    const next = new Set<string>();
    classStudentsAnalysis.forEach((c) => {
      if (!c.isAlreadyActive) {
        next.add(c.student.id);
      }
    });
    setSelectedStudentIds(next);
  };

  // Clear all selections in class
  const handleDeselectAll = () => {
    setSelectedStudentIds(new Set());
  };

  // Handle Submit for Individual Mode
  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!activeEkskul) {
      setErrMsg('Silakan pilih kegiatan ekstrakurikuler.');
      return;
    }

    if (!targetStudent) {
      setErrMsg('Silakan pilih murid yang didaftarkan terlebih dahulu.');
      return;
    }

    // Check if already registered
    const already = currentMembers.find(
      (m) => m.studentId === targetStudent.id && m.status === 'aktif'
    );
    if (already) {
      setErrMsg(`Murid "${targetStudent.fullName}" sudah terdaftar aktif di ekstrakurikuler ${activeEkskul.name}.`);
      return;
    }

    // Check if rule limit exceeded without exception
    if (ruleCheck?.willExceedLimit && (!isException || !exceptionReason.trim())) {
      setErrMsg('Pendaftaran melebihi batas maksimal ekstrakurikuler pilihan. Berikan persetujuan dispensasi/pengecualian beserta alasan yang sah untuk melanjutkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerExtracurricularMember({
        extracurricularId: activeEkskul.id,
        extracurricularName: activeEkskul.name,
        studentId: targetStudent.id,
        studentName: targetStudent.fullName,
        studentNis: targetStudent.nis || targetStudent.nisn,
        classId: targetStudent.classId,
        joinedAt: joinDate || new Date().toISOString().split('T')[0],
        status: 'aktif',
        attendancePercentage: 100,
        coachNotes: coachNotes || 'Anggota baru terdaftar',
        academicYear: schoolProfile.currentAcademicYear,
        isException: isException,
        exceptionReason: isException ? exceptionReason.trim() : undefined
      });
      onClose();
      setCoachNotes('');
      setErrMsg('');
    } catch (err: any) {
      console.error('Error registering extracurricular member:', err);
      setErrMsg(err?.message || 'Gagal menyimpan pendaftaran ekstrakurikuler. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit for Class Mode
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!activeEkskul) {
      setErrMsg('Silakan pilih kegiatan ekstrakurikuler.');
      return;
    }

    if (!selectedClass) {
      setErrMsg('Silakan pilih rombongan belajar (kelas).');
      return;
    }

    if (selectedStudentIds.size === 0) {
      setErrMsg('Pilih minimal 1 murid yang akan didaftarkan ke ekstrakurikuler ini.');
      return;
    }

    // Check if some selected students exceed limit and exception reason is missing
    if (selectedExceededStudents.length > 0 && (!classIsException || !classExceptionReason.trim())) {
      setErrMsg(
        `Terdapat ${selectedExceededStudents.length} murid yang melebihi batas maksimal ${maxElective} pilihan. Aktifkan kotak dispensasi dan masukkan alasan persetujuan sekolah.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedStudents = classStudents.filter((s) => selectedStudentIds.has(s.id));
      const membersToRegister = selectedStudents.map((st) => {
        const studentAnalysis = classStudentsAnalysis.find((c) => c.student.id === st.id);
        const needsException = studentAnalysis?.willExceedLimit && classIsException;

        return {
          extracurricularId: activeEkskul.id,
          extracurricularName: activeEkskul.name,
          studentId: st.id,
          studentName: st.fullName,
          studentNis: st.nis || st.nisn,
          classId: st.classId,
          joinedAt: joinDate || new Date().toISOString().split('T')[0],
          status: 'aktif' as const,
          attendancePercentage: 100,
          coachNotes: classCoachNotes || `Pendaftaran massal ${selectedClass}`,
          academicYear: schoolProfile.currentAcademicYear,
          isException: needsException,
          exceptionReason: needsException ? classExceptionReason.trim() : undefined
        };
      });

      const res = await registerBatchExtracurricularMembers(membersToRegister);
      setSuccessMsg(
        `Berhasil mendaftarkan ${res.registeredCount} murid ${selectedClass} ke ekstrakurikuler ${activeEkskul.name}!`
      );

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Error batch registering extracurricular members:', err);
      setErrMsg(err?.message || 'Gagal menyimpan pendaftaran satu kelas. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pendaftaran Anggota ${activeEkskul ? activeEkskul.name : 'Ekstrakurikuler'}`}
      subtitle={
        activeEkskul
          ? `Kapasitas: ${currentMembers.length}/${capacity} Murid Terdaftar (Tersedia ${remainingCapacity} Kuota)`
          : 'Pilih murid atau rombongan belajar untuk didaftarkan'
      }
      maxWidth={regMode === 'class' ? '2xl' : 'lg'}
    >
      <div className="space-y-4">
        {/* Mode Selector Tab (Only when not locked to a specific student) */}
        {!student && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setRegMode('individual');
                setErrMsg('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                regMode === 'individual'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Per Murid (Individu)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRegMode('class');
                setErrMsg('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                regMode === 'class'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Daftarkan Satu Kelas (Massal)</span>
            </button>
          </div>
        )}

        {/* Global Error or Success Notifications */}
        {errMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>{errMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* ========================================================== */}
        {/* MODE 1: INDIVIDU (PER MURID) */}
        {/* ========================================================== */}
        {regMode === 'individual' && (
          <form onSubmit={handleIndividualSubmit} className="space-y-4">
            {/* If student prop was provided, show student info; otherwise show selector */}
            {student ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 block">Murid Terpilih:</span>
                  <p className="text-xs font-black text-slate-900">{student.fullName} ({student.classId})</p>
                  <p className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Kegiatan Ekstrakurikuler:
                  </label>
                  <select
                    value={selectedEkskulId}
                    onChange={(e) => setSelectedEkskulId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold"
                  >
                    {extracurriculars.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {!extracurricular && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Kegiatan Ekstrakurikuler:
                    </label>
                    <select
                      value={selectedEkskulId}
                      onChange={(e) => setSelectedEkskulId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold"
                    >
                      {extracurriculars.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <StudentSelector
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={(st: Student) => setSelectedStudentId(st.id)}
                  label="Pilih Murid (Cari Berdasarkan Kelas / Nama)"
                  required
                />
              </div>
            )}

            {/* Rule Status Badge for Individual */}
            {ruleCheck && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Ketentuan Kategori:</span>
                  {ruleCheck.isCompulsoryForStudent ? (
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                      ⛺ Ekstrakurikuler Wajib Tingkat {gradeLevel}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      🎯 Ekstrakurikuler Pilihan (Aktif: {ruleCheck.currentElectiveCount}/{maxElective})
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {ruleCheck.isCompulsoryForStudent
                    ? `Ekstrakurikuler ini merupakan kewajiban bagi murid tingkat kelas ${gradeLevel} dan TIDAK memotong kuota ekstrakurikuler pilihan.`
                    : `Kuota ekstrakurikuler pilihan yang diperkenankan adalah maksimal ${maxElective} per murid.`}
                </p>
              </div>
            )}

            {/* Warning if limit exceeded */}
            {ruleCheck?.willExceedLimit && (
              <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-amber-900">
                      Peringatan Batas Maksimal Ekstrakurikuler Pilihan!
                    </h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Murid <strong>{targetStudent?.fullName}</strong> saat ini sudah mengikuti <strong>{ruleCheck.currentElectiveCount}</strong> ekstrakurikuler pilihan (Batas maksimal: {maxElective}).
                      Pendaftaran ini akan menjadikan total <strong>{ruleCheck.newElectiveCount} pilihan</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isException}
                      onChange={(e) => setIsException(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-amber-950">
                      Berikan Pengecualian / Dispensasi Khusus (Izin Admin)
                    </span>
                  </label>

                  {isException && (
                    <div className="mt-2 space-y-1">
                      <label className="block text-[11px] font-bold text-amber-900">
                        Alasan Pengecualian (Wajib Dicatat)*
                      </label>
                      <input
                        type="text"
                        required
                        value={exceptionReason}
                        onChange={(e) => setExceptionReason(e.target.value)}
                        placeholder="Contoh: Persiapan lomba FLS2N provinsi / bakat ganda berprestasi"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-amber-600 font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Minat / Pengalaman Awal:
              </label>
              <textarea
                rows={2}
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Catatan motivasi atau persetujuan orang tua..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (ruleCheck?.willExceedLimit && (!isException || !exceptionReason.trim()))}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs active:scale-95 transition-all ${
                  ruleCheck?.willExceedLimit
                    ? 'bg-amber-600 hover:bg-amber-700 disabled:opacity-50'
                    : 'bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50'
                }`}
              >
                {isSubmitting
                  ? 'Menyimpan...'
                  : ruleCheck?.willExceedLimit
                  ? isException
                    ? 'Simpan dengan Dispensasi'
                    : 'Peringatan: Melebihi Kuota'
                  : 'Daftarkan Murid'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================== */}
        {/* MODE 2: SATU KELAS (PENDAFTARAN MASSAL ROMBEL) */}
        {/* ========================================================== */}
        {regMode === 'class' && (
          <form onSubmit={handleClassSubmit} className="space-y-4">
            {/* Top selectors: Ekskul & Kelas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!extracurricular && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kegiatan Ekstrakurikuler:
                  </label>
                  <select
                    value={selectedEkskulId}
                    onChange={(e) => setSelectedEkskulId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold text-slate-800"
                  >
                    {extracurriculars.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={!extracurricular ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Pilih Rombongan Belajar (Kelas):</span>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    {classStudents.length} Murid Terdata
                  </span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-emerald-600 focus:outline-emerald-700 font-bold text-emerald-950 bg-emerald-50/30"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rule Context Badge for Selected Class */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-emerald-950">
                    {selectedClass} • Tingkat {classGradeLevel}
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    {isClassEkskulCompulsory
                      ? `⭐ Ekstrakurikuler WAJIB bagi ${selectedClass} (Tidak memotong kuota pilihan murid)`
                      : `🎯 Ekstrakurikuler PILIHAN bagi ${selectedClass} (Batas maksimal sekolah: ${maxElective} pilihan)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-emerald-300 text-emerald-900 shadow-2xs">
                  {unassignedCount} Belum Terdaftar
                </span>
                {alreadyAssignedCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {alreadyAssignedCount} Sudah Aktif
                  </span>
                )}
              </div>
            </div>

            {/* Capacity check warning */}
            {selectedCount > remainingCapacity && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Kapasitas Hampir Penuh:</strong> Jumlah murid yang dipilih ({selectedCount}) melebihi sisa kapasitas ({remainingCapacity} dari {capacity} kuota total).
                </div>
              </div>
            )}

            {/* Student Checklist Card */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {/* Header Action Bar */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">
                    Daftar Murid {selectedClass}:
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                    {selectedCount} Terpilih
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectAllUnassigned}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    Pilih Semua ({unassignedCount})
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
                  >
                    Batal Pilih
                  </button>
                </div>
              </div>

              {/* Scrollable Checklist */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1">
                {classStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Belum ada data murid terdaftar di rombel {selectedClass}.
                  </div>
                ) : (
                  classStudentsAnalysis.map((item) => {
                    const st = item.student;
                    const isSelected = selectedStudentIds.has(st.id);
                    const isAlready = item.isAlreadyActive;

                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          if (!isAlready) handleToggleStudent(st.id);
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          isAlready
                            ? 'bg-slate-50/60 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-50/70 hover:bg-emerald-100/70 cursor-pointer'
                            : 'hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isAlready ? (
                            <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}

                          <img
                            src={st.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(st.fullName)}`}
                            alt={st.fullName}
                            className="w-7 h-7 rounded-lg object-cover bg-slate-200 flex-shrink-0"
                          />

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {st.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              NISN: {st.nisn} • Gender: {st.gender || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isAlready ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Sudah Terdaftar Aktif
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {item.currentElectiveCount}/{maxElective} Pilihan
                              </span>
                              {item.willExceedLimit && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  ⚠️ Kuota Penuh
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Warning if any selected student exceeds limit */}
            {selectedExceededStudents.length > 0 && (
              <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-black">
                      Dispensasi Dibutuhkan: {selectedExceededStudents.length} Murid Melebihi Kuota Pilihan
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Murid berikut sudah memiliki {maxElective} ekstrakurikuler pilihan:{' '}
                      <strong>{selectedExceededStudents.map((s) => s.student.fullName).join(', ')}</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={classIsException}
                      onChange={(e) => setClassIsException(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-amber-950">
                      Berikan Izin Dispensasi / Pengecualian Resmi untuk Murid Terpilih
                    </span>
                  </label>

                  {classIsException && (
                    <div className="mt-2 space-y-1">
                      <label className="block text-[11px] font-bold text-amber-900">
                        Alasan Dispensasi Sekolah (Wajib Diisi)*
                      </label>
                      <input
                        type="text"
                        required
                        value={classExceptionReason}
                        onChange={(e) => setClassExceptionReason(e.target.value)}
                        placeholder="Contoh: Program penguatan bakat rombongan belajar kelas binaan"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-amber-600 font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Mulai Bergabung:
                </label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Pendaftaran Kolektif:
                </label>
                <input
                  type="text"
                  value={classCoachNotes}
                  onChange={(e) => setClassCoachNotes(e.target.value)}
                  placeholder="Contoh: Pendaftaran serentak kelas awal semester"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Akan mendaftarkan <strong>{selectedCount} murid</strong> ke <strong>{activeEkskul?.name}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    selectedCount === 0 ||
                    (selectedExceededStudents.length > 0 && (!classIsException || !classExceptionReason.trim()))
                  }
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <School className="w-3.5 h-3.5" />
                  {isSubmitting
                    ? 'Mendaftarkan Murid...'
                    : `Daftarkan ${selectedCount} Murid ${selectedClass}`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
