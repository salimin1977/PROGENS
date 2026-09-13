import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarCheck, AlertTriangle, TrendingDown, UserX } from 'lucide-react';
import KPICard from '../components/ui/KPICard';
import ChartCard from '../components/ui/ChartCard';
import { getAttendanceRecords } from '../services/attendanceService';
import { getStudents } from '../services/studentService';

export default function Attendance() {
  const [records, setRecords] = useState<Awaited<ReturnType<typeof getAttendanceRecords>>>([]);
  const [students, setStudents] = useState<Awaited<ReturnType<typeof getStudents>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getAttendanceRecords(), getStudents()])
      .then(([attendance, studentData]) => {
        if (!mounted) return;
        setRecords(attendance);
        setStudents(studentData);
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load attendance data.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const absentByStudent = useMemo(() => new Map(records.map((record) => [record.studentId, record.absentDays])), [records]);
  const totalAbsent = useMemo(() => records.reduce((sum, record) => sum + record.absentDays, 0), [records]);
  const chronic = useMemo(() => records.filter((record) => record.absentDays >= 20).length, [records]);
  const below10 = useMemo(() => records.filter((record) => record.absentDays >= 10).length, [records]);

  const classData = useMemo(() => {
    const groups = new Map<string, number[]>();
    students.forEach((student) => {
      const values = groups.get(student.className) ?? [];
      values.push(absentByStudent.get(student.id) ?? 0);
      groups.set(student.className, values);
    });
    return [...groups.entries()].map(([className, values]) => ({
      className,
      absentDays: Math.round((values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1)) * 10) / 10,
    }));
  }, [students, absentByStudent]);

  const bands = useMemo(() => [
    { band: '0–4 hari', students: records.filter((r) => r.absentDays < 5).length },
    { band: '5–9 hari', students: records.filter((r) => r.absentDays >= 5 && r.absentDays < 10).length },
    { band: '10–19 hari', students: records.filter((r) => r.absentDays >= 10 && r.absentDays < 20).length },
    { band: '20+ hari', students: records.filter((r) => r.absentDays >= 20).length },
  ], [records]);

  if (loading) return <div className="p-6 text-sm text-slate-500">Memuatkan data kehadiran...</div>;
  if (error) return <div className="p-6 text-sm text-rose-600">Ralat data kehadiran: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Sumber: <strong>RUMUSAN BAHASA MELAYU</strong>, muka surat 9–10. Data yang digunakan ialah kolum <strong>BIL. HARI X HADIR</strong>. Ia ialah jumlah hari tidak hadir, bukan peratus kehadiran harian.
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Murid Dengan Data" value={records.length.toString()} icon={CalendarCheck} tone="positive" helperText={`Daripada ${students.length} murid aktif`} />
        <KPICard label="Jumlah Hari Tidak Hadir" value={totalAbsent.toString()} icon={UserX} tone="critical" helperText="Jumlah rekod sumber" />
        <KPICard label="≥10 Hari Tidak Hadir" value={below10.toString()} icon={TrendingDown} tone="warning" helperText="Keutamaan pemantauan" />
        <KPICard label="≥20 Hari Tidak Hadir" value={chronic.toString()} icon={AlertTriangle} tone="critical" helperText="Kes ketidakhadiran tinggi" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Ketidakhadiran Mengikut Kelas" description="Purata hari tidak hadir bagi murid yang mempunyai data sumber">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="className" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="absentDays" name="Hari tidak hadir" fill="#d6931f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Taburan Hari Tidak Hadir" description="Bilangan murid mengikut julat ketidakhadiran">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bands}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="band" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="students" name="Murid" fill="#17877e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <ChartCard title="Interpretasi Data" description="Kehadiran sebagai input kepada enjin risiko PROGENS">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Sumber</div><div className="mt-1 text-sm text-slate-700">Jumlah hari tidak hadir daripada laporan sekolah.</div></div>
          <div className="rounded-lg bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Signal</div><div className="mt-1 text-sm text-slate-700">≥10 hari wajar diberi perhatian; ≥20 hari ialah signal ketidakhadiran tinggi.</div></div>
          <div className="rounded-lg bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Next</div><div className="mt-1 text-sm text-slate-700">Gabungkan signal kehadiran dengan akademik sebelum mencetuskan intervensi.</div></div>
        </div>
      </ChartCard>
    </div>
  );
}
