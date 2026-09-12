import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import FilterBar from '../components/ui/FilterBar';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { listClassNames, listStudents } from '../services/studentService';
import type { Student, RiskLevel } from '../types';

const FORMS = ['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'];
const RISK_LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

async function loadStudentsPage(filters: { search: string; classFilter: string; formFilter: string; riskFilter: string }) {
  const [students, classNames] = await Promise.all([
    listStudents({
      search: filters.search || undefined,
      className: filters.classFilter || undefined,
      form: (filters.formFilter as Student['form']) || undefined,
      riskLevel: (filters.riskFilter as RiskLevel) || undefined,
    }),
    listClassNames(),
  ]);
  return { students, classNames };
}

export default function Students() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState(searchParams.get('className') ?? '');
  const [formFilter, setFormFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const filters = useMemo(() => ({ search, classFilter, formFilter, riskFilter }), [search, classFilter, formFilter, riskFilter]);
  const state = useAsync(() => loadStudentsPage(filters), [filters]);

  const columns: Column<Student>[] = [
    {
      header: 'Student',
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-teal-300">{s.photoInitials}</div>
          <div>
            <p className="font-semibold text-navy-950">{s.name}</p>
            <p className="text-xs text-slate-400">{s.studentNo}</p>
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
    <AsyncSection state={state} loadingLabel="Loading student directory…">
      {({ students, classNames }) => (
        <div className="space-y-4">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or ID..."
            filters={[
              { label: 'Class', value: classFilter, onChange: setClassFilter, options: classNames.map((c) => ({ label: c, value: c })) },
              { label: 'Form', value: formFilter, onChange: setFormFilter, options: FORMS.map((f) => ({ label: f, value: f })) },
              { label: 'Risk', value: riskFilter, onChange: setRiskFilter, options: RISK_LEVELS.map((r) => ({ label: r, value: r })) },
            ]}
          />

          <p className="text-xs text-slate-500">{students.length} student(s) shown</p>

          <div className="card p-4">
            {students.length === 0 ? (
              <EmptyState icon={Users} title="No students match your filters" description="Try adjusting the search or filter criteria." />
            ) : (
              <DataTable columns={columns} rows={students} keyFn={(s) => s.id} onRowClick={(s) => navigate(`/students/${s.id}`)} />
            )}
          </div>
        </div>
      )}
    </AsyncSection>
  );
}
