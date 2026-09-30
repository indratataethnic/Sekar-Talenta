export type UserRole = 'super_admin' | 'kepala_sekolah' | 'guru_kelas' | 'pembina' | 'murid';

export type Permission =
  | 'manage_users'
  | 'manage_school_config'
  | 'manage_all_students'
  | 'manage_own_class_students'
  | 'view_all_students'
  | 'manage_ambassadors'
  | 'manage_assigned_ambassador'
  | 'manage_extracurriculars'
  | 'manage_assigned_extracurricular'
  | 'record_attendance'
  | 'verify_portfolios'
  | 'submit_own_portfolio'
  | 'submit_own_interest'
  | 'view_school_analytics'
  | 'view_class_analytics'
  | 'export_official_reports'
  | 'manage_announcements'
  | 'view_audit_logs'
  | 'access_confidential_tppk';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  password?: string;
  assignedClass?: string; // e.g. "Kelas 4A"
  assignedAmbassadorType?: string; // e.g. "duta_tppk"
  assignedExtracurricularId?: string; // e.g. "ekskul_tahfidz"
  studentId?: string; // For role murid, linked to student.id
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  customPermissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  fullName: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  classId: string; // e.g. "Kelas 4A"
  academicYear: string; // e.g. "2024/2025"
  avatarUrl?: string;
  isActive: boolean;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface Teacher {
  id: string;
  nip?: string;
  fullName: string;
  position: string; // Jabatan (e.g. Kepala Sekolah, Guru Kelas 1 A, Pelatih Seni Tari, dll.)
  additionalDuties?: string; // Tugas Tambahan (e.g. Pembina Duta TPPK, Pembina Pramuka, Koordinator UKS, dll.)
  avatarUrl?: string;
  isActive: boolean;
  teacherType?: 'internal' | 'external'; // 'internal' = Guru/Tendik Sekolah, 'external' = Pembina/Pelatih Luar
  organization?: string; // Asal Lembaga / Sanggar / Klub / Komunitas (untuk pembina eksternal)
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Kelas 4A"
  grade: number; // 1 to 6
  academicYear: string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  room?: string;
}

export interface TalentCategory {
  id: string;
  name: string;
  icon: string;
  badgeColor: string;
  description: string;
  subcategories: string[];
}

export type InterestLevel = 'sangat_tertarik' | 'tertarik' | 'ingin_mencoba';

export interface StudentInterest {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  interestLevel: InterestLevel;
  desiredActivities?: string[];
  notes?: string;
  submittedAt: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
}

export interface TeacherObservation {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  observationNotes: string;
  talentRecommendations: string[];
  characterGrowthNotes: string;
  observedDate: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  createdAt: string;
}

export interface AmbassadorType {
  id: string;
  code: string; // 'duta_tppk', 'duta_lingkungan', 'duta_literasi', 'duta_kesehatan', 'duta_digital', 'duta_sahabat'
  name: string;
  shortName: string;
  icon: string;
  badgeColor: string;
  description: string;
  focus: string;
  goals: string[];
  tasks: string[];
  coachName: string;
  coachId?: string;
  isActive: boolean;
  isCustom?: boolean;
}

export interface AmbassadorMember {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  classId: string;
  ambassadorTypeId: string;
  ambassadorTypeCode: string;
  ambassadorTypeName: string;
  assignedYear: string;
  startDate: string;
  endDate?: string;
  coachId?: string;
  coachName?: string;
  status: 'aktif' | 'selesai' | 'alumni';
  roleTitle?: string; // e.g. "Koordinator Kelas 4", "Anggota Tim Kampanye"
  reflectionNotes?: string;
  contributionsCount?: number;
  createdAt: string;
}

export interface AmbassadorProgram {
  id: string;
  ambassadorTypeId: string;
  ambassadorTypeName: string;
  title: string;
  description: string;
  targetAudience: string;
  period: string; // e.g. "Semester Ganjil 2024/2025"
  status: 'perencanaan' | 'berjalan' | 'selesai' | 'dibatalkan';
  coachName: string;
  createdAt: string;
}

export interface ExtracurricularCoach {
  name: string;
  role?: string; // e.g. "Pembina Utama", "Pembina Pendamping", "Pelatih Teknis", "Instruktur Ahli", "Koreografer", dll.
  type?: 'internal' | 'external'; // 'internal' (Guru/Tendik Sekolah) atau 'external' (Luar Sekolah/Sanggar/Pelatih Ahli)
  organization?: string; // Asal lembaga / sanggar / instansi jika eksternal
  phone?: string;
  teacherId?: string;
}

export interface Extracurricular {
  id: string;
  code: string;
  name: string;
  category: 'Keagamaan' | 'Kepanduan' | 'Teknologi' | 'Seni Budaya' | 'Olahraga';
  icon: string;
  badgeColor: string;
  description: string;
  goals: string[];
  coachName: string; // Tampilan utama / gabungan nama pembina
  coaches?: ExtracurricularCoach[]; // Daftar rincian pembina (bisa 1 atau lebih, internal maupun eksternal)
  coachPhone?: string;
  dayTimeSchedule: string; // e.g. "Jumat, 14.00 - 16.00 WIB"
  location: string;
  capacity?: number;
  requirements?: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string;
}

export interface ExtracurricularMember {
  id: string;
  extracurricularId: string;
  extracurricularName: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  classId: string;
  joinedAt: string;
  status: 'menunggu' | 'aktif' | 'nonaktif';
  attendancePercentage?: number;
  coachNotes?: string;
  // Report Card Assessment Fields (Kurikulum Merdeka)
  grade?: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';
  reportDescription?: string;
  academicYear?: string;
  semester?: 'Ganjil' | 'Genap';
  evaluatedBy?: string;
  evaluatedAt?: string;
  createdAt: string;
}

export type ActivityType = 'duta' | 'ekstrakurikuler' | 'sekolah';
export type ActivityStatus = 'rencana' | 'berlangsung' | 'selesai' | 'dibatalkan';

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  referenceId: string; // ambassadorTypeId or extracurricularId
  referenceName: string;
  personInCharge: string;
  description: string;
  objectives: string;
  dateTime: string; // ISO date string or formatted date
  timeString?: string;
  location: string;
  participantsCount: number;
  status: ActivityStatus;
  documentationUrls?: string[];
  outcomeNotes?: string;
  reflectionNotes?: string;
  followUpNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  classId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  activityId?: string;
  activityTitle: string;
  date: string;
  referenceType: 'duta' | 'ekstrakurikuler';
  referenceId: string;
  referenceName: string;
  records: AttendanceRecord[];
  recordedBy: string;
  recordedAt: string;
}

export type PortfolioCategory =
  | 'karya'
  | 'proyek'
  | 'kepemimpinan'
  | 'kontribusi_duta'
  | 'ekstrakurikuler'
  | 'prestasi_akademik'
  | 'prestasi_nonakademik'
  | 'refleksi_diri';

export interface Portfolio {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  date: string;
  mediaUrls?: string[];
  coachOrTeacherName?: string;
  reflection?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  tags?: string[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  title: string;
  eventName: string;
  level: 'sekolah' | 'kecamatan' | 'kota' | 'provinsi' | 'nasional';
  category: string;
  rank: 'Juara 1' | 'Juara 2' | 'Juara 3' | 'Harapan 1' | 'Harapan 2' | 'Partisipan Terbaik' | 'Apresiasi';
  date: string;
  certificateUrl?: string;
  coachName?: string;
  notes?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'duta' | 'ekskul' | 'jadwal' | 'umum';
  content: string;
  targetAudience: 'semua' | 'murid' | 'guru' | 'duta' | 'ekskul';
  isPublished: boolean;
  publishedAt: string;
  authorName: string;
  authorRole: string;
  important?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VERIFY'
  | 'ASSIGN'
  | 'RECORD'
  | 'SYSTEM'
  | 'IMPORT'
  | 'EXPORT';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditActionType;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  address: string;
  city: string;
  principalName: string;
  principalNip: string;
  currentAcademicYear: string;
  currentSemester: 'Ganjil' | 'Genap';
  tagline: string;
}
