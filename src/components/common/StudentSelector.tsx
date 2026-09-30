import React, { useState, useMemo, useEffect } from 'react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { isClassMatching } from '../../utils/classUtils';
import { Search, Filter, CheckCircle2, School } from 'lucide-react';
import { Badge } from './Badge';

interface StudentSelectorProps {
  selectedStudentId: string;
  onSelectStudent: (student: Student) => void;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  selectedStudentId,
  onSelectStudent,
  label = 'Pilih Murid',
  required = true,
  className = '',
  disabled = false,
}) => {
  const { students, classes } = useData();
  const { isGuruKelas, currentUser, isSuperAdmin } = useAuth();

  // If Guru Kelas, strictly lock to their assigned class; otherwise "ALL"
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isGuruKelas && currentUser?.assignedClass) {
      return currentUser.assignedClass;
    }
    return 'ALL';
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Update selectedClass if user switches role to Guru Kelas or assignedClass updates
  useEffect(() => {
    if (isGuruKelas && currentUser?.assignedClass) {
      setSelectedClass(currentUser.assignedClass);
    }
  }, [isGuruKelas, currentUser?.assignedClass]);

  // Effective class constraint: Guru Kelas is strictly locked to their class
  const effectiveClass = (isGuruKelas && currentUser?.assignedClass) ? currentUser.assignedClass : selectedClass;

  // Filter students by effectiveClass and searchQuery
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = effectiveClass === 'ALL' || isClassMatching(s.classId, effectiveClass);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        (s.nis && s.nis.includes(q)) ||
        s.classId.toLowerCase().includes(q);

      return matchClass && matchSearch;
    });
  }, [students, effectiveClass, searchQuery]);

  const currentlySelectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Auto-sync selectedStudentId if current selection is not in filtered list
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const exists = filteredStudents.some((s) => s.id === selectedStudentId);
      if (!exists) {
        onSelectStudent(filteredStudents[0]);
      }
    }
  }, [filteredStudents, selectedStudentId, onSelectStudent]);

  // Handle select change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const student = students.find((s) => s.id === e.target.value);
    if (student) {
      onSelectStudent(student);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {isGuruKelas && currentUser?.assignedClass ? (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
            👩‍🏫 Rombel Anda: {currentUser.assignedClass}
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <School className="w-3 h-3 text-slate-400" />
            Pencarian Multi-Kelas (Admin)
          </span>
        )}
      </div>

      {/* Class filter and Search input toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Class Filter Selector (For Admin / Non-Guru Kelas) */}
        {!isGuruKelas ? (
          <div className="sm:col-span-5 relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={disabled}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-semibold text-slate-800 disabled:opacity-50"
            >
              <option value="ALL">🔍 Semua Kelas ({students.length} Murid)</option>
              {classes.map((c) => {
                const countInClass = students.filter((s) => isClassMatching(s.classId, c.name)).length;
                return (
                  <option key={c.id} value={c.name}>
                    {c.name} ({countInClass} murid)
                  </option>
                );
              })}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ) : (
          <div className="sm:col-span-5 flex items-center px-3 py-2 text-xs rounded-xl border border-emerald-200 bg-emerald-50/60 font-bold text-emerald-900">
            <School className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
            {currentUser?.assignedClass} ({students.filter((s) => isClassMatching(s.classId, currentUser?.assignedClass || '')).length} Murid)
          </div>
        )}

        {/* Live Search by Name/NISN/Class */}
        <div className="sm:col-span-7 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            placeholder={isGuruKelas ? "Cari nama murid / NISN di kelas ini..." : "Cari nama murid, NISN, atau kelas (cth: 4A)..."}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-medium text-slate-800 disabled:opacity-50"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Student Select Dropdown */}
      <div className="relative">
        <select
          value={selectedStudentId}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white text-slate-900 disabled:opacity-50"
        >
          <option value="" disabled>
            -- Pilih dari {filteredStudents.length} murid yang ditemukan --
          </option>
          {effectiveClass === 'ALL' && !searchQuery ? (
            classes.map((cls) => {
              const classKids = filteredStudents.filter((s) => isClassMatching(s.classId, cls.name));
              if (classKids.length === 0) return null;
              return (
                <optgroup key={cls.id} label={`── ${cls.name} (${classKids.length} Murid) ──`}>
                  {classKids.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.classId}] {s.fullName} • NISN: {s.nisn}
                    </option>
                  ))}
                </optgroup>
              );
            })
          ) : (
            filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.classId}] {s.fullName} • NISN: {s.nisn}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Filtered count or empty helper */}
      {filteredStudents.length === 0 ? (
        <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          ⚠️ Tidak ada murid ditemukan untuk filter rombel/pencarian ini.
          {!isGuruKelas && ' Coba pilih opsi "Semua Kelas" atau ubah kata kunci pencarian.'}
        </p>
      ) : (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>
            Menampilkan <strong>{filteredStudents.length} murid</strong>
            {effectiveClass !== 'ALL' && ` di ${effectiveClass}`}
          </span>
          {currentlySelectedStudent && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Terpilih: {currentlySelectedStudent.fullName} ({currentlySelectedStudent.classId})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
