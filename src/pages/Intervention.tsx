import { useMemo, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import RiskCard from '../components/ui/RiskCard';
import InterventionCard from '../components/ui/InterventionCard';
import FilterBar from '../components/ui/FilterBar';
import EmptyState from '../components/ui/EmptyState';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getInterventionSummary, listInterventions } from '../services/interventionService';
import type { InterventionStatus } from '../types';

const STATUSES: InterventionStatus[] = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CLOSED'];

async function loadInterventionPage(search: string, status: string) {
  const [interventions, summary] = await Promise.all([
    listInterventions({ search: search || undefined, status: (status as InterventionStatus) || undefined }),
    getInterventionSummary(),
  ]);
  return { interventions, summary };
}

export default function Intervention() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const state = useAsync(() => loadInterventionPage(search, statusFilter), [search, statusFilter]);

  const filters = useMemo(
    () => [{ label: 'Status', value: statusFilter, onChange: setStatusFilter, options: STATUSES.map((s) => ({ label: s, value: s })) }],
    [statusFilter]
  );

  return (
    <AsyncSection state={state} loadingLabel="Loading intervention command…">
      {({ interventions, summary }) => (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <RiskCard label="Critical Students" count={summary.criticalStudents} tone="critical" />
            <RiskCard label="High-Risk Students" count={summary.highRiskStudents} tone="high" />
            <RiskCard label="Active Interventions" count={summary.active} tone="moderate" />
            <RiskCard label="Completed Interventions" count={summary.completed} tone="low" />
          </section>

          <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by student name..." filters={filters} />

          {interventions.length === 0 ? (
            <EmptyState icon={LifeBuoy} title="No intervention cases match your filters" description="Adjust filters or search to view active cases." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {interventions.map((i) => (
                <InterventionCard key={i.id} intervention={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </AsyncSection>
  );
}
