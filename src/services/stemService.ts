import type { StemCandidate, StemPipelineStage } from '../types';
import { classifyStemPipeline, type StemClassification } from '../engines/stemEngine';
import { loadCoreDataset } from './dataset';

export interface StemClassBreakdown {
  className: string;
  eligibleCount: number;
  totalCount: number;
  allFailedMath: boolean;
}

export interface StemOverview {
  pipeline: StemPipelineStage[];
  candidates: StemCandidate[];
  classifications: Map<string, StemClassification>;
  kpis: {
    totalCandidates: number;
    mathReadiness: number;
    scienceReadiness: number;
    stemElite: number;
    stemRisk: number;
  };
  form3ClassBreakdown: StemClassBreakdown[];
}

const MATH_IDS = new Set(['sub-mat', 'sub-mt']);
const SCIENCE_IDS = new Set(['sub-sains', 'sub-fiz', 'sub-kim', 'sub-bio']);

export async function getStemOverview(): Promise<StemOverview> {
  const dataset = await loadCoreDataset();
  // STEM A Pipeline is a pre-streaming programme: it tracks Tingkatan 1-3
  // students toward Tingkatan 4 Sains eligibility. Streamed Tingkatan 4-5
  // students are already in (or out of) STEM, so they are out of scope here.
  const pipelineStudents = dataset.students.filter((s) => s.form <= 3);

  const classifications = new Map<string, StemClassification>();
  for (const student of pipelineStudents) {
    const results = dataset.latestResults.filter((r) => r.student_id === student.id);
    const mathGrade = results.find((r) => MATH_IDS.has(r.subject_id))?.grade;
    const scienceGrade = results.find((r) => SCIENCE_IDS.has(r.subject_id))?.grade;
    classifications.set(
      student.id,
      classifyStemPipeline({ studentId: student.id, mathGrade, scienceGrade, stemInterest: Boolean(mathGrade && scienceGrade) })
    );
  }

  const inPipeline = Array.from(classifications.values()).filter((c) => c.inPipeline);
  const eliteCount = inPipeline.filter((c) => c.pipeline_status === 'ELITE').length;
  const boostCount = inPipeline.filter((c) => c.pipeline_status === 'BOOST').length;
  const rescueCount = Array.from(classifications.values()).filter((c) => c.pipeline_status === 'RESCUE').length;

  const pipeline: StemPipelineStage[] = [
    { stage: 'Identified', count: inPipeline.length },
    { stage: 'Mathematics', count: inPipeline.length },
    { stage: 'Science', count: eliteCount + boostCount },
    { stage: 'STEM Boost', count: boostCount + eliteCount },
    { stage: 'STEM Elite', count: eliteCount },
    { stage: 'STEM A', count: eliteCount },
  ];

  const candidates: StemCandidate[] = pipelineStudents
    .filter((s) => classifications.get(s.id)?.inPipeline || classifications.get(s.id)?.pipeline_status === 'RESCUE')
    .map((s) => {
      const results = dataset.latestResults.filter((r) => r.student_id === s.id);
      const math = results.find((r) => MATH_IDS.has(r.subject_id));
      const science = results.find((r) => SCIENCE_IDS.has(r.subject_id));
      const classification = classifications.get(s.id)!;
      const category: StemCandidate['category'] =
        classification.pipeline_status === 'ELITE' ? 'STEM Elite' : classification.pipeline_status === 'RESCUE' ? 'STEM Rescue' : 'STEM Boost';
      return {
        studentId: s.id,
        studentName: s.name,
        className: dataset.classes.find((c) => c.id === s.class_id)?.name ?? s.class_id,
        mathScore: math?.percentage ?? 0,
        scienceScore: science?.percentage ?? 0,
        category,
      };
    });

  const mathTaken = pipelineStudents.filter((s) => classifications.get(s.id)?.math_status !== 'NOT_TAKEN');
  const mathPass = mathTaken.filter((s) => classifications.get(s.id)?.math_status === 'PASS');
  const scienceTaken = pipelineStudents.filter((s) => classifications.get(s.id)?.science_status !== 'NOT_TAKEN');
  const sciencePass = scienceTaken.filter((s) => classifications.get(s.id)?.science_status === 'PASS');

  const form3Classes = dataset.classes.filter((c) => c.form === 3);
  const form3ClassBreakdown: StemClassBreakdown[] = form3Classes.map((c) => {
    const classStudents = pipelineStudents.filter((s) => s.class_id === c.id);
    const eligible = classStudents.filter((s) => classifications.get(s.id)?.inPipeline).length;
    const allFailedMath = classStudents.length > 0 && classStudents.every((s) => classifications.get(s.id)?.math_status === 'FAIL');
    return { className: c.name, eligibleCount: eligible, totalCount: classStudents.length, allFailedMath };
  });

  return {
    pipeline,
    candidates,
    classifications,
    kpis: {
      totalCandidates: inPipeline.length,
      mathReadiness: mathTaken.length ? Math.round((mathPass.length / mathTaken.length) * 1000) / 10 : 0,
      scienceReadiness: scienceTaken.length ? Math.round((sciencePass.length / scienceTaken.length) * 1000) / 10 : 0,
      stemElite: eliteCount,
      stemRisk: rescueCount,
    },
    form3ClassBreakdown,
  };
}
