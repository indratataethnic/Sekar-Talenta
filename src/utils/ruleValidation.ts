import { Student, ExtracurricularMember, AmbassadorMember, SchoolProfile } from '../types';

export type ComplianceStatus =
  | 'Memenuhi Ketentuan'
  | 'Belum Memenuhi'
  | 'Melebihi Batas'
  | 'Pengecualian';

export interface StudentEkskulValidation {
  studentId: string;
  studentName: string;
  classId: string;
  gradeLevel: number;
  academicYear: string;
  // Compulsory analysis
  compulsoryRequiredNames: string[];
  compulsoryJoined: ExtracurricularMember[];
  compulsoryMissingNames: string[];
  isCompulsoryComplete: boolean;
  // Elective analysis
  electiveJoined: ExtracurricularMember[];
  electiveCount: number;
  minElectiveRequired: number;
  maxElectiveAllowed: number;
  isElectiveUnderMin: boolean;
  isElectiveExceeded: boolean;
  // Exception
  hasException: boolean;
  exceptionReasons: string[];
  // Overall status
  status: ComplianceStatus;
  statusBadgeColor: 'emerald' | 'amber' | 'rose' | 'purple';
  statusDescription: string;
  reasons: string[];
}

/**
 * Extracts grade level (1 to 6) from class string.
 * Examples: "Kelas 1 A" -> 1, "4B" -> 4, "Kelas 6" -> 6. Fallback is 1.
 */
export function extractGradeLevel(classId?: string): number {
  if (!classId) return 1;
  const match = classId.match(/\b([1-6])\b/) || classId.match(/([1-6])/);
  if (match) {
    const parsed = parseInt(match[1], 10);
    if (parsed >= 1 && parsed <= 6) return parsed;
  }
  return 1;
}

/**
 * Checks if an extracurricular code/id/name refers to Gerakan Pramuka.
 */
export function isPramukaEkskul(identifier: string): boolean {
  const lower = (identifier || '').toLowerCase();
  return lower.includes('pramuka') || lower === 'ekskul_pramuka';
}

/**
 * Checks if an extracurricular code/id/name refers to TIK / Komputer.
 */
export function isTikEkskul(identifier: string): boolean {
  const lower = (identifier || '').toLowerCase();
  return lower.includes('tik') || lower.includes('robotik') || lower.includes('komputer') || lower === 'ekskul_tik';
}

/**
 * Checks if an extracurricular is compulsory for a given grade level.
 * Rule 1: Pramuka is compulsory for grades 1 - 5.
 * Rule 2: TIK is compulsory for grades 4 - 6.
 */
export function isCompulsoryForGrade(identifier: string, gradeLevel: number): boolean {
  if (isPramukaEkskul(identifier)) {
    return gradeLevel >= 1 && gradeLevel <= 5;
  }
  if (isTikEkskul(identifier)) {
    return gradeLevel >= 4 && gradeLevel <= 6;
  }
  return false;
}

/**
 * Returns the compulsory extracurricular names required for a specific grade level.
 */
export function getCompulsoryNamesForGrade(gradeLevel: number): string[] {
  const names: string[] = [];
  if (gradeLevel >= 1 && gradeLevel <= 5) {
    names.push('Pramuka');
  }
  if (gradeLevel >= 4 && gradeLevel <= 6) {
    names.push('TIK');
  }
  return names;
}

/**
 * Validates a student's active extracurricular participation against all school rules.
 */
export function validateStudentExtracurriculars(
  student: Student,
  allMembers: ExtracurricularMember[],
  maxElective = 2,
  activeAcademicYear?: string
): StudentEkskulValidation {
  const gradeLevel = extractGradeLevel(student.classId);
  const targetYear = activeAcademicYear || student.academicYear || '2024/2025';

  // Filter active memberships for this student
  const activeMemberships = allMembers.filter((m) => {
    if (m.studentId !== student.id) return false;
    // status must be aktif
    if (m.status !== 'aktif') return false;
    // If membership has academicYear specified, verify if matches targetYear (or accept if not specified)
    if (m.academicYear && activeAcademicYear && m.academicYear !== activeAcademicYear) {
      return false;
    }
    return true;
  });

  const compulsoryRequiredNames = getCompulsoryNamesForGrade(gradeLevel);
  const compulsoryJoined: ExtracurricularMember[] = [];
  const electiveJoined: ExtracurricularMember[] = [];
  const exceptionReasons: string[] = [];

  for (const member of activeMemberships) {
    const isPramuka = isPramukaEkskul(member.extracurricularId) || isPramukaEkskul(member.extracurricularName);
    const isTik = isTikEkskul(member.extracurricularId) || isTikEkskul(member.extracurricularName);

    const isMemberCompulsory =
      (isPramuka && gradeLevel >= 1 && gradeLevel <= 5) ||
      (isTik && gradeLevel >= 4 && gradeLevel <= 6);

    if (isMemberCompulsory) {
      compulsoryJoined.push(member);
    } else {
      electiveJoined.push(member);
    }

    if (member.isException && member.exceptionReason) {
      exceptionReasons.push(`${member.extracurricularName}: ${member.exceptionReason}`);
    }
  }

  // Determine missing compulsory
  const compulsoryMissingNames: string[] = [];
  if (gradeLevel >= 1 && gradeLevel <= 5) {
    const hasPramuka = compulsoryJoined.some(
      (m) => isPramukaEkskul(m.extracurricularId) || isPramukaEkskul(m.extracurricularName)
    );
    if (!hasPramuka) compulsoryMissingNames.push('Pramuka (Wajib Kelas 1-5)');
  }
  if (gradeLevel >= 4 && gradeLevel <= 6) {
    const hasTik = compulsoryJoined.some(
      (m) => isTikEkskul(m.extracurricularId) || isTikEkskul(m.extracurricularName)
    );
    if (!hasTik) compulsoryMissingNames.push('TIK (Wajib Kelas 4-6)');
  }

  const isCompulsoryComplete = compulsoryMissingNames.length === 0;
  const electiveCount = electiveJoined.length;
  const minElectiveRequired = 1;
  const isElectiveUnderMin = electiveCount < minElectiveRequired;
  const isElectiveExceeded = electiveCount > maxElective;
  const hasException = exceptionReasons.length > 0;

  const reasons: string[] = [];
  if (compulsoryMissingNames.length > 0) {
    reasons.push(`Belum mengikuti ekstrakurikuler wajib: ${compulsoryMissingNames.join(', ')}`);
  }
  if (isElectiveUnderMin) {
    reasons.push(`Belum memilih minimal 1 ekstrakurikuler pilihan (saat ini 0)`);
  }
  if (isElectiveExceeded) {
    reasons.push(`Melebihi batas maksimal ekstrakurikuler pilihan (${electiveCount}/${maxElective})`);
  }

  let status: ComplianceStatus;
  let statusBadgeColor: 'emerald' | 'amber' | 'rose' | 'purple';
  let statusDescription: string;

  if (hasException) {
    status = 'Pengecualian';
    statusBadgeColor = 'purple';
    statusDescription = `Mendapat pengecualian/dispensasi resmi dari sekolah (${exceptionReasons.length} catatan)`;
  } else if (isElectiveExceeded) {
    status = 'Melebihi Batas';
    statusBadgeColor = 'rose';
    statusDescription = `Mengikuti ${electiveCount} ekstrakurikuler pilihan (batas maksimal sekolah adalah ${maxElective})`;
  } else if (!isCompulsoryComplete || isElectiveUnderMin) {
    status = 'Belum Memenuhi';
    statusBadgeColor = 'amber';
    statusDescription = reasons.join('; ');
  } else {
    status = 'Memenuhi Ketentuan';
    statusBadgeColor = 'emerald';
    statusDescription = `Memenuhi seluruh kewajiban kelas dan kuota pilihan (${compulsoryJoined.length} Wajib, ${electiveCount} Pilihan)`;
  }

  return {
    studentId: student.id,
    studentName: student.fullName,
    classId: student.classId,
    gradeLevel,
    academicYear: targetYear,
    compulsoryRequiredNames,
    compulsoryJoined,
    compulsoryMissingNames,
    isCompulsoryComplete,
    electiveJoined,
    electiveCount,
    minElectiveRequired,
    maxElectiveAllowed: maxElective,
    isElectiveUnderMin,
    isElectiveExceeded,
    hasException,
    exceptionReasons,
    status,
    statusBadgeColor,
    statusDescription,
    reasons
  };
}

/**
 * Validates whether a student can register for a target extracurricular.
 * Returns warning info and whether an admin exception reason is required.
 */
export function checkExtracurricularRegistration(
  student: Student,
  targetEkskulId: string,
  targetEkskulName: string,
  allMembers: ExtracurricularMember[],
  maxElective = 2,
  activeAcademicYear?: string
): {
  isAlreadyRegistered: boolean;
  isCompulsoryForStudent: boolean;
  currentElectiveCount: number;
  newElectiveCount: number;
  willExceedLimit: boolean;
  warningMessage?: string;
} {
  const gradeLevel = extractGradeLevel(student.classId);
  const isPramuka = isPramukaEkskul(targetEkskulId) || isPramukaEkskul(targetEkskulName);
  const isTik = isTikEkskul(targetEkskulId) || isTikEkskul(targetEkskulName);

  const isCompulsoryForStudent =
    (isPramuka && gradeLevel >= 1 && gradeLevel <= 5) ||
    (isTik && gradeLevel >= 4 && gradeLevel <= 6);

  // Active memberships of this student
  const activeMembers = allMembers.filter(
    (m) => m.studentId === student.id && m.status === 'aktif'
  );

  const isAlreadyRegistered = activeMembers.some(
    (m) => m.extracurricularId === targetEkskulId || m.extracurricularName.toLowerCase() === targetEkskulName.toLowerCase()
  );

  // Count active electives
  const currentElectives = activeMembers.filter((m) => {
    const mPramuka = isPramukaEkskul(m.extracurricularId) || isPramukaEkskul(m.extracurricularName);
    const mTik = isTikEkskul(m.extracurricularId) || isTikEkskul(m.extracurricularName);
    const mCompulsory =
      (mPramuka && gradeLevel >= 1 && gradeLevel <= 5) ||
      (mTik && gradeLevel >= 4 && gradeLevel <= 6);
    return !mCompulsory;
  });

  const currentElectiveCount = currentElectives.length;
  const newElectiveCount = isCompulsoryForStudent ? currentElectiveCount : currentElectiveCount + 1;
  const willExceedLimit = !isCompulsoryForStudent && newElectiveCount > maxElective;

  let warningMessage: string | undefined;
  if (willExceedLimit) {
    warningMessage = `Perhatian: Murid "${student.fullName}" saat ini sudah aktif di ${currentElectiveCount} ekstrakurikuler pilihan. Batas maksimal yang diizinkan sekolah adalah ${maxElective} ekstrakurikuler pilihan. Penambahan ini akan menjadikan total ${newElectiveCount} pilihan.`;
  }

  return {
    isAlreadyRegistered,
    isCompulsoryForStudent,
    currentElectiveCount,
    newElectiveCount,
    willExceedLimit,
    warningMessage
  };
}

/**
 * Validates School Ambassador membership registration.
 * Rule: A student can ONLY have 1 active ambassador membership per period (academic year).
 */
export function checkAmbassadorAssignment(
  studentId: string,
  targetYear: string,
  allAmbassadorMembers: AmbassadorMember[],
  excludeMemberId?: string
): {
  isAllowed: boolean;
  existingActive?: AmbassadorMember;
  errorMessage?: string;
} {
  const existingActive = allAmbassadorMembers.find((m) => {
    if (m.id === excludeMemberId) return false;
    if (m.studentId !== studentId) return false;
    if (m.status !== 'aktif') return false;
    // Check period (assignedYear)
    if (m.assignedYear && targetYear && m.assignedYear === targetYear) {
      return true;
    }
    // If assignedYear not strictly matching but active in same current school period
    return true;
  });

  if (existingActive) {
    return {
      isAllowed: false,
      existingActive,
      errorMessage: `Murid ini sudah terdaftar aktif sebagai "${existingActive.ambassadorTypeName}" (${existingActive.roleTitle || 'Anggota'}) pada periode ${existingActive.assignedYear}. Sesuai aturan sekolah, setiap murid hanya diperbolehkan memiliki 1 keanggotaan Duta aktif dalam satu periode.`
    };
  }

  return {
    isAllowed: true
  };
}
