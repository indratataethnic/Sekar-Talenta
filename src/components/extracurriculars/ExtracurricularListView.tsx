import React, { useState } from 'react';
import {
  Layers,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  Sparkles
} from 'lucide-react';
import { Extracurricular } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ExtracurricularDetailView } from './ExtracurricularDetailView';
import { ExtracurricularFormModal } from './ExtracurricularFormModal';

export const ExtracurricularListView: React.FC = () => {
  const { extracurriculars, extracurricularMembers } = useData();
  const { canManageExtracurriculars } = useAuth();

  const [selectedEkskul, setSelectedEkskul] = useState<Extracurricular | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<Extracurricular | null>(null);

  if (selectedEkskul) {
    return (
      <ExtracurricularDetailView
        extracurricular={selectedEkskul}
        onBack={() => setSelectedEkskul(null)}
        onEdit={() => {
          setEditingEkskul(selectedEkskul);
          setIsFormOpen(true);
        }}
      />
    );
  }

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
            {extracurriculars.length} pilihan kegiatan pengembangan minat, seni, olahraga, teknologi & kepanduan.
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

      {/* Grid of Extracurriculars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extracurriculars.map((ekskul) => {
          const members = extracurricularMembers.filter((m) => m.extracurricularId === ekskul.id);
          const capacity = ekskul.capacity || 30;
          const capacityPercent = Math.min(100, Math.round((members.length / capacity) * 100));

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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500">
                  <span>Pembina: </span>
                  <span className="font-semibold text-slate-700">{ekskul.coachName}</span>
                </div>

                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  Detail <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <ExtracurricularFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEkskul(null);
        }}
        ekskulToEdit={editingEkskul}
      />
    </div>
  );
};
