# PROGENS Phase 9 Audit

## Scope

Audit baseline: `feat/phase4-complete`, before Phase 9 implementation. The target branch is `feat/phase9-production`; `main` is not modified.

## Current architecture

`Supabase / Mock provider → DataProvider → analytics engines → pages/components → Command / Intelligence / Student 360`. Supabase is intended to be the structured source of truth; mock data exists as a development fallback.

## Provider architecture

- `DataProvider` exposes students, academic results, attendance, interventions and KPIs.
- `SupabaseDataProvider` reads live tables and maps them to application types.
- `MockDataProvider` supplies local development data.
- `getConfiguredProvider()` selects Supabase only when the two public Vite variables are configured; otherwise it currently selects mock data.
- `supabase.ts` creates a browser client only from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Existing strengths

1. Provider abstraction prevents pages from being tightly coupled to Supabase.
2. Latest-assessment selection already exists in the analytics layer.
3. Data Health already validates student/result/attendance/intervention linkage and mark ranges.
4. Command and Intelligence already surface coverage and data limitations.
5. Attendance is modelled with `absentDays`, allowing the system to avoid inventing an attendance percentage.
6. Assessment metadata includes assessment identity, type, name and date.

## Production risks identified

1. Provider selection does not expose a transparent LIVE/MOCK/ERROR status to users.
2. Supabase connectivity is not independently health-checked.
3. The attendance provider previously substituted a synthetic date when `updated_at` was unavailable.
4. Data freshness has no reusable production-readiness model.
5. Data Health is not consumed by a production release gate.
6. No dedicated production readiness route exists.
7. No reusable data-source badge exists.
8. CI branch triggers do not include the Phase 9 branch.
9. Privacy/identity policy is not represented as an explicit application-level gate.
10. Production checks are not documented as a single deterministic contract.

## Phase 9 recommendation

Implement a deterministic production-readiness engine that consumes provider data and the existing Data Health engine. Add explicit provider/connectivity state, freshness checks, privacy scanning, attendance integrity checks, assessment freshness checks, release-gate logic, a `/production` page, reusable status badges, documentation and CI coverage.

## Phase 9 non-goals

- No database schema rewrite.
- No new student identity-number fields.
- No fabricated dates or attendance percentages.
- No unrelated dependency upgrades.
- No automatic merge into `feat/phase4-complete` or `main`.

## Baseline implementation notes

The baseline `SupabaseDataProvider` queries students, classes, subjects, academic results, assessments, attendance summaries, interventions and dashboard KPIs. The baseline `DataHealth` page already consumes `buildDataQualitySummary`, so Phase 9 should reuse that engine rather than create a parallel data-validation framework.
