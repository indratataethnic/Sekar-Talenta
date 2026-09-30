import { AmbassadorType, Extracurricular } from '../types';

/**
 * Normalizes teacher name for robust matching across titles and degrees.
 */
export function normalizeTeacherName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/^(bapak|ibu|ustadz|ustadzah|kak|kakak|h\.|hj\.|dra\.|drs\.|dr\.)\s+/i, '')
    .replace(/,\s*(s\.pd|s\.pd\.i|s\.pd\.kor|s\.ag|s\.kom|m\.m|m\.pd|s\.t|s\.si|m\.si|s\.sos).*$/i, '')
    .replace(/\s+(s\.pd|s\.pd\.i|s\.pd\.kor|s\.ag|s\.kom|m\.m|m\.pd|s\.t|s\.si|m\.si|s\.sos).*$/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Checks if two teacher/coach names match.
 */
export function isTeacherNameMatching(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;
  const n1 = normalizeTeacherName(name1);
  const n2 = normalizeTeacherName(name2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  return n1.includes(n2) || n2.includes(n1);
}

export interface DetectedDuty {
  type: 'duta' | 'ekskul';
  sourceName: string;
  dutyLabel: string;
}

/**
 * Gets detailed detected assignments for a teacher from Duta and Ekskul lists.
 */
export function getDetectedTeacherDutiesBreakdown(
  teacherName: string,
  ambassadorTypes: AmbassadorType[] = [],
  extracurriculars: Extracurricular[] = []
): DetectedDuty[] {
  if (!teacherName) return [];
  const results: DetectedDuty[] = [];

  // 1. Check Duta (Koordinator / Pembina Duta Sekolah)
  ambassadorTypes.forEach((duta) => {
    if (duta.coachName && isTeacherNameMatching(duta.coachName, teacherName)) {
      const label = duta.shortName || duta.name;
      const dutyLabel = label.toLowerCase().startsWith('duta')
        ? `Koordinator ${label}`
        : `Koordinator Duta ${label}`;
      results.push({
        type: 'duta',
        sourceName: duta.name,
        dutyLabel
      });
    }
  });

  // 2. Check Ekskul (Pembina / Pelatih Ekstrakurikuler - bisa lebih dari 1 pembina)
  extracurriculars.forEach((ekskul) => {
    let matchedCoachRole = '';
    let isMatched = false;

    // Check array of coaches if defined
    if (Array.isArray(ekskul.coaches) && ekskul.coaches.length > 0) {
      for (const c of ekskul.coaches) {
        if (c.name && isTeacherNameMatching(c.name, teacherName)) {
          isMatched = true;
          if (c.role) matchedCoachRole = c.role;
          break;
        }
      }
    }

    // Fallback check coachName string
    if (!isMatched && ekskul.coachName && isTeacherNameMatching(ekskul.coachName, teacherName)) {
      isMatched = true;
    }

    if (isMatched) {
      const name = ekskul.name;
      let dutyLabel = '';
      if (matchedCoachRole) {
        dutyLabel = `${matchedCoachRole} Ekskul ${name}`;
      } else if (
        name.toLowerCase().startsWith('ekskul') ||
        name.toLowerCase().startsWith('pembina') ||
        name.toLowerCase().startsWith('pelatih')
      ) {
        dutyLabel = name;
      } else {
        dutyLabel = `Pembina Ekskul ${name}`;
      }

      results.push({
        type: 'ekskul',
        sourceName: ekskul.name,
        dutyLabel
      });
    }
  });

  return results;
}

/**
 * Gets detected assignment strings for a teacher from Duta and Ekskul lists.
 */
export function getDetectedTeacherDutiesList(
  teacherName: string,
  ambassadorTypes: AmbassadorType[] = [],
  extracurriculars: Extracurricular[] = []
): string[] {
  const breakdown = getDetectedTeacherDutiesBreakdown(teacherName, ambassadorTypes, extracurriculars);
  const list = breakdown.map((b) => b.dutyLabel);
  return Array.from(new Set(list));
}

/**
 * Computes automatic additional duties string for a teacher combining Duta, Ekskul, and manual duties.
 */
export function getEffectiveTeacherDuties(
  teacher: { fullName: string; additionalDuties?: string },
  ambassadorTypes: AmbassadorType[] = [],
  extracurriculars: Extracurricular[] = []
): string {
  const detected = getDetectedTeacherDutiesList(teacher.fullName, ambassadorTypes, extracurriculars);
  const combined = [...detected];

  if (teacher.additionalDuties && teacher.additionalDuties.trim()) {
    const manualList = teacher.additionalDuties
      .split(/[,;\n]+/)
      .map((d) => d.trim())
      .filter(Boolean);

    manualList.forEach((m) => {
      const normM = normalizeTeacherName(m);
      const alreadyIn = combined.some((c) => {
        const normC = normalizeTeacherName(c);
        return (
          normC === normM ||
          c.toLowerCase() === m.toLowerCase() ||
          c.toLowerCase().includes(m.toLowerCase()) ||
          m.toLowerCase().includes(c.toLowerCase())
        );
      });
      if (!alreadyIn) {
        combined.push(m);
      }
    });
  }

  return combined.join(', ');
}

/**
 * Infers gender ('L' or 'P') from a teacher's name or title if gender is not explicitly specified.
 */
export function inferGenderFromName(name: string): 'L' | 'P' {
  const lower = (name || '').toLowerCase().trim();
  if (
    lower.startsWith('ibu') ||
    lower.startsWith('hj.') ||
    lower.startsWith('hj ') ||
    lower.startsWith('dra.') ||
    lower.includes(' ratna') ||
    lower.includes(' siti') ||
    lower.includes(' nurul') ||
    lower.includes(' tri') ||
    lower.includes(' sri') ||
    lower.includes(' dian') ||
    lower.includes(' maya') ||
    lower.includes('safitri') ||
    lower.includes('kusuma') ||
    lower.includes('dewi') ||
    lower.includes('aminah') ||
    lower.includes('hidayah') ||
    lower.includes('wahyuni') ||
    lower.includes('rahayu')
  ) {
    return 'P';
  }
  return 'L';
}

/**
 * Generates an avatar URL for a teacher/coach that strictly respects gender.
 * For Perempuan (P): Generates feminine styles (including hijab & elegant long styles) with zero facial hair.
 * For Laki-laki (L): Generates neat masculine hairstyles and professional styles.
 */
export function getTeacherAvatarUrl(
  gender?: 'L' | 'P',
  seed: string = 'guru'
): string {
  const effectiveGender = gender || inferGenderFromName(seed);
  const cleanSeed = encodeURIComponent(seed.trim() || 'guru');

  if (effectiveGender === 'P') {
    const femaleTops = [
      'hijab',
      'longHair',
      'longHairBigHair',
      'longHairBob',
      'longHairBun',
      'longHairCurly',
      'longHairCurvy',
      'longHairMiaWallace',
      'longHairNotTooLong',
      'longHairStraight',
      'longHairStraight2',
      'longHairStraightStrand'
    ].join(',');

    return `https://api.dicebear.com/7.x/avataaars/svg?seed=ibu_${cleanSeed}&top=${femaleTops}&facialHairProbability=0`;
  } else {
    const maleTops = [
      'shortHair',
      'shortHairShortFlat',
      'shortHairShortRound',
      'shortHairShortWaved',
      'shortHairSides',
      'shortHairTheCaesar',
      'shortHairTheCaesarSidePart',
      'shortHairShortCurly'
    ].join(',');

    return `https://api.dicebear.com/7.x/avataaars/svg?seed=bapak_${cleanSeed}&top=${maleTops}&facialHairProbability=0`;
  }
}

/**
 * Ensures a teacher's avatar URL is valid and strictly matches their gender.
 * Fixes mismatched legacy avatar URLs.
 */
export function getValidTeacherAvatarUrl(teacher: {
  gender?: 'L' | 'P';
  fullName?: string;
  avatarUrl?: string;
}): string {
  const gender = teacher.gender || inferGenderFromName(teacher.fullName || '');

  // If no avatar URL provided, generate gender-matching avatar
  if (!teacher.avatarUrl) {
    return getTeacherAvatarUrl(gender, teacher.fullName);
  }

  // Detect mismatched female Unsplash portrait on male teacher
  if (gender === 'L' && teacher.avatarUrl.includes('photo-1534528741775-53994a69daeb')) {
    return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';
  }

  return teacher.avatarUrl;
}

