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
  User,
  AuditLog
} from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'UPT SD Negeri Karanganyar',
  npsn: '20535412',
  address: 'Jl. Karanganyar No. 45, Karanganyar, Kec. Panggungrejo',
  city: 'Kota Pasuruan, Jawa Timur',
  principalName: 'H. Sudarsono, S.Pd., M.M.',
  principalNip: '19680512 199303 1 008',
  currentAcademicYear: '2024/2025',
  currentSemester: 'Genap',
  tagline: 'Kenali Potensi • Kembangkan Bakat • Tumbuhkan Kepemimpinan'
};

export const initialUsers: User[] = [
  {
    id: 'user_super_admin',
    email: 'admin.sekar@sdnkaranganyar.sch.id',
    displayName: 'Super Admin',
    role: 'super_admin',
    status: 'active',
    phone: '081234567890',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 'user_guru_kelas',
    email: 'guru.kelas@sdnkaranganyar.sch.id',
    displayName: 'Guru Kelas',
    role: 'guru_kelas',
    assignedClass: 'Kelas 4A',
    status: 'active',
    phone: '082155667788',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 'user_pembina',
    email: 'pembina@sdnkaranganyar.sch.id',
    displayName: 'Pembina',
    role: 'pembina',
    assignedAmbassadorType: 'duta_tppk',
    assignedExtracurricularId: 'ekskul_batik',
    status: 'active',
    phone: '085733445566',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 'user_murid',
    email: 'murid@sdnkaranganyar.sch.id',
    displayName: 'Murid / Orang Tua',
    role: 'murid',
    studentId: 'std_01',
    assignedClass: 'Kelas 4A',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  }
];

export const initialClasses: SchoolClass[] = [
  { id: 'c_1a', name: 'Kelas 1 A', grade: 1, academicYear: '2024/2025', homeroomTeacherName: 'Ibu Siti Aminah, S.Pd.' },
  { id: 'c_1b', name: 'Kelas 1 B', grade: 1, academicYear: '2024/2025', homeroomTeacherName: 'Bapak Joko Susilo, S.Pd.' },
  { id: 'c_2a', name: 'Kelas 2 A', grade: 2, academicYear: '2024/2025', homeroomTeacherName: 'Ibu Nurul Hidayah, S.Pd.' },
  { id: 'c_2b', name: 'Kelas 2 B', grade: 2, academicYear: '2024/2025', homeroomTeacherName: 'Ibu Tri Wahyuni, S.Pd.' },
  { id: 'c_3a', name: 'Kelas 3 A', grade: 3, academicYear: '2024/2025', homeroomTeacherName: 'Bapak Eko Prasetyo, S.Pd.' },
  { id: 'c_3b', name: 'Kelas 3 B', grade: 3, academicYear: '2024/2025', homeroomTeacherName: 'Ibu Sri Rahayu, S.Pd.' },
  { id: 'c_4a', name: 'Kelas 4 A', grade: 4, academicYear: '2024/2025', homeroomTeacherName: 'Ibu Ratna Dewi, S.Pd.' },
  { id: 'c_4b', name: 'Kelas 4 B', grade: 4, academicYear: '2024/2025', homeroomTeacherName: 'Bapak Bambang Wijaya, S.Pd.' },
  { id: 'c_5a', name: 'Kelas 5 A', grade: 5, academicYear: '2024/2025', homeroomTeacherName: 'Ibu Dian Safitri, S.Pd.' },
  { id: 'c_5b', name: 'Kelas 5 B', grade: 5, academicYear: '2024/2025', homeroomTeacherName: 'Bapak Hendra Gunawan, S.Pd.' },
  { id: 'c_6a', name: 'Kelas 6 A', grade: 6, academicYear: '2024/2025', homeroomTeacherName: 'Ibu Maya Kusuma, S.Pd.' },
  { id: 'c_6b', name: 'Kelas 6 B', grade: 6, academicYear: '2024/2025', homeroomTeacherName: 'Bapak Agus Setiawan, S.Pd.' },
];

export const initialTeachers: Teacher[] = [
  {
    id: 't_01',
    nip: '19680512 199303 1 008',
    fullName: 'H. Sudarsono, S.Pd., M.M.',
    position: 'Kepala Sekolah',
    additionalDuties: 'Penanggung Jawab Utama Program SEKAR TALENTA',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_02',
    nip: '19850114 200902 1 003',
    fullName: 'Indartha Meiputra, S.Pd.',
    position: 'Guru Penggerak & IT',
    additionalDuties: 'Koordinator Inovasi SEKAR TALENTA',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_03',
    nip: '19870420 201001 2 015',
    fullName: 'Ibu Ratna Dewi, S.Pd.',
    position: 'Guru Kelas 4 A',
    additionalDuties: 'Koordinator P5',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_04',
    nip: '19890815 201403 1 005',
    fullName: 'Bapak Ahmad Fauzi, S.Pd.',
    position: 'Guru Pendidikan Agama Islam (PAI)',
    additionalDuties: 'Ketua TPPK',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_05',
    nip: '19910210 201602 2 008',
    fullName: 'Ibu Siti Aminah, S.Pd.',
    position: 'Guru Kelas 1 A',
    additionalDuties: 'Pengelola Pojok Baca',
    avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_06',
    nip: '19920518 201701 1 004',
    fullName: 'Bapak Joko Susilo, S.Pd.',
    position: 'Guru Kelas 1 B',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_07',
    nip: '19930722 201803 2 009',
    fullName: 'Ibu Nurul Hidayah, S.Pd.',
    position: 'Guru Kelas 2 A',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_08',
    nip: '19901103 201502 2 011',
    fullName: 'Ibu Tri Wahyuni, S.Pd.',
    position: 'Guru Kelas 2 B',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_09',
    nip: '19880614 201201 1 007',
    fullName: 'Bapak Eko Prasetyo, S.Pd.',
    position: 'Guru Kelas 3 A',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_10',
    nip: '19940125 201903 2 012',
    fullName: 'Ibu Sri Rahayu, S.Pd.',
    position: 'Guru Kelas 3 B',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_11',
    nip: '19860312 201101 1 006',
    fullName: 'Bapak Bambang Wijaya, S.Pd.',
    position: 'Guru Kelas 4 B',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_12',
    nip: '19950917 202012 2 007',
    fullName: 'Ibu Dian Safitri, S.Pd.',
    position: 'Guru Kelas 5 A',
    additionalDuties: 'Koordinator UKS',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_13',
    nip: '19840228 200801 1 002',
    fullName: 'Bapak Hendra Gunawan, S.Pd.',
    position: 'Guru Kelas 5 B',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_14',
    nip: '19900405 201503 2 006',
    fullName: 'Ibu Maya Kusuma, S.Pd.',
    position: 'Guru Kelas 6 A',
    additionalDuties: 'Koordinator Asesmen Nasional (ANBK)',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_15',
    nip: '19831201 200604 1 009',
    fullName: 'Bapak Agus Setiawan, S.Pd.',
    position: 'Guru Kelas 6 B',
    additionalDuties: 'Koordinator Ekstrakurikuler',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_16',
    nip: '19881009 201402 1 004',
    fullName: 'Bapak Rian Hidayat, S.Pd.Kor.',
    position: 'Guru PJOK (Penjasorkes)',
    additionalDuties: 'Koordinator O2SN',
    teacherType: 'internal',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_ext_01',
    fullName: 'Kak Dimas Prasetya, S.Sn.',
    position: 'Instruktur & Koreografer Seni Tari',
    teacherType: 'external',
    organization: 'Sanggar Seni Tari Suropati Pasuruan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_ext_02',
    fullName: 'Sensei Budi Santoso',
    position: 'Pelatih Bela Diri Karate & Silat',
    teacherType: 'external',
    organization: 'Dojo Bela Diri Karanganyar',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  },
  {
    id: 't_ext_03',
    fullName: 'Kak Rizky Ramadhan, S.Kom.',
    position: 'Instruktur Robotik & Coding Anak',
    teacherType: 'external',
    organization: 'Lembaga Edukasi Robotik Pasuruan',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-01T08:00:00Z'
  }
];

export const initialTalentCategories: TalentCategory[] = [
  {
    id: 'cat_seni_budaya',
    name: 'Seni dan Budaya',
    icon: 'Palette',
    badgeColor: 'emerald',
    description: 'Eksplorasi kepekaan estetika, ekspresi artistik, dan pelestarian budaya lokal Pasuruan.',
    subcategories: ['Seni Tari Tradisional', 'Seni Tari Kreasi', 'Seni Musik Tradisional', 'Seni Musik Modern', 'Seni Rupa & Lukis', 'Membatik Karanganyar', 'Seni Pertunjukan & Teater']
  },
  {
    id: 'cat_olahraga',
    name: 'Olahraga & Kebugaran',
    icon: 'Activity',
    badgeColor: 'amber',
    description: 'Pengembangan ketangkasan jasmani, sportivitas, daya juang, dan kesehatan raga.',
    subcategories: ['Atletik & Lari Cepat', 'Permainan Sepak Bola/Futsal', 'Bulu Tangkis', 'Senam Irama', 'Bola Voli Mini', 'Catur', 'Renang Dasar']
  },
  {
    id: 'cat_akademik',
    name: 'Akademik & Sains',
    icon: 'BookOpen',
    badgeColor: 'blue',
    description: 'Pengembangan daya nalar kritis, eksperimen sains, logika matematika, dan kebahasaan.',
    subcategories: ['Matematika Nalaria Realistik', 'Sains & Eksperimen IPA', 'IPS & Wawasan Kebangsaan', 'Bahasa Indonesia & Puisi', 'Bahasa Inggris Dasar', 'Bahasa Jawa & Aksara Jawa']
  },
  {
    id: 'cat_literasi',
    name: 'Literasi dan Komunikasi',
    icon: 'PenTool',
    badgeColor: 'purple',
    description: 'Pengembangan gemar membaca, kecakapan menulis, bercerita, dan public speaking.',
    subcategories: ['Membaca & Resensi Buku', 'Menulis Cerpen/Puisi', 'Bercerita / Storytelling', 'Berpidato / Pildacil', 'Membuat Konten Edukasi Mading', 'Jurnalistik Cilik']
  },
  {
    id: 'cat_teknologi',
    name: 'Teknologi dan Digital',
    icon: 'Laptop',
    badgeColor: 'cyan',
    description: 'Pemberdayaan keterampilan komputer, logika komputasi anak, dan etika digital.',
    subcategories: ['Aplikasi Komputer Dasar', 'Pemrograman Visual Scratch', 'Desain Grafis Canva Sederhana', 'Media Pembelajaran Digital', 'Literasi & Keamanan Digital']
  },
  {
    id: 'cat_kepemimpinan',
    name: 'Kepemimpinan dan Sosial',
    icon: 'Users',
    badgeColor: 'indigo',
    description: 'Penanaman empati, kecakapan memimpin, musyawarah, dan aksi kepedulian sosial.',
    subcategories: ['Kepemimpinan Duta Sekolah', 'Kerja Sama Regu Pramuka', 'Komunikasi & Mediasi Sahabat', 'Aksi Peduli Lingkungan Resik', 'Bakti Sosial & Gotong Royong']
  },
  {
    id: 'cat_keagamaan',
    name: 'Keagamaan & Karakter',
    icon: 'Sparkles',
    badgeColor: 'teal',
    description: 'Pembentukan akhlak mulia, hafalan Al-Qur\'an, tilawah, dan pembiasaan ibadah.',
    subcategories: ['Tahfidz Juz Amma (Juz 30)', 'Metode Qiroati', 'Seni Hadrah & Albanjari', 'Tilawatil Qur\'an', 'Kultum & Da\'i Cilik', 'Pembiasaan Adab & Sholat Berjamaah']
  }
];

export const initialAmbassadorTypes: AmbassadorType[] = [
  {
    id: 'duta_tppk',
    code: 'duta_tppk',
    name: 'Duta TPPK (Pencegahan & Penanganan Kekerasan)',
    shortName: 'Duta TPPK',
    icon: 'ShieldCheck',
    badgeColor: 'rose',
    focus: 'Pencegahan perundungan, anti kekerasan, dan perwujudan sekolah aman ramah anak.',
    description: 'Duta pelopor rasa aman dan ramah di lingkungan UPT SDN Karanganyar tanpa perundungan.',
    goals: [
      'Menciptakan lingkungan belajar yang aman, nyaman, dan bebas dari perundungan fisik, verbal, maupun sosial.',
      'Menjadi jembatan komunikasi antara murid dan guru jika ada indikasi situasi tidak nyaman.',
      'Mengedukasi murid untuk berani berbicara (speak up) dan saling melindungi.'
    ],
    tasks: [
      'Mengampanyekan sikap saling menghargai dan ramah sesama teman di kelas dan luar kelas.',
      'Menjadi teladan dalam berteman tanpa membeda-bedakan latar belakang.',
      'Mengajak teman berani melapor kepada guru/wali kelas bila melihat dugaan perundungan.',
      'Mendampingi teman untuk menemui guru jika diminta bantuan secara santun.',
      'Membuat media poster edukasi anti-perundungan di mading sekolah.'
    ],
    coachName: 'Bapak Ahmad Fauzi, S.Pd.',
    isActive: true
  },
  {
    id: 'duta_lingkungan',
    code: 'duta_lingkungan',
    name: 'Duta Lingkungan & Adiwiyata',
    shortName: 'Duta Lingkungan',
    icon: 'Leaf',
    badgeColor: 'emerald',
    focus: 'Kebersihan, penghijauan, pilah sampah, dan kelestarian ekosistem sekolah hijau.',
    description: 'Duta pelestari lingkungan hijau, pembiasaan pilah sampah, dan perawatan tanaman sekolah.',
    goals: [
      'Mewujudkan sekolah berbudaya lingkungan bersih, asri, dan hemat energi.',
      'Membiasakan murid memilah sampah organik dan anorganik.',
      'Mengurangi sampah plastik sekali pakai di kantin dan lingkungan sekolah.'
    ],
    tasks: [
      'Mengajak teman menjaga kebersihan ruang kelas dan halaman.',
      'Merawat taman tanaman hias dan apotek hidup sekolah.',
      'Mengampanyekan pemilahan sampah organik, anorganik, dan residu.',
      'Menggerakkan aksi Sabtu Resik Karanganyar setiap minggu.',
      'Mengajak teman menghemat air wudhu dan mematikan lampu yang tidak terpakai.'
    ],
    coachName: 'Ibu Nurul Hidayah, S.Pd.',
    isActive: true
  },
  {
    id: 'duta_literasi',
    code: 'duta_literasi',
    name: 'Duta Literasi Sekolah',
    shortName: 'Duta Literasi',
    icon: 'BookMarked',
    badgeColor: 'amber',
    focus: 'Gerakan gemar membaca buku, sudut baca kelas, resensi, dan apresiasi karya tulis.',
    description: 'Duta penggerak gemar membaca, pengelolaan sudut baca kelas, dan festival literasi.',
    goals: [
      'Meningkatkan minat baca buku bacaan bermutu 15 menit sebelum pembelajaran.',
      'Menghidupkan perpustakaan sekolah dan pojok baca kelas.',
      'Mendorong lahirnya karya cerpen, puisi, dan mading karya murid.'
    ],
    tasks: [
      'Menggerakkan budaya membaca 15 menit setiap pagi.',
      'Membuat rekomendasi buku cerita inspiratif setiap pekan.',
      'Mengadakan kegiatan berbagi cerita (bercerita bergilir) di kelas.',
      'Membantu merapikan pojok baca kelas.'
    ],
    coachName: 'Ibu Tri Wahyuni, S.Pd.',
    isActive: true
  },
  {
    id: 'duta_kesehatan',
    code: 'duta_kesehatan',
    name: 'Duta Kesehatan & Dokter Kecil UKS',
    shortName: 'Duta Kesehatan',
    icon: 'HeartPulse',
    badgeColor: 'red',
    focus: 'Perilaku Hidup Bersih dan Sehat (PHBS), gizi seimbang, dan pendukung UKS.',
    description: 'Duta pelopor kebersihan diri, cuci tangan pakai sabun, sarapan sehat, dan kesiapsiagaan UKS.',
    goals: [
      'Membudayakan cuci tangan pakai sabun (CTPS) 6 langkah dengan benar.',
      'Mengedukasi jajanan sehat dan gizi seimbang.',
      'Mendukung operasional layanan pertolongan pertama di UKS.'
    ],
    tasks: [
      'Mengampanyekan perilaku hidup bersih dan sehat di kantin dan kelas.',
      'Memeriksa kebersihan kuku dan kerapian teman saat upacara/pembiasaan pagi.',
      'Membantu petugas UKS dalam pertolongan pertama ringan (minyak kayu putih, plester).',
      'Mengedukasi pentingnya minum air putih cukup.'
    ],
    coachName: 'Ibu Dian Safitri, S.Pd.',
    isActive: true
  },
  {
    id: 'duta_digital',
    code: 'duta_digital',
    name: 'Duta Digital & Media Cilik',
    shortName: 'Duta Digital',
    icon: 'MonitorSmartphone',
    badgeColor: 'indigo',
    focus: 'Etika bermedia digital, pemanfaatan TIK positif, dan konten karya digital sekolah.',
    description: 'Duta pelopor internet sehat, etika digital ramah anak, dan dokumentasi karya positif.',
    goals: [
      'Mengedukasi batasan waktu layar (screen time) dan konten ramah anak.',
      'Mengajak murid menggunakan gawai untuk belajar, berkarya, dan membaca e-book.',
      'Membantu kegiatan pembelajaran berbasis Chromebook/komputer dengan guru.'
    ],
    tasks: [
      'Mengampanyekan etika berteman di dunia digital tanpa cyberbullying.',
      'Mengajak penggunaan teknologi secara aman dan bijak.',
      'Membantu pendampingan teman saat pembelajaran di lab komputer/Chromebook.',
      'Membuat desain poster sederhana untuk kegiatan sekolah bersama pembina.'
    ],
    coachName: 'Bapak Bambang Wijaya, S.Pd.',
    isActive: true
  },
  {
    id: 'duta_sahabat',
    code: 'duta_sahabat',
    name: 'Duta Sahabat & Inklusi',
    shortName: 'Duta Sahabat',
    icon: 'Smile',
    badgeColor: 'sky',
    focus: 'Penerimaan kawan baru, persahabatan inklusif, tolong-menolong, dan empati sosial.',
    description: 'Duta penjaga kehangatan persahabatan, penyambut murid baru, dan penghubung pertemanan.',
    goals: [
      'Memastikan tidak ada murid yang merasa kesepian, terisolasi, atau terkucilkan.',
      'Menumbuhkan rasa empati dan saling tolong saat kawan sakit atau berduka.',
      'Mendukung program sekolah inklusif yang ramah semua keragaman.'
    ],
    tasks: [
      'Menyambut murid baru di kelas dan memperkenalkan fasilitas sekolah.',
      'Mengajak teman bermain bersama di waktu istirahat tanpa mengotak-kotakkan teman.',
      'Menguatkan budaya tolong-menolong dan peduli pada kawan yang membutuhkan.',
      'Mengedukasi kata-kata ajaib: Tolong, Maaf, Terima Kasih, dan Permisi.'
    ],
    coachName: 'Ibu Sri Rahayu, S.Pd.',
    isActive: true
  }
];

export const initialExtracurriculars: Extracurricular[] = [
  {
    id: 'ekskul_tahfidz',
    code: 'tahfidz',
    name: 'Tahfidz Al-Qur\'an',
    category: 'Keagamaan',
    icon: 'Sparkles',
    badgeColor: 'emerald',
    description: 'Bimbingan hafalan Al-Qur\'an juz 30 dengan metode muroja\'ah berirama yang menyenangkan bagi anak SD.',
    goals: [
      'Menumbuhkan kecintaan terhadap Al-Qur\'an sejak dini.',
      'Mencapai target hafalan Juz 30 (Surah An-Naba s/d An-Nas) dengan makhraj dan tajwid yang tepat.',
      'Membentuk kepribadian qur\'ani yang santun dan berakhlakul karimah.'
    ],
    coachName: 'Ustadz M. Farhan, S.Pd.I.',
    coaches: [
      {
        name: 'Ustadz M. Farhan, S.Pd.I.',
        role: 'Pembina Utama',
        type: 'internal',
        phone: '081298765411'
      }
    ],
    coachPhone: '081298765411',
    dayTimeSchedule: 'Selasa & Kamis, 14.30 - 16.00 WIB',
    location: 'Musholla As-Salam SDN Karanganyar',
    capacity: 35,
    requirements: 'Sudah lancar membaca iqro jilid 4 atau Al-Qur\'an dasar',
    isActive: true
  },
  {
    id: 'ekskul_qiroati',
    code: 'qiroati',
    name: 'Qiro\'ati & Tartil',
    category: 'Keagamaan',
    icon: 'BookOpen',
    badgeColor: 'teal',
    description: 'Pembelajaran baca tulis Al-Qur\'an metode praktis Qiro\'ati dari jilid pemula hingga mahir.',
    goals: [
      'Membaca Al-Qur\'an secara tartil, fasih, dan bertajwid.',
      'Kemandirian murid dalam menulis huruf hijaiyah bersambung.'
    ],
    coachName: 'Ustadzah Fatimah, S.Ag.',
    coaches: [
      {
        name: 'Ustadzah Fatimah, S.Ag.',
        role: 'Pembina Utama',
        type: 'internal',
        phone: '081344556677'
      }
    ],
    coachPhone: '081344556677',
    dayTimeSchedule: 'Senin & Rabu, 14.30 - 15.45 WIB',
    location: 'Ruang Agama Islam',
    capacity: 40,
    isActive: true
  },
  {
    id: 'ekskul_pramuka',
    code: 'pramuka',
    name: 'Gerakan Pramuka (Siaga & Penggalang)',
    category: 'Kepanduan',
    icon: 'Compass',
    badgeColor: 'amber',
    description: 'Pendidikan kepanduan untuk melatih kedisiplinan, kemandirian, cinta alam, dan keterampilan pionering.',
    goals: [
      'Menanamkan Dwisatya, Dwidarma, Trisatya, dan Dasadarma Pramuka.',
      'Mengasah keterampilan tali-temali, sandi, semapur, dan pertolongan pertama.',
      'Menumbuhkan jiwa kepemimpinan dan kerja sama regu.'
    ],
    coachName: 'Kak Eko Prasetyo, S.Pd. & Kak Maya Kusuma, S.Pd.',
    coaches: [
      {
        name: 'Kak Eko Prasetyo, S.Pd.',
        role: 'Pembina Pramuka Putra',
        type: 'internal',
        phone: '085611223344'
      },
      {
        name: 'Kak Maya Kusuma, S.Pd.',
        role: 'Pembina Pramuka Putri',
        type: 'internal',
        phone: '085611223345'
      }
    ],
    coachPhone: '085611223344',
    dayTimeSchedule: 'Jumat, 13.30 - 15.30 WIB',
    location: 'Halaman Utama & Aula Sekolah',
    capacity: 120,
    isActive: true
  },
  {
    id: 'ekskul_tik',
    code: 'tik',
    name: 'TIK & Robotika Sederhana',
    category: 'Teknologi',
    icon: 'Laptop',
    badgeColor: 'cyan',
    description: 'Eksplorasi komputer, pengenalan logika coding anak (Scratch), dan desain grafis dasar.',
    goals: [
      'Menguasai pengetikan cepat 10 jari dan aplikasi perkantoran edukatif.',
      'Membuat game edukasi animasi sederhana menggunakan Scratch.',
      'Mengenal perangkat keras dan logika sensor sederhana.'
    ],
    coachName: 'Bapak Hendra Gunawan, S.Kom. & Kak Rizky Ramadhan, S.Kom.',
    coaches: [
      {
        name: 'Bapak Hendra Gunawan, S.Kom.',
        role: 'Pembina Sekolah',
        type: 'internal',
        phone: '087812345678'
      },
      {
        name: 'Kak Rizky Ramadhan, S.Kom.',
        role: 'Instruktur Robotik & Coding',
        type: 'external',
        organization: 'Lembaga Edukasi Robotik Pasuruan',
        phone: '081233449900'
      }
    ],
    coachPhone: '087812345678',
    dayTimeSchedule: 'Rabu, 14.00 - 15.30 WIB',
    location: 'Laboratorium Komputer & Digital SDN Karanganyar',
    capacity: 25,
    requirements: 'Murid Kelas 3 s/d Kelas 6',
    isActive: true
  },
  {
    id: 'ekskul_batik',
    code: 'batik',
    name: 'Seni Membatik Khas Pasuruan',
    category: 'Seni Budaya',
    icon: 'Palette',
    badgeColor: 'rose',
    description: 'Pelatihan kearifan lokal seni membatik tulis dan jumputan dengan motif khas Kota Pasuruan.',
    goals: [
      'Melestarikan warisan budaya batik khas daerah Kota Pasuruan.',
      'Melatih ketelitian tangan, kesabaran, dan kreativitas pola warna.',
      'Menghasilkan karya taplak, selendang, dan hiasan dinding bernilai seni.'
    ],
    coachName: 'Ibu Ratna Dewi, S.Pd. & Ibu Siti Khodijah',
    coaches: [
      {
        name: 'Ibu Ratna Dewi, S.Pd.',
        role: 'Koordinator Pembina',
        type: 'internal',
        phone: '082155667788'
      },
      {
        name: 'Ibu Siti Khodijah',
        role: 'Instruktur Batik Tulis Tradisional',
        type: 'external',
        organization: 'Paguyuban Batik Karanganyar',
        phone: '081399887766'
      }
    ],
    coachPhone: '082155667788',
    dayTimeSchedule: 'Sabtu, 08.00 - 10.00 WIB',
    location: 'Ruang Prakarya Seni',
    capacity: 25,
    isActive: true
  },
  {
    id: 'ekskul_albanjari',
    code: 'albanjari',
    name: 'Seni Hadrah Albanjari',
    category: 'Seni Budaya',
    icon: 'Music',
    badgeColor: 'purple',
    description: 'Pelatihan ketukan rebana terbang albanjari dan lantunan sholawat nabi yang merdu dan dinamis.',
    goals: [
      'Menguasai ketukan dasar golong, kenceng, dan variasi albanjari.',
      'Menumbuhkan rasa cinta sholawat dan kekompakan tim.',
      'Menyiapkan grup festival albanjari tingkat kota.'
    ],
    coachName: 'Ustadz Ahmad Fauzi, S.Pd. & Kak Syahrul Romadhon',
    coaches: [
      {
        name: 'Ustadz Ahmad Fauzi, S.Pd.',
        role: 'Pembina Utama',
        type: 'internal',
        phone: '085733445566'
      },
      {
        name: 'Kak Syahrul Romadhon',
        role: 'Pelatih Vokal & Tabuhan',
        type: 'external',
        organization: 'Ikatan Seni Hadrah Pasuruan',
        phone: '085811224455'
      }
    ],
    coachPhone: '085733445566',
    dayTimeSchedule: 'Kamis, 15.30 - 17.00 WIB',
    location: 'Aula Karanganyar',
    capacity: 30,
    isActive: true
  },
  {
    id: 'ekskul_atletik',
    code: 'atletik',
    name: 'Atletik & Kebugaran Jasmani',
    category: 'Olahraga',
    icon: 'Activity',
    badgeColor: 'orange',
    description: 'Pembinaan olahraga dasar lari cepat (sprint), estafet, lompat jauh, dan kelincahan motorik kasar.',
    goals: [
      'Meningkatkan kapasitas kardiovaskular dan kebugaran tubuh anak.',
      'Menyiapkan bibit atlet untuk O2SN cabang atletik tingkat kecamatan/kota.',
      'Menanamkan sportivitas dan disiplin berlatih.'
    ],
    coachName: 'Bapak Agus Setiawan, S.Pd. & Bapak Rian Hidayat, S.Pd.Kor.',
    coaches: [
      {
        name: 'Bapak Agus Setiawan, S.Pd.',
        role: 'Pembina Utama',
        type: 'internal',
        phone: '081987654321'
      },
      {
        name: 'Bapak Rian Hidayat, S.Pd.Kor.',
        role: 'Pelatih Teknis & Fisik O2SN',
        type: 'internal',
        phone: '081987654322'
      }
    ],
    coachPhone: '081987654321',
    dayTimeSchedule: 'Selasa & Jumat Pagi, 06.00 - 07.00 WIB',
    location: 'Lapangan Olahraga SDN Karanganyar',
    capacity: 30,
    isActive: true
  },
  {
    id: 'ekskul_seni_tari',
    code: 'seni_tari',
    name: 'Seni Tari Tradisional & Kreasi',
    category: 'Seni Budaya',
    icon: 'Sparkles',
    badgeColor: 'pink',
    description: 'Latihan gerak tari tradisional Jawa Timur (Gandrung, Remo Cilik) dan tari kreasi nusantara.',
    goals: [
      'Melatih kelenturan tubuh, wiraga, wirama, dan wirasa.',
      'Mengisi pentas seni sekolah dan mengikuti ajang FLS2N tari tingkat kota.',
      'Menumbuhkan rasa bangga terhadap seni tari nusantara.'
    ],
    coachName: 'Ibu Dian Safitri, S.Pd. & Kak Dimas Prasetya, S.Sn.',
    coaches: [
      {
        name: 'Ibu Dian Safitri, S.Pd.',
        role: 'Pembina Guru Sekolah',
        type: 'internal',
        phone: '085233112233'
      },
      {
        name: 'Kak Dimas Prasetya, S.Sn.',
        role: 'Instruktur & Koreografer Tari',
        type: 'external',
        organization: 'Sanggar Seni Tari Suropati Pasuruan',
        phone: '085233112299'
      }
    ],
    coachPhone: '085233112233',
    dayTimeSchedule: 'Sabtu, 08.00 - 10.00 WIB',
    location: 'Panggung Terbuka SDN Karanganyar',
    capacity: 25,
    isActive: true
  }
];

export const initialStudents: Student[] = [
  {
    id: 'std_01',
    nisn: '0123456781',
    nis: '4120',
    fullName: 'Ahmad Fauzan Pratama',
    gender: 'L',
    birthPlace: 'Pasuruan',
    birthDate: '2014-04-12',
    classId: 'Kelas 4A',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak Bambang Pratama',
    parentPhone: '081298760001',
    notes: 'Sangat aktif dalam kegiatan kelompok dan memiliki minat tinggi di bidang teknologi dan kepemimpinan.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_02',
    nisn: '0123456782',
    nis: '4121',
    fullName: 'Siti Nurhaliza Zahra',
    gender: 'P',
    birthPlace: 'Pasuruan',
    birthDate: '2014-06-25',
    classId: 'Kelas 4A',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Ibu Anisa',
    parentPhone: '081298760002',
    notes: 'Punya ketertarikan kuat dalam seni tari dan literasi bercerita. Sopan dan telaten.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_03',
    nisn: '0123456783',
    nis: '4122',
    fullName: 'Budi Santoso Wibowo',
    gender: 'L',
    birthPlace: 'Pasuruan',
    birthDate: '2014-02-18',
    classId: 'Kelas 4A',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak Santoso',
    parentPhone: '081298760003',
    notes: 'Sangat peduli kebersihan dan rajin membantu dalam piket kelas.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_04',
    nisn: '0123456784',
    nis: '4123',
    fullName: 'Cantika Putri Lestari',
    gender: 'P',
    birthPlace: 'Surabaya',
    birthDate: '2014-08-09',
    classId: 'Kelas 4B',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak Rudi Lestari',
    parentPhone: '081298760004',
    notes: 'Gemilap dalam membaca puisi dan aktif di dokter kecil UKS.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_05',
    nisn: '0123456785',
    nis: '5080',
    fullName: 'Dimas Aditya Saputra',
    gender: 'L',
    birthPlace: 'Pasuruan',
    birthDate: '2013-11-03',
    classId: 'Kelas 5A',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak Agus Saputra',
    parentPhone: '081298760005',
    notes: 'Memiliki bakat hafalan Al-Qur\'an dan pukulan terbang Albanjari yang berirama rapi.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_06',
    nisn: '0123456786',
    nis: '5081',
    fullName: 'Farah Nabila Azzahra',
    gender: 'P',
    birthPlace: 'Malang',
    birthDate: '2013-05-14',
    classId: 'Kelas 5A',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak M. Zainuddin',
    parentPhone: '081298760006',
    notes: 'Kreatif membuat motif canting batik jumputan dan aktif di mading sekolah.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_07',
    nisn: '0123456787',
    nis: '5082',
    fullName: 'Gilang Pratama Yudha',
    gender: 'L',
    birthPlace: 'Pasuruan',
    birthDate: '2013-09-20',
    classId: 'Kelas 5B',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak Yudha',
    parentPhone: '081298760007',
    notes: 'Pelari cepat yang tekun, senang bermain sepak bola dan atletik sprint.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_08',
    nisn: '0123456788',
    nis: '5083',
    fullName: 'Hani Maulida Kusuma',
    gender: 'P',
    birthPlace: 'Pasuruan',
    birthDate: '2013-12-30',
    classId: 'Kelas 5B',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Ibu Kusuma',
    parentPhone: '081298760008',
    notes: 'Ramah dan senang menyambut kawan baru. Sangat cocok sebagai Duta Sahabat.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_09',
    nisn: '0123456789',
    nis: '6010',
    fullName: 'Irfan Maulana Akbar',
    gender: 'L',
    birthPlace: 'Pasuruan',
    birthDate: '2012-07-19',
    classId: 'Kelas 6A',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak Akbar',
    parentPhone: '081298760009',
    notes: 'Ketua regu pramuka yang berwibawa dan teliti.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  },
  {
    id: 'std_10',
    nisn: '0123456790',
    nis: '6011',
    fullName: 'Jasmine Putri Cahyani',
    gender: 'P',
    birthPlace: 'Sidoarjo',
    birthDate: '2012-10-10',
    classId: 'Kelas 6B',
    academicYear: '2024/2025',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    parentName: 'Bapak Cahyani',
    parentPhone: '081298760010',
    notes: 'Juara olimpiade sains dan gemar coding animasi interaktif.',
    createdBy: 'admin_sekar',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2024-07-15T08:00:00Z',
    isDemo: true
  }
];

export const initialStudentInterests: StudentInterest[] = [
  {
    id: 'int_01',
    studentId: 'std_01',
    studentName: 'Ahmad Fauzan Pratama',
    classId: 'Kelas 4A',
    categoryId: 'cat_teknologi',
    categoryName: 'Teknologi dan Digital',
    subcategory: 'Pemrograman Visual Scratch',
    interestLevel: 'sangat_tertarik',
    desiredActivities: ['Membuat game petualangan matematika', 'Belajar desain poster di Canva'],
    notes: 'Ingin membuat permainan kuis tentang satwa nusantara',
    submittedAt: '2024-08-05T09:00:00Z',
    academicYear: '2024/2025',
    semester: 'Genap'
  },
  {
    id: 'int_02',
    studentId: 'std_01',
    studentName: 'Ahmad Fauzan Pratama',
    classId: 'Kelas 4A',
    categoryId: 'cat_kepemimpinan',
    categoryName: 'Kepemimpinan dan Sosial',
    subcategory: 'Kepemimpinan Duta Sekolah',
    interestLevel: 'tertarik',
    desiredActivities: ['Kampanye anti perundungan di kelas bawah'],
    notes: 'Tertarik menjadi penengah yang adil di permainan istirahat',
    submittedAt: '2024-08-05T09:10:00Z',
    academicYear: '2024/2025',
    semester: 'Genap'
  },
  {
    id: 'int_03',
    studentId: 'std_02',
    studentName: 'Siti Nurhaliza Zahra',
    classId: 'Kelas 4A',
    categoryId: 'cat_seni_budaya',
    categoryName: 'Seni dan Budaya',
    subcategory: 'Seni Tari Tradisional',
    interestLevel: 'sangat_tertarik',
    desiredActivities: ['Belajar Tari Remo Cilik Pasuruan', 'Pentas FLS2N'],
    notes: 'Sudah berlatih dasar gerak tari sejak kelas 2 SD',
    submittedAt: '2024-08-06T10:00:00Z',
    academicYear: '2024/2025',
    semester: 'Genap'
  },
  {
    id: 'int_04',
    studentId: 'std_03',
    studentName: 'Budi Santoso Wibowo',
    classId: 'Kelas 4A',
    categoryId: 'cat_kepemimpinan',
    categoryName: 'Kepemimpinan dan Sosial',
    subcategory: 'Aksi Peduli Lingkungan Resik',
    interestLevel: 'sangat_tertarik',
    desiredActivities: ['Pilah botol plastik', 'Membuat kompos daun gugur'],
    notes: 'Senang menata taman dan menyiram tanaman sekolah',
    submittedAt: '2024-08-07T08:30:00Z',
    academicYear: '2024/2025',
    semester: 'Genap'
  },
  {
    id: 'int_05',
    studentId: 'std_05',
    studentName: 'Dimas Aditya Saputra',
    classId: 'Kelas 5A',
    categoryId: 'cat_keagamaan',
    categoryName: 'Keagamaan & Karakter',
    subcategory: 'Tahfidz Juz Amma (Juz 30)',
    interestLevel: 'sangat_tertarik',
    desiredActivities: ['Murojaah harian bersama ustadz', 'Ikut lomba tartil kota'],
    notes: 'Sudah hafal 18 surah juz 30 dengan tartil',
    submittedAt: '2024-08-08T09:30:00Z',
    academicYear: '2024/2025',
    semester: 'Genap'
  }
];

export const initialTeacherObservations: TeacherObservation[] = [
  {
    id: 'obs_01',
    studentId: 'std_01',
    studentName: 'Ahmad Fauzan Pratama',
    classId: 'Kelas 4A',
    teacherId: 'user_guru_4a',
    teacherName: 'Ibu Ratna Dewi, S.Pd.',
    observationNotes: 'Fauzan menunjukkan rasa ingin tahu yang tinggi dalam pengenalan teknologi. Ia senang membimbing temannya saat tugas kelompok.',
    talentRecommendations: ['TIK & Coding Scratch', 'Duta TPPK / Kepemimpinan Kelas'],
    characterGrowthNotes: 'Tumbuh menjadi anak yang berani menyampaikan pendapat santun dan mau mendengarkan kawan.',
    observedDate: '2024-09-10',
    academicYear: '2024/2025',
    semester: 'Genap',
    createdAt: '2024-09-10T11:00:00Z'
  },
  {
    id: 'obs_02',
    studentId: 'std_02',
    studentName: 'Siti Nurhaliza Zahra',
    classId: 'Kelas 4A',
    teacherId: 'user_guru_4a',
    teacherName: 'Ibu Ratna Dewi, S.Pd.',
    observationNotes: 'Nurhaliza memiliki koordinasi gerak yang sangat lentur dan ekspresif. Dalam literasi, ia senang merangkum cerita dongeng rakyat.',
    talentRecommendations: ['Seni Tari Tradisional', 'Literasi & Storytelling'],
    characterGrowthNotes: 'Disiplin dan bertanggung jawab terhadap tugas mandiri maupun kelompok.',
    observedDate: '2024-09-12',
    academicYear: '2024/2025',
    semester: 'Genap',
    createdAt: '2024-09-12T10:00:00Z'
  }
];

export const initialAmbassadorMembers: AmbassadorMember[] = [
  {
    id: 'amb_mem_01',
    studentId: 'std_01',
    studentName: 'Ahmad Fauzan Pratama',
    studentNis: '4120',
    classId: 'Kelas 4A',
    ambassadorTypeId: 'duta_tppk',
    ambassadorTypeCode: 'duta_tppk',
    ambassadorTypeName: 'Duta TPPK',
    assignedYear: '2024/2025',
    startDate: '2024-08-01',
    coachId: 'user_pembina_tppk',
    coachName: 'Bapak Ahmad Fauzi, S.Pd.',
    status: 'aktif',
    roleTitle: 'Koordinator Kampanye Ramah Teman Kelas 4',
    reflectionNotes: 'Saya senang bisa mengajak teman sekelas untuk tidak saling mengejek nama panggilan.',
    contributionsCount: 4,
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'amb_mem_02',
    studentId: 'std_03',
    studentName: 'Budi Santoso Wibowo',
    studentNis: '4122',
    classId: 'Kelas 4A',
    ambassadorTypeId: 'duta_lingkungan',
    ambassadorTypeCode: 'duta_lingkungan',
    ambassadorTypeName: 'Duta Lingkungan',
    assignedYear: '2024/2025',
    startDate: '2024-08-01',
    coachName: 'Ibu Nurul Hidayah, S.Pd.',
    status: 'aktif',
    roleTitle: 'Pelopor Pilah Sampah & Sabtu Resik',
    reflectionNotes: 'Teman-teman kelas 4A sekarang sudah mulai tertib memasukkan plastik ke tempat sampah kuning.',
    contributionsCount: 6,
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'amb_mem_03',
    studentId: 'std_02',
    studentName: 'Siti Nurhaliza Zahra',
    studentNis: '4121',
    classId: 'Kelas 4A',
    ambassadorTypeId: 'duta_literasi',
    ambassadorTypeCode: 'duta_literasi',
    ambassadorTypeName: 'Duta Literasi',
    assignedYear: '2024/2025',
    startDate: '2024-08-01',
    coachName: 'Ibu Tri Wahyuni, S.Pd.',
    status: 'aktif',
    roleTitle: 'Pengelola Pojok Baca & Pohon Literasi',
    reflectionNotes: 'Senang saat melihat teman-teman antre membaca buku cerita bergambar di pojok kelas.',
    contributionsCount: 5,
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'amb_mem_04',
    studentId: 'std_04',
    studentName: 'Cantika Putri Lestari',
    studentNis: '4123',
    classId: 'Kelas 4B',
    ambassadorTypeId: 'duta_kesehatan',
    ambassadorTypeCode: 'duta_kesehatan',
    ambassadorTypeName: 'Duta Kesehatan',
    assignedYear: '2024/2025',
    startDate: '2024-08-01',
    coachName: 'Ibu Dian Safitri, S.Pd.',
    status: 'aktif',
    roleTitle: 'Dokter Kecil UKS & Kampanye CTPS',
    reflectionNotes: 'Membantu mengobati luka kecil teman yang terjatuh saat main kejar-kejaran.',
    contributionsCount: 4,
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'amb_mem_05',
    studentId: 'std_08',
    studentName: 'Hani Maulida Kusuma',
    studentNis: '5083',
    classId: 'Kelas 5B',
    ambassadorTypeId: 'duta_sahabat',
    ambassadorTypeCode: 'duta_sahabat',
    ambassadorTypeName: 'Duta Sahabat',
    assignedYear: '2024/2025',
    startDate: '2024-08-01',
    coachName: 'Ibu Sri Rahayu, S.Pd.',
    status: 'aktif',
    roleTitle: 'Penyambut Kawan & Fasilitator Main Bersama',
    reflectionNotes: 'Semua teman adalah sahabat berharga, tidak boleh ada yang duduk sendirian saat jam istirahat.',
    contributionsCount: 5,
    createdAt: '2024-08-01T08:00:00Z'
  }
];

export const initialAmbassadorPrograms: AmbassadorProgram[] = [
  {
    id: 'prog_01',
    ambassadorTypeId: 'duta_tppk',
    ambassadorTypeName: 'Duta TPPK',
    title: 'Gerakan Sahabat Ramah Karanganyar (Anti-Bullying Campaign)',
    description: 'Pembuatan poster mading kreatif dan deklarasi cap tangan komitmen persahabatan di seluruh kelas 1-6.',
    targetAudience: 'Seluruh Murid Kelas 1 s/d Kelas 6 SDN Karanganyar',
    period: 'Semester Genap 2024/2025',
    status: 'berjalan',
    coachName: 'Bapak Ahmad Fauzi, S.Pd.',
    createdAt: '2024-08-10T08:00:00Z'
  },
  {
    id: 'prog_02',
    ambassadorTypeId: 'duta_lingkungan',
    ambassadorTypeName: 'Duta Lingkungan',
    title: 'Aksi Sabtu Resik & Sedekah Sampah Plastik',
    description: 'Kegiatan gotong royong 30 menit setiap Sabtu pagi untuk pemilahan botol plastik dan perawatan pot bunga.',
    targetAudience: 'Warga Sekolah dan Penjaga Kantin',
    period: 'Setiap Pekan Semester Genap 2024/2025',
    status: 'berjalan',
    coachName: 'Ibu Nurul Hidayah, S.Pd.',
    createdAt: '2024-08-12T08:00:00Z'
  },
  {
    id: 'prog_03',
    ambassadorTypeId: 'duta_literasi',
    ambassadorTypeName: 'Duta Literasi',
    title: 'Pohon Gelembung Kata (Pojok Baca Inspiratif)',
    description: 'Setiap anak yang menyelesaikan 1 buku cerita menempelkan daun origami bertuliskan pesan moral di pohon mading kelas.',
    targetAudience: 'Murid Kelas 1 - 6',
    period: 'Semester Genap 2024/2025',
    status: 'berjalan',
    coachName: 'Ibu Tri Wahyuni, S.Pd.',
    createdAt: '2024-08-15T08:00:00Z'
  }
];

export const initialExtracurricularMembers: ExtracurricularMember[] = [
  {
    id: 'ext_mem_01',
    extracurricularId: 'ekskul_tik',
    extracurricularName: 'TIK & Robotika Sederhana',
    studentId: 'std_01',
    studentName: 'Ahmad Fauzan Pratama',
    studentNis: '4120',
    classId: 'Kelas 4A',
    joinedAt: '2024-08-01',
    status: 'aktif',
    attendancePercentage: 95,
    coachNotes: 'Sangat cepat memahami konsep perulangan (loops) dalam blok kode Scratch.',
    grade: 'Sangat Baik',
    reportDescription: 'Ahmad Fauzan Pratama sangat aktif dan bersemangat mengikuti latihan TIK & Robotika Sederhana, menunjukkan penguasaan pembuatan animasi Scratch serta disiplin yang sangat baik.',
    academicYear: '2024/2025',
    semester: 'Genap',
    evaluatedBy: 'Bapak Hendra Gunawan, S.Kom.',
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'ext_mem_02',
    extracurricularId: 'ekskul_seni_tari',
    extracurricularName: 'Seni Tari Tradisional & Kreasi',
    studentId: 'std_02',
    studentName: 'Siti Nurhaliza Zahra',
    studentNis: '4121',
    classId: 'Kelas 4A',
    joinedAt: '2024-08-01',
    status: 'aktif',
    attendancePercentage: 100,
    coachNotes: 'Hafalan gerak tari Remo cilik sangat mantap dan berkarakter.',
    grade: 'Sangat Baik',
    reportDescription: 'Siti Nurhaliza Zahra sangat aktif dan tekun dalam mengikuti latihan Seni Tari Tradisional, menguasai wiraga dan wirama Tari Remo Cilik Pasuruan dengan sangat memuaskan.',
    academicYear: '2024/2025',
    semester: 'Genap',
    evaluatedBy: 'Ibu Ratna Dewi, S.Pd.',
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'ext_mem_03',
    extracurricularId: 'ekskul_pramuka',
    extracurricularName: 'Gerakan Pramuka',
    studentId: 'std_03',
    studentName: 'Budi Santoso Wibowo',
    studentNis: '4122',
    classId: 'Kelas 4A',
    joinedAt: '2024-08-01',
    status: 'aktif',
    attendancePercentage: 90,
    coachNotes: 'Anggota Siaga yang cekatan dan bersemangat dalam permainan regu.',
    grade: 'Baik',
    reportDescription: 'Budi Santoso Wibowo aktif mengikuti kegiatan Gerakan Pramuka dan mampu menguasai keterampilan tali-temali serta kerja sama regu dengan baik.',
    academicYear: '2024/2025',
    semester: 'Genap',
    evaluatedBy: 'Kak Eko Prasetyo, S.Pd.',
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'ext_mem_04',
    extracurricularId: 'ekskul_tahfidz',
    extracurricularName: 'Tahfidz Al-Qur\'an',
    studentId: 'std_05',
    studentName: 'Dimas Aditya Saputra',
    studentNis: '5080',
    classId: 'Kelas 5A',
    joinedAt: '2024-08-01',
    status: 'aktif',
    attendancePercentage: 100,
    coachNotes: 'Makhraj huruf fasih dan hafalan surah An-Naba sangat lancar.',
    grade: 'Sangat Baik',
    reportDescription: 'Dimas Aditya Saputra sangat tekun dan fasih dalam bimbingan Tahfidz Al-Qur\'an, berhasil menuntaskan hafalan Juz 30 dengan tajwid yang sangat baik.',
    academicYear: '2024/2025',
    semester: 'Genap',
    evaluatedBy: 'Ustadz M. Farhan, S.Pd.I.',
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'ext_mem_05',
    extracurricularId: 'ekskul_batik',
    extracurricularName: 'Seni Membatik Khas Pasuruan',
    studentId: 'std_06',
    studentName: 'Farah Nabila Azzahra',
    studentNis: '5081',
    classId: 'Kelas 5A',
    joinedAt: '2024-08-01',
    status: 'aktif',
    attendancePercentage: 95,
    coachNotes: 'Goresan malam canting halus dan mampu memadukan warna cerah.',
    grade: 'Sangat Baik',
    reportDescription: 'Farah Nabila Azzahra sangat terampil dalam membatik tulis dan jumputan motif Pasuruan, menunjukkan ketelitian dan kreativitas seni yang tinggi.',
    academicYear: '2024/2025',
    semester: 'Genap',
    evaluatedBy: 'Ibu Ratna Dewi, S.Pd.',
    createdAt: '2024-08-01T08:00:00Z'
  },
  {
    id: 'ext_mem_06',
    extracurricularId: 'ekskul_atletik',
    extracurricularName: 'Atletik & Kebugaran Jasmani',
    studentId: 'std_07',
    studentName: 'Gilang Pratama Yudha',
    studentNis: '5082',
    classId: 'Kelas 5B',
    joinedAt: '2024-08-01',
    status: 'aktif',
    attendancePercentage: 92,
    coachNotes: 'Kecepatan lari sprint 60 meter sangat potensial untuk O2SN.',
    grade: 'Baik',
    reportDescription: 'Gilang Pratama Yudha aktif dan disiplin dalam berlatih Atletik & Kebugaran Jasmani, menunjukkan peningkatan teknik lari sprint yang baik.',
    academicYear: '2024/2025',
    semester: 'Genap',
    evaluatedBy: 'Bapak Agus Setiawan, S.Pd.',
    createdAt: '2024-08-01T08:00:00Z'
  }
];

export const initialActivities: Activity[] = [
  {
    id: 'act_01',
    title: 'Eksplorasi Proyek Coding Scratch: Game Kuis Satwa Nusantara',
    type: 'ekstrakurikuler',
    referenceId: 'ekskul_tik',
    referenceName: 'TIK & Robotika Sederhana',
    personInCharge: 'Bapak Hendra Gunawan, S.Kom.',
    description: 'Pertemuan praktik membuat variabel skor dan interaksi tombol menggunakan Sprite Scratch.',
    objectives: 'Murid memahami dasar logika variabel dan animasi interaktif sederhana.',
    dateTime: '2024-10-16 14:00',
    timeString: '14.00 - 15.30 WIB',
    location: 'Laboratorium Komputer',
    participantsCount: 22,
    status: 'selesai',
    documentationUrls: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'],
    outcomeNotes: '20 dari 22 murid berhasil menyelesaikan game mini dengan 3 pertanyaan bergambar.',
    reflectionNotes: 'Murid sangat antusias saat karyanya dicoba oleh teman sebangku.',
    createdBy: 'user_pembina_tppk',
    createdAt: '2024-10-16T16:00:00Z',
    updatedAt: '2024-10-16T16:00:00Z'
  },
  {
    id: 'act_02',
    title: 'Aksi Kampanye Teman Sebaya: Stop Ejekan & Rangkul Teman',
    type: 'duta',
    referenceId: 'duta_tppk',
    referenceName: 'Duta TPPK',
    personInCharge: 'Bapak Ahmad Fauzi, S.Pd.',
    description: 'Penyampaian pesan santun berteman pada sesi apel pagi dan pemasangan stiker ramah anak di tiap pintu kelas.',
    objectives: 'Menumbuhkan kesadaran bahwa kata-kata positif menciptakan rasa aman di sekolah.',
    dateTime: '2024-10-21 07:00',
    timeString: '07.00 - 08.00 WIB',
    location: 'Halaman Utama Sekolah',
    participantsCount: 180,
    status: 'selesai',
    documentationUrls: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80'],
    outcomeNotes: 'Duta TPPK tampil percaya diri membacakan Deklarasi Sahabat Bahagia.',
    reflectionNotes: 'Perlu pendampingan intonasi suara agar terdengar bersahabat dan tidak menggurui.',
    createdBy: 'user_pembina_tppk',
    createdAt: '2024-10-21T09:00:00Z',
    updatedAt: '2024-10-21T09:00:00Z'
  },
  {
    id: 'act_03',
    title: 'Latihan Gabungan Tari Remo Cilik & Tari Saman Kreasi',
    type: 'ekstrakurikuler',
    referenceId: 'ekskul_seni_tari',
    referenceName: 'Seni Tari Tradisional & Kreasi',
    personInCharge: 'Ibu Dian Safitri, S.Pd.',
    description: 'Pemantapan wirama dan keseragaman hentakan kaki bersama pengiring gending mini.',
    objectives: 'Penyelarasan tempo dan ekspresi wajah penari cilik.',
    dateTime: '2024-10-26 08:00',
    timeString: '08.00 - 10.00 WIB',
    location: 'Panggung Terbuka Sekolah',
    participantsCount: 24,
    status: 'selesai',
    documentationUrls: ['https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop&q=80'],
    outcomeNotes: 'Formasi silang dan pola lantai diagonal sudah terkuasai 90%.',
    createdBy: 'user_guru_4a',
    createdAt: '2024-10-26T11:00:00Z',
    updatedAt: '2024-10-26T11:00:00Z'
  },
  {
    id: 'act_04',
    title: 'Festival Gelar Karya & Pameran Talenta Karanganyar 2024',
    type: 'sekolah',
    referenceId: 'sekolah_karanganyar',
    referenceName: 'Kegiatan Sekolah Terpadu',
    personInCharge: 'H. Sudarsono, S.Pd., M.M.',
    description: 'Pentas seni, pameran hasil membatik, unjuk karya digital Scratch, dan bazar kewirausahaan ramah lingkungan.',
    objectives: 'Mengapresiasi seluruh potensi dan karya murid tanpa pemeringkatan ranking yang membebani.',
    dateTime: '2024-11-20 08:00',
    timeString: '08.00 - 12.30 WIB',
    location: 'Seluruh Area Sekolah UPT SDN Karanganyar',
    participantsCount: 250,
    status: 'rencana',
    documentationUrls: [],
    createdBy: 'user_super_admin',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2024-10-01T08:00:00Z'
  }
];

export const initialAttendanceSessions: AttendanceSession[] = [
  {
    id: 'att_01',
    activityId: 'act_01',
    activityTitle: 'Eksplorasi Proyek Coding Scratch: Game Kuis Satwa Nusantara',
    date: '2024-10-16',
    referenceType: 'ekstrakurikuler',
    referenceId: 'ekskul_tik',
    referenceName: 'TIK & Robotika Sederhana',
    records: [
      { studentId: 'std_01', studentName: 'Ahmad Fauzan Pratama', classId: 'Kelas 4A', status: 'hadir', notes: 'Sangat aktif' },
      { studentId: 'std_03', studentName: 'Budi Santoso Wibowo', classId: 'Kelas 4A', status: 'hadir' },
      { studentId: 'std_10', studentName: 'Jasmine Putri Cahyani', classId: 'Kelas 6B', status: 'hadir', notes: 'Menyelesaikan modul bonus' }
    ],
    recordedBy: 'Bapak Hendra Gunawan, S.Kom.',
    recordedAt: '2024-10-16T15:30:00Z'
  },
  {
    id: 'att_02',
    activityId: 'act_03',
    activityTitle: 'Latihan Gabungan Tari Remo Cilik',
    date: '2024-10-26',
    referenceType: 'ekstrakurikuler',
    referenceId: 'ekskul_seni_tari',
    referenceName: 'Seni Tari Tradisional & Kreasi',
    records: [
      { studentId: 'std_02', studentName: 'Siti Nurhaliza Zahra', classId: 'Kelas 4A', status: 'hadir', notes: 'Lengkap dan tepat waktu' },
      { studentId: 'std_04', studentName: 'Cantika Putri Lestari', classId: 'Kelas 4B', status: 'hadir' }
    ],
    recordedBy: 'Ibu Dian Safitri, S.Pd.',
    recordedAt: '2024-10-26T10:00:00Z'
  }
];

export const initialPortfolios: Portfolio[] = [
  {
    id: 'port_01',
    studentId: 'std_01',
    studentName: 'Ahmad Fauzan Pratama',
    classId: 'Kelas 4A',
    title: 'Game Edukasi Scratch: Petualangan Menjelajah Fauna Jawa Timur',
    description: 'Karya pemrograman visual animasi interaktif tentang habitat satwa langka seperti Banteng Baluran dan Rusa Bawean.',
    category: 'karya',
    date: '2024-10-16',
    mediaUrls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'],
    coachOrTeacherName: 'Bapak Hendra Gunawan, S.Kom.',
    reflection: 'Saya belajar bagaimana membuat sprite bergerak dengan tombol keyboard dan menyisipkan suara burung asli.',
    isVerified: true,
    verifiedBy: 'Ibu Ratna Dewi, S.Pd.',
    verifiedAt: '2024-10-17T09:00:00Z',
    tags: ['Scratch', 'Teknologi', 'Game Edukasi', 'Fauna'],
    createdAt: '2024-10-16T17:00:00Z'
  },
  {
    id: 'port_02',
    studentId: 'std_02',
    studentName: 'Siti Nurhaliza Zahra',
    classId: 'Kelas 4A',
    title: 'Penampilan Tari Remo Gagrak Cilik pada Peringatan Hari Pahlawan',
    description: 'Pementasan tari pembuka dengan kostum sampur merah dan gelang kaki lonceng khas Jawa Timur.',
    category: 'kontribusi_duta',
    date: '2024-10-26',
    mediaUrls: ['https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop&q=80'],
    coachOrTeacherName: 'Ibu Dian Safitri, S.Pd.',
    reflection: 'Awalnya deg-degan di depan panggung, tapi senang sekali saat semua bapak ibu guru bertepuk tangan meriah.',
    isVerified: true,
    verifiedBy: 'Ibu Ratna Dewi, S.Pd.',
    verifiedAt: '2024-10-27T08:30:00Z',
    tags: ['Seni Tari', 'Remo Cilik', 'Budaya Jawa Timur', 'Pentas'],
    createdAt: '2024-10-26T12:00:00Z'
  },
  {
    id: 'port_03',
    studentId: 'std_06',
    studentName: 'Farah Nabila Azzahra',
    classId: 'Kelas 5A',
    title: 'Kain Batik Tulis Motif Daun Sirih & Bunga Melati Karanganyar',
    description: 'Karya batik canting lilin dengan perwarnaan alami ramah lingkungan ukuran taplak meja 80x80 cm.',
    category: 'karya',
    date: '2024-09-28',
    mediaUrls: ['https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&auto=format&fit=crop&q=80'],
    coachOrTeacherName: 'Ibu Ratna Dewi, S.Pd.',
    reflection: 'Belajar meniup canting agar lilin tidak menetes sembarangan di atas kain mori.',
    isVerified: true,
    verifiedBy: 'H. Sudarsono, S.Pd., M.M.',
    verifiedAt: '2024-09-30T10:00:00Z',
    tags: ['Batik', 'Seni Rupa', 'Prakarya', 'Kearifan Lokal'],
    createdAt: '2024-09-28T14:00:00Z'
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach_01',
    studentId: 'std_02',
    studentName: 'Siti Nurhaliza Zahra',
    classId: 'Kelas 4A',
    title: 'Juara 1 Lomba Seni Tari Kreasi Tradisional SD Tingkat Kota Pasuruan',
    eventName: 'Festival dan Lomba Seni Siswa Nasional (FLS2N) Kota Pasuruan',
    level: 'kota',
    category: 'Seni Tari',
    rank: 'Juara 1',
    date: '2024-05-18',
    coachName: 'Ibu Dian Safitri, S.Pd.',
    notes: 'Mewakili kontingen Kota Pasuruan ke tingkat Provinsi Jawa Timur.',
    createdAt: '2024-05-20T08:00:00Z'
  },
  {
    id: 'ach_02',
    studentId: 'std_05',
    studentName: 'Dimas Aditya Saputra',
    classId: 'Kelas 5A',
    title: 'Juara 2 Festival Hadrah Albanjari Anak Sholeh se-Pasuruan Raya',
    eventName: 'Pekan Maulid Nabi & Kreasi Seni Santri Cilik',
    level: 'kota',
    category: 'Seni Musik Keagamaan',
    rank: 'Juara 2',
    date: '2024-09-15',
    coachName: 'Ustadz Ahmad Fauzi, S.Pd.',
    notes: 'Tim Albanjari UPT SDN Karanganyar meraih nilai harmonisasi terbaik.',
    createdAt: '2024-09-16T09:00:00Z'
  },
  {
    id: 'ach_03',
    studentId: 'std_07',
    studentName: 'Gilang Pratama Yudha',
    classId: 'Kelas 5B',
    title: 'Juara 1 Lari Cepat 60 Meter Putra O2SN Kecamatan Panggungrejo',
    eventName: 'Olimpiade Olahraga Siswa Nasional (O2SN)',
    level: 'kecamatan',
    category: 'Atletik',
    rank: 'Juara 1',
    date: '2024-04-22',
    coachName: 'Bapak Agus Setiawan, S.Pd.',
    notes: 'Catatan waktu rekor 8,42 detik di tingkat kecamatan.',
    createdAt: '2024-04-23T08:00:00Z'
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann_01',
    title: 'Penerimaan Anggota Duta SEKAR MELATI Periode Baru 2024/2025',
    category: 'duta',
    content: 'Pendaftaran terbuka untuk seluruh murid Kelas 3 s/d 5 yang bersemangat menjadi Duta TPPK, Duta Lingkungan, Duta Literasi, Duta Kesehatan, Duta Digital, atau Duta Sahabat. Hubungi wali kelas masing-masing.',
    targetAudience: 'murid',
    isPublished: true,
    publishedAt: '2024-08-01',
    authorName: 'Indartha Meiputra, S.Pd.',
    authorRole: 'Admin Sekolah',
    important: true
  },
  {
    id: 'ann_02',
    title: 'Jadwal Mulai Ekstrakurikuler Semester Genap',
    category: 'ekskul',
    content: 'Seluruh kegiatan ekstrakurikuler (Tahfidz, Qiroati, Pramuka, TIK, Batik, Albanjari, Atletik, Seni Tari) akan aktif serentak mulai pekan depan. Pastikan membawa perlengkapan sesuai bidang masing-masing.',
    targetAudience: 'semua',
    isPublished: true,
    publishedAt: '2024-08-05',
    authorName: 'H. Sudarsono, S.Pd., M.M.',
    authorRole: 'Kepala Sekolah',
    important: false
  },
  {
    id: 'ann_03',
    title: 'Sosialisasi Pencegahan Perundungan & Deklarasi Sekolah Ramah Anak',
    category: 'umum',
    content: 'Kegiatan apel gabungan dan penandatanganan komitmen bersama anti perundungan oleh guru, perwakilan komite, dan murid.',
    targetAudience: 'semua',
    isPublished: true,
    publishedAt: '2024-09-01',
    authorName: 'Bapak Ahmad Fauzi, S.Pd.',
    authorRole: 'Pembina TPPK',
    important: true
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_01',
    userId: 'user_super_admin',
    userName: 'Indartha Meiputra, S.Pd.',
    userRole: 'super_admin',
    action: 'CREATE',
    entityType: 'Student',
    entityId: 'std_01',
    details: 'Menambahkan data murid Ahmad Fauzan Pratama (Kelas 4A)',
    timestamp: '2024-07-15T08:00:00Z'
  },
  {
    id: 'log_02',
    userId: 'user_guru_4a',
    userName: 'Ibu Ratna Dewi, S.Pd.',
    userRole: 'guru_kelas',
    action: 'VERIFY',
    entityType: 'Portfolio',
    entityId: 'port_01',
    details: 'Memverifikasi portofolio Game Scratch murid Ahmad Fauzan Pratama',
    timestamp: '2024-10-17T09:00:00Z'
  },
  {
    id: 'log_03',
    userId: 'user_pembina_tppk',
    userName: 'Bapak Ahmad Fauzi, S.Pd.',
    userRole: 'pembina',
    action: 'CREATE',
    entityType: 'Activity',
    entityId: 'act_02',
    details: 'Membuat agenda kegiatan Kampanye Ramah Teman Duta TPPK',
    timestamp: '2024-10-21T09:00:00Z'
  }
];
