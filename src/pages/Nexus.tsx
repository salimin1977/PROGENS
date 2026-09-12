import { Network, Database, Lightbulb, Zap, Users, GraduationCap, CalendarCheck, ClipboardList, LifeBuoy, UserCog } from 'lucide-react';
import InsightCard from '../components/ui/InsightCard';
import { aiInsights, commandKpis } from '../data/kpi';

const DATA_SOURCES = [
  { label: 'Student Data', icon: Users, description: `${commandKpis.totalStudents} student records synchronized` },
  { label: 'Academic Data', icon: GraduationCap, description: 'Subject scores, GPS, grade distribution' },
  { label: 'Attendance Data', icon: CalendarCheck, description: 'Daily attendance and absence patterns' },
  { label: 'Assessment Data', icon: ClipboardList, description: 'Diagnostic and formative assessment results' },
  { label: 'Intervention Data', icon: LifeBuoy, description: 'Case status, progress and outcomes' },
  { label: 'Teacher Data', icon: UserCog, description: 'Coverage, caseload and engagement records' },
];

export default function Nexus() {
  return (
    <div className="space-y-6">
      <div className="card flex items-start gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-teal-300">
          <Network size={22} />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-navy-950">NEXUS — Integrated Data &amp; Intelligence Hub</h2>
          <p className="mt-1 text-sm text-slate-500">Where school data converges into insight and drives leadership action.</p>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Data Sources</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_SOURCES.map(({ label, icon: Icon, description }) => (
            <div key={label} className="card flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-navy-700">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-950">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy-900">Data &rarr; Insight &rarr; Action</h3>
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
          <PipelineStep icon={Database} label="Data" text="37 students identified as high risk across Tingkatan 2 and 3." tone="neutral" />
          <PipelineStep icon={Lightbulb} label="Insight" text="Mathematics is the major performance bottleneck across those classes." tone="warning" />
          <PipelineStep icon={Zap} label="Action" text="Targeted Mathematics intervention launched via GROW and SEEDS." tone="positive" />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">AI Insight Cards</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {aiInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PipelineStep({ icon: Icon, label, text, tone }: { icon: typeof Database; label: string; text: string; tone: 'neutral' | 'warning' | 'positive' }) {
  const toneStyles = {
    neutral: 'bg-slate-100 text-navy-700',
    warning: 'bg-gold-50 text-gold-700',
    positive: 'bg-teal-50 text-teal-700',
  }[tone];
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${toneStyles}`}>
        <Icon size={22} />
      </div>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-navy-900">{text}</p>
    </div>
  );
}
