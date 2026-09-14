import type { AcademicResult, AttendanceRecord, Intervention, Student } from '../types';
import { buildDataQualitySummary, type QualitySummary } from './dataQualityEngine';

export type ProductionCheckStatus = 'PASS' | 'WARN' | 'FAIL';
export type ProductionCheckCategory =
  | 'ENVIRONMENT' | 'DATABASE' | 'PROVIDER' | 'DATA' | 'ASSESSMENT'
  | 'ATTENDANCE' | 'INTERVENTION' | 'PRIVACY' | 'BUILD' | 'SECURITY' | 'RELEASE';
export type ProductionSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export interface ProductionCheck {
  id: string;
  category: ProductionCheckCategory;
  label: string;
  status: ProductionCheckStatus;
  severity: ProductionSeverity;
  detail: string;
  recommendation: string;
}

export type ProductionGate = 'READY' | 'READY WITH WARNINGS' | 'NOT READY';

export interface ProductionReadinessResult {
  checks: ProductionCheck[];
  gate: ProductionGate;
  criticalFailures: number;
  warnings: number;
  quality: QualitySummary;
  latestAssessment: { name: string; type: string; date: string | null; coverage: number };
  latestAttendanceDate: string | null;
  latestInterventionDate: string | null;
}

interface BuildProductionReadinessInput {
  students: Student[];
  results: AcademicResult[];
  attendance: AttendanceRecord[];
  interventions: Intervention[];
  environment: { configured: boolean; productionBuild?: boolean };
  provider: 'LIVE' | 'MOCK' | 'ERROR' | 'NOT_CONFIGURED';
  database: 'CONNECTED' | 'ERROR' | 'NOT_CONFIGURED';
  dataHealth?: QualitySummary;
  prohibitedFieldScan?: unknown[];
}

const PROHIBITED_IDENTITY_KEYS = new Set([
  'nokadicpengenalan', 'mykad', 'mykid', 'passportnumber', 'passportno',
  'governmentid', 'governmentidentitynumber', 'identitynumber', 'icnumber',
]);

const normaliseKey = (key: string) => key.toLowerCase().replace(/[\s_.-]/g, '');

function containsProhibitedIdentityField(value: unknown, seen = new Set<object>()): boolean {
  if (!value || typeof value !== 'object') return false;
  if (seen.has(value as object)) return false;
  seen.add(value as object);
  if (Array.isArray(value)) return value.some((item) => containsProhibitedIdentityField(item, seen));
  return Object.entries(value as Record<string, unknown>).some(([key, child]) =>
    PROHIBITED_IDENTITY_KEYS.has(normaliseKey(key)) || containsProhibitedIdentityField(child, seen)
  );
}

function latestDate(values: Array<string | null | undefined>): string | null {
  const valid = values.filter((value): value is string => Boolean(value) && !Number.isNaN(Date.parse(value)));
  if (!valid.length) return null;
  return valid.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

export function buildProductionReadiness(input: BuildProductionReadinessInput): ProductionReadinessResult {
  const { students, results, attendance, interventions } = input;
  const quality = input.dataHealth ?? buildDataQualitySummary(students, results, attendance, interventions);
  const checks: ProductionCheck[] = [];
  const add = (check: ProductionCheck) => checks.push(check);

  add({
    id: 'env-config', category: 'ENVIRONMENT', label: 'Environment configuration',
    status: input.environment.configured ? 'PASS' : 'FAIL', severity: 'CRITICAL',
    detail: input.environment.configured ? 'Required Supabase environment variables are configured.' : 'Supabase environment is not configured.',
    recommendation: input.environment.configured ? 'Keep secrets out of client code and deployment logs.' : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment.',
  });

  add({
    id: 'supabase-connection', category: 'DATABASE', label: 'Supabase connectivity',
    status: input.database === 'CONNECTED' ? 'PASS' : input.database === 'NOT_CONFIGURED' ? 'FAIL' : 'FAIL',
    severity: 'CRITICAL',
    detail: input.database === 'CONNECTED' ? 'Supabase health check completed successfully.' : input.database === 'NOT_CONFIGURED' ? 'Supabase is not configured.' : 'Supabase health check failed.',
    recommendation: input.database === 'CONNECTED' ? 'Continue monitoring connection errors in production.' : 'Check environment configuration, project availability and network access.',
  });

  const providerStatus: ProductionCheckStatus = input.provider === 'LIVE' ? 'PASS' : input.provider === 'MOCK' ? 'WARN' : 'FAIL';
  add({
    id: 'provider-status', category: 'PROVIDER', label: 'Data provider', status: providerStatus,
    severity: input.provider === 'LIVE' ? 'MAJOR' : 'CRITICAL',
    detail: input.provider === 'LIVE' ? 'LIVE SUPABASE provider is active.' : input.provider === 'MOCK' ? 'MOCK FALLBACK is active; this is not production data.' : input.provider === 'NOT_CONFIGURED' ? 'No live provider is configured.' : 'The live provider failed to initialise or respond.',
    recommendation: input.provider === 'LIVE' ? 'No action required.' : 'Do not treat mock/fallback data as live school data; fix production configuration before release.',
  });

  for (const qualityCheck of quality.checks) {
    const severity: ProductionSeverity = ['student-master', 'result-links', 'marks-range', 'attendance-links', 'intervention-links'].includes(qualityCheck.id) ? 'CRITICAL' : 'MAJOR';
    add({ id: `data-${qualityCheck.id}`, category: 'DATA', label: qualityCheck.label, status: qualityCheck.status, severity, detail: qualityCheck.detail, recommendation: qualityCheck.status === 'PASS' ? 'No action required.' : 'Review the Data Health findings before relying on the affected data.' });
  }

  const datedResults = results.filter((result) => result.assessmentDate && !Number.isNaN(Date.parse(result.assessmentDate)));
  const latestAssessmentDate = latestDate(datedResults.map((result) => result.assessmentDate));
  const latestAssessmentRows = latestAssessmentDate
    ? results.filter((result) => result.assessmentDate === latestAssessmentDate)
    : results;
  const latestAssessment = latestAssessmentRows[0];
  const latestAssessmentStudents = new Set(latestAssessmentRows.map((result) => result.studentId));
  const assessmentCoverage = students.length ? Math.round((latestAssessmentStudents.size / students.length) * 100) : 0;
  const assessmentStatus: ProductionCheckStatus = results.length === 0 ? 'WARN' : latestAssessmentDate ? (assessmentCoverage >= 90 ? 'PASS' : 'WARN') : 'WARN';
  add({
    id: 'assessment-freshness', category: 'ASSESSMENT', label: 'Assessment freshness', status: assessmentStatus, severity: 'MAJOR',
    detail: results.length === 0 ? 'No academic assessment records are available.' : `Latest assessment: ${latestAssessment?.assessmentName || latestAssessment?.assessment || 'Assessment identity unavailable'} • ${latestAssessmentDate ?? 'Date unavailable'} • coverage ${assessmentCoverage}%.`,
    recommendation: assessmentStatus === 'PASS' ? 'No action required.' : 'Verify the latest assessment identity/date and coverage; do not invent missing dates.',
  });

  const invalidAttendanceRate = attendance.some((row) => row.rate !== undefined && (row.rate < 0 || row.rate > 100));
  const attendanceHasVerifiedRate = attendance.some((row) => row.rate !== undefined);
  add({
    id: 'attendance-integrity', category: 'ATTENDANCE', label: 'Attendance integrity', status: invalidAttendanceRate ? 'FAIL' : 'PASS', severity: 'CRITICAL',
    detail: invalidAttendanceRate ? 'Attendance rate contains values outside 0–100.' : attendanceHasVerifiedRate ? 'Verified attendance rates exist in the provider contract.' : 'Source is represented as absence days; no attendance percentage is inferred.',
    recommendation: invalidAttendanceRate ? 'Correct invalid attendance rate values.' : 'Keep absence days separate from attendance percentage unless a verified denominator/rate exists.',
  });

  const latestInterventionDate = latestDate(interventions.map((item) => item.startDate));
  const interventionMissingStudent = interventions.some((item) => !item.studentId);
  add({
    id: 'intervention-integrity', category: 'INTERVENTION', label: 'Intervention integrity', status: interventionMissingStudent ? 'FAIL' : interventions.length ? 'PASS' : 'WARN', severity: 'MAJOR',
    detail: interventionMissingStudent ? 'One or more intervention records have no student linkage.' : interventions.length ? `${interventions.length} intervention records are available.` : 'No intervention records are available.',
    recommendation: interventionMissingStudent ? 'Repair intervention-to-student linkage.' : 'Review ownership, status and next action completeness operationally.',
  });

  const identityViolation = containsProhibitedIdentityField([input.students, input.results, input.attendance, input.interventions, ...(input.prohibitedFieldScan ?? [])]);
  add({
    id: 'identity-policy', category: 'PRIVACY', label: 'Identity policy', status: identityViolation ? 'FAIL' : 'PASS', severity: 'CRITICAL',
    detail: identityViolation ? 'A prohibited government identity-number field was detected in the scanned application/data contract.' : 'No prohibited identity-number field was detected in the scanned contract/data.',
    recommendation: identityViolation ? 'Remove the prohibited identity-number field and prevent import/storage.' : 'Do not add IC/MyKad/MyKID/passport/government identity-number fields.',
  });

  add({
    id: 'client-secrets', category: 'SECURITY', label: 'Client-side secrets', status: 'PASS', severity: 'CRITICAL',
    detail: 'The approved browser configuration uses only public Vite Supabase variables; service-role credentials are not part of the production contract.',
    recommendation: 'Keep SUPABASE_SERVICE_ROLE_KEY server-side only and never expose it through Vite client variables.',
  });

  add({
    id: 'build-readiness', category: 'BUILD', label: 'Build readiness', status: input.environment.productionBuild === false ? 'WARN' : 'PASS', severity: 'MAJOR',
    detail: input.environment.productionBuild === false ? 'The current runtime is a development build.' : 'Production build flag is acceptable or was not contradicted by the runtime.',
    recommendation: input.environment.productionBuild === false ? 'Run and deploy the verified production build before release.' : 'Run npm run build and npm run lint in CI before release.',
  });

  const criticalFailures = checks.filter((check) => check.status === 'FAIL' && check.severity === 'CRITICAL').length;
  const warnings = checks.filter((check) => check.status === 'WARN').length;
  const gate: ProductionGate = criticalFailures > 0 ? 'NOT READY' : checks.some((check) => check.status === 'FAIL') || warnings > 0 ? 'READY WITH WARNINGS' : 'READY';
  checks.push({
    id: 'release-gate', category: 'RELEASE', label: 'Production release gate',
    status: gate === 'READY' ? 'PASS' : gate === 'READY WITH WARNINGS' ? 'WARN' : 'FAIL',
    severity: 'CRITICAL',
    detail: gate === 'READY' ? 'No production-blocking checks failed.' : gate === 'READY WITH WARNINGS' ? 'No critical check failed, but warnings or non-critical failures remain.' : `${criticalFailures} critical production check(s) failed.`,
    recommendation: gate === 'READY' ? 'Proceed only after final human review.' : 'Resolve the checks identified as production blockers before release.',
  });

  return {
    checks, gate, criticalFailures, warnings, quality,
    latestAssessment: { name: latestAssessment?.assessmentName || latestAssessment?.assessment || 'Assessment identity unavailable', type: latestAssessment?.assessment || 'Unknown', date: latestAssessmentDate, coverage: assessmentCoverage },
    latestAttendanceDate: latestDate(attendance.map((row) => row.date)),
    latestInterventionDate,
  };
}
