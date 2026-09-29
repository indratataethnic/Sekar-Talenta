/**
 * Utility functions for robust school class comparison and normalization.
 * Handles variations like "Kelas 4A", "Kelas 4 A", "kelas 4a", etc.
 */

export const normalizeClassName = (name?: string): string => {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
};

export const cleanClassCode = (name?: string): string => {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const isClassMatching = (classA?: string, classB?: string): boolean => {
  if (!classA || !classB) return false;
  if (classA === 'ALL' || classB === 'ALL') return true;
  return cleanClassCode(classA) === cleanClassCode(classB);
};

export const formatClassDisplay = (name?: string): string => {
  if (!name) return '';
  const clean = cleanClassCode(name); // e.g. "kelas4a"
  const match = clean.match(/kelas(\d+)([a-z]+)/i);
  if (match) {
    return `Kelas ${match[1]} ${match[2].toUpperCase()}`;
  }
  return name;
};
