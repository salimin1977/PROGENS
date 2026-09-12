import { useState } from 'react';
import { School, CalendarRange, Target, ShieldAlert, UsersRound, Settings as SettingsIcon } from 'lucide-react';
import { getSchoolProfile } from '../services/schoolService';
import { getDataProvider } from '../providers';
import { useAsync } from '../hooks/useAsync';
import AsyncSection from '../components/ui/AsyncSection';
import type { AppRole } from '../types/schema';

interface AppUserRow {
  name: string;
  role: AppRole;
  access: string;
}

const USERS: AppUserRow[] = [
  { name: 'Tuan Haji Ahmad Faizal bin Othman', role: 'PENGETUA', access: 'Full Access' },
  { name: 'Pn. Rohana Ibrahim', role: 'GKMP', access: 'Academic & Reports' },
  { name: 'En. Muthu Kumaran', role: 'COUNSELLOR', access: 'Intervention & Students' },
  { name: 'Cik Ling Wei Yee', role: 'TEACHER', access: 'STEM & Academic' },
  { name: 'En. Zulfadli Aziz', role: 'TEACHER', access: 'Attendance & Students' },
  { name: 'System Administrator', role: 'ADMIN', access: 'Full System Configuration' },
];

async function loadSettingsData() {
  const [school, kpiTargets] = await Promise.all([getSchoolProfile(), getDataProvider().getKpiTargets()]);
  return { school, kpiTargets };
}

export default function Settings() {
  const [thresholds, setThresholds] = useState({ critical: 4, high: 2, medium: 1 });
  const state = useAsync(loadSettingsData, []);

  return (
    <AsyncSection state={state} loadingLabel="Loading settings…">
      {({ school, kpiTargets }) => {
        const gpsTarget = kpiTargets.find((k) => k.kpi_name === 'GPS Semasa');
        const gpmpTarget = kpiTargets.find((k) => k.kpi_name === 'GPMP Matematik');
        const passRateTarget = kpiTargets.find((k) => k.kpi_name === 'Kadar Lulus');
        const attendanceTarget = kpiTargets.find((k) => k.kpi_name === 'Kehadiran');

        return (
          <div className="space-y-6">
            <SettingsSection icon={School} title="School Profile">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ReadField label="School Name" value={school.name} />
                <ReadField label="School Code" value={school.code} />
                <ReadField label="Principal" value={school.principal} />
                <ReadField label="Address" value={school.address} />
                <ReadField label="Total Students" value={school.totalStudents.toString()} />
                <ReadField label="Total Teachers" value={school.totalTeachers.toString()} />
              </div>
            </SettingsSection>

            <SettingsSection icon={CalendarRange} title="Academic Year">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ReadField label="Current Academic Year" value={school.academicYear} />
                <ReadField label="Term" value="Term 2" />
                <ReadField label="SPM Cohort" value={`Tingkatan 5, ${school.academicYear}`} />
              </div>
            </SettingsSection>

            <SettingsSection icon={Target} title="KPI Targets">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ReadField label="GPS Target" value={(gpsTarget?.target_value ?? 4.84).toFixed(2)} />
                <ReadField label="GPMP Matematik Target" value={(gpmpTarget?.target_value ?? 5).toFixed(2)} />
                <ReadField label="Pass Rate Target" value={`${passRateTarget?.target_value ?? 95}%`} />
                <ReadField label="Attendance Target" value={`${attendanceTarget?.target_value ?? 97}%`} />
              </div>
            </SettingsSection>

            <SettingsSection icon={ShieldAlert} title="Risk Threshold">
              <p className="mb-4 text-xs text-slate-500">
                Number of G-grade subjects that classifies a student at each risk level (see the Risk Engine — docs/risk-engine.md).
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ThresholdField label="Critical at or above" value={thresholds.critical} onChange={(v) => setThresholds((t) => ({ ...t, critical: v }))} />
                <ThresholdField label="High at or above" value={thresholds.high} onChange={(v) => setThresholds((t) => ({ ...t, high: v }))} />
                <ThresholdField label="Medium at or above" value={thresholds.medium} onChange={(v) => setThresholds((t) => ({ ...t, medium: v }))} />
              </div>
            </SettingsSection>

            <SettingsSection icon={UsersRound} title="User Management">
              <p className="mb-3 text-xs text-slate-500">Access roles prepared for Supabase Row Level Security: ADMIN, PENGETUA, GKMP, TEACHER, COUNSELLOR, VIEWER.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Role</th>
                      <th className="px-3 py-2 font-semibold">Access Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {USERS.map((u) => (
                      <tr key={u.name}>
                        <td className="px-3 py-3 font-medium text-navy-950">{u.name}</td>
                        <td className="px-3 py-3 text-slate-600">{u.role}</td>
                        <td className="px-3 py-3 text-slate-600">{u.access}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SettingsSection>

            <SettingsSection icon={SettingsIcon} title="System Configuration">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ReadField label="Data Source" value="Mock Dataset (DataProvider: mock)" />
                <ReadField label="Planned Backend" value="Supabase (PostgreSQL)" />
                <ReadField label="Authentication" value="Not yet configured" />
                <ReadField label="Last Sync" value="Local prototype — no live sync" />
              </div>
            </SettingsSection>
          </div>
        );
      }}
    </AsyncSection>
  );
}

function SettingsSection({ icon: Icon, title, children }: { icon: typeof School; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-teal-700" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-navy-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy-900">{value}</p>
    </div>
  );
}

function ThresholdField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-navy-900 outline-none focus:border-teal-500"
      />
    </div>
  );
}
