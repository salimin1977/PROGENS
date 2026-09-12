import { useMemo, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import RiskCard from '../components/ui/RiskCard';
import InterventionCard from '../components/ui/InterventionCard';
import FilterBar from '../components/ui/FilterBar';
import EmptyState from '../components/ui/EmptyState';
import { interventions, interventionSummary } from '../data/interventions';
import { students } from '../data/students';

const STATUSES = ['Critical', 'Active', 'Monitoring', 'Completed'];

export default function Intervention() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return interventions.filter((i) => {
      if (search && !i.studentName.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && i.status !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter]);

  const criticalStudents = students.filter((s) => s.riskLevel === 'Critical').length;
  const highRiskStudents = students.filter((s) => s.riskLevel === 'High').length;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RiskCard label="Critical Students" count={criticalStudents} tone="critical" />
        <RiskCard label="High-Risk Students" count={highRiskStudents} tone="high" />
        <RiskCard label="Active Interventions" count={interventionSummary.active} tone="moderate" />
        <RiskCard label="Completed Interventions" count={interventionSummary.completed} tone="low" />
      </section>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name..."
        filters={[{ label: 'Status', value: statusFilter, onChange: setStatusFilter, options: STATUSES.map((s) => ({ label: s, value: s })) }]}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No intervention cases match your filters" description="Adjust filters or search to view active cases." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((i) => (
            <InterventionCard key={i.id} intervention={i} />
          ))}
        </div>
      )}
    </div>
  );
}
