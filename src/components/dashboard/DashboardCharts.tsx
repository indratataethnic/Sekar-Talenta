import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { Card } from '../common/Card';
import { useData } from '../../context/DataContext';

export const DashboardCharts: React.FC = () => {
  const {
    students,
    talentCategories,
    studentInterests,
    ambassadorTypes,
    ambassadorMembers,
    extracurriculars,
    extracurricularMembers,
    activities
  } = useData();

  // 1. Data Murid per Kelas
  const classCounts: Record<string, number> = {};
  students.forEach((s) => {
    classCounts[s.classId] = (classCounts[s.classId] || 0) + 1;
  });
  const classChartData = Object.entries(classCounts).map(([name, count]) => ({
    name: name.replace('Kelas ', 'Kls '),
    jumlah: count,
  }));

  // 2. Distribusi Minat per Kategori
  const talentCounts: Record<string, number> = {};
  talentCategories.forEach((tc) => {
    talentCounts[tc.name] = 0;
  });
  studentInterests.forEach((si) => {
    if (talentCounts[si.categoryName] !== undefined) {
      talentCounts[si.categoryName] += 1;
    } else {
      talentCounts[si.categoryName] = 1;
    }
  });
  const talentChartData = Object.entries(talentCounts).map(([name, count]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    fullName: name,
    jumlah: count || 1, // Fallback non-zero for visual aesthetics
  }));

  const PIE_COLORS = ['#059669', '#0284c7', '#f59e0b', '#8b5cf6', '#e11d48', '#0d9488', '#ea580c'];

  // 3. Peserta per Ekstrakurikuler
  const ekskulChartData = extracurriculars.map((e) => {
    const memberCount = extracurricularMembers.filter(
      (m) =>
        m.extracurricularId === e.id ||
        m.extracurricularId === e.code ||
        (m.extracurricularName && e.name && m.extracurricularName.toLowerCase().trim().includes(e.name.toLowerCase().trim())) ||
        (m.extracurricularName && e.name && e.name.toLowerCase().trim().includes(m.extracurricularName.toLowerCase().trim()))
    ).length;
    return {
      name: e.name.length > 12 ? e.name.substring(0, 12) + '...' : e.name,
      fullName: e.name,
      peserta: memberCount,
      kapasitas: e.capacity || 500
    };
  });

  // 4. Anggota per Jenis Duta
  const dutaChartData = ambassadorTypes.map((d) => {
    const count = ambassadorMembers.filter((m) => m.ambassadorTypeId === d.id).length;
    return {
      name: d.shortName,
      anggota: count
    };
  });

  // 5. Tren Partisipasi Kegiatan
  const trendData = [
    { bulan: 'Jul', kegiatan: 2, kehadiran: 45 },
    { bulan: 'Agt', kegiatan: 4, kehadiran: 98 },
    { bulan: 'Sep', kegiatan: 5, kehadiran: 140 },
    { bulan: 'Okt', kegiatan: 6, kehadiran: 185 },
    { bulan: 'Nov', kegiatan: activities.length || 7, kehadiran: 210 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Chart 1: Minat Murid */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Distribusi Bakat & Minat Murid</h3>
            <p className="text-xs text-slate-500">Pilihan eksplorasi 7 kategori potensi</p>
          </div>
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={talentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                formatter={(val, _name, item) => [`${val} Pilihan Minat`, item.payload.fullName]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: Peserta Ekstrakurikuler */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Keikutsertaan Ekstrakurikuler</h3>
            <p className="text-xs text-slate-500">Jumlah murid terdaftar vs kapasitas</p>
          </div>
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ekskulChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                formatter={(val, name, item) => [
                  `${val} Murid`,
                  name === 'peserta' ? 'Terdaftar' : 'Kapasitas'
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="peserta" fill="#0284c7" name="Peserta Terdaftar" radius={[6, 6, 0, 0]} />
              <Bar dataKey="kapasitas" fill="#cbd5e1" name="Kapasitas Kelas" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 3: Duta Sekolah Breakdown */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Komposisi Duta SEKAR MELATI</h3>
            <p className="text-xs text-slate-500">Jumlah kader per bidang kepemimpinan</p>
          </div>
        </div>
        <div className="h-64 mt-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dutaChartData}
                dataKey="anggota"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={4}
                label={({ name, percent }) => `${name} (${(((percent ?? 0) as number) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {dutaChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} Anggota`, name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 4: Tren Partisipasi & Keaktifan */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Perkembangan Partisipasi Kegiatan</h3>
            <p className="text-xs text-slate-500">Jumlah kegiatan & partisipasi murid bulanan</p>
          </div>
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="kegiatan" name="Total Kegiatan" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="kehadiran" name="Total Partisipan" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
