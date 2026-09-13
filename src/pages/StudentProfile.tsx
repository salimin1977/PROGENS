import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, FileQuestion } from 'lucide-react';
import { useStudent } from '../hooks/useStudent';
import { useEffect } from 'react';
import { getStudentInterventions } from '../services/interventionService';
import type { Intervention } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';

const TABS = ['Profile', 'Academic', 'Attendance', 'Intervention', 'Talent', 'Progress Timeline'] as const;
type Tab = (typeof TABS)[number];

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const [tab, setTab] = useState<Tab>('Profile');
  const [studentInterventions, setStudentInterventions] = useState<Intervention[]>([]);
  const { data: student, loading } = useStudent(studentId);

  useEffect(() => { if (studentId) getStudentInterventions(studentId).then(setStudentInterventions); }, [studentId]);
  if (loading) return <div className="p-6 text-sm text-slate-500">Loading student profile...</div>;
  if (!student) return <EmptyState icon={FileQuestion} title="Student not found" description="This student record does not exist in the current dataset." />;

  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline"><ArrowLeft size={16} /> Back to Students</Link>
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-xl font-bold text-teal-300">{student.photoInitials}</div><div><h2 className="text-lg font-extrabold text-navy-950">{student.name}</h2><p className="text-sm text-slate-500">{student.id} &middot; {student.className} &middot; {student.form}</p><div className="mt-2 flex gap-2"><StatusBadge status={student.riskLevel} /><StatusBadge status={student.status} />{student.stemTrack && <StatusBadge status="STEM Track" />}</div></div></div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-6"><Metric label="Academic Score" value={String(student.academicScore)} /><Metric label="Attendance" value={`${student.attendanceRate}%`} /><Metric label="STEM Readiness" value={String(student.stemReadiness)} /></div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold ${tab === t ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500'}`}>{t}</button>)}</div>
      {tab === 'Profile' && <div className="card p-5"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Student Information</h3><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Full Name" value={student.name} /><Field label="Gender" value={student.gender} /><Field label="Class" value={student.className} /><Field label="Form" value={student.form} /><Field label="Guardian Contact" value={student.guardianContact} icon={<Phone size={13} />} /><Field label="Status" value={student.status} /></dl></div>}
      {tab === 'Academic' && <div className="card p-5"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Subject Performance</h3><div className="space-y-3">{student.subjects.map((sub) => <div key={sub.subject}><div className="mb-1 flex items-center justify-between text-sm"><span>{sub.subject}</span><span className="font-semibold">{sub.score} ({sub.grade})</span></div><ProgressBar value={sub.score} tone={sub.score >= 70 ? 'teal' : sub.score >= 50 ? 'gold' : 'rose'} /></div>)}</div></div>}
      {tab === 'Attendance' && <div className="card p-5"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Attendance Record</h3><div className="flex items-center gap-6"><div className="text-3xl font-extrabold">{student.attendanceRate}%</div><ProgressBar value={student.attendanceRate} tone={student.attendanceRate >= 90 ? 'teal' : student.attendanceRate >= 80 ? 'gold' : 'rose'} className="flex-1" /></div><p className="mt-3 text-xs text-slate-500">{student.attendanceRate < 90 ? 'Attendance risk: below configurable 90% threshold.' : 'Attendance within healthy range.'}</p></div>}
      {tab === 'Intervention' && <div className="card p-5"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Intervention Cases</h3>{studentInterventions.length === 0 ? <p className="text-sm text-slate-500">No active intervention cases for this student.</p> : <div className="space-y-3">{studentInterventions.map((i) => <div key={i.id} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{i.interventionType}</p><StatusBadge status={i.status} /></div><p className="mt-1 text-xs text-slate-500">{i.problem}</p><p className="mt-1 text-xs">Teacher: {i.teacher} &middot; Started {i.startDate}</p><ProgressBar value={i.progress} className="mt-2" showLabel /></div>)}</div>}</div>}
      {tab === 'Talent' && <div className="card p-5"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Talent Development</h3>{student.talents.length === 0 ? <p className="text-sm text-slate-500">No talent profile recorded yet.</p> : <div className="grid gap-3 sm:grid-cols-2">{student.talents.map((t) => <div key={t.domain} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{t.domain}</p><StatusBadge status={t.level} /></div><p className="mt-1 text-xs text-slate-500">{t.notes}</p></div>)}</div>}</div>}
      {tab === 'Progress Timeline' && <div className="card p-5"><h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy-900">Progress Timeline</h3><ol className="relative space-y-6 border-l border-slate-200 pl-5">{student.progressTimeline.map((event, idx) => <li key={idx} className="relative"><span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-teal-500" /><p className="text-xs text-slate-400">{event.date}</p><p className="text-sm font-semibold">{event.label}</p><p className="text-xs text-slate-500">{event.detail}</p></li>)}</ol></div>}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="text-right"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="text-lg font-extrabold">{value}</p></div>; }
function Field({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) { return <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-0.5 flex items-center gap-1 text-sm font-medium">{icon}{value}</dd></div>; }
