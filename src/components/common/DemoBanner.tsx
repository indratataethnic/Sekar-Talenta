import React, { useState } from 'react';
import { Sparkles, RotateCcw, Trash2, Info, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, resetToDemoData, clearAllDemoData } = useData();
  const { isSuperAdmin } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isDemoMode) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border-b border-amber-300/40 px-4 py-2 text-xs font-medium text-amber-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-amber-950 font-bold text-[11px] tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-950" /> DEMO MODE
          </span>
          <span className="text-slate-700 hidden sm:inline">
            Aplikasi berjalan dengan data demonstrasi fiktif UPT SDN Karanganyar Kota Pasuruan.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-emerald-800 border border-emerald-300/60 font-semibold shadow-2xs transition-all active:scale-95 hover:border-emerald-500"
                title="Reset kembali ke data awal demo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold shadow-2xs transition-all active:scale-95"
                title="Hapus data demo untuk mulai input data sekolah asli"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Demo</span>
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetToDemoData}
        title="Reset Data Demonstrasi?"
        message="Tindakan ini akan mengembalikan seluruh data murid, duta sekolah, ekskul, kegiatan, dan portofolio ke paket contoh awal standar SEKAR TALENTA."
        type="warning"
        confirmText="Ya, Reset Data Demo"
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAllDemoData}
        title="Kosongkan Seluruh Data Demo?"
        message="Perhatian! Tindakan ini akan menghapus seluruh data demonstrasi agar sekolah siap memasukkan data murid dan kegiatan yang sebenarnya."
        type="danger"
        confirmText="Hapus Semua Data Demo"
      />
    </>
  );
};
