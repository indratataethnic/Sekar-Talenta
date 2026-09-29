import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Leaf,
  BookMarked,
  HeartPulse,
  MonitorSmartphone,
  Smile,
  Plus,
  ArrowRight,
  Users,
  CalendarCheck,
  HeartHandshake,
  Edit2,
  Trash2
} from 'lucide-react';
import { AmbassadorType } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { AmbassadorDetailView } from './AmbassadorDetailView';
import { AmbassadorTypeModal } from './AmbassadorTypeModal';

export const AmbassadorListView: React.FC = () => {
  const { ambassadorTypes, ambassadorMembers, deleteAmbassadorType } = useData();
  const { isSuperAdmin, isGuruKelas, isPembina, isMurid, canManageAmbassadorType } = useAuth();

  const [selectedAmbassador, setSelectedAmbassador] = useState<AmbassadorType | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingAmbassadorType, setEditingAmbassadorType] = useState<AmbassadorType | null>(null);
  const [deletingType, setDeletingType] = useState<AmbassadorType | null>(null);

  const canManage = !isMurid;

  const currentSelectedAmbassador = selectedAmbassador
    ? ambassadorTypes.find((t) => t.id === selectedAmbassador.id) || selectedAmbassador
    : null;

  const getDutaIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-rose-600" />;
      case 'Leaf':
        return <Leaf className="w-6 h-6 text-emerald-600" />;
      case 'BookMarked':
        return <BookMarked className="w-6 h-6 text-amber-600" />;
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6 text-red-600" />;
      case 'MonitorSmartphone':
        return <MonitorSmartphone className="w-6 h-6 text-indigo-600" />;
      case 'Smile':
        return <Smile className="w-6 h-6 text-sky-600" />;
      default:
        return <Award className="w-6 h-6 text-teal-600" />;
    }
  };

  if (currentSelectedAmbassador) {
    return (
      <AmbassadorDetailView
        ambassadorType={currentSelectedAmbassador}
        onBack={() => setSelectedAmbassador(null)}
        onEdit={() => {
          setEditingAmbassadorType(currentSelectedAmbassador);
          setIsTypeModalOpen(true);
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
            <Award className="w-6 h-6 text-purple-600" />
            Duta SEKAR MELATI (Kepemimpinan Murid)
          </h2>
          <p className="text-xs text-slate-500">
            Wadah aktualisasi peran teladan, kepedulian sosial, dan karakter Pancasila di UPT SDN Karanganyar.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingAmbassadorType(null);
              setIsTypeModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Bidang Duta
          </button>
        )}
      </div>

      {/* Grid of Ambassadors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambassadorTypes.map((type) => {
          const membersCount = ambassadorMembers.filter((m) => m.ambassadorTypeId === type.id).length;

          return (
            <Card
              key={type.id}
              hoverable
              onClick={() => setSelectedAmbassador(type)}
              className="flex flex-col justify-between p-5 border-slate-200/80 group relative hover:border-purple-300 transition-all cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-purple-50 transition-colors">
                    {getDutaIcon(type.icon)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAmbassadorType(type);
                            setIsTypeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Edit Bidang Duta"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingType(type);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Hapus Bidang Duta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <Badge variant="purple" size="sm">
                      {membersCount} Kader
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-xs font-medium text-purple-700 mt-0.5">
                    Fokus: {type.focus}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500">
                  <span>Pembina: </span>
                  <span className="font-semibold text-slate-700">{type.coachName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAmbassadorType(type);
                          setIsTypeModalOpen(true);
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Bidang Duta"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingType(type);
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors shadow-2xs"
                        title="Hapus Bidang Duta"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </>
                  )}
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-1 transition-transform ml-1">
                    Buka <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AmbassadorTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => {
          setIsTypeModalOpen(false);
          setEditingAmbassadorType(null);
        }}
        ambassadorTypeToEdit={editingAmbassadorType}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingType}
        onClose={() => setDeletingType(null)}
        onConfirm={async () => {
          if (deletingType) {
            await deleteAmbassadorType(deletingType.id);
            setDeletingType(null);
          }
        }}
        title="Hapus Bidang Duta Sekolah?"
        message={`Apakah Anda yakin ingin menghapus bidang "${deletingType?.name}"? Seluruh data penugasan kader murid dan program kerja terkait pada bidang ini juga akan dihapus secara permanen.`}
        type="danger"
        confirmText="Hapus Bidang Duta"
      />
    </div>
  );
};
