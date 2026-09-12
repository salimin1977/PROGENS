import { Users, GraduationCap, CalendarCheck, ShieldAlert, LifeBuoy, FlaskConical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import KPICard from '../components/ui/KPICard';
import ChartCard from '../components/ui/ChartCard';
import ProgressBar from '../components/ui/ProgressBar';
import InsightCard from '../components/ui/InsightCard';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getCommandKpis, getStrategicOverview } from '../services/kpiService';
import { getAcademicOverview } from '../services/academicService';
import { getAiInsights } from '../services/analyticsService';
import { getInterventionSummary } from '../services/interventionService';
import { loadCoreDataset } from '../services/dataset';
import { buildRiskLookup } from '../services/riskLookup';
import type { RiskLevel } from '../types';

const RISK_COLORS: Record<RiskLevel, string> = {
  CRITICAL: '#e11d48',
  HIGH: '#fb7185',
  MEDIUM: '#d6931f',
  LOW: '#22a89b',
};

async function loadCommandData() {
  const [kpis, overview, academic, insights, interventionSummary, dataset] = await Promise.all([
    getCommandKpis(),
    getStrategicOverview(),
    getAcademicOverview(),
    getAiInsights(),
    getInterventionSummary(),
    loadCoreDataset(),
  ]);

  const riskLookup = buildRiskLookup(dataset);
  const riskCounts: Record<RiskLevel, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const risk of riskLookup.values()) riskCounts[risk.risk_level]++;

  return { kpis, overview, academic, insights, interventionSummary, riskCounts };
}

export default function Command() {
  const state = useAsync(loadCommandData, []);

  return (
    <AsyncSection state={state} loadingLabel="Loading Command Centre…">
      {({ kpis, overview, academic, insights, interventionSummary, riskCounts }) => {
        const riskData = (Object.keys(riskCounts) as RiskLevel[]).map((level) => ({ name: level, value: riskCounts[level] }));
        const interventionData = [
          { name: 'Planned', value: interventionSummary.planned },
          { name: 'Active', value: interventionSummary.active },
          { name: 'Completed', value: interventionSummary.completed },
          { name: 'Closed', value: interventionSummary.closed },
        ];
        const gpsImproving = academic.gpsCurrent > academic.gpsTarget;

        return (
          <div className="space-y-6">
            <section>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <KPICard label="Total Students" value={kpis.totalStudents.toString()} icon={Users} tone="neutral" helperText="Across Tingkatan 1-5" />
                <KPICard label="Academic Performance" value={`${kpis.academicPerformance}%`} icon={GraduationCap} tone="positive" trend={{ direction: 'up', text: 'Pass rate' }} />
                <KPICard label="Attendance" value={`${kpis.attendance.toFixed(1)}%`} icon={CalendarCheck} tone="positive" helperText="School average" />
                <KPICard label="Students at Risk" value={kpis.studentsAtRisk.toString()} icon={ShieldAlert} tone="critical" helperText="Critical + High" />
                <KPICard label="Intervention Active" value={kpis.interventionActive.toString()} icon={LifeBuoy} tone="warning" helperText="Cases in progress" />
                <KPICard label="STEM Pipeline" value={kpis.stemPipeline.toString()} icon={FlaskConical} tone="positive" helperText="Identified candidates" />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ChartCard title="Student Progress" description="School-wide progress index" className="lg:col-span-1">
                <div className="space-y-4">
                  <ProgressOverview label="Overall Progress" value={overview.overallProgress} tone="navy" />
                  <ProgressOverview label="Academic" value={overview.academic} tone="teal" />
                  <ProgressOverview label="Attendance" value={overview.attendance} tone="teal" />
                  <ProgressOverview label="Intervention" value={overview.intervention} tone="gold" />
                  <ProgressOverview label="Talent" value={overview.talent} tone="gold" />
                </div>
              </ChartCard>

              <ChartCard title="School Performance" description="Grade Purata Sekolah trajectory" className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Metric label="GPS Current" value={academic.gpsCurrent.toFixed(2)} />
                  <Metric label="GPS Target" value={academic.gpsTarget.toFixed(2)} />
                  <Metric label="Pass Rate" value={`${academic.passRate}%`} />
                  <Metric label="Students At Risk" value={kpis.studentsAtRisk.toString()} />
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-navy-900">Status: </span>
                  <span className={gpsImproving ? 'text-gold-700 font-semibold' : 'text-teal-700 font-semibold'}>
                    {gpsImproving ? 'Improvement Required' : 'On Track'}
                  </span>
                  <span className="ml-2 text-slate-500">GPS must decrease from {academic.gpsCurrent.toFixed(2)} to {academic.gpsTarget.toFixed(2)} (lower is better).</span>
                </div>
                <div className="mt-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={academic.gpsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis domain={[4.5, 6]} reversed tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="gps" name="GPS" stroke="#166b66" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="target" name="Target" stroke="#d6931f" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Risk Distribution" description="Students by risk category">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {riskData.map((entry) => (
                          <Cell key={entry.name} fill={RISK_COLORS[entry.name as RiskLevel]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Intervention Status" description="Case pipeline overview">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interventionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#17877e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-navy-900">Leadership Signal — What Requires Action</h3>
                <Link to="/nexus" className="whitespace-nowrap text-xs font-semibold text-teal-700 hover:underline">
                  View all insights in NEXUS &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          </div>
        );
      }}
    </AsyncSection>
  );
}

function ProgressOverview({ label, value, tone }: { label: string; value: number; tone: 'teal' | 'gold' | 'navy' }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-navy-800">{label}</span>
        <span className="font-bold text-navy-950">{value}%</span>
      </div>
      <ProgressBar value={value} tone={tone} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-navy-950">{value}</p>
    </div>
  );
}
