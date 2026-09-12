# PROGENS Intervention Engine

`src/engines/interventionEngine.ts` — `generateInterventionRecommendation()`
turns a `StudentRiskAssessment` (from the Risk Engine) into a concrete,
advisory recommendation. It never creates an intervention case itself —
that remains a human/teacher decision recorded in the `interventions`
table.

## Trigger conditions

A recommendation is produced when any of these hold:

- `risk_level === 'CRITICAL'`
- Attendance is below 90%
- A subject failure (`grade === 'G'`) is detected
- `risk_level === 'HIGH'` (even with no other specific trigger, a generic
  Peer Support action is proposed rather than leaving the case silent)

A student with `risk_level === 'LOW'` and no failing subjects gets
`shouldIntervene: false` and an empty action list.

## Action selection

| Condition | Action(s) added |
| --- | --- |
| `risk_level === 'CRITICAL'` | `Academic Rescue`, `Parent Engagement` |
| `attendanceRate < 90` | `Attendance Intervention` |
| A failing subject is Mathematics/Science (any of Matematik, Sains, Fizik, Kimia, Biologi) | `STEM Rescue` |
| Exactly one failing subject, not STEM, and not CRITICAL | `Subject Coaching` |
| `risk_level === 'MEDIUM'` and the trend is still worsening | `Mentoring` |
| `risk_level === 'HIGH'` with no other action yet | `Peer Support` |
| Tingkatan 5 and risk is `HIGH` or `CRITICAL` | `Career Guidance` |

Actions are deduplicated (a `Set`) — a student can trigger several rules
at once (e.g. CRITICAL + failing Mathematics + poor attendance yields
`Academic Rescue`, `Parent Engagement`, `STEM Rescue`, `Attendance
Intervention` together).

## Priority mapping

Directly from `risk_level`:

```
CRITICAL -> P1
HIGH     -> P2
MEDIUM   -> P3
LOW      -> NONE
```

This is the same `P1/P2/P3` vocabulary REAP uses for Tingkatan 5
prioritisation (`src/engines/reapEngine.ts`), so a Tingkatan 5 student's
intervention priority and REAP priority always agree.

## Output shape

```ts
{
  studentId: string,
  shouldIntervene: boolean,
  priority: 'P1' | 'P2' | 'P3' | 'NONE',
  actions: InterventionAction[],   // e.g. ['Academic Rescue', 'STEM Rescue']
  rationale: string[],             // = the risk assessment's reasons
}
```

## How this seeds `interventions`

`src/data/seed/interventions.ts` runs every seeded student through
`calculateStudentRisk` then `generateInterventionRecommendation`, and
creates an `interventions` row (plus a short `intervention_actions`
history) only for students where `shouldIntervene` is true — so the
seeded case list is a direct, reproducible consequence of the engines
above, not a separately hand-curated list.

## Turning a recommendation into a real case

`generateInterventionRecommendation` only proposes; a teacher/counsellor
action still has to create the case. `DataProvider` exposes
`createIntervention`, `updateIntervention`, `closeIntervention` and
`addInterventionAction`, implemented identically by `MockDataProvider`
(mutable in-memory state cloned from seed data on construction — the
shared seed module itself is never mutated) and `SupabaseDataProvider`
(real `insert`/`update` calls). `interventionService.ts` wraps these with
the same view-model mapping every read path uses
(`mapInterventionRow`), so a freshly created case looks exactly like a
seeded one to the UI.
