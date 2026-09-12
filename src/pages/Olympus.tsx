import { Landmark } from 'lucide-react';
import ExecutiveScorecard from '../components/ui/ExecutiveScorecard';
import ChartCard from '../components/ui/ChartCard';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getExecutiveScorecard } from '../services/olympusService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Olympus() {
  const state = useAsync(getExecutiveScorecard, []);

  return (
    <AsyncSection state={state} loadingLabel="Loading OLYMPUS governance scorecard…">
      {(items) => {
        const categorySummary = Array.from(new Set(items.map((i) => i.category))).map((category) => {
          const categoryItems = items.filter((i) => i.category === category);
          const green = categoryItems.filter((i) => i.trafficLight === 'GREEN').length;
          return { category, score: Math.round((green / categoryItems.length) * 100) };
        });

        return (
          <div className="space-y-6">
            <div className="card flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                <Landmark size={22} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-navy-950">OLYMPUS — Strategic School Leadership &amp; Governance</h2>
                <p className="mt-1 text-sm text-slate-500">The executive command view of institutional performance across every domain.</p>
              </div>
            </div>

            <ChartCard title="Governance Readiness by Category" description="Share of KPIs currently on target (GREEN), by category">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="score" name="On Target %" fill="#182f4d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Executive Scorecard</h3>
              <ExecutiveScorecard items={items} />
            </section>
          </div>
        );
      }}
    </AsyncSection>
  );
}
