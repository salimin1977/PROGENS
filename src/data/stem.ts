import type { StemCandidate, StemPipelineStage } from '../types';
import { students } from './students';

const stemPool = students.filter((s) => s.stemTrack || s.stemReadiness >= 65);

export const stemPipeline: StemPipelineStage[] = [
  { stage: 'Identified', count: stemPool.length },
  { stage: 'Mathematics', count: Math.round(stemPool.length * 0.82) },
  { stage: 'Science', count: Math.round(stemPool.length * 0.68) },
  { stage: 'STEM Boost', count: Math.round(stemPool.length * 0.45) },
  { stage: 'STEM Elite', count: Math.round(stemPool.length * 0.22) },
  { stage: 'STEM A', count: Math.round(stemPool.length * 0.12) },
];

export const stemCandidates: StemCandidate[] = stemPool.map((s) => {
  const math = s.subjects.find((sub) => sub.subject.toLowerCase().includes('math'))?.score ?? s.academicScore;
  const science = s.subjects.find((sub) => ['science', 'physics', 'chemistry', 'biology'].some((k) => sub.subject.toLowerCase().includes(k)))?.score ?? s.academicScore;
  let category: StemCandidate['category'] = 'STEM Boost';
  if (math >= 85 && science >= 85) category = 'STEM Elite';
  else if (math < 60 || science < 60) category = 'STEM Rescue';
  return {
    studentId: s.id,
    studentName: s.name,
    className: s.className,
    mathScore: math,
    scienceScore: science,
    category,
  };
});

export const stemKpi = {
  totalCandidates: stemPool.length,
  mathReadiness: Math.round((stemPool.filter((s) => (s.subjects.find((sub) => sub.subject.toLowerCase().includes('math'))?.score ?? 0) >= 70).length / (stemPool.length || 1)) * 1000) / 10,
  scienceReadiness: Math.round((stemPool.filter((s) => (s.subjects.find((sub) => ['science', 'physics', 'chemistry', 'biology'].some((k) => sub.subject.toLowerCase().includes(k)))?.score ?? 0) >= 70).length / (stemPool.length || 1)) * 1000) / 10,
  stemElite: stemCandidates.filter((c) => c.category === 'STEM Elite').length,
  stemRisk: stemCandidates.filter((c) => c.category === 'STEM Rescue').length,
};
