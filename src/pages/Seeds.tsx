import { Sprout } from 'lucide-react';
import ChartCard from '../components/ui/ChartCard';
import Funnel from '../components/ui/Funnel';
import StudentCard from '../components/ui/StudentCard';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getSeedsOverview } from '../services/seedsService';
import type { Student } from '../types';

const SEEDS_STAGES = [
  { key: 'S', label: 'Screen', description: 'Early screening of academic, attendance and behavioural indicators.' },
  { key: 'E', label: 'Evaluate', description: 'In-depth evaluation of strengths, gaps and talent potential.' },
  { key: 'E2', label: 'Empower', description: 'Empowerment through mentoring, resources and structured support.' },
  { key: 'D', label: 'Develop', description: 'Targeted development plans across academic and talent domains.' },
  { key: 'S2', label: 'Sustain', description: 'Sustained monitoring to lock in gains ahead of streaming.' },
];

export default function Seeds() {
  const state = useAsync(getSeedsOverview, []);

  return (
    <AsyncSection state={state} loadingLabel="Loading SEEDS overview…">
      {(overview) => (
        <div className="space-y-6">
          <div className="card flex items-start gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Sprout size={22} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy-950">SEEDS — Student Early Excellence & Development System</h2>
              <p className="mt-1 text-sm text-slate-500">Focused on Tingkatan 1-3, building the foundation for excellence before streaming.</p>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            {SEEDS_STAGES.map((stage) => (
              <div key={stage.key} className="card p-4 text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-navy-950 text-sm font-extrabold text-gold-300">
                  {stage.label[0]}
                </div>
                <p className="mt-2 text-sm font-bold text-navy-950">{stage.label}</p>
                <p className="mt-1 text-[11px] text-slate-500">{stage.description}</p>
              </div>
            ))}
          </section>

          <ChartCard title="Student Development Funnel" description="Progression of Tingkatan 1-3 students from identification to excellence">
            <Funnel stages={overview.funnel} />
          </ChartCard>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProgramPanel title="SOLARIS" subtitle="Top Tingkatan 1 Talent Programme" students={overview.solaris} />
            <ProgramPanel title="NOVA" subtitle="Top Tingkatan 2 Talent Programme" students={overview.nova} />
            <ProgramPanel title="SUPERNOVA" subtitle="Top Tingkatan 3 Talent Programme" students={overview.supernova} />
            <ProgramPanel title="STEM A PIPELINE" subtitle="Early STEM identification, Tingkatan 1-3" students={overview.stemPipeline} />
          </section>
        </div>
      )}
    </AsyncSection>
  );
}

function ProgramPanel({ title, subtitle, students }: { title: string; subtitle: string; students: Student[] }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-navy-900">{title}</h3>
      <p className="mb-3 text-xs text-slate-500">{subtitle}</p>
      <div className="space-y-2">
        {students.length === 0 ? <p className="text-xs text-slate-400">No students identified yet.</p> : students.map((s) => <StudentCard key={s.id} student={s} />)}
      </div>
    </div>
  );
}
