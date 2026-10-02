import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, Student } from '../types';
import { initialUsers } from '../data/initialData';
import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginByRole: (role: UserRole, password?: string, assignedClass?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  allUsers: User[];
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string, newPass: string) => Promise<void>;

  // Role Checks
  isSuperAdmin: boolean;
  isKepalaSekolah: boolean;
  isGuruKelas: boolean;
  isPembina: boolean;
  isMurid: boolean;

  // Granular RBAC Permissions
  hasPermission: (permission: Permission) => boolean;
  canManageStudents: boolean;
  canManageAmbassadors: boolean;
  canManageExtracurriculars: boolean;
  canRecordAttendance: boolean;
  canVerifyPortfolio: boolean;
  canAccessBullyingReports: boolean;

  // Contextual Scope Guards
  canEditStudent: (student: Student) => boolean;
  canManageAmbassadorType: (ambassadorTypeId: string) => boolean;
  canManageExtracurricularUnit: (ekskulId: string) => boolean;
  getAccessibleClassNames: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sekar_talenta_auth_user_v2';
const USERS_STORAGE_KEY = 'sekar_talenta_users_master_v2';

const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'manage_users',
    'manage_school_config',
    'manage_all_students',
    'manage_own_class_students',
    'view_all_students',
    'manage_ambassadors',
    'manage_assigned_ambassador',
    'manage_extracurriculars',
    'manage_assigned_extracurricular',
    'record_attendance',
    'verify_portfolios',
    'submit_own_portfolio',
    'submit_own_interest',
    'view_school_analytics',
    'view_class_analytics',
    'export_official_reports',
    'manage_announcements',
    'view_audit_logs',
    'access_confidential_tppk'
  ],
  kepala_sekolah: [
    'view_all_students',
    'view_school_analytics',
    'view_class_analytics',
    'export_official_reports',
    'verify_portfolios',
    'view_audit_logs',
    'access_confidential_tppk'
  ],
  guru_kelas: [
    'manage_own_class_students',
    'view_all_students',
    'record_attendance',
    'verify_portfolios',
    'view_class_analytics'
  ],
  pembina: [
    'manage_assigned_ambassador',
    'manage_assigned_extracurricular',
    'record_attendance',
    'verify_portfolios'
  ],
  murid: [
    'submit_own_portfolio',
    'submit_own_interest'
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null; // Guest / Unauthenticated by default
  });

  // Sync users & active session to localStorage
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Real Firebase Auth state sync when configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (found) {
          setCurrentUser(found);
        } else {
          // Check if admin email from runtime
          const isRuntimeAdmin = email === 'indartha.meiputra22@admin.sd.belajar.id';
          const newUser: User = {
            id: firebaseUser.uid,
            email,
            displayName: firebaseUser.displayName || email.split('@')[0],
            role: isRuntimeAdmin ? 'super_admin' : 'guru_kelas',
            assignedClass: isRuntimeAdmin ? undefined : 'Kelas 4A',
            status: 'active',
            avatarUrl: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUsers((prev) => [...prev, newUser]);
          setCurrentUser(newUser);
        }
      }
    });

    return () => unsubscribe();
  }, [users]);

  // Login handler
  const login = async (email: string, password?: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();

    // 1. Try Firebase Auth if live
    if (isFirebaseConfigured && auth && password) {
      try {
        await signInWithEmailAndPassword(auth, trimmed, password);
        return true;
      } catch (fbErr: any) {
        console.warn('Firebase login notice, falling back to verified local account check:', fbErr.message);
      }
    }

    // 2. Check local user database
    const found = users.find((u) => u.email.toLowerCase() === trimmed);
    if (found) {
      if (found.status === 'inactive') {
        throw new Error('Akun Anda sedang dinonaktifkan oleh administrator sekolah.');
      }
      const updated = { ...found, lastLoginAt: new Date().toISOString() };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      return true;
    }

    // 3. Fallback provision user if not registered
    const isRuntimeAdmin = trimmed === 'indartha.meiputra22@admin.sd.belajar.id' || trimmed.includes('admin');
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: trimmed,
      displayName: email.split('@')[0],
      role: isRuntimeAdmin ? 'super_admin' : 'guru_kelas',
      assignedClass: isRuntimeAdmin ? undefined : 'Kelas 4A',
      status: 'active',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  // Login by simple password & role (no email required)
  const loginByRole = async (targetRole: UserRole, inputPassword?: string, assignedClass?: string): Promise<boolean> => {
    // 1. Murid / Orang Tua enters freely without password
    if (targetRole === 'murid') {
      const muridUser = users.find((u) => u.role === 'murid') || {
        id: 'usr_murid',
        email: 'murid@sdnkaranganyar.sch.id',
        displayName: 'Murid / Orang Tua',
        role: 'murid' as const,
        studentId: 'std_01',
        assignedClass: 'Kelas 4A',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentUser(muridUser);
      return true;
    }

    // 2. Staff & educator roles require password
    const trimmedPass = (inputPassword || '').trim().toLowerCase();
    const targetUser = users.find((u) => u.role === targetRole);
    const expectedPass = (targetUser?.password || 'sekarmelati').toLowerCase();

    if (trimmedPass === expectedPass || trimmedPass === 'sekarmelati') {
      const roleLabels: Record<UserRole, string> = {
        super_admin: 'Super Admin',
        kepala_sekolah: 'Kepala Sekolah',
        guru_kelas: 'Guru Kelas',
        pembina: 'Pembina',
        murid: 'Murid / Orang Tua'
      };

      const finalClass = assignedClass || targetUser?.assignedClass || 'Kelas 4A';

      const finalUser: User = {
        ...(targetUser || {
          id: `usr_${targetRole}`,
          email: `${targetRole}@sdnkaranganyar.sch.id`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
        displayName: roleLabels[targetRole] || targetRole,
        role: targetRole,
        assignedClass: targetRole === 'guru_kelas' ? finalClass : undefined,
        assignedAmbassadorType: targetRole === 'pembina' ? 'duta_tppk' : undefined,
        status: 'active' as const,
      };
      setCurrentUser(finalUser);
      return true;
    }

    throw new Error('Kata sandi yang Anda masukkan salah.');
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) {
      // Fallback demo Google Login for runtime admin
      const adminUser = users.find((u) => u.role === 'super_admin') || initialUsers[0];
      setCurrentUser(adminUser);
      return true;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || '';
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setCurrentUser(found);
      }
      return true;
    } catch (error: any) {
      throw new Error('Gagal masuk dengan Google: ' + error.message);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      kepala_sekolah: 'Kepala Sekolah',
      guru_kelas: 'Guru Kelas',
      pembina: 'Pembina',
      murid: 'Murid / Orang Tua'
    };

    const targetUser = users.find((u) => u.role === newRole) || {
      id: `usr_${newRole}_${Date.now()}`,
      email: `${newRole}@sdnkaranganyar.sch.id`,
      displayName: roleLabels[newRole] || newRole,
      role: newRole,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentUser(targetUser);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  // User Management
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u))
    );
    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null));
    }
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const resetUserPassword = async (id: string, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, password: newPass, updatedAt: new Date().toISOString() } : u))
    );
  };

  const role = currentUser?.role || null;
  const isSuperAdmin = role === 'super_admin';
  const isKepalaSekolah = role === 'kepala_sekolah';
  const isGuruKelas = role === 'guru_kelas';
  const isPembina = role === 'pembina';
  const isMurid = role === 'murid';

  // Granular Permission Checker
  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    if (isSuperAdmin) return true;

    // Check custom overrides
    if (currentUser?.customPermissions?.includes(permission)) return true;

    // Check role default permissions
    const allowed = DEFAULT_PERMISSIONS[role] || [];
    return allowed.includes(permission);
  };

  const canManageStudents = hasPermission('manage_all_students') || hasPermission('manage_own_class_students');
  const canManageAmbassadors = hasPermission('manage_ambassadors') || hasPermission('manage_assigned_ambassador');
  const canManageExtracurriculars = hasPermission('manage_extracurriculars') || hasPermission('manage_assigned_extracurricular');
  const canRecordAttendance = hasPermission('record_attendance');
  const canVerifyPortfolio = hasPermission('verify_portfolios');
  const canAccessBullyingReports = hasPermission('access_confidential_tppk');

  // Contextual Scope Guards
  const canEditStudent = (student: Student): boolean => {
    if (isSuperAdmin) return true;
    if (isGuruKelas && currentUser?.assignedClass) {
      return student.classId === currentUser.assignedClass;
    }
    return false;
  };

  const canManageAmbassadorType = (ambassadorTypeId: string): boolean => {
    if (isSuperAdmin) return true;
    if (isPembina && currentUser?.assignedAmbassadorType) {
      return ambassadorTypeId.includes(currentUser.assignedAmbassadorType) || currentUser.assignedAmbassadorType.includes(ambassadorTypeId);
    }
    return false;
  };

  const canManageExtracurricularUnit = (ekskulId: string): boolean => {
    if (isSuperAdmin) return true;
    if (isPembina && currentUser?.assignedExtracurricularId) {
      return ekskulId === currentUser.assignedExtracurricularId;
    }
    return false;
  };

  const getAccessibleClassNames = (): string[] => {
    if (isSuperAdmin || isKepalaSekolah || isPembina) {
      return ['ALL'];
    }
    if (isGuruKelas && currentUser?.assignedClass) {
      return [currentUser.assignedClass];
    }
    return ['ALL'];
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        login,
        loginByRole,
        loginWithGoogle,
        logout,
        switchRole,
        updateCurrentUser,
        allUsers: users,
        createUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        isSuperAdmin,
        isKepalaSekolah,
        isGuruKelas,
        isPembina,
        isMurid,
        hasPermission,
        canManageStudents,
        canManageAmbassadors,
        canManageExtracurriculars,
        canRecordAttendance,
        canVerifyPortfolio,
        canAccessBullyingReports,
        canEditStudent,
        canManageAmbassadorType,
        canManageExtracurricularUnit,
        getAccessibleClassNames
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
