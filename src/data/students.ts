import type { Form, Gender, ProgressEvent, Student, SubjectScore, TalentProfile } from '../types';
import { mulberry32, randChoice, randFloat, randInt, shuffle, type Rng } from './random';

export interface ClassInfo {
  name: string;
  form: Form;
  stream: 'General' | 'Sains' | 'Akaun' | 'Ekonomi';
}

export const CLASSES: ClassInfo[] = [
  { name: '1 Amanah', form: 'Tingkatan 1', stream: 'General' },
  { name: '1 Damai', form: 'Tingkatan 1', stream: 'General' },
  { name: '1 Cekap', form: 'Tingkatan 1', stream: 'General' },
  { name: '2 Amanah', form: 'Tingkatan 2', stream: 'General' },
  { name: '2 Damai', form: 'Tingkatan 2', stream: 'General' },
  { name: '2 Cekap', form: 'Tingkatan 2', stream: 'General' },
  { name: '3 Amanah', form: 'Tingkatan 3', stream: 'General' },
  { name: '3 Damai', form: 'Tingkatan 3', stream: 'General' },
  { name: '3 Cekap', form: 'Tingkatan 3', stream: 'General' },
  { name: '4 Akaun', form: 'Tingkatan 4', stream: 'Akaun' },
  { name: '4 Sains', form: 'Tingkatan 4', stream: 'Sains' },
  { name: '4 Ekonomi', form: 'Tingkatan 4', stream: 'Ekonomi' },
  { name: '5 Akaun', form: 'Tingkatan 5', stream: 'Akaun' },
  { name: '5 Sains', form: 'Tingkatan 5', stream: 'Sains' },
  { name: '5 Ekonomi', form: 'Tingkatan 5', stream: 'Ekonomi' },
];

export const SUBJECTS_BY_STREAM: Record<ClassInfo['stream'], string[]> = {
  General: ['Bahasa Melayu', 'English', 'Mathematics', 'Science', 'Sejarah', 'Geografi'],
  Sains: ['Bahasa Melayu', 'English', 'Additional Mathematics', 'Physics', 'Chemistry', 'Biology'],
  Akaun: ['Bahasa Melayu', 'English', 'Additional Mathematics', 'Principles of Accounting', 'Economics', 'Sejarah'],
  Ekonomi: ['Bahasa Melayu', 'English', 'Mathematics', 'Economics', 'Perniagaan', 'Sejarah'],
};

const MALAY_MALE_FIRST = ['Aiman', 'Danial', 'Haziq', 'Iskandar', 'Zulkarnain', 'Amir', 'Farid', 'Hakim', 'Rayyan', 'Syafiq'];
const MALAY_FEMALE_FIRST = ['Nur Aisyah', 'Siti Hajar', 'Nurul Ain', 'Aleesya', 'Farah Diana', 'Batrisyia', 'Nadia', 'Alia', 'Sofea', 'Iman'];
const MALAY_LAST = ['bin Rahman', 'bin Ismail', 'bin Yusof', 'bin Hassan', 'bin Ahmad', 'bin Kassim', 'bin Zainal', 'bin Osman'];
const MALAY_LAST_F = ['binti Rahman', 'binti Ismail', 'binti Yusof', 'binti Hassan', 'binti Ahmad', 'binti Kassim', 'binti Zainal', 'binti Osman'];

const CHINESE_FIRST = ['Wei Jian', 'Mei Ling', 'Jia Hui', 'Kai Xin', 'Zhi Hao', 'Xin Yi', 'Yong Jie', 'Li Wen', 'Chen Hao', 'Hui Min'];
const CHINESE_LAST = ['Tan', 'Lim', 'Lee', 'Wong', 'Chong', 'Ng', 'Chan', 'Ooi', 'Teoh', 'Yap'];

const INDIAN_MALE_FIRST = ['Arjun', 'Vishal', 'Karthik', 'Dinesh', 'Suresh', 'Prakash', 'Ravin', 'Naveen'];
const INDIAN_FEMALE_FIRST = ['Priya', 'Divya', 'Kavitha', 'Meera', 'Shalini', 'Ananya', 'Nisha', 'Lavanya'];
const INDIAN_LAST_M = ['a/l Muthu', 'a/l Kumar', 'a/l Raj', 'a/l Samy', 'a/l Perumal'];
const INDIAN_LAST_F = ['a/p Muthu', 'a/p Kumar', 'a/p Raj', 'a/p Samy', 'a/p Perumal'];

const TALENT_DOMAINS = ['Debate', 'Robotics', 'Netball', 'Choir', 'Chess', 'Football', 'Visual Art', 'Entrepreneurship', 'Public Speaking', 'Badminton', 'Science Innovation', 'Creative Writing'];

function generateName(rng: Rng, gender: Gender): string {
  const roll = rng();
  if (roll < 0.6) {
    return gender === 'Male'
      ? `${randChoice(rng, MALAY_MALE_FIRST)} ${randChoice(rng, MALAY_LAST)}`
      : `${randChoice(rng, MALAY_FEMALE_FIRST)} ${randChoice(rng, MALAY_LAST_F)}`;
  }
  if (roll < 0.85) {
    return `${randChoice(rng, CHINESE_FIRST)} ${randChoice(rng, CHINESE_LAST)}`;
  }
  return gender === 'Male'
    ? `${randChoice(rng, INDIAN_MALE_FIRST)} ${randChoice(rng, INDIAN_LAST_M)}`
    : `${randChoice(rng, INDIAN_FEMALE_FIRST)} ${randChoice(rng, INDIAN_LAST_F)}`;
}

function initialsOf(name: string): string {
  const parts = name.split(' ').filter((p) => !['bin', 'binti', 'a/l', 'a/p'].includes(p));
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function gradeForScore(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'G';
}

function buildSubjects(rng: Rng, stream: ClassInfo['stream'], baseline: number): SubjectScore[] {
  return SUBJECTS_BY_STREAM[stream].map((subject) => {
    const variance = randInt(rng, -12, 12);
    const score = Math.max(28, Math.min(100, Math.round(baseline + variance)));
    return { subject, score, grade: gradeForScore(score) };
  });
}

function buildTalents(rng: Rng): TalentProfile[] {
  const count = rng() < 0.55 ? randInt(rng, 1, 2) : 0;
  const domains = shuffle(rng, TALENT_DOMAINS).slice(0, count);
  const levels: TalentProfile['level'][] = ['Emerging', 'Developing', 'Proficient', 'Elite'];
  return domains.map((domain) => ({
    domain,
    level: randChoice(rng, levels),
    notes: `Participated in school-level ${domain.toLowerCase()} activities this academic year.`,
  }));
}

function buildTimeline(rng: Rng, riskLevel: Student['riskLevel']): ProgressEvent[] {
  const events: ProgressEvent[] = [
    { date: '2026-01-15', label: 'Academic Year Baseline', category: 'Academic', detail: 'Term 1 diagnostic assessment recorded.' },
    { date: '2026-03-10', label: 'Attendance Review', category: 'Attendance', detail: 'Monthly attendance pattern reviewed by form teacher.' },
  ];
  if (riskLevel === 'Critical' || riskLevel === 'High') {
    events.push({ date: '2026-04-02', label: 'Intervention Initiated', category: 'Intervention', detail: 'Referred to counselling unit for targeted support.' });
  }
  if (rng() < 0.4) {
    events.push({ date: '2026-05-20', label: 'Talent Milestone', category: 'Talent', detail: 'Represented school at district-level competition.' });
  }
  if (rng() < 0.3) {
    events.push({ date: '2026-06-18', label: 'STEM Assessment', category: 'STEM', detail: 'Completed STEM readiness diagnostic.' });
  }
  events.push({ date: '2026-08-05', label: 'Mid-Year Review', category: 'Academic', detail: 'Mid-year performance consolidated for progress report.' });
  return events;
}

function generateStudent(rng: Rng, classInfo: ClassInfo, index: number): Student {
  const gender: Gender = rng() < 0.5 ? 'Male' : 'Female';
  const name = generateName(rng, gender);
  const id = `STU-${classInfo.name.replace(' ', '').toUpperCase()}-${String(index + 1).padStart(2, '0')}`;

  const performanceTier = rng();
  let baseline: number;
  if (performanceTier < 0.12) baseline = randInt(rng, 32, 48);
  else if (performanceTier < 0.3) baseline = randInt(rng, 49, 62);
  else if (performanceTier < 0.75) baseline = randInt(rng, 63, 82);
  else baseline = randInt(rng, 83, 98);

  const academicScore = Math.max(30, Math.min(100, Math.round(baseline + randInt(rng, -4, 4))));

  const attendanceTier = rng();
  let attendanceRate: number;
  if (attendanceTier < 0.08) attendanceRate = randFloat(rng, 62, 79, 1);
  else if (attendanceTier < 0.22) attendanceRate = randFloat(rng, 80, 89, 1);
  else attendanceRate = randFloat(rng, 90, 100, 1);

  let riskLevel: Student['riskLevel'];
  if (academicScore < 50 || attendanceRate < 78) riskLevel = 'Critical';
  else if (academicScore < 60 || attendanceRate < 86) riskLevel = 'High';
  else if (academicScore < 72 || attendanceRate < 92) riskLevel = 'Moderate';
  else riskLevel = 'Low';

  let status: Student['status'] = 'Active';
  if (riskLevel === 'Critical' || riskLevel === 'High') status = 'On Watch';
  if (academicScore >= 88 && attendanceRate >= 96) status = 'Excellence Track';

  const subjects = buildSubjects(rng, classInfo.stream, academicScore);
  const mathSubject = subjects.find((s) => s.subject.toLowerCase().includes('math'));
  const scienceSubject = subjects.find((s) => ['science', 'physics', 'chemistry', 'biology'].some((k) => s.subject.toLowerCase().includes(k)));
  const stemReadiness = Math.round(((mathSubject?.score ?? academicScore) + (scienceSubject?.score ?? academicScore)) / 2);
  const stemTrack = classInfo.stream === 'Sains' || stemReadiness >= 75;

  return {
    id,
    name,
    gender,
    className: classInfo.name,
    form: classInfo.form,
    academicScore,
    attendanceRate,
    riskLevel,
    status,
    subjects,
    talents: buildTalents(rng),
    stemTrack,
    stemReadiness,
    progressTimeline: buildTimeline(rng, riskLevel),
    guardianContact: `01${randInt(rng, 2, 9)}-${randInt(rng, 1000000, 9999999)}`,
    photoInitials: initialsOf(name),
  };
}

const rng = mulberry32(20260101);
const STUDENTS_PER_CLASS = 8;

export const students: Student[] = CLASSES.flatMap((classInfo) =>
  Array.from({ length: STUDENTS_PER_CLASS }, (_, i) => generateStudent(rng, classInfo, i))
);

export const getStudentById = (id: string): Student | undefined => students.find((s) => s.id === id);

export const getStudentsByForm = (form: Form): Student[] => students.filter((s) => s.form === form);

export const getStudentsByClass = (className: string): Student[] => students.filter((s) => s.className === className);
