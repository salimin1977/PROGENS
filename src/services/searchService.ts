import { loadCoreDataset } from './dataset';

export type SearchResultType = 'student' | 'class' | 'teacher' | 'subject';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  meta: string;
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const dataset = await loadCoreDataset();
  const results: SearchResult[] = [];

  for (const student of dataset.students) {
    if (student.name.toLowerCase().includes(q) || student.id.toLowerCase().includes(q) || student.student_no.toLowerCase().includes(q)) {
      const className = dataset.classes.find((c) => c.id === student.class_id)?.name ?? '';
      results.push({ type: 'student', id: student.id, label: student.name, meta: `${className} · ${student.student_no}`, href: `/students/${student.id}` });
    }
  }

  for (const classRoom of dataset.classes) {
    if (classRoom.name.toLowerCase().includes(q)) {
      results.push({ type: 'class', id: classRoom.id, label: classRoom.name, meta: `Tingkatan ${classRoom.form}`, href: `/students?className=${encodeURIComponent(classRoom.name)}` });
    }
  }

  for (const teacher of dataset.teachers) {
    if (teacher.name.toLowerCase().includes(q)) {
      results.push({ type: 'teacher', id: teacher.id, label: teacher.name, meta: `${teacher.department} · ${teacher.position}`, href: `/intervention` });
    }
  }

  for (const subject of dataset.subjects) {
    if (subject.name.toLowerCase().includes(q) || subject.code.toLowerCase().includes(q)) {
      results.push({ type: 'subject', id: subject.id, label: subject.name, meta: subject.department, href: `/academic` });
    }
  }

  return results.slice(0, 20);
}
