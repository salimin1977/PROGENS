import type { AiInsight } from '../types';
import { generateNexusInsights } from '../analytics/nexusEngine';
import { getAcademicOverview } from './academicService';
import { getAttendanceOverview } from './attendanceService';
import { getStemOverview } from './stemService';
import { loadCoreDataset } from './dataset';
import { getInterventionSummary } from './interventionService';

export interface DataSourceSummary {
  label: string;
  description: string;
  recordCount: number;
}

export async function getDataSources(): Promise<DataSourceSummary[]> {
  const dataset = await loadCoreDataset();
  return [
    { label: 'Student Data', description: `${dataset.students.length} student records synchronized`, recordCount: dataset.students.length },
    { label: 'Academic Data', description: 'Subject scores, GPS, grade distribution', recordCount: dataset.latestResults.length + dataset.previousResults.length },
    { label: 'Attendance Data', description: 'Daily attendance and absence patterns', recordCount: dataset.attendance.length },
    { label: 'Assessment Data', description: `${dataset.assessments.length} assessments recorded this year`, recordCount: dataset.assessments.length },
    { label: 'Intervention Data', description: 'Case status, progress and outcomes', recordCount: dataset.interventions.length },
    { label: 'Teacher Data', description: 'Coverage, caseload and engagement records', recordCount: dataset.teachers.length },
  ];
}

export async function getAiInsights(): Promise<AiInsight[]> {
  const [academic, attendance, stem] = await Promise.all([getAcademicOverview(), getAttendanceOverview(), getStemOverview()]);
  return generateNexusInsights({ academic, attendance, stem });
}

export interface DataInsightActionPipeline {
  data: string;
  insight: string;
  action: string;
}

export async function getDataInsightActionPipeline(): Promise<DataInsightActionPipeline> {
  const [dataset, interventionSummary] = await Promise.all([loadCoreDataset(), getInterventionSummary()]);
  const atRisk = interventionSummary.criticalStudents + interventionSummary.highRiskStudents;
  const insights = await getAiInsights();
  const topInsight = insights[0];

  return {
    data: `${atRisk} of ${dataset.students.length} students identified as high risk`,
    insight: topInsight ? topInsight.headline : 'No significant bottleneck detected this cycle',
    action: topInsight ? topInsight.action : 'Continue standard monitoring',
  };
}
