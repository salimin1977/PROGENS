import { useEffect, useMemo, useState } from 'react';
import { Users, GraduationCap, CalendarCheck, ShieldAlert, LifeBuoy, Target, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '../components/ui/KPICard';
import ChartCard from '../components/ui/ChartCard';
import ProgressBar from '../components/ui/ProgressBar';
import { getConfiguredProvider } from '../providers';
import type { AttendanceRecord, Intervention, Student } from '../types';
import { useKPIs } from '../hooks/useKPIs';

const provider = () => getConfiguredProvider();
const RISK_WEIGHT: Record<string, number> = { Critical: 40, High: 30, Moderate: 15, Low: 0, Unassessed: 20 };

interface CommandItem {
  student: Student;
  absentDays: number;
  score: number;
  reason: string;
  action: string;
}

export default function Command() {
  const { data: kpi, loading: kpiLoading } = useKPIs();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([provider().getStudents(), provider().getAttendance(), provider().getInterventions()])
      .then(([studentRows, attendanceRows, interventionRows]) => {
        if (!active) return;
        setStudents(studentRows);
        setAttendance(attendanceRows);
        setInterventions(interventionRows);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const absenceMap = useMemo(() => {
    const map = new Map<string, number>();
    attendance.forEach((row) => map.set(row.studentId, row.absentDays ?? 0));
    return map;
  }, [attendance]);

  const interventionStudentIds = useMemo(() => new Set(
    interventions.filter((item) => item.status === 'Active' || item.status === 'Critical' || item.status === 'Monitoring').map((item) => item.studentId),
  ), [interventions]);

  const priorityQueue = useMemo<CommandItem[]>(() => students
    .map((student) => {
      const absentDays = absenceMap.get(student.id) ?? 0;
      const academicPenalty = student.academicScore <= 50 ? 20 : student.academicScore <= 65 ? 10 : 0;
      const absencePenalty = absentDays >= 20 ? 25 : absentDays >= 10 ? 15 : absentDays >= 5 ? 8 : 0;
      const interventionGap = !interventionStudentIds.has(student.id) && (student.riskLevel === 'Critical' || student.riskLevel === 'High') ? 10 : 0;
      const score = RISK_WEIGHT[student.riskLevel] + academicPenalty + absencePenalty + interventionGap;
      const reasons = [
        student.riskLevel !== 'Low' && student.riskLevel !== 'Unassessed' ? `Risiko ${student.riskLevel}` : '',
        absentDays >= 10 ? `${absentDays} hari tidak hadir` : '',
        student.academicScore <= 65 ? `Prestasi ${student.academicScore.toFixed(0)}%` : '',
        interventionGap > 0 ? 'Tiada intervensi aktif' : '',
      ].filter(Boolean);
      const action = interventionGap > 0 ? 'Buka intervensi' : absentDays >= 10 ? 'Semak kehadiran & punca' : 'Semak kemajuan';
      return { student, absentDays, score, reason: reasons.join(' • ') || 'Perlu semakan data', action };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8),
  [students, absenceMap, interventionStudentIds]);

  const coverage = students.length ? Math.round((students.filter((s) => s.riskLevel !== 'Unassessed').length / students.length) * 100) : 0;
  const criticalHigh = students.filter((s) => s.riskLevel === 'Critical' || s.riskLevel === 'High').length;
  const unassessed = students.filter((s) => s.riskLevel === 'Unassessed').length;
  const activeInterventions = interventions.filter((i) => i.status === 'Active' || i.status === 'Critical').length;
  const commandStatus = criticalHigh > activeInterventions ? 'ACTION REQUIRED' : unassessed > 0 ? 'DATA COVERAGE GAP' : 'MONITOR';

  return <div className="space-y-6">
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Fasa 4 • Command Centre</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Apa yang perlu tindakan dahulu?</h2></div>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${commandStatus === 'ACTION REQUIRED' ? 'bg-rose-100 text-rose-700' : commandStatus === 'DATA COVERAGE GAP' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{commandStatus}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard label="Total Students" value={kpiLoading ? '—' : String(kpi?.totalStudents ?? students.length)} icon={Users} tone="neutral" helperText="Live Supabase" />
        <KPICard label="Critical + High" value={loading ? '—' : String(criticalHigh)} icon={ShieldAlert} tone="critical" helperText="Priority queue" />
        <KPICard label="Intervention Active" value={loading ? '—' : String(activeInterventions)} icon={LifeBuoy} tone="warning" helperText="Critical + Active" />
        <KPICard label="Data Coverage" value={loading ? '—' : `${coverage}%`} icon={Target} tone={coverage === 100 ? 'positive' : 'warning'} helperText={`${unassessed} belum dinilai`} />
        <KPICard label="Attendance Source" value={loading ? '—' : `${attendance.length}`} icon={CalendarCheck} tone="neutral" helperText="Aggregate records" />
      </div>
    </section>

    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard title="Decision Stack" description="KPI → bottleneck → risk → action" className="lg:col-span-1">
        <div className="space-y-4">
          <ProgressOverview label="Risk Coverage" value={coverage} tone="teal" />
          <Signal label="Critical + High" value={criticalHigh} detail={criticalHigh > activeInterventions ? 'Intervention gap exists' : 'Covered by active cases'} critical={criticalHigh > activeInterventions} />
          <Signal label="Unassessed" value={unassessed} detail={unassessed ? 'Data diagnosis belum lengkap' : 'Coverage lengkap'} critical={unassessed > 0} />
          <Signal label="Priority Queue" value={priorityQueue.length} detail="Students requiring review" critical={priorityQueue.length > 0} />
        </div>
      </ChartCard>

      <ChartCard title="Priority Action Queue" description="Susunan tindakan berdasarkan signal semasa" className="lg:col-span-2">
        {loading ? <p className="py-12 text-center text-sm text-slate-500">Memuatkan data live…</p> : priorityQueue.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">Tiada signal tindakan aktif daripada data semasa.</p> : <div className="space-y-2">{priorityQueue.map((item, index) => <div key={item.student.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><span className="w-6 text-center text-xs font-extrabold text-slate-400">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="truncate font-bold text-navy-950">{item.student.name}</span><span className="text-xs text-slate-500">{item.student.className}</span></div><p className="mt-0.5 text-xs text-slate-500">{item.reason}</p></div><div className="hidden text-right sm:block"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Priority</p><p className="font-extrabold text-navy-950">{item.score}</p></div><Link to={`/students/${item.student.id}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-teal-700 hover:bg-slate-200">{item.action}<ArrowRight size={14}/></Link></div>)}</div>}
      </ChartCard>
    </section>

    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <CommandQuestion title="1. Siapa paling perlu tindakan?" text={priorityQueue[0] ? `${priorityQueue[0].student.name} — ${priorityQueue[0].reason}` : 'Tiada calon dalam queue.'} />
      <CommandQuestion title="2. Adakah intervensi mencukupi?" text={`${activeInterventions} kes aktif untuk ${criticalHigh} murid Critical + High.`} warning={criticalHigh > activeInterventions} />
      <CommandQuestion title="3. Adakah data cukup untuk membuat keputusan?" text={unassessed ? `${unassessed} murid masih Unassessed.` : 'Coverage risiko lengkap untuk murid aktif.'} warning={unassessed > 0} />
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start gap-3"><GraduationCap className="mt-0.5 text-teal-700" size={20}/><div><p className="font-bold text-navy-950">Prinsip Command Centre</p><p className="mt-1 text-sm text-slate-600">Dashboard ini sengaja bergerak daripada paparan KPI kepada keputusan: <strong>signal → bottleneck → murid → priority → action → follow-up</strong>. Data attendance yang digunakan ialah rekod agregat hari tidak hadir; kadar kehadiran tidak diandaikan tanpa denominator.</p></div></div></section>
  </div>;
}

function ProgressOverview({ label, value, tone }: { label: string; value: number; tone: 'teal' | 'gold' | 'navy' }) { return <div><div className="mb-1 flex items-center justify-between text-sm"><span>{label}</span><span className="font-bold">{value}%</span></div><ProgressBar value={value} tone={tone}/></div>; }
function Signal({ label, value, detail, critical }: { label: string; value: number; detail: string; critical: boolean }) { return <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><div><p className="text-xs font-bold text-navy-900">{label}</p><p className="text-[11px] text-slate-500">{detail}</p></div><span className={`text-lg font-extrabold ${critical ? 'text-rose-700' : 'text-teal-700'}`}>{value}</span></div>; }
function CommandQuestion({ title, text, warning = false }: { title: string; text: string; warning?: boolean }) { return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start gap-2"><AlertTriangle size={17} className={warning ? 'text-amber-600' : 'text-teal-700'}/><p className="text-sm font-bold text-navy-950">{title}</p></div><p className="mt-2 text-sm text-slate-600">{text}</p></div>; }
