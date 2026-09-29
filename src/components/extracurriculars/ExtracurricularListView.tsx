import React, { useState } from 'react';
import {
  Layers,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Edit2,
  Trash2,
  UserCheck,
  School,
  Globe2
} from 'lucide-react';
import { Extracurricular } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ExtracurricularDetailView } from './ExtracurricularDetailView';
import { ExtracurricularFormModal } from './ExtracurricularFormModal';

export const ExtracurricularListView: React.FC = () => {
  const { extracurriculars, extracurricularMembers, deleteExtracurricular } = useData();
  const { canManageExtracurriculars, isMurid } = useAuth();
  const canManage = !isMurid;

  const [selectedEkskul, setSelectedEkskul] = useState<Extracurricular | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<Extracurricular | null>(null);
  const [deletingEkskul, setDeletingEkskul] = useState<Extracurricular | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const currentEkskul = selectedEkskul
    ? extracurriculars.find((e) => e.id === selectedEkskul.id) || selectedEkskul
    : null;

  if (currentEkskul) {
    return (
      <>
        <ExtracurricularDetailView
          extracurricular={currentEkskul}
          onBack={() => setSelectedEkskul(null)}
          onEdit={() => {
            setEditingEkskul(currentEkskul);
            setIsFormOpen(true);
          }}
        />
        <ExtracurricularFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEkskul(null);
          }}
          ekskulToEdit={editingEkskul}
        />
      </>
    );
  }

  const categories = ['all', 'Keagamaan', 'Kepanduan', 'Teknologi', 'Seni Budaya', 'Olahraga'];

  const filteredEkskuls = extracurriculars.filter((ekskul) => {
    const matchCategory = selectedCategory === 'all' || ekskul.category === selectedCategory;
    const matchSearch =
      searchTerm === '' ||
      ekskul.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ekskul.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ekskul.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ekskul.coaches &&
        ekskul.coaches.some(
          (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.organization && c.organization.toLowerCase().includes(searchTerm.toLowerCase()))
        ));
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Ekstrakurikuler UPT SDN Karanganyar
          </h2>
          <p className="text-xs text-slate-500">
            {extracurriculars.length} pilihan kegiatan pengembangan minat, seni, olahraga, teknologi & kepanduan bersama pembina internal sekolah & pelatih eksternal.
          </p>
        </div>

        {canManageExtracurriculars && (
          <button
            onClick={() => {
              setEditingEkskul(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Ekstrakurikuler
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ekskul / pembina..."
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-slate-50"
          />
        </div>
      </div>

      {/* Grid of Extracurriculars */}
      {filteredEkskuls.length === 0 ? (
        <Card className="text-center py-12 text-slate-500 text-xs">
          Tidak ada kegiatan ekstrakurikuler yang sesuai dengan filter pencarian.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEkskuls.map((ekskul) => {
            const members = extracurricularMembers.filter((m) => m.extracurricularId === ekskul.id);
            const capacity = ekskul.capacity || 30;
            const capacityPercent = Math.min(100, Math.round((members.length / capacity) * 100));

            const coachList =
              ekskul.coaches && ekskul.coaches.length > 0
                ? ekskul.coaches
                : [
                    {
                      name: ekskul.coachName,
                      role: 'Pembina',
                      type: 'internal' as const
                    }
                  ];

            return (
              <Card
                key={ekskul.id}
                hoverable
                onClick={() => setSelectedEkskul(ekskul)}
                className="flex flex-col justify-between p-5 border-slate-200/80 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant={
                        ekskul.category === 'Keagamaan'
                          ? 'emerald'
                          : ekskul.category === 'Kepanduan'
                          ? 'amber'
                          : ekskul.category === 'Teknologi'
                          ? 'cyan'
                          : ekskul.category === 'Olahraga'
                          ? 'orange'
                          : 'pink'
                      }
                    >
                      {ekskul.category}
                    </Badge>

                    <span className="text-[11px] font-bold text-slate-500">
                      {members.length}/{capacity} Murid
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {ekskul.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {ekskul.description}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {ekskul.dayTimeSchedule}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ekskul.location}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-2">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          capacityPercent >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer: Coaches & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  {/* Coaches details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Tim Pembina ({coachList.length}):
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {coachList.map((c, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-[10.5px]"
                        >
                          {c.type === 'external' ? (
                            <Globe2 className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          ) : (
                            <School className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                            {c.name}
                          </span>
                          {c.type === 'external' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                              Luar
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEkskul(ekskul);
                              setIsFormOpen(true);
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Data Ekstrakurikuler"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingEkskul(ekskul);
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 transition-colors shadow-2xs"
                            title="Hapus Ekstrakurikuler"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                      Detail Kegiatan <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ExtracurricularFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEkskul(null);
        }}
        ekskulToEdit={editingEkskul}
      />

      <ConfirmDialog
        isOpen={!!deletingEkskul}
        onClose={() => setDeletingEkskul(null)}
        onConfirm={async () => {
          if (deletingEkskul) {
            await deleteExtracurricular(deletingEkskul.id);
            setDeletingEkskul(null);
          }
        }}
        title="Hapus Ekstrakurikuler?"
        message={`Apakah Anda yakin ingin menghapus kegiatan ekstrakurikuler "${deletingEkskul?.name}"? Seluruh pendaftaran peserta terkait juga akan dibersihkan.`}
        type="danger"
        confirmText="Hapus Ekstrakurikuler"
      />
    </div>
  );
};
