import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { getStudentProfile } from '../services/studentService';
import { listInterventions } from '../services/interventionService';
import { getDataProvider } from '../providers';
import { classifySeedsStudent } from '../engines/seedsEngine';
import { calculateGrowScore } from '../engines/growEngine';
import { calculateReapPriority } from '../engines/reapEngine';
import { classifyStemPipeline } from '../engines/stemEngine';
import type { Department, Grade } from '../types/schema';
import StatusBadge from '../components/ui/StatusBadge';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';

const TABS = ['Profile', 'Academic', 'Attendance', 'Risk', 'Intervention', 'SEEDS/GROW/REAP', 'STEM', 'Timeline'] as const;
type Tab = (typeof TABS)[number];

function strongestDepartment(subjects: { department: string; gp: number }[]): Department {
  if (subjects.length === 0) return 'Others';
  const byDept = new Map<string, number[]>();
  for (const s of subjects) {
    if (!byDept.has(s.department)) byDept.set(s.department, []);
    byDept.get(s.department)!.push(s.gp);
  }
  let best: Department = 'Others';
  let bestAvg = 11;
  for (const [dept, points] of byDept) {
    const avg = points.reduce((a, b) => a + b, 0) / points.length;
    if (avg < bestAvg) {
      bestAvg = avg;
      best = dept as Department;
    }
  }
  return best;
}

async function loadProfile(studentId: string) {
  const [student, interventions, kpiTargets] = await Promise.all([
    getStudentProfile(studentId),
    listInterventions({ studentId }),
    getDataProvider().getKpiTargets(),
  ]);
  return { student, interventions, kpiTargets };
}

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const [tab, setTab] = useState<Tab>('Profile');
  const state = useAsync(() => loadProfile(studentId ?? ''), [studentId]);

  return (
    <AsyncSection state={state} loadingLabel="Loading student profile…">
      {({ student, interventions, kpiTargets }) => {
        if (!student) {
          return <EmptyState icon={FileQuestion} title="Student not found" description="This student record does not exist in the current dataset." />;
        }

        const mathGrade = student.subjects.find((s) => s.subject.toLowerCase().includes('matematik'))?.grade as Grade | undefined;
        const scienceGrade = student.subjects.find((s) => ['sains', 'fizik', 'kimia', 'biologi'].some((k) => s.subject.toLowerCase().includes(k)))?.grade as Grade | undefined;
        const stem = classifyStemPipeline({ studentId: student.id, mathGrade, scienceGrade, stemInterest: student.stemTrack });

        return (
          <div className="space-y-6">
            <Link to="/students" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
              <ArrowLeft size={16} /> Back to Students
            </Link>

            <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-xl font-bold text-teal-300">
                  {student.photoInitials}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-navy-950">{student.name}</h2>
                  <p className="text-sm text-slate-500">{student.studentNo} &middot; {student.className} &middot; {student.form}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={student.riskLevel} />
                    <StatusBadge status={student.status} />
                    {student.stemTrack && <StatusBadge status="STEM Track" />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-6">
                <Metric label="Academic Score" value={student.academicScore.toString()} />
                <Metric label="GPM" value={student.gpm.toFixed(2)} />
                <Metric label="Attendance" value={`${student.attendanceRate}%`} />
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    tab === t ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-navy-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'Profile' && (
              <div className="space-y-4">
                <div className="card p-5">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Student Information</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Full Name" value={student.name} />
                    <Field label="Gender" value={student.gender} />
                    <Field label="Class" value={student.className} />
                    <Field label="Form" value={student.form} />
                    <Field label="IC (last 4)" value={`****${student.icLast4}`} />
                    <Field label="Status" value={student.status} />
                  </dl>
                </div>
                <div className="card p-5">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Talent Development</h3>
                  {student.talents.length === 0 ? (
                    <p className="text-sm text-slate-500">No talent profile recorded yet.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {student.talents.map((t) => (
                        <div key={t.domain} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-navy-950">{t.domain}</p>
                            <StatusBadge status={t.level} />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{t.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'Academic' && (
              <div className="card p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Subject Performance</h3>
                <div className="space-y-3">
                  {student.subjects.map((sub) => (
                    <div key={sub.subject}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-navy-800">{sub.subject}</span>
                        <span className="font-semibold text-navy-950">{sub.score} ({sub.grade})</span>
                      </div>
                      <ProgressBar value={sub.score} tone={sub.score >= 70 ? 'teal' : sub.score >= 50 ? 'gold' : 'rose'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'Attendance' && (
              <div className="card p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Attendance Record</h3>
                <div className="flex items-center gap-6">
                  <div className="text-3xl font-extrabold text-navy-950">{student.attendanceRate}%</div>
                  <ProgressBar value={student.attendanceRate} tone={student.attendanceRate >= 90 ? 'teal' : student.attendanceRate >= 80 ? 'gold' : 'rose'} className="flex-1" />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {student.attendanceRate < 80
                    ? 'Chronic absence pattern detected — flagged for Attendance Recovery Plan.'
                    : student.attendanceRate < 90
                    ? 'Attendance below school target of 97%. Monitor for further decline.'
                    : 'Attendance within healthy range.'}
                </p>
              </div>
            )}

            {tab === 'Risk' && (
              <div className="card p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Risk Assessment</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <StatusBadge status={student.riskLevel} />
                  <span className="text-2xl font-extrabold text-navy-950">{student.riskScore}<span className="text-sm font-medium text-slate-400">/100</span></span>
                </div>
                <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-navy-800">
                  {student.riskReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-semibold text-navy-900">Recommended action: </span>
                  {student.recommendedAction}
                </div>
              </div>
            )}

            {tab === 'Intervention' && (
              <div className="card p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Intervention Cases</h3>
                {interventions.length === 0 ? (
                  <p className="text-sm text-slate-500">No active intervention cases for this student.</p>
                ) : (
                  <div className="space-y-3">
                    {interventions.map((i) => (
                      <div key={i.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-navy-950">{i.category}</p>
                          <StatusBadge status={i.status} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{i.problem}</p>
                        <p className="mt-1 text-xs text-navy-700">Teacher: {i.teacher} &middot; Started {i.startDate}</p>
                        <ProgressBar value={i.progress} className="mt-2" showLabel />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'SEEDS/GROW/REAP' && (
              <div className="card p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Programme Classification</h3>
                {student.form === 'Tingkatan 4' ? (
                  (() => {
                    const dept = strongestDepartment(student.subjects);
                    const grow = calculateGrowScore({ studentId: student.id, gpm: student.gpm, attendanceRate: student.attendanceRate, careerReadiness: student.stemReadiness, strongestDepartment: dept });
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-navy-900">GROW Score:</span> {grow.score}/100 — <StatusBadge status={grow.status} /></p>
                        <p><span className="font-semibold text-navy-900">Strength:</span> {grow.strength}</p>
                        <p><span className="font-semibold text-navy-900">Recommended Pathway:</span> {grow.recommended_pathway}</p>
                      </div>
                    );
                  })()
                ) : student.form === 'Tingkatan 5' ? (
                  (() => {
                    const target = kpiTargets.find((k) => k.kpi_name === 'GPS Semasa')?.target_value ?? 4.84;
                    const reap = calculateReapPriority({ studentId: student.id, currentGpm: student.gpm, targetGps: target, riskLevel: student.riskLevel, interventionStatus: interventions.some((i) => i.status === 'ACTIVE') ? 'ACTIVE' : 'NONE' });
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-navy-900">REAP Priority:</span> <StatusBadge status={reap.priority} /></p>
                        <p><span className="font-semibold text-navy-900">Gap to Target GPS:</span> {reap.gap.toFixed(2)}</p>
                        <p><span className="font-semibold text-navy-900">SPM Readiness:</span> {reap.spm_readiness}/100</p>
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    const seeds = classifySeedsStudent({ studentId: student.id, gpm: student.gpm, attendanceRate: student.attendanceRate, riskLevel: student.riskLevel, stemInterest: student.stemTrack });
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-navy-900">SEEDS Status:</span> <StatusBadge status={seeds.status} /></p>
                        <p><span className="font-semibold text-navy-900">Potential:</span> {seeds.potential_level} &middot; <span className="font-semibold text-navy-900">Academic:</span> {seeds.academic_level} &middot; <span className="font-semibold text-navy-900">Attendance:</span> {seeds.attendance_level}</p>
                        <p><span className="font-semibold text-navy-900">Recommended Action:</span> {seeds.recommended_action}</p>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {tab === 'STEM' && (
              <div className="card p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">STEM Pipeline</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-navy-900">Mathematics:</span> {stem.math_status}</p>
                  <p><span className="font-semibold text-navy-900">Science:</span> {stem.science_status}</p>
                  <p><span className="font-semibold text-navy-900">Pipeline Status:</span> <StatusBadge status={stem.pipeline_status} /></p>
                  <p><span className="font-semibold text-navy-900">STEM Readiness:</span> {student.stemReadiness}/100</p>
                  <p><span className="font-semibold text-navy-900">Recommended Action:</span> {stem.recommended_action}</p>
                </div>
              </div>
            )}

            {tab === 'Timeline' && (
              <div className="card p-5">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy-900">Progress Timeline</h3>
                {student.progressTimeline.length === 0 ? (
                  <p className="text-sm text-slate-500">No timeline events recorded yet.</p>
                ) : (
                  <ol className="relative space-y-6 border-l border-slate-200 pl-5">
                    {student.progressTimeline.map((event, idx) => (
                      <li key={idx} className="relative">
                        <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-teal-500" />
                        <p className="text-xs font-medium text-slate-400">{event.date}</p>
                        <p className="text-sm font-semibold text-navy-950">{event.label}</p>
                        <p className="text-xs text-slate-500">{event.detail}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        );
      }}
    </AsyncSection>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-extrabold text-navy-950">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-navy-900">{value}</dd>
    </div>
  );
}
