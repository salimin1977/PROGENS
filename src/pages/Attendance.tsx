import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { CalendarCheck, AlertTriangle, TrendingDown, UserX } from 'lucide-react';
import KPICard from '../components/ui/KPICard';
import ChartCard from '../components/ui/ChartCard';
import { attendanceByClass, attendanceTrend, riskVsAttendance, attendanceKpi } from '../data/attendance';

export default function Attendance() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Attendance Rate" value={`${attendanceKpi.overallRate}%`} icon={CalendarCheck} tone="positive" helperText={`Target ${attendanceKpi.target}%`} />
        <KPICard label="Chronic Absence" value={attendanceKpi.chronicAbsence.toString()} icon={UserX} tone="critical" helperText="Below 80% attendance" />
        <KPICard label="Students Below 90%" value={attendanceKpi.below90.toString()} icon={TrendingDown} tone="warning" />
        <KPICard label="Students Below 80%" value={attendanceKpi.below80.toString()} icon={AlertTriangle} tone="critical" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Attendance by Class" description="Average attendance rate per class">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByClass}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="className" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-30} textAnchor="end" height={60} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="rate" fill="#17877e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Attendance Trend" description="School-wide monthly attendance rate">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[90, 97]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#166b66" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <ChartCard title="Risk vs Attendance" description="Relationship between attendance bands and academic risk">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="band" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDuplicatedCategory={false} />
              <YAxis dataKey="avgRisk" type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" label={{ value: 'Avg Risk Index', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <ZAxis dataKey="studentCount" range={[100, 800]} name="Students" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={riskVsAttendance} fill="#d6931f" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-slate-500">Bubble size reflects number of students in each attendance band. Lower attendance bands consistently show higher average risk.</p>
      </ChartCard>
    </div>
  );
}
