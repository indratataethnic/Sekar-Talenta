import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SchoolProfile,
  SchoolClass,
  TalentCategory,
  AmbassadorType,
  Extracurricular,
  Student,
  Teacher,
  StudentInterest,
  TeacherObservation,
  AmbassadorMember,
  AmbassadorProgram,
  ExtracurricularMember,
  Activity,
  AttendanceSession,
  Portfolio,
  Achievement,
  Announcement,
  NotificationItem,
  AuditLog,
  AuditActionType
} from '../types';
import {
  initialSchoolProfile,
  initialClasses,
  initialTalentCategories,
  initialAmbassadorTypes,
  initialExtracurriculars,
  initialStudents,
  initialTeachers,
  initialStudentInterests,
  initialTeacherObservations,
  initialAmbassadorMembers,
  initialAmbassadorPrograms,
  initialExtracurricularMembers,
  initialActivities,
  initialAttendanceSessions,
  initialPortfolios,
  initialAchievements,
  initialAnnouncements,
  initialAuditLogs
} from '../data/initialData';
import { extractGradeLevel, isPramukaEkskul, isTikEkskul } from '../utils/ruleValidation';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType, testConnection } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';

interface DataContextType {
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (updates: Partial<SchoolProfile>) => Promise<void>;
  classes: SchoolClass[];
  talentCategories: TalentCategory[];
  ambassadorTypes: AmbassadorType[];
  extracurriculars: Extracurricular[];
  students: Student[];
  teachers: Teacher[];
  studentInterests: StudentInterest[];
  teacherObservations: TeacherObservation[];
  ambassadorMembers: AmbassadorMember[];
  ambassadorPrograms: AmbassadorProgram[];
  extracurricularMembers: ExtracurricularMember[];
  activities: Activity[];
  attendanceSessions: AttendanceSession[];
  portfolios: Portfolio[];
  achievements: Achievement[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  isDemoMode: boolean;
  isCloudConnected: boolean;
  testCloudConnection: () => Promise<boolean>;
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteAllStudents: () => Promise<void>;
  importStudentsCsv: (importedList: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<number>;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Teacher>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  deleteAllTeachers: () => Promise<void>;
  importTeachersCsv: (importedList: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<number>;
  submitInterest: (data: Omit<StudentInterest, 'id' | 'submittedAt'>) => Promise<void>;
  deleteInterest: (id: string) => Promise<void>;
  addObservation: (data: Omit<TeacherObservation, 'id' | 'createdAt'>) => Promise<void>;
  updateObservation: (id: string, updates: Partial<TeacherObservation>) => Promise<void>;
  addAmbassadorType: (data: Omit<AmbassadorType, 'id'>) => Promise<void>;
  updateAmbassadorType: (id: string, updates: Partial<AmbassadorType>) => Promise<void>;
  deleteAmbassadorType: (id: string) => Promise<void>;
  addAmbassadorMember: (data: Omit<AmbassadorMember, 'id' | 'createdAt'>) => Promise<void>;
  updateAmbassadorMember: (id: string, updates: Partial<AmbassadorMember>) => Promise<void>;
  removeAmbassadorMember: (id: string) => Promise<void>;
  addAmbassadorProgram: (data: Omit<AmbassadorProgram, 'id' | 'createdAt'>) => Promise<void>;
  updateAmbassadorProgram: (id: string, updates: Partial<AmbassadorProgram>) => Promise<void>;
  deleteAmbassadorProgram: (id: string) => Promise<void>;
  addExtracurricular: (data: Omit<Extracurricular, 'id' | 'createdAt'>) => Promise<void>;
  updateExtracurricular: (id: string, updates: Partial<Extracurricular>) => Promise<void>;
  deleteExtracurricular: (id: string) => Promise<void>;
  registerExtracurricularMember: (data: Omit<ExtracurricularMember, 'id' | 'createdAt'>) => Promise<void>;
  registerBatchExtracurricularMembers: (membersData: Omit<ExtracurricularMember, 'id' | 'createdAt'>[]) => Promise<{ registeredCount: number; skippedCount: number; errors: string[] }>;
  updateExtracurricularMember: (id: string, updates: Partial<ExtracurricularMember>) => Promise<void>;
  removeExtracurricularMember: (id: string) => Promise<void>;
  addActivity: (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Activity>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  saveAttendanceSession: (data: Omit<AttendanceSession, 'id' | 'recordedAt'>) => Promise<void>;
  addPortfolio: (data: Omit<Portfolio, 'id' | 'createdAt'>) => Promise<Portfolio>;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => Promise<void>;
  verifyPortfolio: (id: string, verifiedBy: string) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  addAchievement: (data: Omit<Achievement, 'id' | 'createdAt'>) => Promise<void>;
  updateAchievement: (id: string, updates: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  addAnnouncement: (data: Omit<Announcement, 'id'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  resetToDemoData: () => void;
  clearAllDemoData: () => Promise<void>;
  purgeOnlyDummyData: () => Promise<void>;
  exportAllDataAsJson: () => string;
  importAllDataFromJson: (jsonStr: string) => Promise<boolean>;
  seedInitialDataToFirestore: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const PREFIX = 'sekar_talenta_v2_';

function loadStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    if (item) return JSON.parse(item);
  } catch {
    // fallback
  }
  return defaultValue;
}

/**
  Helper to remove undefined values from objects/arrays before passing to Firestore
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // States - Clean default state without auto-filling dummy data
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => loadStored('school_profile', initialSchoolProfile));
  const [classes] = useState<SchoolClass[]>(() => loadStored('classes', initialClasses));
  const [talentCategories] = useState<TalentCategory[]>(() => loadStored('talent_categories', initialTalentCategories));
  const [ambassadorTypes, setAmbassadorTypes] = useState<AmbassadorType[]>(() => loadStored('ambassador_types', initialAmbassadorTypes));
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>(() => loadStored('extracurriculars', initialExtracurriculars));
  const [students, setStudents] = useState<Student[]>(() => loadStored('students', []));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadStored('teachers', []));
  const [studentInterests, setStudentInterests] = useState<StudentInterest[]>(() => loadStored('student_interests', []));
  const [teacherObservations, setTeacherObservations] = useState<TeacherObservation[]>(() => loadStored('teacher_observations', []));
  const [ambassadorMembers, setAmbassadorMembers] = useState<AmbassadorMember[]>(() => loadStored('ambassador_members', []));
  const [ambassadorPrograms, setAmbassadorPrograms] = useState<AmbassadorProgram[]>(() => loadStored('ambassador_programs', []));
  const [extracurricularMembers, setExtracurricularMembers] = useState<ExtracurricularMember[]>(() => loadStored('extracurricular_members', []));
  const [activities, setActivities] = useState<Activity[]>(() => loadStored('activities', []));
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => loadStored('attendance_sessions', []));
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => loadStored('portfolios', []));
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadStored('achievements', []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadStored('announcements', []));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStored('notifications', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('audit_logs', []));

  // Sync to LocalStorage for offline durability
  useEffect(() => { localStorage.setItem(PREFIX + 'school_profile', JSON.stringify(schoolProfile)); }, [schoolProfile]);
  useEffect(() => { localStorage.setItem(PREFIX + 'ambassador_types', JSON.stringify(ambassadorTypes)); }, [ambassadorTypes]);
  useEffect(() => { localStorage.setItem(PREFIX + 'extracurriculars', JSON.stringify(extracurriculars)); }, [extracurriculars]);
  useEffect(() => { localStorage.setItem(PREFIX + 'students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(PREFIX + 'teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem(PREFIX + 'student_interests', JSON.stringify(studentInterests)); }, [studentInterests]);
  useEffect(() => { localStorage.setItem(PREFIX + 'teacher_observations', JSON.stringify(teacherObservations)); }, [teacherObservations]);
  useEffect(() => { localStorage.setItem(PREFIX + 'ambassador_members', JSON.stringify(ambassadorMembers)); }, [ambassadorMembers]);
  useEffect(() => { localStorage.setItem(PREFIX + 'ambassador_programs', JSON.stringify(ambassadorPrograms)); }, [ambassadorPrograms]);
  useEffect(() => { localStorage.setItem(PREFIX + 'extracurricular_members', JSON.stringify(extracurricularMembers)); }, [extracurricularMembers]);
  useEffect(() => { localStorage.setItem(PREFIX + 'activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem(PREFIX + 'attendance_sessions', JSON.stringify(attendanceSessions)); }, [attendanceSessions]);
  useEffect(() => { localStorage.setItem(PREFIX + 'portfolios', JSON.stringify(portfolios)); }, [portfolios]);
  useEffect(() => { localStorage.setItem(PREFIX + 'achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem(PREFIX + 'announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem(PREFIX + 'notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(PREFIX + 'audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Seed initial data to Firestore
  const seedInitialDataToFirestore = async () => {
    if (!isFirebaseConfigured || !db) return;
    try {
      await setDoc(doc(db, 'schoolProfile', 'main'), sanitizeForFirestore(schoolProfile));

      for (const s of initialStudents) {
        await setDoc(doc(db, 'students', s.id), sanitizeForFirestore(s));
      }
      for (const t of initialTeachers) {
        await setDoc(doc(db, 'teachers', t.id), sanitizeForFirestore(t));
      }
      for (const e of initialExtracurriculars) {
        await setDoc(doc(db, 'extracurriculars', e.id), sanitizeForFirestore(e));
      }
      for (const aType of initialAmbassadorTypes) {
        await setDoc(doc(db, 'ambassadorTypes', aType.id), sanitizeForFirestore(aType));
      }
      for (const i of initialStudentInterests) {
        await setDoc(doc(db, 'studentInterests', i.id), sanitizeForFirestore(i));
      }
      for (const o of initialTeacherObservations) {
        await setDoc(doc(db, 'teacherObservations', o.id), sanitizeForFirestore(o));
      }
      for (const am of initialAmbassadorMembers) {
        await setDoc(doc(db, 'ambassadorMembers', am.id), sanitizeForFirestore(am));
      }
      for (const em of initialExtracurricularMembers) {
        await setDoc(doc(db, 'extracurricularMembers', em.id), sanitizeForFirestore(em));
      }
      for (const p of initialPortfolios) {
        await setDoc(doc(db, 'portfolios', p.id), sanitizeForFirestore(p));
      }
      for (const a of initialAchievements) {
        await setDoc(doc(db, 'achievements', a.id), sanitizeForFirestore(a));
      }
      for (const act of initialActivities) {
        await setDoc(doc(db, 'activities', act.id), sanitizeForFirestore(act));
      }
      for (const ann of initialAnnouncements) {
        await setDoc(doc(db, 'announcements', ann.id), sanitizeForFirestore(ann));
      }
      logAction('SYSTEM', 'Database', 'all', 'Sinkronisasi data awal ke Cloud Firestore berhasil.');
    } catch (err: any) {
      console.warn('Seed initial data notice:', err.message);
    }
  };

  // Firestore Realtime Listeners across all collections
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsCloudConnected(false);
      return;
    }

    setIsCloudConnected(true);

    // 0. School Profile listener
    const unsubSchool = onSnapshot(doc(db, 'schoolProfile', 'main'), (snap) => {
      if (snap.exists()) setSchoolProfile(snap.data() as SchoolProfile);
    }, (error) => console.warn('School profile snapshot notice:', error.message));

    // 1. Students listener
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const items: Student[] = [];
      snap.forEach((doc) => items.push(doc.data() as Student));
      setStudents(items);
    }, (error) => console.warn('Students snapshot notice:', error.message));

    // 2. Teachers listener
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snap) => {
      const items: Teacher[] = [];
      snap.forEach((doc) => items.push(doc.data() as Teacher));
      setTeachers(items);
    }, (error) => console.warn('Teachers snapshot notice:', error.message));

    // 3. Extracurriculars listener
    const unsubEkskulMaster = onSnapshot(collection(db, 'extracurriculars'), (snap) => {
      const items: Extracurricular[] = [];
      snap.forEach((doc) => items.push(doc.data() as Extracurricular));
      setExtracurriculars(items);
    }, (error) => console.warn('Extracurriculars snapshot notice:', error.message));

    // 4. Ambassador Types listener
    const unsubAmbassadorTypes = onSnapshot(collection(db, 'ambassadorTypes'), (snap) => {
      const items: AmbassadorType[] = [];
      snap.forEach((doc) => items.push(doc.data() as AmbassadorType));
      setAmbassadorTypes(items);
    }, (error) => console.warn('AmbassadorTypes snapshot notice:', error.message));

    // 5. Student Interests listener
    const unsubInterests = onSnapshot(collection(db, 'studentInterests'), (snap) => {
      const items: StudentInterest[] = [];
      snap.forEach((doc) => items.push(doc.data() as StudentInterest));
      setStudentInterests(items);
    }, (error) => console.warn('StudentInterests snapshot notice:', error.message));

    // 6. Teacher Observations listener
    const unsubObservations = onSnapshot(collection(db, 'teacherObservations'), (snap) => {
      const items: TeacherObservation[] = [];
      snap.forEach((doc) => items.push(doc.data() as TeacherObservation));
      setTeacherObservations(items);
    }, (error) => console.warn('TeacherObservations snapshot notice:', error.message));

    // 7. Ambassador Members listener
    const unsubAmbassadors = onSnapshot(collection(db, 'ambassadorMembers'), (snap) => {
      const items: AmbassadorMember[] = [];
      snap.forEach((doc) => items.push(doc.data() as AmbassadorMember));
      setAmbassadorMembers(items);
    }, (error) => console.warn('AmbassadorMembers snapshot notice:', error.message));

    // 8. Ambassador Programs listener
    const unsubAmbassadorPrograms = onSnapshot(collection(db, 'ambassadorPrograms'), (snap) => {
      const items: AmbassadorProgram[] = [];
      snap.forEach((doc) => items.push(doc.data() as AmbassadorProgram));
      setAmbassadorPrograms(items);
    }, (error) => console.warn('AmbassadorPrograms snapshot notice:', error.message));

    // 9. Extracurricular Members listener
    const unsubEkskulMembers = onSnapshot(collection(db, 'extracurricularMembers'), (snap) => {
      const items: ExtracurricularMember[] = [];
      snap.forEach((doc) => items.push(doc.data() as ExtracurricularMember));
      setExtracurricularMembers(items);
    }, (error) => console.warn('ExtracurricularMembers snapshot notice:', error.message));

    // 10. Portfolios listener
    const unsubPortfolios = onSnapshot(collection(db, 'portfolios'), (snap) => {
      const items: Portfolio[] = [];
      snap.forEach((doc) => items.push(doc.data() as Portfolio));
      setPortfolios(items);
    }, (error) => console.warn('Portfolios snapshot notice:', error.message));

    // 11. Achievements listener
    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snap) => {
      const items: Achievement[] = [];
      snap.forEach((doc) => items.push(doc.data() as Achievement));
      setAchievements(items);
    }, (error) => console.warn('Achievements snapshot notice:', error.message));

    // 12. Activities listener
    const unsubActivities = onSnapshot(collection(db, 'activities'), (snap) => {
      const items: Activity[] = [];
      snap.forEach((doc) => items.push(doc.data() as Activity));
      setActivities(items);
    }, (error) => console.warn('Activities snapshot notice:', error.message));

    // 13. Attendance Sessions listener
    const unsubAttendance = onSnapshot(collection(db, 'attendanceSessions'), (snap) => {
      const items: AttendanceSession[] = [];
      snap.forEach((doc) => items.push(doc.data() as AttendanceSession));
      setAttendanceSessions(items);
    }, (error) => console.warn('AttendanceSessions snapshot notice:', error.message));

    // 14. Announcements listener
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
      const items: Announcement[] = [];
      snap.forEach((doc) => items.push(doc.data() as Announcement));
      setAnnouncements(items);
    }, (error) => console.warn('Announcements snapshot notice:', error.message));

    // 15. Audit Logs listener
    const unsubLogs = onSnapshot(collection(db, 'auditLogs'), (snap) => {
      const items: AuditLog[] = [];
      snap.forEach((doc) => items.push(doc.data() as AuditLog));
      setAuditLogs(items);
    }, (error) => console.warn('AuditLogs snapshot notice:', error.message));

    return () => {
      unsubSchool();
      unsubStudents();
      unsubTeachers();
      unsubEkskulMaster();
      unsubAmbassadorTypes();
      unsubInterests();
      unsubObservations();
      unsubAmbassadors();
      unsubAmbassadorPrograms();
      unsubEkskulMembers();
      unsubPortfolios();
      unsubAchievements();
      unsubActivities();
      unsubAttendance();
      unsubAnnouncements();
      unsubLogs();
    };
  }, []);

  const testCloudConnection = async (): Promise<boolean> => {
    return await testConnection();
  };

  // Helper for audit logging
  const logAction = (action: AuditActionType, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'system',
      userName: currentUser?.displayName || 'Pengguna System',
      userRole: currentUser?.role || 'super_admin',
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'auditLogs', newLog.id), sanitizeForFirestore(newLog)).catch((err) => {
        console.info('Audit log firestore notice:', err.message);
      });
    }
  };

  // Student handlers
  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> => {
    const newStudent: Student = {
      ...studentData,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };
    setStudents((prev) => [newStudent, ...prev]);
    logAction('CREATE', 'Student', newStudent.id, `Menambahkan murid baru: ${newStudent.fullName} (${newStudent.classId})`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'students', newStudent.id), sanitizeForFirestore(newStudent));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `students/${newStudent.id}`);
      }
    }

    return newStudent;
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const cleanUpdates = sanitizeForFirestore({ ...updates, updatedAt: new Date().toISOString() });
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...cleanUpdates } : s))
    );
    logAction('UPDATE', 'Student', id, `Memperbarui data murid ID ${id}`);

    // Synchronize studentName & classId across related collections
    const subUpdates: { studentName?: string; classId?: string; studentNis?: string } = {};
    if (updates.fullName) subUpdates.studentName = updates.fullName;
    if (updates.classId) subUpdates.classId = updates.classId;
    if (updates.nis || updates.nisn) subUpdates.studentNis = updates.nis || updates.nisn;

    if (Object.keys(subUpdates).length > 0) {
      setExtracurricularMembers((prev) =>
        prev.map((m) => (m.studentId === id ? { ...m, ...subUpdates } : m))
      );
      setAmbassadorMembers((prev) =>
        prev.map((m) => (m.studentId === id ? { ...m, ...subUpdates } : m))
      );
      setStudentInterests((prev) =>
        prev.map((i) => (i.studentId === id ? { ...i, ...subUpdates } : i))
      );
      setTeacherObservations((prev) =>
        prev.map((o) => (o.studentId === id ? { ...o, ...subUpdates } : o))
      );
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'students', id), cleanUpdates, { merge: true });

        if (Object.keys(subUpdates).length > 0) {
          extracurricularMembers.filter((m) => m.studentId === id).forEach((m) => {
            setDoc(doc(db, 'extracurricularMembers', m.id), sanitizeForFirestore(subUpdates), { merge: true }).catch(() => {});
          });
          ambassadorMembers.filter((m) => m.studentId === id).forEach((m) => {
            setDoc(doc(db, 'ambassadorMembers', m.id), sanitizeForFirestore(subUpdates), { merge: true }).catch(() => {});
          });
          studentInterests.filter((i) => i.studentId === id).forEach((i) => {
            setDoc(doc(db, 'studentInterests', i.id), sanitizeForFirestore(subUpdates), { merge: true }).catch(() => {});
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${id}`);
      }
    }
  };

  const deleteStudent = async (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setStudentInterests((prev) => prev.filter((i) => i.studentId !== id));
    setAmbassadorMembers((prev) => prev.filter((m) => m.studentId !== id));
    setExtracurricularMembers((prev) => prev.filter((m) => m.studentId !== id));
    logAction('DELETE', 'Student', id, `Menghapus data murid: ${student?.fullName || id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
      }
    }
  };

  const deleteAllStudents = async () => {
    const studentIds = students.map((s) => s.id);
    const count = students.length;
    setStudents([]);
    setStudentInterests((prev) => prev.filter((i) => !studentIds.includes(i.studentId)));
    setAmbassadorMembers((prev) => prev.filter((m) => !studentIds.includes(m.studentId)));
    setExtracurricularMembers((prev) => prev.filter((m) => !studentIds.includes(m.studentId)));
    logAction('DELETE', 'Student', 'all', `Menghapus seluruh (${count}) data murid`);

    if (isFirebaseConfigured && db) {
      for (const id of studentIds) {
        try {
          await deleteDoc(doc(db, 'students', id));
        } catch (err) {
          console.warn('Firestore delete student error:', err);
        }
      }
    }
  };

  const importStudentsCsv = async (importedList: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> => {
    const newItems: Student[] = importedList.map((item, idx) => ({
      ...item,
      id: `std_import_${Date.now()}_${idx}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    }));
    setStudents((prev) => [...newItems, ...prev]);
    logAction('IMPORT', 'Student', 'batch', `Mengimpor ${newItems.length} data murid via CSV`);

    if (isFirebaseConfigured && db) {
      for (const item of newItems) {
        try {
          await setDoc(doc(db, 'students', item.id), sanitizeForFirestore(item));
        } catch (err) {
          console.warn('Import student to firestore notice:', err);
        }
      }
    }
    return newItems.length;
  };

  // Teacher Actions
  const addTeacher = async (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<Teacher> => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `tch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    logAction('CREATE', 'Teacher', newTeacher.id, `Menambahkan data guru baru: ${newTeacher.fullName} (${newTeacher.position})`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teachers', newTeacher.id), sanitizeForFirestore(newTeacher));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `teachers/${newTeacher.id}`);
      }
    }

    return newTeacher;
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    const cleanUpdates = sanitizeForFirestore({ ...updates, updatedAt: new Date().toISOString() });
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...cleanUpdates } : t))
    );
    logAction('UPDATE', 'Teacher', id, `Memperbarui data guru ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teachers', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `teachers/${id}`);
      }
    }
  };

  const deleteTeacher = async (id: string) => {
    const teacher = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    logAction('DELETE', 'Teacher', id, `Menghapus data guru: ${teacher?.fullName || id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'teachers', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `teachers/${id}`);
      }
    }
  };

  const deleteAllTeachers = async () => {
    const teacherIds = teachers.map((t) => t.id);
    const count = teachers.length;
    setTeachers([]);
    logAction('DELETE', 'Teacher', 'all', `Menghapus seluruh (${count}) data guru`);

    if (isFirebaseConfigured && db) {
      for (const id of teacherIds) {
        try {
          await deleteDoc(doc(db, 'teachers', id));
        } catch (err) {
          console.warn('Firestore delete teacher error:', err);
        }
      }
    }
  };

  const importTeachersCsv = async (importedList: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> => {
    const newItems: Teacher[] = importedList.map((item, idx) => ({
      ...item,
      id: `tch_import_${Date.now()}_${idx}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    }));
    setTeachers((prev) => [...newItems, ...prev]);
    logAction('IMPORT', 'Teacher', 'batch', `Mengimpor ${newItems.length} data guru via CSV`);

    if (isFirebaseConfigured && db) {
      for (const item of newItems) {
        try {
          await setDoc(doc(db, 'teachers', item.id), sanitizeForFirestore(item));
        } catch (err) {
          console.warn('Import teacher to firestore notice:', err);
        }
      }
    }
    return newItems.length;
  };

  // Talent & Interest Handlers
  const submitInterest = async (data: Omit<StudentInterest, 'id' | 'submittedAt'>) => {
    const newInterest: StudentInterest = {
      ...data,
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      submittedAt: new Date().toISOString()
    };
    setStudentInterests((prev) => [
      newInterest,
      ...prev.filter((i) => !(i.studentId === data.studentId && i.subcategory === data.subcategory))
    ]);
    logAction('CREATE', 'StudentInterest', newInterest.id, `Eksplorasi minat murid: ${data.studentName} - ${data.subcategory}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'studentInterests', newInterest.id), sanitizeForFirestore(newInterest));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `studentInterests/${newInterest.id}`);
      }
    }
  };

  const deleteInterest = async (id: string) => {
    setStudentInterests((prev) => prev.filter((i) => i.id !== id));
    logAction('DELETE', 'StudentInterest', id, `Menghapus catatan minat ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'studentInterests', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `studentInterests/${id}`);
      }
    }
  };

  const addObservation = async (data: Omit<TeacherObservation, 'id' | 'createdAt'>) => {
    const newObs: TeacherObservation = {
      ...data,
      id: `obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setTeacherObservations((prev) => [newObs, ...prev]);
    logAction('CREATE', 'TeacherObservation', newObs.id, `Catatan pengamatan guru untuk ${data.studentName}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teacherObservations', newObs.id), sanitizeForFirestore(newObs));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `teacherObservations/${newObs.id}`);
      }
    }
  };

  const updateObservation = async (id: string, updates: Partial<TeacherObservation>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setTeacherObservations((prev) => prev.map((o) => (o.id === id ? { ...o, ...cleanUpdates } : o)));
    logAction('UPDATE', 'TeacherObservation', id, `Memperbarui pengamatan ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teacherObservations', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `teacherObservations/${id}`);
      }
    }
  };

  // Ambassador Handlers
  const addAmbassadorType = async (data: Omit<AmbassadorType, 'id'>) => {
    const newType: AmbassadorType = {
      ...data,
      id: `duta_${Date.now()}`,
      isCustom: true
    };
    setAmbassadorTypes((prev) => [...prev, newType]);
    logAction('CREATE', 'AmbassadorType', newType.id, `Menambahkan jenis Duta baru: ${newType.name}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorTypes', newType.id), sanitizeForFirestore(newType));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `ambassadorTypes/${newType.id}`);
      }
    }
  };

  const updateAmbassadorType = async (id: string, updates: Partial<AmbassadorType>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setAmbassadorTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...cleanUpdates } : t)));
    logAction('UPDATE', 'AmbassadorType', id, `Memperbarui profil jenis duta ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorTypes', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `ambassadorTypes/${id}`);
      }
    }
  };

  const deleteAmbassadorType = async (id: string) => {
    const amb = ambassadorTypes.find((t) => t.id === id);
    setAmbassadorTypes((prev) => prev.filter((t) => t.id !== id));
    setAmbassadorMembers((prev) => prev.filter((m) => m.ambassadorTypeId !== id));
    setAmbassadorPrograms((prev) => prev.filter((p) => p.ambassadorTypeId !== id));
    logAction('DELETE', 'AmbassadorType', id, `Menghapus bidang Duta: ${amb?.name || id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'ambassadorTypes', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `ambassadorTypes/${id}`);
      }
    }
  };

  const addAmbassadorMember = async (data: Omit<AmbassadorMember, 'id' | 'createdAt'>) => {
    // ATURAN DUTA SEKOLAH: 1 keanggotaan Duta aktif per murid dalam 1 periode
    const existingActive = ambassadorMembers.find(
      (m) => m.studentId === data.studentId && m.status === 'aktif' && (m.assignedYear === data.assignedYear || !data.assignedYear)
    );
    if (existingActive) {
      throw new Error(
        `Validasi Aturan Duta: Murid "${data.studentName}" telah memiliki keanggotaan aktif sebagai "${existingActive.ambassadorTypeName}" (${existingActive.roleTitle || 'Anggota'}) pada periode ${existingActive.assignedYear}. Setiap murid hanya boleh memiliki 1 keanggotaan Duta aktif dalam satu periode.`
      );
    }

    const newMember: AmbassadorMember = {
      ...data,
      id: `amb_mem_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAmbassadorMembers((prev) => [newMember, ...prev]);
    logAction('ASSIGN', 'AmbassadorMember', newMember.id, `Menugaskan ${data.studentName} sebagai ${data.ambassadorTypeName}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorMembers', newMember.id), sanitizeForFirestore(newMember));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `ambassadorMembers/${newMember.id}`);
      }
    }
  };

  const updateAmbassadorMember = async (id: string, updates: Partial<AmbassadorMember>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setAmbassadorMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...cleanUpdates } : m)));
    logAction('UPDATE', 'AmbassadorMember', id, `Memperbarui status anggota duta ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorMembers', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `ambassadorMembers/${id}`);
      }
    }
  };

  const removeAmbassadorMember = async (id: string) => {
    setAmbassadorMembers((prev) => prev.filter((m) => m.id !== id));
    logAction('DELETE', 'AmbassadorMember', id, `Menonaktifkan keanggotaan duta ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'ambassadorMembers', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `ambassadorMembers/${id}`);
      }
    }
  };

  const addAmbassadorProgram = async (data: Omit<AmbassadorProgram, 'id' | 'createdAt'>) => {
    const newProg: AmbassadorProgram = {
      ...data,
      id: `prog_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAmbassadorPrograms((prev) => [newProg, ...prev]);
    logAction('CREATE', 'AmbassadorProgram', newProg.id, `Membuat program kerja Duta: ${data.title}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorPrograms', newProg.id), sanitizeForFirestore(newProg));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `ambassadorPrograms/${newProg.id}`);
      }
    }
  };

  const updateAmbassadorProgram = async (id: string, updates: Partial<AmbassadorProgram>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setAmbassadorPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...cleanUpdates } : p)));
    logAction('UPDATE', 'AmbassadorProgram', id, `Memperbarui program kerja ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorPrograms', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `ambassadorPrograms/${id}`);
      }
    }
  };

  const deleteAmbassadorProgram = async (id: string) => {
    setAmbassadorPrograms((prev) => prev.filter((p) => p.id !== id));
    logAction('DELETE', 'AmbassadorProgram', id, `Menghapus program kerja ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'ambassadorPrograms', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `ambassadorPrograms/${id}`);
      }
    }
  };

  // Extracurricular Handlers
  const addExtracurricular = async (data: Omit<Extracurricular, 'id' | 'createdAt'>) => {
    const newExtra: Extracurricular = {
      ...data,
      id: `ekskul_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExtracurriculars((prev) => [...prev, newExtra]);
    logAction('CREATE', 'Extracurricular', newExtra.id, `Menambahkan ekstrakurikuler baru: ${data.name}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'extracurriculars', newExtra.id), sanitizeForFirestore(newExtra));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `extracurriculars/${newExtra.id}`);
      }
    }
  };

  const updateExtracurricular = async (id: string, updates: Partial<Extracurricular>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setExtracurriculars((prev) => prev.map((e) => (e.id === id ? { ...e, ...cleanUpdates } : e)));
    logAction('UPDATE', 'Extracurricular', id, `Memperbarui ekstrakurikuler ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'extracurriculars', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `extracurriculars/${id}`);
      }
    }
  };

  const deleteExtracurricular = async (id: string) => {
    setExtracurriculars((prev) => prev.filter((e) => e.id !== id));
    logAction('DELETE', 'Extracurricular', id, `Menghapus ekstrakurikuler ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'extracurriculars', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `extracurriculars/${id}`);
      }
    }
  };

  const registerExtracurricularMember = async (data: Omit<ExtracurricularMember, 'id' | 'createdAt'>) => {
    // Check if already active
    const already = extracurricularMembers.find(
      (m) => m.studentId === data.studentId && m.extracurricularId === data.extracurricularId && m.status === 'aktif'
    );
    if (already) {
      throw new Error(`Murid "${data.studentName}" sudah terdaftar aktif di ekstrakurikuler ${data.extracurricularName}.`);
    }

    const gradeLevel = extractGradeLevel(data.classId);
    const isPramuka = isPramukaEkskul(data.extracurricularId) || isPramukaEkskul(data.extracurricularName);
    const isTik = isTikEkskul(data.extracurricularId) || isTikEkskul(data.extracurricularName);
    const isCompulsory =
      (isPramuka && gradeLevel >= 1 && gradeLevel <= 5) ||
      (isTik && gradeLevel >= 4 && gradeLevel <= 6);

    const maxElective = schoolProfile.maxElectiveExtracurricular || 2;

    if (!isCompulsory && !data.isException) {
      const activeElectives = extracurricularMembers.filter((m) => {
        if (m.studentId !== data.studentId || m.status !== 'aktif') return false;
        const mP = isPramukaEkskul(m.extracurricularId) || isPramukaEkskul(m.extracurricularName);
        const mT = isTikEkskul(m.extracurricularId) || isTikEkskul(m.extracurricularName);
        const mComp = (mP && gradeLevel >= 1 && gradeLevel <= 5) || (mT && gradeLevel >= 4 && gradeLevel <= 6);
        return !mComp;
      });

      if (activeElectives.length >= maxElective) {
        throw new Error(
          `Validasi Aturan Ekstrakurikuler: Pendaftaran melebihi batas maksimal ${maxElective} ekstrakurikuler pilihan. Berikan dispensasi/pengecualian dengan alasan tertulis jika disetujui Admin.`
        );
      }
    }

    const newMember: ExtracurricularMember = {
      ...data,
      isCompulsory,
      academicYear: data.academicYear || schoolProfile.currentAcademicYear,
      id: `ext_mem_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExtracurricularMembers((prev) => [newMember, ...prev]);
    logAction(
      'ASSIGN',
      'ExtracurricularMember',
      newMember.id,
      `Mendaftarkan ${data.studentName} ke ${data.extracurricularName}${data.isException ? ' (Dispensasi: ' + data.exceptionReason + ')' : ''}`
    );

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'extracurricularMembers', newMember.id), sanitizeForFirestore(newMember));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `extracurricularMembers/${newMember.id}`);
      }
    }
  };

  const registerBatchExtracurricularMembers = async (
    membersData: Omit<ExtracurricularMember, 'id' | 'createdAt'>[]
  ): Promise<{ registeredCount: number; skippedCount: number; errors: string[] }> => {
    let registeredCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const newMembers: ExtracurricularMember[] = [];

    const currentAcademicYear = schoolProfile.currentAcademicYear;

    for (let i = 0; i < membersData.length; i++) {
      const data = membersData[i];
      // Check if already active
      const already = extracurricularMembers.some(
        (m) => m.studentId === data.studentId && m.extracurricularId === data.extracurricularId && m.status === 'aktif'
      );
      if (already) {
        skippedCount++;
        continue;
      }

      const gradeLevel = extractGradeLevel(data.classId);
      const isPramuka = isPramukaEkskul(data.extracurricularId) || isPramukaEkskul(data.extracurricularName);
      const isTik = isTikEkskul(data.extracurricularId) || isTikEkskul(data.extracurricularName);
      const isCompulsory =
        (isPramuka && gradeLevel >= 1 && gradeLevel <= 5) ||
        (isTik && gradeLevel >= 4 && gradeLevel <= 6);

      const uniqueId = `ext_mem_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
      const memberObj: ExtracurricularMember = {
        ...data,
        id: uniqueId,
        isCompulsory,
        academicYear: data.academicYear || currentAcademicYear,
        createdAt: new Date().toISOString()
      };

      newMembers.push(memberObj);
      registeredCount++;
    }

    if (newMembers.length > 0) {
      setExtracurricularMembers((prev) => [...newMembers, ...prev]);
      logAction(
        'ASSIGN',
        'ExtracurricularMember',
        newMembers[0].id,
        `Mendaftarkan masal ${registeredCount} murid ke ${newMembers[0].extracurricularName}`
      );

      if (isFirebaseConfigured && db) {
        try {
          const promises = newMembers.map((m) =>
            setDoc(doc(db, 'extracurricularMembers', m.id), sanitizeForFirestore(m))
          );
          await Promise.all(promises);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `extracurricularMembers/batch`);
        }
      }
    }

    return { registeredCount, skippedCount, errors };
  };

  const updateExtracurricularMember = async (id: string, updates: Partial<ExtracurricularMember>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setExtracurricularMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...cleanUpdates } : m)));
    logAction('UPDATE', 'ExtracurricularMember', id, `Memperbarui data anggota ekskul ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'extracurricularMembers', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `extracurricularMembers/${id}`);
      }
    }
  };

  const removeExtracurricularMember = async (id: string) => {
    setExtracurricularMembers((prev) => prev.filter((m) => m.id !== id));
    logAction('DELETE', 'ExtracurricularMember', id, `Menghapus anggota ekskul ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'extracurricularMembers', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `extracurricularMembers/${id}`);
      }
    }
  };

  // Activity & Attendance Handlers
  const addActivity = async (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> => {
    const newAct: Activity = {
      ...data,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setActivities((prev) => [newAct, ...prev]);
    logAction('CREATE', 'Activity', newAct.id, `Membuat agenda kegiatan: ${data.title}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'activities', newAct.id), sanitizeForFirestore(newAct));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `activities/${newAct.id}`);
      }
    }
    return newAct;
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    const cleanUpdates = sanitizeForFirestore({ ...updates, updatedAt: new Date().toISOString() });
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...cleanUpdates } : a))
    );
    logAction('UPDATE', 'Activity', id, `Memperbarui agenda kegiatan ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'activities', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `activities/${id}`);
      }
    }
  };

  const deleteActivity = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    logAction('DELETE', 'Activity', id, `Menghapus kegiatan ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'activities', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `activities/${id}`);
      }
    }
  };

  const saveAttendanceSession = async (data: Omit<AttendanceSession, 'id' | 'recordedAt'>) => {
    const newSession: AttendanceSession = {
      ...data,
      id: `att_${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    setAttendanceSessions((prev) => [newSession, ...prev]);
    logAction('RECORD', 'AttendanceSession', newSession.id, `Mencatat presensi untuk: ${data.referenceName} (${data.date})`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'attendanceSessions', newSession.id), sanitizeForFirestore(newSession));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `attendanceSessions/${newSession.id}`);
      }
    }
  };

  // Portfolio & Achievement Handlers
  const addPortfolio = async (data: Omit<Portfolio, 'id' | 'createdAt'>): Promise<Portfolio> => {
    const newPort: Portfolio = {
      ...data,
      id: `port_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPortfolios((prev) => [newPort, ...prev]);
    logAction('CREATE', 'Portfolio', newPort.id, `Menambahkan portofolio karya murid: ${data.title}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'portfolios', newPort.id), sanitizeForFirestore(newPort));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `portfolios/${newPort.id}`);
      }
    }
    return newPort;
  };

  const updatePortfolio = async (id: string, updates: Partial<Portfolio>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setPortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, ...cleanUpdates } : p)));
    logAction('UPDATE', 'Portfolio', id, `Memperbarui portofolio ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'portfolios', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `portfolios/${id}`);
      }
    }
  };

  const verifyPortfolio = async (id: string, verifiedBy: string) => {
    const updates = sanitizeForFirestore({ isVerified: true, verifiedBy, verifiedAt: new Date().toISOString() });
    setPortfolios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    logAction('VERIFY', 'Portfolio', id, `Memverifikasi portofolio karya ID ${id} oleh ${verifiedBy}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'portfolios', id), updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `portfolios/${id}`);
      }
    }
  };

  const deletePortfolio = async (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
    logAction('DELETE', 'Portfolio', id, `Menghapus portofolio ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'portfolios', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `portfolios/${id}`);
      }
    }
  };

  const addAchievement = async (data: Omit<Achievement, 'id' | 'createdAt'>) => {
    const newAch: Achievement = {
      ...data,
      id: `ach_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAchievements((prev) => [newAch, ...prev]);
    logAction('CREATE', 'Achievement', newAch.id, `Mencatat piagam prestasi: ${data.title} (${data.rank})`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'achievements', newAch.id), sanitizeForFirestore(newAch));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `achievements/${newAch.id}`);
      }
    }
  };

  const updateAchievement = async (id: string, updates: Partial<Achievement>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...cleanUpdates } : a)));
    logAction('UPDATE', 'Achievement', id, `Memperbarui prestasi ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'achievements', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `achievements/${id}`);
      }
    }
  };

  const deleteAchievement = async (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    logAction('DELETE', 'Achievement', id, `Menghapus prestasi ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'achievements', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `achievements/${id}`);
      }
    }
  };

  // Announcements & Notifications
  const addAnnouncement = async (data: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...data,
      id: `ann_${Date.now()}`
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    logAction('CREATE', 'Announcement', newAnn.id, `Menerbitkan pengumuman: ${data.title}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'announcements', newAnn.id), sanitizeForFirestore(newAnn));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `announcements/${newAnn.id}`);
      }
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...cleanUpdates } : a)));
    logAction('UPDATE', 'Announcement', id, `Memperbarui pengumuman ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'announcements', id), cleanUpdates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `announcements/${id}`);
      }
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    logAction('DELETE', 'Announcement', id, `Menghapus pengumuman ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const updateSchoolProfile = async (updates: Partial<SchoolProfile>) => {
    const cleanUpdates = sanitizeForFirestore(updates);
    setSchoolProfile((prev) => ({ ...prev, ...cleanUpdates }));
    logAction('UPDATE', 'SchoolProfile', 'main', `Memperbarui profil instansi sekolah`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'schoolProfile', 'main'), sanitizeForFirestore({ ...schoolProfile, ...cleanUpdates }), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'schoolProfile/main');
      }
    }
  };

  // Demo Controls
  const resetToDemoData = () => {
    setSchoolProfile(initialSchoolProfile);
    setAmbassadorTypes(initialAmbassadorTypes);
    setExtracurriculars(initialExtracurriculars);
    setStudents(initialStudents);
    setTeachers(initialTeachers);
    setStudentInterests(initialStudentInterests);
    setTeacherObservations(initialTeacherObservations);
    setAmbassadorMembers(initialAmbassadorMembers);
    setAmbassadorPrograms(initialAmbassadorPrograms);
    setExtracurricularMembers(initialExtracurricularMembers);
    setActivities(initialActivities);
    setAttendanceSessions(initialAttendanceSessions);
    setPortfolios(initialPortfolios);
    setAchievements(initialAchievements);
    setAnnouncements(initialAnnouncements);
    setAuditLogs(initialAuditLogs);
    setIsDemoMode(true);
    logAction('SYSTEM', 'Database', 'all', 'Mereset database ke data demonstrasi standar UPT SDN Karanganyar');
  };

  const clearAllDemoData = async () => {
    setStudents([]);
    setTeachers([]);
    setStudentInterests([]);
    setTeacherObservations([]);
    setAmbassadorMembers([]);
    setAmbassadorPrograms([]);
    setExtracurricularMembers([]);
    setActivities([]);
    setAttendanceSessions([]);
    setPortfolios([]);
    setAchievements([]);
    setAnnouncements([]);
    setIsDemoMode(false);

    if (isFirebaseConfigured && db) {
      try {
        const collectionsToClear = [
          'students',
          'teachers',
          'studentInterests',
          'teacherObservations',
          'ambassadorMembers',
          'ambassadorPrograms',
          'extracurricularMembers',
          'activities',
          'attendanceSessions',
          'portfolios',
          'achievements',
          'announcements'
        ];
        for (const colName of collectionsToClear) {
          const snap = await getDocs(collection(db, colName));
          for (const d of snap.docs) {
            await deleteDoc(doc(db, colName, d.id));
          }
        }
      } catch (err: any) {
        console.warn('Clear firestore notice:', err.message);
      }
    }
    logAction('SYSTEM', 'Database', 'all', 'Mengosongkan seluruh data dari database lokal dan Firestore');
  };

  const purgeOnlyDummyData = async () => {
    const demoStudentIds = new Set(initialStudents.map((s) => s.id));
    const demoTeacherIds = new Set(initialTeachers.map((t) => t.id));
    const demoEkskulMemberIds = new Set(initialExtracurricularMembers.map((m) => m.id));
    const demoAmbassadorMemberIds = new Set(initialAmbassadorMembers.map((m) => m.id));
    const demoAmbassadorProgIds = new Set(initialAmbassadorPrograms.map((p) => p.id));
    const demoPortIds = new Set(initialPortfolios.map((p) => p.id));
    const demoAchIds = new Set(initialAchievements.map((a) => a.id));
    const demoActIds = new Set(initialActivities.map((a) => a.id));
    const demoAttIds = new Set(initialAttendanceSessions.map((s) => s.id));
    const demoObsIds = new Set(initialTeacherObservations.map((o) => o.id));
    const demoIntIds = new Set(initialStudentInterests.map((i) => i.id));
    const demoAnnIds = new Set(initialAnnouncements.map((a) => a.id));

    setStudents((prev) => prev.filter((s) => !demoStudentIds.has(s.id) && !s.isDemo));
    setTeachers((prev) => prev.filter((t) => !demoTeacherIds.has(t.id) && !t.isDemo));
    setExtracurricularMembers((prev) => prev.filter((m) => !demoEkskulMemberIds.has(m.id)));
    setAmbassadorMembers((prev) => prev.filter((m) => !demoAmbassadorMemberIds.has(m.id)));
    setAmbassadorPrograms((prev) => prev.filter((p) => !demoAmbassadorProgIds.has(p.id)));
    setPortfolios((prev) => prev.filter((p) => !demoPortIds.has(p.id)));
    setAchievements((prev) => prev.filter((a) => !demoAchIds.has(a.id)));
    setActivities((prev) => prev.filter((a) => !demoActIds.has(a.id)));
    setAttendanceSessions((prev) => prev.filter((s) => !demoAttIds.has(s.id)));
    setTeacherObservations((prev) => prev.filter((o) => !demoObsIds.has(o.id)));
    setStudentInterests((prev) => prev.filter((i) => !demoIntIds.has(i.id)));
    setAnnouncements((prev) => prev.filter((a) => !demoAnnIds.has(a.id)));

    if (isFirebaseConfigured && db) {
      try {
        for (const id of demoStudentIds) await deleteDoc(doc(db, 'students', id));
        for (const id of demoTeacherIds) await deleteDoc(doc(db, 'teachers', id));
        for (const id of demoEkskulMemberIds) await deleteDoc(doc(db, 'extracurricularMembers', id));
        for (const id of demoAmbassadorMemberIds) await deleteDoc(doc(db, 'ambassadorMembers', id));
        for (const id of demoAmbassadorProgIds) await deleteDoc(doc(db, 'ambassadorPrograms', id));
        for (const id of demoPortIds) await deleteDoc(doc(db, 'portfolios', id));
        for (const id of demoAchIds) await deleteDoc(doc(db, 'achievements', id));
        for (const id of demoActIds) await deleteDoc(doc(db, 'activities', id));
        for (const id of demoAttIds) await deleteDoc(doc(db, 'attendanceSessions', id));
        for (const id of demoObsIds) await deleteDoc(doc(db, 'teacherObservations', id));
        for (const id of demoIntIds) await deleteDoc(doc(db, 'studentInterests', id));
        for (const id of demoAnnIds) await deleteDoc(doc(db, 'announcements', id));
      } catch (err: any) {
        console.warn('Purge firestore dummy data notice:', err.message);
      }
    }
    setIsDemoMode(false);
    logAction('SYSTEM', 'Database', 'all', 'Membersihkan data dummy bawaan dari database');
  };

  const exportAllDataAsJson = (): string => {
    const fullState = {
      exportDate: new Date().toISOString(),
      schoolProfile,
      students,
      teachers,
      studentInterests,
      teacherObservations,
      ambassadorTypes,
      ambassadorMembers,
      ambassadorPrograms,
      extracurriculars,
      extracurricularMembers,
      activities,
      attendanceSessions,
      portfolios,
      achievements,
      announcements,
      auditLogs
    };
    return JSON.stringify(fullState, null, 2);
  };

  const importAllDataFromJson = async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.schoolProfile) await updateSchoolProfile(parsed.schoolProfile);
      if (Array.isArray(parsed.students)) {
        setStudents(parsed.students);
        if (isFirebaseConfigured && db) {
          for (const s of parsed.students) await setDoc(doc(db, 'students', s.id), sanitizeForFirestore(s));
        }
      }
      if (Array.isArray(parsed.teachers)) {
        setTeachers(parsed.teachers);
        if (isFirebaseConfigured && db) {
          for (const t of parsed.teachers) await setDoc(doc(db, 'teachers', t.id), sanitizeForFirestore(t));
        }
      }
      if (Array.isArray(parsed.extracurriculars)) {
        setExtracurriculars(parsed.extracurriculars);
        if (isFirebaseConfigured && db) {
          for (const e of parsed.extracurriculars) await setDoc(doc(db, 'extracurriculars', e.id), sanitizeForFirestore(e));
        }
      }
      if (Array.isArray(parsed.studentInterests)) setStudentInterests(parsed.studentInterests);
      if (Array.isArray(parsed.teacherObservations)) setTeacherObservations(parsed.teacherObservations);
      if (Array.isArray(parsed.ambassadorMembers)) setAmbassadorMembers(parsed.ambassadorMembers);
      if (Array.isArray(parsed.ambassadorPrograms)) setAmbassadorPrograms(parsed.ambassadorPrograms);
      if (Array.isArray(parsed.extracurricularMembers)) setExtracurricularMembers(parsed.extracurricularMembers);
      if (Array.isArray(parsed.activities)) setActivities(parsed.activities);
      if (Array.isArray(parsed.attendanceSessions)) setAttendanceSessions(parsed.attendanceSessions);
      if (Array.isArray(parsed.portfolios)) setPortfolios(parsed.portfolios);
      if (Array.isArray(parsed.achievements)) setAchievements(parsed.achievements);
      if (Array.isArray(parsed.announcements)) setAnnouncements(parsed.announcements);
      logAction('IMPORT', 'Database', 'all', 'Memulihkan cadangan data dari file JSON');
      return true;
    } catch (err: any) {
      throw new Error('Format berkas cadangan JSON tidak valid: ' + err.message);
    }
  };

  return (
    <DataContext.Provider
      value={{
        schoolProfile,
        updateSchoolProfile,
        classes,
        talentCategories,
        ambassadorTypes,
        extracurriculars,
        students,
        teachers,
        studentInterests,
        teacherObservations,
        ambassadorMembers,
        ambassadorPrograms,
        extracurricularMembers,
        activities,
        attendanceSessions,
        portfolios,
        achievements,
        announcements,
        notifications,
        auditLogs,
        isDemoMode,
        isCloudConnected,
        testCloudConnection,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteAllStudents,
        importStudentsCsv,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        deleteAllTeachers,
        importTeachersCsv,
        submitInterest,
        deleteInterest,
        addObservation,
        updateObservation,
        addAmbassadorType,
        updateAmbassadorType,
        deleteAmbassadorType,
        addAmbassadorMember,
        updateAmbassadorMember,
        removeAmbassadorMember,
        addAmbassadorProgram,
        updateAmbassadorProgram,
        deleteAmbassadorProgram,
        addExtracurricular,
        updateExtracurricular,
        deleteExtracurricular,
        registerExtracurricularMember,
        registerBatchExtracurricularMembers,
        updateExtracurricularMember,
        removeExtracurricularMember,
        addActivity,
        updateActivity,
        deleteActivity,
        saveAttendanceSession,
        addPortfolio,
        updatePortfolio,
        verifyPortfolio,
        deletePortfolio,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        markNotificationAsRead,
        resetToDemoData,
        clearAllDemoData,
        purgeOnlyDummyData,
        exportAllDataAsJson,
        importAllDataFromJson,
        seedInitialDataToFirestore
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
