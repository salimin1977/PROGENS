import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import FilterBar from '../components/ui/FilterBar';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { students, CLASSES } from '../data/students';
import type { Student } from '../types';

const FORMS = ['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'];
const RISK_LEVELS = ['Critical', 'High', 'Moderate', 'Low'];

export default function Students() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (classFilter && s.className !== classFilter) return false;
      if (formFilter && s.form !== formFilter) return false;
      if (riskFilter && s.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [search, classFilter, formFilter, riskFilter]);

  const columns: Column<Student>[] = [
    {
      header: 'Student',
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-teal-300">{s.photoInitials}</div>
          <div>
            <p className="font-semibold text-navy-950">{s.name}</p>
            <p className="text-xs text-slate-400">{s.id}</p>
          </div>
        </div>
      ),
    },
    { header: 'Class', accessor: (s) => s.className },
    { header: 'Year', accessor: (s) => s.form.replace('Tingkatan ', 'T') },
    { header: 'Academic Score', accessor: (s) => <span className="font-semibold">{s.academicScore}</span> },
    { header: 'Attendance', accessor: (s) => `${s.attendanceRate}%` },
    { header: 'Risk', accessor: (s) => <StatusBadge status={s.riskLevel} /> },
    { header: 'Status', accessor: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or ID..."
        filters={[
          { label: 'Class', value: classFilter, onChange: setClassFilter, options: CLASSES.map((c) => ({ label: c.name, value: c.name })) },
          { label: 'Form', value: formFilter, onChange: setFormFilter, options: FORMS.map((f) => ({ label: f, value: f })) },
          { label: 'Risk', value: riskFilter, onChange: setRiskFilter, options: RISK_LEVELS.map((r) => ({ label: r, value: r })) },
        ]}
      />

      <p className="text-xs text-slate-500">{filtered.length} of {students.length} students shown</p>

      <div className="card p-4">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No students match your filters" description="Try adjusting the search or filter criteria." />
        ) : (
          <DataTable columns={columns} rows={filtered} keyFn={(s) => s.id} onRowClick={(s) => navigate(`/students/${s.id}`)} />
        )}
      </div>
    </div>
  );
}
