import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Activity, ActivityType, ActivityStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: Activity | null;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
}) => {
  const { ambassadorTypes, extracurriculars, addActivity, updateActivity } = useData();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('ekstrakurikuler');
  const [referenceId, setReferenceId] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [dateTime, setDateTime] = useState('2024-11-15 14:00');
  const [location, setLocation] = useState('Ruang Karanganyar');
  const [participantsCount, setParticipantsCount] = useState(25);
  const [status, setStatus] = useState<ActivityStatus>('rencana');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setType(activityToEdit.type || 'ekstrakurikuler');
      setReferenceId(activityToEdit.referenceId || '');
      setPersonInCharge(activityToEdit.personInCharge || currentUser?.displayName || '');
      setDescription(activityToEdit.description || '');
      setObjectives(activityToEdit.objectives || '');
      setDateTime(activityToEdit.dateTime || '2024-11-15 14:00');
      setLocation(activityToEdit.location || 'Ruang Karanganyar');
      setParticipantsCount(activityToEdit.participantsCount || 25);
      setStatus(activityToEdit.status || 'rencana');
      setOutcomeNotes(activityToEdit.outcomeNotes || '');
      setReflectionNotes(activityToEdit.reflectionNotes || '');
      setFollowUpNotes(activityToEdit.followUpNotes || '');
    } else {
      setTitle('');
      setType('ekstrakurikuler');
      setReferenceId(extracurriculars[0]?.id || '');
      setPersonInCharge(currentUser?.displayName || 'Koordinator Kegiatan');
      setDescription('');
      setObjectives('');
      setDateTime(new Date().toISOString().slice(0, 16).replace('T', ' '));
      setLocation('Ruang Karanganyar');
      setParticipantsCount(25);
      setStatus('rencana');
      setOutcomeNotes('');
      setReflectionNotes('');
      setFollowUpNotes('');
    }
  }, [activityToEdit, isOpen, currentUser, extracurriculars]);

  const getReferenceName = (t: ActivityType, id: string) => {
    if (t === 'duta') {
      return ambassadorTypes.find((d) => d.id === id)?.name || 'Duta Sekolah';
    }
    if (t === 'ekstrakurikuler') {
      return extracurriculars.find((e) => e.id === id)?.name || 'Ekstrakurikuler';
    }
    return 'Kegiatan Terpadu Sekolah';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const referenceName = getReferenceName(type, referenceId);
      if (activityToEdit) {
        await updateActivity(activityToEdit.id, {
          title,
          type,
          referenceId,
          referenceName,
          personInCharge,
          description,
          objectives,
          dateTime,
          location,
          participantsCount: Number(participantsCount),
          status,
          outcomeNotes,
          reflectionNotes,
          followUpNotes
        });
      } else {
        await addActivity({
          title,
          type,
          referenceId,
          referenceName,
          personInCharge,
          description,
          objectives,
          dateTime,
          location,
          participantsCount: Number(participantsCount),
          status,
          documentationUrls: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80'],
          outcomeNotes,
          reflectionNotes,
          followUpNotes,
          createdBy: currentUser?.id || 'admin'
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
      title={activityToEdit ? 'Edit Agenda Pertemuan/Kegiatan' : 'Buat Agenda Pertemuan/Kegiatan'}
      subtitle="Jadwalkan aktivitas Duta Sekolah, Ekstrakurikuler, atau Acara Sekolah"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama / Judul Kegiatan *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Latihan Rutin Tari Remo Cilik / Aksi Kampanye Resik"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Program *</label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as ActivityType;
                setType(newType);
                if (newType === 'duta') setReferenceId(ambassadorTypes[0]?.id || '');
                else if (newType === 'ekstrakurikuler') setReferenceId(extracurriculars[0]?.id || '');
                else setReferenceId('sekolah_karanganyar');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="ekstrakurikuler">Ekstrakurikuler</option>
              <option value="duta">Duta SEKAR MELATI</option>
              <option value="sekolah">Acara Terpadu Sekolah</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bidang / Unit Terkait *</label>
            {type === 'duta' && (
              <select
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              >
                {ambassadorTypes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            {type === 'ekstrakurikuler' && (
              <select
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              >
                {extracurriculars.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            )}

            {type === 'sekolah' && (
              <input
                type="text"
                disabled
                value="UPT SDN Karanganyar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Penanggung Jawab (PJ) *</label>
            <input
              type="text"
              required
              value={personInCharge}
              onChange={(e) => setPersonInCharge(e.target.value)}
              placeholder="Nama Guru / Pembina PJ"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Kegiatan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            >
              <option value="rencana">Rencana</option>
              <option value="berlangsung">Sedang Berlangsung</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Waktu & Tanggal Pertemuan</label>
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              placeholder="Contoh: 2024-11-20 14:00 (atau teks bebas)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Pertemuan</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lab Komputer / Musholla / Aula"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tujuan & Sasaran Pembelajaran:
          </label>
          <input
            type="text"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Contoh: Murid menguasai ketukan dasar terbang golong albanjari"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Kegiatan:</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ringkasan susunan acara atau modul yang dilatihkan..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
          />
        </div>

        {status === 'selesai' && (
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
            <h4 className="text-xs font-bold text-emerald-950">Laporan Hasil & Refleksi (Selesai):</h4>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hasil & Capaian:</label>
              <textarea
                rows={2}
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Hasil yang dicapai murid..."
                className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Refleksi & Tindak Lanjut:</label>
              <input
                type="text"
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="Catatan evaluasi pembina..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>
        )}

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
            {isSubmitting ? 'Menyimpan...' : 'Simpan Kegiatan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
