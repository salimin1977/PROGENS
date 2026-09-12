import type { Rng } from '../random';
import { shuffle } from '../random';

/**
 * Distributes N integer grade points (1-10) across `subjectIds` whose mean
 * is exactly `targetGpm`. Used to seed named demonstration students (NOVA,
 * SUPERNOVA) whose GPM is a fixed, known figure rather than emergent from
 * random per-subject scores.
 *
 * Requires targetGpm * subjectIds.length to be a whole number — true for
 * every NOVA/SUPERNOVA figure supplied against an 8-subject roster.
 */
export function buildPointsForTargetGpm(rng: Rng, subjectIds: string[], targetGpm: number): Record<string, number> {
  const n = subjectIds.length;
  const rawSum = targetGpm * n;
  const sum = Math.round(rawSum);
  if (Math.abs(rawSum - sum) > 1e-6) {
    throw new Error(`targetGpm ${targetGpm} is not exactly representable over ${n} subjects`);
  }
  const base = Math.floor(sum / n);
  const remainder = sum - base * n;
  const points = Array.from({ length: n }, (_, i) => (i < remainder ? base + 1 : base));
  const shuffled = shuffle(rng, points).map((p) => Math.min(10, Math.max(1, p)));

  return Object.fromEntries(subjectIds.map((id, i) => [id, shuffled[i]]));
}
