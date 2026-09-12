import { useState } from 'react';
import { School, CalendarRange, Target, ShieldAlert, UsersRound, Settings as SettingsIcon } from 'lucide-react';
import { schoolProfile } from '../data/kpi';
import { academicKpi } from '../data/academic';
import { attendanceKpi } from '../data/attendance';

const USERS = [
  { name: 'Tuan Haji Ahmad Faizal bin Othman', role: 'Principal', access: 'Full Access' },
  { name: 'Pn. Rohana Ibrahim', role: 'Senior Assistant (Academic)', access: 'Academic & Reports' },
  { name: 'En. Muthu Kumaran', role: 'Counsellor', access: 'Intervention & Students' },
  { name: 'Cik Ling Wei Yee', role: 'STEM Coordinator', access: 'STEM & Academic' },
  { name: 'En. Zulfadli Aziz', role: 'Discipline Teacher', access: 'Attendance & Students' },
];

export default function Settings() {
  const [thresholds, setThresholds] = useState({ critical: 50, high: 60, moderate: 72 });

  return (
    <div className="space-y-6">
      <SettingsSection icon={School} title="School Profile">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadField label="School Name" value={schoolProfile.name} />
          <ReadField label="School Code" value={schoolProfile.code} />
          <ReadField label="Principal" value={schoolProfile.principal} />
          <ReadField label="Address" value={schoolProfile.address} />
          <ReadField label="Total Students" value={schoolProfile.totalStudents.toString()} />
          <ReadField label="Total Teachers" value={schoolProfile.totalTeachers.toString()} />
        </div>
      </SettingsSection>

      <SettingsSection icon={CalendarRange} title="Academic Year">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ReadField label="Current Academic Year" value={schoolProfile.academicYear} />
          <ReadField label="Term" value="Term 2" />
          <ReadField label="SPM Cohort" value="Tingkatan 5, 2026" />
        </div>
      </SettingsSection>

      <SettingsSection icon={Target} title="KPI Targets">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadField label="GPS Target" value={academicKpi.gpsTarget.toFixed(2)} />
          <ReadField label="GPMP Target" value={`${academicKpi.gpmpTarget}%`} />
          <ReadField label="Pass Rate Target" value={`${academicKpi.passRateTarget}%`} />
          <ReadField label="Attendance Target" value={`${attendanceKpi.target}%`} />
        </div>
      </SettingsSection>

      <SettingsSection icon={ShieldAlert} title="Risk Threshold">
        <p className="mb-4 text-xs text-slate-500">Adjust the academic score thresholds used to classify student risk levels.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ThresholdField label="Critical below" value={thresholds.critical} onChange={(v) => setThresholds((t) => ({ ...t, critical: v }))} />
          <ThresholdField label="High below" value={thresholds.high} onChange={(v) => setThresholds((t) => ({ ...t, high: v }))} />
          <ThresholdField label="Moderate below" value={thresholds.moderate} onChange={(v) => setThresholds((t) => ({ ...t, moderate: v }))} />
        </div>
      </SettingsSection>

      <SettingsSection icon={UsersRound} title="User Management">
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
          <ReadField label="Data Source" value="Mock Dataset (Prototype)" />
          <ReadField label="Planned Backend" value="Supabase (PostgreSQL)" />
          <ReadField label="Authentication" value="Not yet configured" />
          <ReadField label="Last Sync" value="Local prototype — no live sync" />
        </div>
      </SettingsSection>
    </div>
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
