# PROGENS Risk Engine

`src/engines/riskEngine.ts` — `calculateStudentRisk()` is the single
source of truth for a student's risk classification. Every module
(Intervention, SEEDS, GROW, REAP, NEXUS, Command Centre) calls it rather
than re-deriving risk from raw grades.

## Base rule — G-grade count

| Failing subjects (grade `G`) | Risk level |
| --- | --- |
| 4 or more | `CRITICAL` |
| 2-3 | `HIGH` |
| 1 | `MEDIUM` |
| 0 | `LOW` (see modifiers below) |

## Modifiers on a 0-G student

A student with no failing grade can still be flagged. `LOW` is escalated
to `MEDIUM` when either is true:

- **Attendance below 90%** (the same threshold the Attendance dashboard
  flags — `ATTENDANCE_FLAG_THRESHOLD` in `attendanceEngine.ts`)
- **Significant academic decline** — the student's GPM moved by 1.5
  grade points or worse (i.e. got measurably worse) between the previous
  and latest assessment (`trendDelta >= 1.5`)

This is a deliberate design choice: the G-grade-count rule alone would
miss a student who is passing everything but sliding fast, or who is
barely attending. It never escalates a 1+ G-grade student further beyond
what the base rule already gives — the base rule's CRITICAL/HIGH/MEDIUM
tiers are not adjusted by attendance or trend, only reported as
additional reasons.

## Risk score (0-100)

A secondary, continuous number for sorting/visualisation, not for
classification:

```
score  = min(80, gCount * 20)
       + (attendanceRate < 80 ? 15 : attendanceRate < 90 ? 8 : 0)
       + (trendDelta >= 1.5 ? 15 : trendDelta >= 0.75 ? 8 : 0)
risk_score = min(100, round(score))
```

## Output shape

```ts
{
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  risk_score: number,        // 0-100
  reasons: string[],         // human-readable, e.g. "2 failing subjects (Matematik, Sains)"
  recommended_action: string,
  gCount: number,
  attendanceRate: number,
  trendDelta: number,        // positive = got worse
}
```

## Edge cases (see `src/engines/riskEngine.test.ts`)

- A student with zero results at all: treated as `LOW`, `risk_score: 0` —
  never throws.
- `risk_score` is always clamped to 100 even with 5 failing subjects and
  poor attendance stacked together.
- Attendance defaults to 100% when no attendance records are supplied
  (rather than treating "no data" as "zero attendance").
