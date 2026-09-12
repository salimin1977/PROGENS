import { Network, Database, Lightbulb, Zap, Users, GraduationCap, CalendarCheck, ClipboardList, LifeBuoy, UserCog } from 'lucide-react';
import InsightCard from '../components/ui/InsightCard';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getAiInsights, getDataInsightActionPipeline, getDataSources } from '../services/analyticsService';

const ICON_BY_LABEL: Record<string, typeof Users> = {
  'Student Data': Users,
  'Academic Data': GraduationCap,
  'Attendance Data': CalendarCheck,
  'Assessment Data': ClipboardList,
  'Intervention Data': LifeBuoy,
  'Teacher Data': UserCog,
};

async function loadNexusData() {
  const [dataSources, insights, pipeline] = await Promise.all([getDataSources(), getAiInsights(), getDataInsightActionPipeline()]);
  return { dataSources, insights, pipeline };
}

export default function Nexus() {
  const state = useAsync(loadNexusData, []);

  return (
    <AsyncSection state={state} loadingLabel="Loading NEXUS intelligence hub…">
      {({ dataSources, insights, pipeline }) => (
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
              {dataSources.map(({ label, description, recordCount }) => {
                const Icon = ICON_BY_LABEL[label] ?? Database;
                return (
                  <div key={label} className="card flex items-start gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-navy-700">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-950">{label}</p>
                      <p className="text-xs text-slate-500">{description}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-teal-700">{recordCount} records</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy-900">Data &rarr; Insight &rarr; Action</h3>
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
              <PipelineStep icon={Database} label="Data" text={pipeline.data} tone="neutral" />
              <PipelineStep icon={Lightbulb} label="Insight" text={pipeline.insight} tone="warning" />
              <PipelineStep icon={Zap} label="Action" text={pipeline.action} tone="positive" />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">AI Insight Cards</h3>
            {insights.length === 0 ? (
              <p className="text-sm text-slate-500">No significant bottlenecks or risk clusters detected this cycle.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AsyncSection>
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
