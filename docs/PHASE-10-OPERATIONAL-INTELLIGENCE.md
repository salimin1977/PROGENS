# PROGENS Phase 10 — Operational Intelligence & Final Integration

## Objective

Turn PROGENS from a collection of analytics pages into a closed operational decision loop:

`DATA → SIGNAL → BOTTLENECK → STUDENT 360 → ACTION → INTERVENTION → FOLLOW-UP → OUTCOME`

## Integration principles

1. Supabase remains the structured source of truth.
2. `DataProvider` remains the application data boundary.
3. Existing analytics engines remain the calculation layer; do not duplicate business rules.
4. Command is the decision surface, not a second database.
5. Student 360 is the unit of action and follow-up.
6. SEEDS → GROW → REAP represents longitudinal progression from Tingkatan 1–5.
7. Intelligence recommends and explains; it does not fabricate facts or silently mutate data.
8. Intervention records must remain traceable to a student and an observable problem/signal.
9. Missing data must be visible as a coverage gap, not converted into an invented KPI.
10. Production readiness remains a release-control layer.

## Operational flow

### 1. Data

Read student, academic, attendance and intervention records through `DataProvider`.

### 2. Signal

Use existing analytics to identify measurable risk, performance gaps, attendance concerns and intervention gaps.

### 3. Bottleneck

Prioritise the largest actionable school/class/subject constraints using existing bottleneck engines.

### 4. Student 360

Drill from an aggregate signal to the affected student without creating a duplicate student master.

### 5. Action

Expose a clear next action based on the signal and available intervention state.

### 6. Intervention

Link an action to an existing intervention case where available. Do not create synthetic intervention history.

### 7. Follow-up

Surface next action, status and progress from the intervention record. Missing follow-up data remains explicitly missing.

### 8. Outcome

Compare subsequent available academic/attendance/intervention evidence. Do not claim causal impact unless supported by the data.

## Longitudinal model

- **SEEDS:** Tingkatan 1–3 foundation and early development.
- **GROW:** Tingkatan 4 readiness, strengths and gaps.
- **REAP:** Tingkatan 5 SPM readiness and target gap.
- **Student 360:** longitudinal student view across the progression pipeline.
- **Command:** current operational priority.
- **Intelligence:** cross-domain synthesis and decision support.

## Phase 10 acceptance criteria

- Command can identify a priority from available data.
- Priority can drill to Student 360.
- Student 360 exposes academic, attendance and intervention evidence without inventing missing values.
- Intervention status and next action are visible where supplied by the provider.
- Intelligence consumes existing analytics rather than reimplementing them.
- Data Health and Production readiness remain visible as governance controls.
- Mock and live data remain explicitly distinguishable.
- No identity-number fields are introduced.
- No service-role credentials are exposed to the client.
- No database schema migration is required for the integration layer.
- Build and lint must pass before integration is considered complete.

## Non-goals

- No rewrite of Phase 6–9 analytics.
- No new student database in Notion.
- No automatic intervention creation without an explicit write workflow.
- No AI-generated claims presented as verified school facts.
- No automatic merge into `main`.
