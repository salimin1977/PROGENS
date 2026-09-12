# PROGENS Analytics — Academic & KPI Engines

## GPM vs GPMP vs GPS — three different metrics

These look similar and are **not interchangeable**:

| Metric | Full name | Scope | Function |
| --- | --- | --- | --- |
| **GPM** | Gred Purata Murid | One student, across their subjects | `calculateStudentGPM(results)` |
| **GPMP** | Gred Purata Mata Pelajaran | One subject, across every student who sat it | `calculateGPMP(results, subjectId)` |
| **GPS** | Gred Purata Sekolah | The whole school, across every result | `calculateGPS(results)` |

All three share the same 1-10 grade-point scale where **lower is
better** (1 = A+, 10 = G) — the same direction the school's headline KPI
(GPS 5.11 → target 4.84) already uses.

GPMP is what powers subject bottleneck detection: the subject with the
highest (worst) GPMP is flagged as the constraint dragging down GPS, both
on the Academic dashboard and as a NEXUS insight.

## Grading utility

`src/utils/grading.ts` is the only place a grade is converted to/from a
point or a percentage band:

- `calculateGP(grade)` — grade → point (1-10)
- `gradeFromPoint(point)` — point → grade, clamped to a valid range
- `gradeFromPercentage(pct)` — percentage → grade via fixed bands
- `isPass(grade)` / `resultStatus(grade)` — only `G` fails

No component or service re-implements this mapping.

## Other academic functions (`src/engines/academicEngine.ts`)

- `calculatePassRate(results)` — % of results that are not `G`
- `calculateGradeDistribution(results)` — count per grade, all 10 grades always present (zero-filled)
- `calculateSubjectPerformance(results, subjects)` — GPMP + pass rate + average % per subject
- `calculateStudentPerformance(studentId, results)` — one student's GPM, pass rate, failing subjects
- `calculateClassPerformance(classRoom, students, results)` — GPS + pass rate for one class
- `calculateFieldPerformance(results, subjects)` — subjects grouped by `department` (Sains, Bahasa, …), for GROW's "strongest field" detection

## KPI engine (`src/engines/kpiEngine.ts`)

Every KPI has a `higher_is_better` flag. Status is computed the same way
regardless of direction:

```
isKpiAchieved   = higherIsBetter ? current >= target : current <= target
calculateKpiVariance = target - current
calculateKpiStatus  = ACHIEVED | ON_TRACK (within tolerance) | ATTENTION
```

Tolerance is unit-aware (0.15 for `gps`, 3 for `%`/`count`). OLYMPUS maps
`ACHIEVED → GREEN`, `ON_TRACK → AMBER`, `ATTENTION → RED`.

## NEXUS insight generation (`src/analytics/nexusEngine.ts`)

`generateNexusInsights()` is a pure function over already-computed
overviews (academic, attendance, STEM) and always answers, per insight:

- **What** is happening (the number)
- **Why** it's happening (the mechanism)
- **Who** is affected (specific classes/cohorts, not "students" in general)
- **Action** — the concrete next step
- **What happens if nothing is done** — the cost of inaction

It currently detects: the weakest subject (bottleneck), the highest-risk
attendance band, a class where every student failed Mathematics (the 3
Berani case), and the strongest STEM-eligible class. Each is derived from
real seed data, not scripted text — feed it a different dataset and the
insights change accordingly.
