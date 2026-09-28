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
  Edit2
} from 'lucide-react';
import { AmbassadorType } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AmbassadorDetailView } from './AmbassadorDetailView';
import { AmbassadorTypeModal } from './AmbassadorTypeModal';

export const AmbassadorListView: React.FC = () => {
  const { ambassadorTypes, ambassadorMembers, ambassadorPrograms } = useData();
  const { isSuperAdmin, canManageAmbassadorType } = useAuth();

  const [selectedAmbassador, setSelectedAmbassador] = useState<AmbassadorType | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingAmbassadorType, setEditingAmbassadorType] = useState<AmbassadorType | null>(null);

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

  if (selectedAmbassador) {
    return (
      <AmbassadorDetailView
        ambassadorType={selectedAmbassador}
        onBack={() => setSelectedAmbassador(null)}
        onEdit={() => {
          setEditingAmbassadorType(selectedAmbassador);
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

        {isSuperAdmin && (
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
          const canManage = isSuperAdmin || canManageAmbassadorType(type.id) || canManageAmbassadorType(type.code);

          return (
            <Card
              key={type.id}
              hoverable
              onClick={() => setSelectedAmbassador(type)}
              className="flex flex-col justify-between p-5 border-slate-200/80 group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-purple-50 transition-colors">
                    {getDutaIcon(type.icon)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canManage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAmbassadorType(type);
                          setIsTypeModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Edit Data Duta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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

                <div className="flex items-center gap-2">
                  {canManage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAmbassadorType(type);
                        setIsTypeModalOpen(true);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  )}
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    Kelola <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  );
};
