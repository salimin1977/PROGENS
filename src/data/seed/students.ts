import type { AcademicResult, DbStudent } from '../../types/schema';
import { calculateGP, gradeFromPoint, percentageBandFor, resultStatus } from '../../utils/grading';
import { mulberry32, randInt, type Rng } from '../random';
import { ACADEMIC_YEAR, CLASSES, type ClassConfig } from './config';
import { ASSESSMENTS } from './assessments';
import { buildPointsForTargetGpm } from './gpmBuilder';
import { generateName, type Gender } from './names';

interface NamedOverride {
  name: string;
  gender: Gender;
  gpm: number;
}

// --- NOVA — Top Tingkatan 2 (2026 cohort) ------------------------------
const NOVA_BY_CLASS: Record<string, NamedOverride[]> = {
  'cls-2damai': [
    { name: 'Irfan Mukhriz Mohd Azlan bin Abdul Aziz', gender: 'Male', gpm: 1.25 },
    { name: 'Aisy Zafri Ruzain bin Zariman Huzaini', gender: 'Male', gpm: 2.125 },
    { name: 'Muhammad Danish Irfan bin Mat Hussin', gender: 'Male', gpm: 2.125 },
    { name: 'Muhammad Reezqi Reza bin Ezree Reza', gender: 'Male', gpm: 2.25 },
    { name: 'Nur Sofeya Elisya binti Zamzulasri', gender: 'Female', gpm: 2.375 },
    { name: 'Airis Hana binti Noor Haffis', gender: 'Female', gpm: 2.75 },
    { name: 'Muhammad Airil Danish bin Jawahir', gender: 'Male', gpm: 2.75 },
  ],
  'cls-2berani': [{ name: 'Ahmad Fenriz Akmal bin Ahmad Fyruz', gender: 'Male', gpm: 2.5 }],
  'cls-2cekap': [
    { name: 'Muhammad Rayyan Hakim bin Huzaidi', gender: 'Male', gpm: 2.75 },
    { name: 'Juwita Zahra binti Mohamed Hirman', gender: 'Female', gpm: 2.75 },
  ],
};

// --- SUPERNOVA — Top Tingkatan 3 (2026 cohort), all in 3 Cekap --------
const SUPERNOVA_3CEKAP: NamedOverride[] = [
  { name: 'Habib Faeeq bin Hasanusi', gender: 'Male', gpm: 1.0 },
  { name: "Raja Anees Sa'adah binti Raja Ahmad Zahir", gender: 'Female', gpm: 1.125 },
  { name: 'Ithna Zahra binti Mohamad Nudman', gender: 'Female', gpm: 1.5 },
  { name: 'Nur Liyana binti Mazlan', gender: 'Female', gpm: 1.5 },
  { name: 'Lirna Dewantari binti Jasman', gender: 'Female', gpm: 1.625 },
  { name: 'Nur Sofea Syafiqah binti Shah Izzuan', gender: 'Female', gpm: 1.75 },
  { name: 'Muhammad Aiqyll Aliff bin Shahrizan', gender: 'Male', gpm: 2.0 },
  { name: 'Muhammad Rayyan Rezqi bin Ruslan', gender: 'Male', gpm: 2.0 },
  { name: 'Nur Zara Alesya binti Suhaimi', gender: 'Female', gpm: 2.0 },
  { name: 'Nurlana Hawwa binti Adli', gender: 'Female', gpm: 2.0 },
];

// STEM A Pipeline 2027 eligibility slice — the first N roster indices of
// each Tingkatan 3 class are "eligible" (strong, passing Math & Science).
// This reproduces the known 2027 cohort split exactly: 33 total
// (3 Cekap 23, 3 Amanah 4, 3 Damai 6, 3 Berani 0). SUPERNOVA students in
// 3 Cekap already qualify on merit, so only 13 more generic slots are
// marked eligible there (10 + 13 = 23).
const STEM_ELIGIBLE_COUNT: Record<string, number> = {
  'cls-3cekap': 23,
  'cls-3amanah': 4,
  'cls-3damai': 6,
  'cls-3berani': 0,
};

// Critical observation carried over from Phase 1 planning: every student
// in 3 Berani failed Mathematics — this is a deliberate, not random, fact.
const FORCE_MATH_FAIL_CLASSES = new Set(['cls-3berani']);

const MATH_SUBJECT_ID = 'sub-mat';
const SCIENCE_SUBJECT_ID = 'sub-sains';

function buildGenericPoints(rng: Rng, subjectIds: string[], basePoint: number, overrides: Record<string, number> = {}): Record<string, number> {
  const points: Record<string, number> = {};
  for (const subjectId of subjectIds) {
    points[subjectId] = overrides[subjectId] ?? Math.min(10, Math.max(1, basePoint + randInt(rng, -2, 2)));
  }
  return points;
}

function previousAssessmentPoints(rng: Rng, currentPoints: Record<string, number>, forceFailSubjects: string[]): Record<string, number> {
  const previous: Record<string, number> = {};
  for (const [subjectId, point] of Object.entries(currentPoints)) {
    if (forceFailSubjects.includes(subjectId)) {
      previous[subjectId] = 10;
      continue;
    }
    previous[subjectId] = Math.min(10, Math.max(1, point + randInt(rng, -1, 2)));
  }
  return previous;
}

function pushResults(
  results: AcademicResult[],
  studentId: string,
  assessmentId: string,
  points: Record<string, number>,
  rng: Rng,
  idPrefix: string
) {
  for (const [subjectId, point] of Object.entries(points)) {
    const grade = gradeFromPoint(point);
    const [min, max] = percentageBandFor(grade);
    const percentage = randInt(rng, min, max);
    results.push({
      id: `${idPrefix}-${assessmentId}-${subjectId}`,
      student_id: studentId,
      subject_id: subjectId,
      assessment_id: assessmentId,
      marks: percentage,
      percentage,
      grade,
      gp: calculateGP(grade),
      status: resultStatus(grade),
      created_at: '2026-10-20T00:00:00Z',
    });
  }
}

const rng = mulberry32(20260202);
const students: DbStudent[] = [];
const academicResults: AcademicResult[] = [];
/** studentId -> whether the student meets the STEM A Pipeline eligibility bar (Math & Science both passing at B or better). */
const stemEligibility = new Map<string, boolean>();

let globalIndex = 0;
/** Student ids for the NOVA (Top Tingkatan 2) roster, in the given rank order. */
const novaStudentIds: string[] = [];
/** Student ids for the SUPERNOVA (Top Tingkatan 3) roster, in the given rank order. */
const supernovaStudentIds: string[] = [];

function buildClassRoster(cls: ClassConfig) {
  const namedList = NOVA_BY_CLASS[cls.id] ?? (cls.id === 'cls-3cekap' ? SUPERNOVA_3CEKAP : []);
  const eligibleCount = STEM_ELIGIBLE_COUNT[cls.id] ?? 0;
  const forceMathFail = FORCE_MATH_FAIL_CLASSES.has(cls.id);
  const alreadyEligibleFromNamed = cls.id === 'cls-3cekap' ? namedList.length : 0;
  const genericEligibleNeeded = Math.max(0, eligibleCount - alreadyEligibleFromNamed);

  for (let i = 0; i < cls.rollSize; i++) {
    globalIndex++;
    const studentId = `stu-${cls.id}-${String(i + 1).padStart(3, '0')}`;
    const named = namedList[i];
    const gender: Gender = named?.gender ?? (rng() < 0.5 ? 'Male' : 'Female');
    const name = named?.name ?? generateName(rng, gender);

    students.push({
      id: studentId,
      student_no: `S${String(globalIndex).padStart(4, '0')}`,
      name,
      gender,
      ic_last4: String(randInt(rng, 1000, 9999)),
      form: cls.form,
      class_id: cls.id,
      status: 'ACTIVE',
      created_at: '2026-01-05T00:00:00Z',
      updated_at: '2026-01-05T00:00:00Z',
    });

    // Determine this student's STEM eligibility slot (index-based, deterministic).
    const isNamedEligible = cls.id === 'cls-3cekap' && Boolean(named);
    const genericSlot = i - namedList.length; // index among the non-named students in this class
    const isGenericEligible = !named && genericSlot >= 0 && genericSlot < genericEligibleNeeded;
    const eligible = isNamedEligible || isGenericEligible;

    let currentPoints: Record<string, number>;
    if (named) {
      currentPoints = buildPointsForTargetGpm(rng, cls.subjectSet, named.gpm);
    } else {
      const basePoint = eligible ? randInt(rng, 1, 3) : forceMathFail ? randInt(rng, 5, 8) : randInt(rng, 4, 7);
      const overrides: Record<string, number> = {};
      if (cls.subjectSet.includes(MATH_SUBJECT_ID)) {
        overrides[MATH_SUBJECT_ID] = forceMathFail ? 10 : eligible ? randInt(rng, 1, 5) : randInt(rng, 6, 9);
      }
      if (cls.subjectSet.includes(SCIENCE_SUBJECT_ID)) {
        overrides[SCIENCE_SUBJECT_ID] = eligible ? randInt(rng, 1, 5) : randInt(rng, 5, 9);
      }
      currentPoints = buildGenericPoints(rng, cls.subjectSet, basePoint, overrides);
    }

    stemEligibility.set(studentId, eligible && !forceMathFail);

    if (named) {
      if (NOVA_BY_CLASS[cls.id]) novaStudentIds.push(studentId);
      else if (cls.id === 'cls-3cekap') supernovaStudentIds.push(studentId);
    }

    const forceFailSubjects = forceMathFail && cls.subjectSet.includes(MATH_SUBJECT_ID) ? [MATH_SUBJECT_ID] : [];
    const previousPoints = previousAssessmentPoints(rng, currentPoints, forceFailSubjects);

    pushResults(academicResults, studentId, ASSESSMENTS[0].id, previousPoints, rng, studentId);
    pushResults(academicResults, studentId, ASSESSMENTS[1].id, currentPoints, rng, studentId);
  }
}

CLASSES.forEach(buildClassRoster);

export { students, academicResults, stemEligibility, novaStudentIds, supernovaStudentIds, ACADEMIC_YEAR };
