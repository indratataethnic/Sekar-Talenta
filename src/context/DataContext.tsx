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
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType, testConnection } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';

interface DataContextType {
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (updates: Partial<SchoolProfile>) => void;
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

  // Student Actions
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteAllStudents: () => Promise<void>;
  importStudentsCsv: (importedStudents: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<number>;

  // Teacher Actions
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Teacher>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  deleteAllTeachers: () => Promise<void>;
  importTeachersCsv: (importedTeachers: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<number>;

  // Talent & Interest Actions
  submitInterest: (interestData: Omit<StudentInterest, 'id' | 'submittedAt'>) => Promise<void>;
  deleteInterest: (id: string) => Promise<void>;
  addObservation: (observationData: Omit<TeacherObservation, 'id' | 'createdAt'>) => Promise<void>;
  updateObservation: (id: string, updates: Partial<TeacherObservation>) => Promise<void>;

  // Ambassador Actions
  addAmbassadorType: (typeData: Omit<AmbassadorType, 'id'>) => Promise<void>;
  updateAmbassadorType: (id: string, updates: Partial<AmbassadorType>) => Promise<void>;
  addAmbassadorMember: (memberData: Omit<AmbassadorMember, 'id' | 'createdAt'>) => Promise<void>;
  updateAmbassadorMember: (id: string, updates: Partial<AmbassadorMember>) => Promise<void>;
  removeAmbassadorMember: (id: string) => Promise<void>;
  addAmbassadorProgram: (progData: Omit<AmbassadorProgram, 'id' | 'createdAt'>) => Promise<void>;
  updateAmbassadorProgram: (id: string, updates: Partial<AmbassadorProgram>) => Promise<void>;
  deleteAmbassadorProgram: (id: string) => Promise<void>;

  // Extracurricular Actions
  addExtracurricular: (ekskulData: Omit<Extracurricular, 'id' | 'createdAt'>) => Promise<void>;
  updateExtracurricular: (id: string, updates: Partial<Extracurricular>) => Promise<void>;
  deleteExtracurricular: (id: string) => Promise<void>;
  registerExtracurricularMember: (memberData: Omit<ExtracurricularMember, 'id' | 'createdAt'>) => Promise<void>;
  updateExtracurricularMember: (id: string, updates: Partial<ExtracurricularMember>) => Promise<void>;
  removeExtracurricularMember: (id: string) => Promise<void>;

  // Activity & Attendance Actions
  addActivity: (actData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Activity>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  saveAttendanceSession: (sessionData: Omit<AttendanceSession, 'id' | 'recordedAt'>) => Promise<void>;

  // Portfolio & Achievement Actions
  addPortfolio: (portData: Omit<Portfolio, 'id' | 'createdAt'>) => Promise<Portfolio>;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => Promise<void>;
  verifyPortfolio: (id: string, verifiedBy: string) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  addAchievement: (achData: Omit<Achievement, 'id' | 'createdAt'>) => Promise<void>;
  updateAchievement: (id: string, updates: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;

  // Announcements & Notifications
  addAnnouncement: (annData: Omit<Announcement, 'id'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;

  // Demo & System Controls
  resetToDemoData: () => void;
  clearAllDemoData: () => void;
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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // States
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => loadStored('school_profile', initialSchoolProfile));
  const [classes] = useState<SchoolClass[]>(() => loadStored('classes', initialClasses));
  const [talentCategories] = useState<TalentCategory[]>(() => loadStored('talent_categories', initialTalentCategories));
  const [ambassadorTypes, setAmbassadorTypes] = useState<AmbassadorType[]>(() => loadStored('ambassador_types', initialAmbassadorTypes));
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>(() => loadStored('extracurriculars', initialExtracurriculars));
  const [students, setStudents] = useState<Student[]>(() => loadStored('students', initialStudents));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadStored('teachers', initialTeachers));
  const [studentInterests, setStudentInterests] = useState<StudentInterest[]>(() => loadStored('student_interests', initialStudentInterests));
  const [teacherObservations, setTeacherObservations] = useState<TeacherObservation[]>(() => loadStored('teacher_observations', initialTeacherObservations));
  const [ambassadorMembers, setAmbassadorMembers] = useState<AmbassadorMember[]>(() => loadStored('ambassador_members', initialAmbassadorMembers));
  const [ambassadorPrograms, setAmbassadorPrograms] = useState<AmbassadorProgram[]>(() => loadStored('ambassador_programs', initialAmbassadorPrograms));
  const [extracurricularMembers, setExtracurricularMembers] = useState<ExtracurricularMember[]>(() => loadStored('extracurricular_members', initialExtracurricularMembers));
  const [activities, setActivities] = useState<Activity[]>(() => loadStored('activities', initialActivities));
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => loadStored('attendance_sessions', initialAttendanceSessions));
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => loadStored('portfolios', initialPortfolios));
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadStored('achievements', initialAchievements));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadStored('announcements', initialAnnouncements));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStored('notifications', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('audit_logs', initialAuditLogs));

  // Sync to LocalStorage for offline-first continuous durability
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

  // Firestore Realtime Listeners when live
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !currentUser) {
      setIsCloudConnected(false);
      return;
    }

    setIsCloudConnected(true);

    // 1. Students collection listener
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const items: Student[] = [];
      snap.forEach((doc) => items.push(doc.data() as Student));
      if (items.length > 0) setStudents(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for students:', error.message);
    });

    // 1b. Teachers collection listener
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snap) => {
      const items: Teacher[] = [];
      snap.forEach((doc) => items.push(doc.data() as Teacher));
      if (items.length > 0) setTeachers(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for teachers:', error.message);
    });

    // 2. Student Interests listener
    const unsubInterests = onSnapshot(collection(db, 'studentInterests'), (snap) => {
      const items: StudentInterest[] = [];
      snap.forEach((doc) => items.push(doc.data() as StudentInterest));
      if (items.length > 0) setStudentInterests(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for studentInterests:', error.message);
    });

    // 3. Teacher Observations listener
    const unsubObservations = onSnapshot(collection(db, 'teacherObservations'), (snap) => {
      const items: TeacherObservation[] = [];
      snap.forEach((doc) => items.push(doc.data() as TeacherObservation));
      if (items.length > 0) setTeacherObservations(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for teacherObservations:', error.message);
    });

    // 4. Ambassador Members listener
    const unsubAmbassadors = onSnapshot(collection(db, 'ambassadorMembers'), (snap) => {
      const items: AmbassadorMember[] = [];
      snap.forEach((doc) => items.push(doc.data() as AmbassadorMember));
      if (items.length > 0) setAmbassadorMembers(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for ambassadorMembers:', error.message);
    });

    // 5. Extracurricular Members listener
    const unsubEkskul = onSnapshot(collection(db, 'extracurricularMembers'), (snap) => {
      const items: ExtracurricularMember[] = [];
      snap.forEach((doc) => items.push(doc.data() as ExtracurricularMember));
      if (items.length > 0) setExtracurricularMembers(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for extracurricularMembers:', error.message);
    });

    // 6. Portfolios listener
    const unsubPortfolios = onSnapshot(collection(db, 'portfolios'), (snap) => {
      const items: Portfolio[] = [];
      snap.forEach((doc) => items.push(doc.data() as Portfolio));
      if (items.length > 0) setPortfolios(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for portfolios:', error.message);
    });

    // 7. Achievements listener
    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snap) => {
      const items: Achievement[] = [];
      snap.forEach((doc) => items.push(doc.data() as Achievement));
      if (items.length > 0) setAchievements(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for achievements:', error.message);
    });

    // 8. Activities listener
    const unsubActivities = onSnapshot(collection(db, 'activities'), (snap) => {
      const items: Activity[] = [];
      snap.forEach((doc) => items.push(doc.data() as Activity));
      if (items.length > 0) setActivities(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for activities:', error.message);
    });

    // 9. Announcements listener
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
      const items: Announcement[] = [];
      snap.forEach((doc) => items.push(doc.data() as Announcement));
      if (items.length > 0) setAnnouncements(items);
    }, (error) => {
      console.warn('Firestore snapshot notice for announcements:', error.message);
    });

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubInterests();
      unsubObservations();
      unsubAmbassadors();
      unsubEkskul();
      unsubPortfolios();
      unsubAchievements();
      unsubActivities();
      unsubAnnouncements();
    };
  }, [currentUser]);

  // Seed initial data to Firestore
  const seedInitialDataToFirestore = async () => {
    if (!isFirebaseConfigured || !db) return;
    try {
      // Seed School Profile
      await setDoc(doc(db, 'schoolProfile', 'main'), schoolProfile);

      // Seed Students
      for (const s of initialStudents) {
        await setDoc(doc(db, 'students', s.id), s);
      }
      // Seed Teachers
      for (const t of initialTeachers) {
        await setDoc(doc(db, 'teachers', t.id), t);
      }
      // Seed Interests
      for (const i of initialStudentInterests) {
        await setDoc(doc(db, 'studentInterests', i.id), i);
      }
      // Seed Observations
      for (const o of initialTeacherObservations) {
        await setDoc(doc(db, 'teacherObservations', o.id), o);
      }
      // Seed Ambassador Members
      for (const am of initialAmbassadorMembers) {
        await setDoc(doc(db, 'ambassadorMembers', am.id), am);
      }
      // Seed Extracurricular Members
      for (const em of initialExtracurricularMembers) {
        await setDoc(doc(db, 'extracurricularMembers', em.id), em);
      }
      // Seed Portfolios
      for (const p of initialPortfolios) {
        await setDoc(doc(db, 'portfolios', p.id), p);
      }
      // Seed Achievements
      for (const a of initialAchievements) {
        await setDoc(doc(db, 'achievements', a.id), a);
      }
      // Seed Activities
      for (const act of initialActivities) {
        await setDoc(doc(db, 'activities', act.id), act);
      }
      // Seed Announcements
      for (const ann of initialAnnouncements) {
        await setDoc(doc(db, 'announcements', ann.id), ann);
      }
      logAction('SYSTEM', 'Database', 'all', 'Sinkronisasi data awal ke Cloud Firestore berhasil.');
    } catch (err: any) {
      console.warn('Seed initial data notice:', err.message);
    }
  };

  const testCloudConnection = async (): Promise<boolean> => {
    return await testConnection();
  };

  // Helper for audit logging
  const logAction = (action: AuditActionType, entityType: string, entityId: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Push log to Firestore if live
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch((err) => {
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
      isDemo: true
    };
    setStudents((prev) => [newStudent, ...prev]);
    logAction('CREATE', 'Student', newStudent.id, `Menambahkan murid baru: ${newStudent.fullName} (${newStudent.classId})`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'students', newStudent.id), newStudent);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `students/${newStudent.id}`);
      }
    }

    return newStudent;
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
    logAction('UPDATE', 'Student', id, `Memperbarui data murid ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'students', id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
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
          await setDoc(doc(db, 'students', item.id), item);
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
      isDemo: true
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    logAction('CREATE', 'Teacher', newTeacher.id, `Menambahkan data guru baru: ${newTeacher.fullName} (${newTeacher.position})`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teachers', newTeacher.id), newTeacher);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `teachers/${newTeacher.id}`);
      }
    }

    return newTeacher;
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
    logAction('UPDATE', 'Teacher', id, `Memperbarui data guru ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teachers', id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
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
          await setDoc(doc(db, 'teachers', item.id), item);
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
        await setDoc(doc(db, 'studentInterests', newInterest.id), newInterest);
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
        await setDoc(doc(db, 'teacherObservations', newObs.id), newObs);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `teacherObservations/${newObs.id}`);
      }
    }
  };

  const updateObservation = async (id: string, updates: Partial<TeacherObservation>) => {
    setTeacherObservations((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    logAction('UPDATE', 'TeacherObservation', id, `Memperbarui pengamatan ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teacherObservations', id), updates, { merge: true });
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
        await setDoc(doc(db, 'ambassadorTypes', newType.id), newType);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `ambassadorTypes/${newType.id}`);
      }
    }
  };

  const updateAmbassadorType = async (id: string, updates: Partial<AmbassadorType>) => {
    setAmbassadorTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    logAction('UPDATE', 'AmbassadorType', id, `Memperbarui profil jenis duta ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorTypes', id), updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `ambassadorTypes/${id}`);
      }
    }
  };

  const addAmbassadorMember = async (data: Omit<AmbassadorMember, 'id' | 'createdAt'>) => {
    const newMember: AmbassadorMember = {
      ...data,
      id: `amb_mem_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAmbassadorMembers((prev) => [newMember, ...prev]);
    logAction('ASSIGN', 'AmbassadorMember', newMember.id, `Menugaskan ${data.studentName} sebagai ${data.ambassadorTypeName}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorMembers', newMember.id), newMember);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `ambassadorMembers/${newMember.id}`);
      }
    }
  };

  const updateAmbassadorMember = async (id: string, updates: Partial<AmbassadorMember>) => {
    setAmbassadorMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    logAction('UPDATE', 'AmbassadorMember', id, `Memperbarui status anggota duta ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorMembers', id), updates, { merge: true });
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
        await setDoc(doc(db, 'ambassadorPrograms', newProg.id), newProg);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `ambassadorPrograms/${newProg.id}`);
      }
    }
  };

  const updateAmbassadorProgram = async (id: string, updates: Partial<AmbassadorProgram>) => {
    setAmbassadorPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAction('UPDATE', 'AmbassadorProgram', id, `Memperbarui program kerja ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'ambassadorPrograms', id), updates, { merge: true });
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
        await setDoc(doc(db, 'extracurriculars', newExtra.id), newExtra);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `extracurriculars/${newExtra.id}`);
      }
    }
  };

  const updateExtracurricular = async (id: string, updates: Partial<Extracurricular>) => {
    setExtracurriculars((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    logAction('UPDATE', 'Extracurricular', id, `Memperbarui ekstrakurikuler ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'extracurriculars', id), updates, { merge: true });
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
    const newMember: ExtracurricularMember = {
      ...data,
      id: `ext_mem_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExtracurricularMembers((prev) => [newMember, ...prev]);
    logAction('ASSIGN', 'ExtracurricularMember', newMember.id, `Mendaftarkan ${data.studentName} ke ${data.extracurricularName}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'extracurricularMembers', newMember.id), newMember);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `extracurricularMembers/${newMember.id}`);
      }
    }
  };

  const updateExtracurricularMember = async (id: string, updates: Partial<ExtracurricularMember>) => {
    setExtracurricularMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    logAction('UPDATE', 'ExtracurricularMember', id, `Memperbarui data anggota ekskul ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'extracurricularMembers', id), updates, { merge: true });
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
        await setDoc(doc(db, 'activities', newAct.id), newAct);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `activities/${newAct.id}`);
      }
    }
    return newAct;
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
    logAction('UPDATE', 'Activity', id, `Memperbarui agenda kegiatan ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'activities', id), updates, { merge: true });
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
        await setDoc(doc(db, 'attendanceSessions', newSession.id), newSession);
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
        await setDoc(doc(db, 'portfolios', newPort.id), newPort);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `portfolios/${newPort.id}`);
      }
    }
    return newPort;
  };

  const updatePortfolio = async (id: string, updates: Partial<Portfolio>) => {
    setPortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAction('UPDATE', 'Portfolio', id, `Memperbarui portofolio ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'portfolios', id), updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `portfolios/${id}`);
      }
    }
  };

  const verifyPortfolio = async (id: string, verifiedBy: string) => {
    const updates = { isVerified: true, verifiedBy, verifiedAt: new Date().toISOString() };
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
        await setDoc(doc(db, 'achievements', newAch.id), newAch);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `achievements/${newAch.id}`);
      }
    }
  };

  const updateAchievement = async (id: string, updates: Partial<Achievement>) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    logAction('UPDATE', 'Achievement', id, `Memperbarui prestasi ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'achievements', id), updates, { merge: true });
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
        await setDoc(doc(db, 'announcements', newAnn.id), newAnn);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `announcements/${newAnn.id}`);
      }
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    logAction('UPDATE', 'Announcement', id, `Memperbarui pengumuman ID ${id}`);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'announcements', id), updates, { merge: true });
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

  const updateSchoolProfile = (updates: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => ({ ...prev, ...updates }));
    logAction('UPDATE', 'SchoolProfile', 'main', `Memperbarui profil instansi sekolah`);

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'schoolProfile', 'main'), { ...schoolProfile, ...updates }, { merge: true }).catch((err) => {
        console.warn('Update school profile notice:', err);
      });
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

  const clearAllDemoData = () => {
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
    logAction('SYSTEM', 'Database', 'all', 'Mengosongkan data demonstrasi untuk memulai data sekolah riil');
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
      if (parsed.schoolProfile) setSchoolProfile(parsed.schoolProfile);
      if (Array.isArray(parsed.students)) setStudents(parsed.students);
      if (Array.isArray(parsed.teachers)) setTeachers(parsed.teachers);
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
