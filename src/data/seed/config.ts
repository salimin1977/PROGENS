import type { AcademicYear, ClassRoom, Department, School, Subject, Teacher } from '../../types/schema';

export const SCHOOL: School = {
  id: 'sch-001',
  name: 'SMK Kelana Jaya',
  code: 'BPS 2026',
  address: 'Jalan SS6/12, Kelana Jaya, 47301 Petaling Jaya, Selangor',
  principal_name: 'Tuan Haji Ahmad Faizal bin Othman',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const ACADEMIC_YEAR: AcademicYear = {
  id: 'ay-2026',
  year: 2026,
  start_date: '2026-01-01',
  end_date: '2026-11-30',
  is_current: true,
};

export const DEPARTMENTS: Department[] = ['Kemanusiaan', 'Bahasa', 'Sains', 'Matematik', 'Teknik & Vokasional', 'Pendidikan Jasmani', 'Others'];

export const SUBJECTS: Subject[] = [
  { id: 'sub-bm', code: 'BM', name: 'Bahasa Melayu', department: 'Bahasa', is_spm_subject: true },
  { id: 'sub-bi', code: 'BI', name: 'Bahasa Inggeris', department: 'Bahasa', is_spm_subject: true },
  { id: 'sub-sej', code: 'SEJ', name: 'Sejarah', department: 'Kemanusiaan', is_spm_subject: true },
  { id: 'sub-mat', code: 'MAT', name: 'Matematik', department: 'Matematik', is_spm_subject: true },
  { id: 'sub-mt', code: 'MT', name: 'Matematik Tambahan', department: 'Matematik', is_spm_subject: true },
  { id: 'sub-pi', code: 'PI', name: 'Pendidikan Islam', department: 'Kemanusiaan', is_spm_subject: true },
  { id: 'sub-pm', code: 'PM', name: 'Pendidikan Moral', department: 'Kemanusiaan', is_spm_subject: true },
  { id: 'sub-sains', code: 'SC', name: 'Sains', department: 'Sains', is_spm_subject: true },
  { id: 'sub-fiz', code: 'FIZ', name: 'Fizik', department: 'Sains', is_spm_subject: true },
  { id: 'sub-kim', code: 'KIM', name: 'Kimia', department: 'Sains', is_spm_subject: true },
  { id: 'sub-bio', code: 'BIO', name: 'Biologi', department: 'Sains', is_spm_subject: true },
  { id: 'sub-eko', code: 'EKO', name: 'Ekonomi', department: 'Kemanusiaan', is_spm_subject: true },
  { id: 'sub-pa', code: 'PA', name: 'Prinsip Perakaunan', department: 'Teknik & Vokasional', is_spm_subject: true },
  { id: 'sub-psv', code: 'PSV', name: 'Pendidikan Seni Visual', department: 'Others', is_spm_subject: false },
  { id: 'sub-pjpk', code: 'PJPK', name: 'PJPK', department: 'Pendidikan Jasmani', is_spm_subject: false },
  { id: 'sub-ss', code: 'SS', name: 'Sains Sukan', department: 'Pendidikan Jasmani', is_spm_subject: true },
];

// Subject sets by stream. Tingkatan 1-3 ("General") is deliberately 8
// subjects — this lets whole-number NOVA/SUPERNOVA GPM targets (e.g. 2.125
// = 17/8) be hit exactly via integer grade-point distribution.
export const SUBJECT_SET_GENERAL = ['sub-bm', 'sub-bi', 'sub-mat', 'sub-sains', 'sub-sej', 'sub-pi', 'sub-psv', 'sub-pjpk'];
export const SUBJECT_SET_SAINS = ['sub-bm', 'sub-bi', 'sub-mt', 'sub-fiz', 'sub-kim', 'sub-bio'];
export const SUBJECT_SET_AKAUN = ['sub-bm', 'sub-bi', 'sub-mt', 'sub-pa', 'sub-eko', 'sub-sej'];
export const SUBJECT_SET_EKONOMI = ['sub-bm', 'sub-bi', 'sub-mat', 'sub-eko', 'sub-pa', 'sub-sej'];
export const SUBJECT_SET_SENI = ['sub-bm', 'sub-bi', 'sub-mat', 'sub-psv', 'sub-eko', 'sub-sej'];

export const TEACHER_NAMES: { name: string; department: Department; position: string }[] = [
  { name: 'Pn. Rohana Ibrahim', department: 'Bahasa', position: 'Senior Assistant (Academic)' },
  { name: 'En. Muthu Kumaran', department: 'Kemanusiaan', position: 'Counsellor' },
  { name: 'Cik Ling Wei Yee', department: 'Sains', position: 'STEM Coordinator' },
  { name: 'En. Zulfadli Aziz', department: 'Pendidikan Jasmani', position: 'Discipline Teacher' },
  { name: 'Pn. Kavitha Rajan', department: 'Matematik', position: 'Subject Head' },
  { name: 'En. Chong Boon Hock', department: 'Sains', position: 'Teacher' },
  { name: 'Pn. Nurul Huda', department: 'Bahasa', position: 'Teacher' },
  { name: 'Cik Tan Mei Yin', department: 'Teknik & Vokasional', position: 'Teacher' },
  { name: 'En. Faizal Rashid', department: 'Kemanusiaan', position: 'Teacher' },
  { name: 'Pn. Anitha Selvam', department: 'Matematik', position: 'Teacher' },
  { name: 'En. Hafizuddin Rosli', department: 'Sains', position: 'Teacher' },
  { name: 'Pn. Siti Zulaikha', department: 'Bahasa', position: 'Teacher' },
  { name: 'En. Vignesh Waran', department: 'Matematik', position: 'Teacher' },
  { name: 'Pn. Wong Su Lin', department: 'Sains', position: 'Teacher' },
  { name: 'En. Amirul Hakim', department: 'Kemanusiaan', position: 'Teacher' },
  { name: 'Pn. Fatimah Zahra', department: 'Teknik & Vokasional', position: 'Teacher' },
  { name: 'En. Ravindran Nair', department: 'Pendidikan Jasmani', position: 'Teacher' },
  { name: 'Pn. Chin Yee Wen', department: 'Bahasa', position: 'Teacher' },
  { name: 'En. Syahmi Iskandar', department: 'Matematik', position: 'Teacher' },
  { name: 'Pn. Devi Shanmugam', department: 'Others', position: 'Teacher' },
  { name: 'En. Kok Wei Jian', department: 'Sains', position: 'Teacher' },
  { name: 'Pn. Aina Sofea', department: 'Kemanusiaan', position: 'Senior Assistant (Student Affairs)' },
];

export const TEACHERS: Teacher[] = TEACHER_NAMES.map((t, i) => ({
  id: `tch-${String(i + 1).padStart(3, '0')}`,
  staff_no: `T${String(2000 + i)}`,
  name: t.name,
  department: t.department,
  position: t.position,
  status: 'ACTIVE',
}));

export interface ClassConfig {
  id: string;
  name: string;
  form: 1 | 2 | 3 | 4 | 5;
  stream: ClassRoom['stream'];
  rollSize: number;
  subjectSet: string[];
}

// Roll sizes are deliberately uneven and larger for Tingkatan 3 so the
// STEM A Pipeline 2027 counts (33 total: 3 Cekap 23, 3 Amanah 4, 3 Damai 6,
// 3 Berani 0) can be reproduced exactly from real per-class rosters instead
// of being hard-coded totals with no underlying students.
export const CLASSES: ClassConfig[] = [
  { id: 'cls-1damai', name: '1 Damai', form: 1, stream: 'General', rollSize: 32, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-1berani', name: '1 Berani', form: 1, stream: 'General', rollSize: 30, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-1cekap', name: '1 Cekap', form: 1, stream: 'General', rollSize: 30, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-2damai', name: '2 Damai', form: 2, stream: 'General', rollSize: 32, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-2berani', name: '2 Berani', form: 2, stream: 'General', rollSize: 30, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-2cekap', name: '2 Cekap', form: 2, stream: 'General', rollSize: 30, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-3cekap', name: '3 Cekap', form: 3, stream: 'General', rollSize: 30, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-3amanah', name: '3 Amanah', form: 3, stream: 'General', rollSize: 20, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-3damai', name: '3 Damai', form: 3, stream: 'General', rollSize: 22, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-3berani', name: '3 Berani', form: 3, stream: 'General', rollSize: 18, subjectSet: SUBJECT_SET_GENERAL },
  { id: 'cls-4akaun', name: '4 Akaun', form: 4, stream: 'Akaun', rollSize: 28, subjectSet: SUBJECT_SET_AKAUN },
  { id: 'cls-4sains', name: '4 Sains', form: 4, stream: 'Sains', rollSize: 28, subjectSet: SUBJECT_SET_SAINS },
  { id: 'cls-4ekonomi', name: '4 Ekonomi', form: 4, stream: 'Ekonomi', rollSize: 26, subjectSet: SUBJECT_SET_EKONOMI },
  { id: 'cls-5akaun', name: '5 Akaun', form: 5, stream: 'Akaun', rollSize: 27, subjectSet: SUBJECT_SET_AKAUN },
  { id: 'cls-5sains', name: '5 Sains', form: 5, stream: 'Sains', rollSize: 27, subjectSet: SUBJECT_SET_SAINS },
  { id: 'cls-5ekonomi', name: '5 Ekonomi', form: 5, stream: 'Ekonomi', rollSize: 25, subjectSet: SUBJECT_SET_EKONOMI },
  { id: 'cls-5seni', name: '5 Seni', form: 5, stream: 'Seni', rollSize: 20, subjectSet: SUBJECT_SET_SENI },
];

export const CLASS_ROOMS: ClassRoom[] = CLASSES.map((c, i) => ({
  id: c.id,
  name: c.name,
  form: c.form,
  stream: c.stream,
  teacher_id: TEACHERS[i % TEACHERS.length].id,
  capacity: c.rollSize + 5,
  academic_year_id: ACADEMIC_YEAR.id,
}));

export function subjectById(id: string): Subject {
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) throw new Error(`Unknown subject id: ${id}`);
  return subject;
}
