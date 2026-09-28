# Security Specification - SEKAR TALENTA

## 1. Data Invariants
1. A Student record cannot exist without valid NISN, NIS, Full Name, and Class assignment.
2. User profile records are bound to authentication UIDs. Roles can only be assigned or mutated by Super Admin.
3. Students can only read and edit their own interest exploration and view their own portfolios and activity participation.
4. Homeroom teachers (Guru Kelas) have access to their assigned class records.
5. Co-curricular mentors/coaches (Pembina) manage members, programs, and attendance within their assigned domain.
6. Bullying/TPPK incident reports are strictly isolated and not accessible by student ambassadors or unassigned roles.
7. Admin and Principal (Kepala Sekolah) have institutional read access for holistic reporting and analytics.

## 2. Test Runner and Rules Verification
Firestore security rules enforce strict authentication, role verification, field boundaries, and prevent unauthorized client writes.
