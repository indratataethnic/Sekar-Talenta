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

  // 2. Check Ekskul (Pembina / Pelatih Ekstrakurikuler)
  extracurriculars.forEach((ekskul) => {
    if (ekskul.coachName && isTeacherNameMatching(ekskul.coachName, teacherName)) {
      const name = ekskul.name;
      const dutyLabel = name.toLowerCase().startsWith('ekskul') || name.toLowerCase().startsWith('pembina') || name.toLowerCase().startsWith('pelatih')
        ? name
        : `Pembina Ekskul ${name}`;
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
