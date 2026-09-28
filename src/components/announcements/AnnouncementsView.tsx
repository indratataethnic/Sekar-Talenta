import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit2,
  Tag,
  Pin,
  Sparkles
} from 'lucide-react';
import { Announcement } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AnnouncementsView: React.FC = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const { isSuperAdmin, isKepalaSekolah, currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [deletingAnnId, setDeletingAnnId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'duta' | 'ekskul' | 'jadwal' | 'umum'>('umum');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'semua' | 'murid' | 'guru' | 'duta' | 'ekskul'>('semua');
  const [important, setImportant] = useState(false);

  const canManageAnnouncements = isSuperAdmin || isKepalaSekolah;

  const handleOpenCreate = () => {
    setEditingAnn(null);
    setTitle('');
    setCategory('umum');
    setContent('');
    setTargetAudience('semua');
    setImportant(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setCategory(ann.category);
    setContent(ann.content);
    setTargetAudience(ann.targetAudience);
    setImportant(!!ann.important);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingAnn) {
      await updateAnnouncement(editingAnn.id, {
        title,
        category,
        content,
        targetAudience,
        important
      });
    } else {
      await addAnnouncement({
        title,
        category,
        content,
        targetAudience,
        isPublished: true,
        publishedAt: new Date().toISOString().split('T')[0],
        authorName: currentUser?.displayName || 'Admin Sekolah',
        authorRole: currentUser?.role?.replace('_', ' ').toUpperCase() || 'PENGELOLA',
        important
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            Papan Pengumuman & Notifikasi Sekolah
          </h2>
          <p className="text-xs text-slate-500">
            Informasi pembukaan Duta Sekolah, jadwal ekstrakurikuler, dan kegiatan resmi UPT SDN Karanganyar.
          </p>
        </div>

        {canManageAnnouncements && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" /> Buat Pengumuman Baru
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 text-xs">
            Belum ada pengumuman aktif saat ini.
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card
              key={ann.id}
              className={`p-6 border-l-4 transition-all ${
                ann.important
                  ? 'border-l-amber-500 bg-amber-50/20'
                  : 'border-l-emerald-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      ann.category === 'duta'
                        ? 'purple'
                        : ann.category === 'ekskul'
                        ? 'blue'
                        : 'amber'
                    }
                  >
                    {ann.category.toUpperCase()}
                  </Badge>

                  {ann.important && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> PENTING
                    </span>
                  )}

                  <span className="text-xs text-slate-500">
                    Untuk: <strong className="capitalize text-slate-700">{ann.targetAudience}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{ann.publishedAt}</span>
                  {canManageAnnouncements && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingAnnId(ann.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Diterbitkan oleh: <strong className="text-slate-700">{ann.authorName}</strong> ({ann.authorRole})</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnn ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        subtitle="Sampaikan informasi penting ke seluruh warga sekolah"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Pembukaan Pendaftaran Duta Sekolah"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              >
                <option value="umum">Informasi Umum</option>
                <option value="duta">Duta SEKAR MELATI</option>
                <option value="ekskul">Ekstrakurikuler</option>
                <option value="jadwal">Jadwal & Agenda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Audiens</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              >
                <option value="semua">Semua Warga Sekolah</option>
                <option value="murid">Khusus Murid</option>
                <option value="guru">Bapak/Ibu Guru</option>
                <option value="duta">Anggota Duta Sekolah</option>
                <option value="ekskul">Peserta Ekstrakurikuler</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pengumuman:</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan detail informasi, petunjuk pelaksanaan, dan narahubung..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              Tandai sebagai Pengumuman Penting / Disematkan (Pinned)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
            >
              {editingAnn ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingAnnId}
        onClose={() => setDeletingAnnId(null)}
        onConfirm={() => {
          if (deletingAnnId) {
            deleteAnnouncement(deletingAnnId);
            setDeletingAnnId(null);
          }
        }}
        title="Hapus Pengumuman?"
        message="Pengumuman ini akan dihapus dari papan informasi sekolah."
        type="danger"
        confirmText="Hapus Pengumuman"
      />
    </div>
  );
};
