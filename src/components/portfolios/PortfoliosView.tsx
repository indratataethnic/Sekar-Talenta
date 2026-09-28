import React, { useState } from 'react';
import {
  FolderHeart,
  Award,
  Sparkles,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  ShieldCheck,
  Star,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { Portfolio, Achievement, PortfolioCategory } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { PortfolioFormModal } from './PortfolioFormModal';
import { AchievementModal } from './AchievementModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const PortfoliosView: React.FC = () => {
  const { portfolios, achievements, verifyPortfolio, deletePortfolio, deleteAchievement } = useData();
  const { canVerifyPortfolio, isMurid, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'works' | 'achievements'>('works');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const [deletingPortId, setDeletingPortId] = useState<string | null>(null);
  const [deletingAchId, setDeletingAchId] = useState<string | null>(null);

  // If user is Murid, filter only their own creations or allow viewing all peer achievements
  const displayedPortfolios = portfolios.filter((p) => {
    if (isMurid && currentUser?.studentId && p.studentId !== currentUser.studentId) return false;
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  const displayedAchievements = achievements.filter((a) => {
    if (isMurid && currentUser?.studentId && a.studentId !== currentUser.studentId) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-amber-500" />
            Portofolio, Karya & Prestasi Murid
          </h2>
          <p className="text-xs text-slate-500">
            Merekam perjalanan belajar, aksi kepemimpinan, dan artefak karya bermakna tanpa pemeringkatan kaku.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/60">
            <button
              onClick={() => setActiveTab('works')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'works'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Galeri Karya ({portfolios.length})
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'achievements'
                  ? 'bg-amber-500 text-amber-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penghargaan ({achievements.length})
            </button>
          </div>

          {activeTab === 'works' ? (
            <button
              onClick={() => {
                setEditingPortfolio(null);
                setIsPortfolioModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" /> Unggah Karya
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingAchievement(null);
                setIsAchievementModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold shadow-xs active:scale-95"
            >
              <Award className="w-4 h-4" /> Catat Prestasi
            </button>
          )}
        </div>
      </div>

      {/* Tab: Works & Portfolios */}
      {activeTab === 'works' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <Card className="p-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-500 uppercase flex-shrink-0">
                Kategori:
              </span>
              {[
                { id: 'ALL', label: 'Semua Kategori' },
                { id: 'karya', label: 'Karya Kreatif' },
                { id: 'proyek', label: 'Proyek Belajar' },
                { id: 'kontribusi_duta', label: 'Duta Sekolah' },
                { id: 'ekstrakurikuler', label: 'Ekstrakurikuler' },
                { id: 'refleksi_diri', label: 'Refleksi Diri' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Grid of Portfolios */}
          {displayedPortfolios.length === 0 ? (
            <Card className="text-center py-12 text-slate-400 text-xs">
              Belum ada portofolio karya yang diunggah untuk kategori ini.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPortfolios.map((port) => (
                <Card
                  key={port.id}
                  className="flex flex-col justify-between p-5 border-slate-200/80 hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="amber">{port.category.replace('_', ' ').toUpperCase()}</Badge>
                      {port.isVerified ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Menunggu Verifikasi
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {port.title}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                        Oleh: {port.studentName} ({port.classId})
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {port.description}
                    </p>

                    {port.reflection && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                        💡 "{port.reflection}"
                      </div>
                    )}

                    {port.tags && port.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {port.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 flex items-center gap-0.5"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom / Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">{port.date}</span>

                    <div className="flex items-center gap-1">
                      {!port.isVerified && canVerifyPortfolio && (
                        <button
                          onClick={() => verifyPortfolio(port.id, currentUser?.displayName || 'Guru')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors shadow-2xs"
                        >
                          Verifikasi
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingPortfolio(port);
                          setIsPortfolioModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Portofolio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingPortId(port.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus Portofolio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {displayedAchievements.length === 0 ? (
            <Card className="text-center py-12 text-slate-400 text-xs">
              Belum ada piagam penghargaan atau prestasi yang tercatat.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAchievements.map((ach) => (
                <Card
                  key={ach.id}
                  className="flex flex-col justify-between p-5 bg-gradient-to-br from-amber-500/5 via-white to-emerald-500/5 border-amber-200/80"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-2xs">
                        🏆 {ach.rank}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tingkat {ach.level}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {ach.title}
                      </h3>
                      <p className="text-xs text-amber-900 font-semibold mt-0.5">
                        Ajang: {ach.eventName}
                      </p>
                      <p className="text-xs text-slate-600 font-bold mt-1">
                        Murid: {ach.studentName} ({ach.classId})
                      </p>
                    </div>

                    {ach.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic border border-slate-100">
                        "{ach.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">{ach.date}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAchievement(ach);
                          setIsAchievementModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingAchId(ach.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PortfolioFormModal
        isOpen={isPortfolioModalOpen}
        onClose={() => {
          setIsPortfolioModalOpen(false);
          setEditingPortfolio(null);
        }}
        portfolioToEdit={editingPortfolio}
      />

      <AchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => {
          setIsAchievementModalOpen(false);
          setEditingAchievement(null);
        }}
        achievementToEdit={editingAchievement}
      />

      <ConfirmDialog
        isOpen={!!deletingPortId}
        onClose={() => setDeletingPortId(null)}
        onConfirm={() => {
          if (deletingPortId) {
            deletePortfolio(deletingPortId);
            setDeletingPortId(null);
          }
        }}
        title="Hapus Karya Portofolio?"
        message="Portofolio karya ini akan dihapus dari rekam jejak murid."
        type="danger"
        confirmText="Hapus Portofolio"
      />

      <ConfirmDialog
        isOpen={!!deletingAchId}
        onClose={() => setDeletingAchId(null)}
        onConfirm={() => {
          if (deletingAchId) {
            deleteAchievement(deletingAchId);
            setDeletingAchId(null);
          }
        }}
        title="Hapus Piagam Prestasi?"
        message="Data piagam prestasi ini akan dihapus."
        type="danger"
        confirmText="Hapus Prestasi"
      />
    </div>
  );
};
