import assert from 'node:assert/strict';
import { calculateGP, calculateGPI, calculateGPMP, calculateGPS, calculatePassRate } from '../src/analytics/academicAnalytics';
import { calculateStudentRisk } from '../src/analytics/riskAnalytics';
import { generateInterventionRecommendation } from '../src/analytics/interventionAnalytics';
import type { AcademicResult, Student } from '../src/types';

const result = (marks: number, grade: string): AcademicResult => ({ id: `r-${marks}`, studentId: 's1', subject: 'Mathematics', assessment: 'PPT', marks, maximumMarks: 100, grade });
assert.equal(calculateGP([50, 70]), 60);
assert.equal(calculateGPI([1, 2, 3]), 2);
assert.equal(calculateGPMP([result(50, 'D'), result(70, 'B')]), 60);
assert.equal(calculateGPS([4, 6]), 5);
assert.equal(calculatePassRate([result(39, 'G'), result(40, 'E')]), 50);

const student = (g: number): Student => ({ id: 's1', name: 'Test Student', gender: 'Male', className: '5 Sains', form: 'Tingkatan 5', academicScore: 45, attendanceRate: 88, riskLevel: 'Critical', status: 'On Watch', subjects: Array.from({ length: g }, (_, i) => ({ subject: `S${i}`, score: 30, grade: 'G' })), talents: [], stemTrack: false, stemReadiness: 20, progressTimeline: [], guardianContact: '', photoInitials: 'TS' });
const critical = calculateStudentRisk(student(4));
assert.equal(critical.riskLevel, 'Critical');
assert.equal(generateInterventionRecommendation(student(4)), 'ACADEMIC_RESCUE');
