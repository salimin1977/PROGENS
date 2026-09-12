import { useState } from 'react';
import { FileText, Users, GraduationCap, CalendarCheck, LifeBuoy, FlaskConical, Landmark, Eye, Download, RefreshCw } from 'lucide-react';
import { schoolProfile } from '../data/kpi';

interface ReportType {
  id: string;
  label: string;
  description: string;
  icon: typeof FileText;
}

const REPORT_TYPES: ReportType[] = [
  { id: 'student', label: 'Student Report', description: 'Individual and cohort student progress summaries.', icon: Users },
  { id: 'academic', label: 'Academic Report', description: 'GPS, GPMP, subject and class performance analysis.', icon: GraduationCap },
  { id: 'attendance', label: 'Attendance Report', description: 'Attendance rates, chronic absence and trends.', icon: CalendarCheck },
  { id: 'intervention', label: 'Intervention Report', description: 'Case status, outcomes and teacher caseload.', icon: LifeBuoy },
  { id: 'stem', label: 'STEM Report', description: 'STEM pipeline readiness and elite candidate tracking.', icon: FlaskConical },
  { id: 'kpi', label: 'KPI Report', description: 'School-wide KPI targets, gaps and status.', icon: FileText },
  { id: 'executive', label: 'Executive Report', description: 'OLYMPUS scorecard summary for leadership review.', icon: Landmark },
];

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Record<string, string>>({});

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      setGeneratedAt((prev) => ({ ...prev, [id]: new Date().toLocaleString('en-MY') }));
      setPreviewId(id);
    }, 900);
  };

  const activeReport = REPORT_TYPES.find((r) => r.id === previewId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;
          return (
            <div key={report.id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-950">{report.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{report.description}</p>
                </div>
              </div>
              {generatedAt[report.id] && <p className="mt-3 text-[11px] text-slate-400">Last generated: {generatedAt[report.id]}</p>}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setPreviewId(report.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-slate-50"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => handleGenerate(report.id)}
                  disabled={isGenerating}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy-950 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-900 disabled:opacity-60"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
                <button
                  onClick={() => handleGenerate(report.id)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-slate-50"
                  aria-label="Download report"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeReport && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-navy-900">{activeReport.label} Preview</h3>
            <button onClick={() => setPreviewId(null)} className="text-xs font-semibold text-slate-400 hover:text-navy-800">
              Close
            </button>
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">PROGENS — Progress Genesis System</p>
            <h4 className="mt-1 text-lg font-extrabold text-navy-950">{schoolProfile.name}</h4>
            <p className="text-xs text-slate-500">{schoolProfile.address}</p>
            <div className="my-4 border-t border-slate-200" />
            <p className="text-sm font-semibold text-navy-900">{activeReport.label} — Academic Year {schoolProfile.academicYear}</p>
            <p className="mt-2 text-sm text-slate-600">
              This is a prototype preview. In production, this report would be generated from live Supabase data covering{' '}
              {activeReport.description.toLowerCase()} Export formats will include PDF and Excel with full institutional branding.
            </p>
            <p className="mt-4 text-xs text-slate-400">Generated by PROGENS Report Centre &middot; {generatedAt[activeReport.id] ?? 'Not yet generated'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
