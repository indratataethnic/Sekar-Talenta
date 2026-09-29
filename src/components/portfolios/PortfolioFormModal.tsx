import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Portfolio, PortfolioCategory, Student } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StudentSelector } from '../common/StudentSelector';

interface PortfolioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioToEdit?: Portfolio | null;
}

export const PortfolioFormModal: React.FC<PortfolioFormModalProps> = ({
  isOpen,
  onClose,
  portfolioToEdit,
}) => {
  const { students, addPortfolio, updatePortfolio } = useData();
  const { currentUser, isMurid } = useAuth();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PortfolioCategory>('karya');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reflection, setReflection] = useState('');
  const [coachOrTeacherName, setCoachOrTeacherName] = useState(currentUser?.displayName || 'Guru Pembina');
  const [tagsText, setTagsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (portfolioToEdit) {
      setSelectedStudentId(portfolioToEdit.studentId);
      setTitle(portfolioToEdit.title);
      setCategory(portfolioToEdit.category || 'karya');
      setDescription(portfolioToEdit.description || '');
      setDate(portfolioToEdit.date || new Date().toISOString().split('T')[0]);
      setReflection(portfolioToEdit.reflection || '');
      setCoachOrTeacherName(portfolioToEdit.coachOrTeacherName || currentUser?.displayName || 'Guru Pembina');
      setTagsText(portfolioToEdit.tags?.join(', ') || '');
    } else {
      setSelectedStudentId(isMurid ? currentUser?.studentId || students[0]?.id || '' : students[0]?.id || '');
      setTitle('');
      setCategory('karya');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setReflection('');
      setCoachOrTeacherName(currentUser?.displayName || 'Guru Pembina');
      setTagsText('');
    }
  }, [portfolioToEdit, isOpen, isMurid, currentUser, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student || !title.trim()) return;

    setIsSubmitting(true);
    try {
      if (portfolioToEdit) {
        await updatePortfolio(portfolioToEdit.id, {
          title,
          category,
          description,
          date,
          reflection,
          coachOrTeacherName,
          tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean)
        });
      } else {
        await addPortfolio({
          studentId: student.id,
          studentName: student.fullName,
          classId: student.classId,
          title,
          category,
          description,
          date,
          mediaUrls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'],
          coachOrTeacherName,
          reflection,
          isVerified: !isMurid, // Auto verify if uploaded by teacher, pending if student
          verifiedBy: !isMurid ? currentUser?.displayName : undefined,
          verifiedAt: !isMurid ? new Date().toISOString() : undefined,
          tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean)
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={portfolioToEdit ? 'Edit Portofolio Murid' : 'Tambah Karya / Portofolio Baru'}
      subtitle="Dokumentasikan rekam jejak hasil karya, aksi, dan refleksi murid"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isMurid ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Murid Pemilik Karya
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
              {students.find((s) => s.id === selectedStudentId)?.fullName || 'Murid'} ({students.find((s) => s.id === selectedStudentId)?.classId})
            </div>
          </div>
        ) : (
          <StudentSelector
            selectedStudentId={selectedStudentId}
            onSelectStudent={(st: Student) => setSelectedStudentId(st.id)}
            label="Nama Murid Pemilik Karya (Cari Berdasarkan Kelas / Nama)"
            required
          />
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Judul Karya / Proyek / Aksi *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Game Edukasi Scratch / Taplak Meja Motif Batik Karanganyar"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Portofolio *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="karya">Karya Kreatif & Seni</option>
              <option value="proyek">Proyek Belajar</option>
              <option value="kepemimpinan">Pengalaman Kepemimpinan</option>
              <option value="kontribusi_duta">Kontribusi Duta Sekolah</option>
              <option value="ekstrakurikuler">Hasil Kegiatan Ekstrakurikuler</option>
              <option value="prestasi_akademik">Prestasi Akademik</option>
              <option value="prestasi_nonakademik">Prestasi Nonakademik</option>
              <option value="refleksi_diri">Refleksi & Pengembangan Diri</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Karya</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Karya / Aksi:</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan proses pembuatan atau aksi yang dilakukan..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Refleksi Murid (Pelajaran berharga yang didapatkan):
          </label>
          <textarea
            rows={2}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Apa perasaan murid saat membuat ini dan apa hal baru yang dipelajari?"
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Guru / Pembina Pendamping</label>
            <input
              type="text"
              value={coachOrTeacherName}
              onChange={(e) => setCoachOrTeacherName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tag / Kata Kunci (pisahkan koma)</label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Batik, Scratch, Seni Tari, Duta TPPK"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Portofolio'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
