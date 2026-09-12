// Single entry point for the mock "database" — everything a
// MockDataProvider needs, generated once from deterministic seeds.

export { SCHOOL, ACADEMIC_YEAR, SUBJECTS, TEACHERS, CLASSES, CLASS_ROOMS, subjectById } from './config';
export { ASSESSMENTS, LATEST_ASSESSMENT_ID, PREVIOUS_ASSESSMENT_ID } from './assessments';
export { students, academicResults, stemEligibility, novaStudentIds, supernovaStudentIds } from './students';
export { attendance } from './attendance';
export { interventions, interventionActions } from './interventions';
export { KPI_TARGETS_SEED, KPI_SNAPSHOTS_SEED } from './kpi';
