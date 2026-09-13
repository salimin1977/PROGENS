# PROGENS — Progress Genesis System

A digital Student Progress, Performance, Intervention and School Intelligence ecosystem for a Malaysian secondary school.

**Potential → Progress → Excellence**

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app opens directly on the **PROGENS Command Centre**.

```bash
npm run build
npm run preview
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- Lucide React
- React Router

## Modules

| Route | Module | Focus |
| --- | --- | --- |
| `/` | Command | Executive command centre |
| `/students` | Students | Directory, filters and profiles |
| `/academic` | Academic | GPS, GPMP, subject performance |
| `/attendance` | Attendance | Attendance and risk |
| `/intervention` | Intervention | Intervention cases |
| `/seeds` | SEEDS | Tingkatan 1–3 development |
| `/grow` | GROW | Tingkatan 4 readiness |
| `/reap` | REAP | Tingkatan 5 SPM readiness |
| `/stem` | STEM | STEM A pipeline |
| `/olympus` | OLYMPUS | Strategic scorecard |
| `/nexus` | NEXUS | Data and AI intelligence |
| `/reports` | Reports | Reporting |
| `/settings` | Settings | Configuration |

## Phase 2 — Data Engine & Application Architecture

Phase 2 evolves the existing UI-first prototype without rebuilding the application.

### Architecture

```text
PROGENS UI
    ↓
React Hooks
    ↓
Domain Services
    ↓
Analytics / Business Logic
    ↓
DataProvider
   ↙       ↘
Mock     Supabase (Phase 3)
```

### Data Provider

`src/providers/DataProvider.ts` defines the persistence-independent contract. `MockDataProvider` is the current deterministic source. `SupabaseDataProvider` is an adapter boundary reserved for Phase 3 and requires no credentials in Phase 2.

### Domain Services

- `studentService.ts` — student retrieval, filtering, search and top-student queries.
- `academicService.ts` — results by student, subject, class and assessment.
- `attendanceService.ts` — attendance and configurable risk threshold.
- `interventionService.ts` — intervention lifecycle operations.
- `kpiService.ts` — dynamic school, academic, attendance, intervention and STEM KPI access.

### Analytics Engine

Pure calculation modules live under `src/analytics/`:

- `academicAnalytics.ts` — GP, GPI, GPMP, GPS, pass rate, grade distribution, subject/class performance and assessment trends.
- `attendanceAnalytics.ts` — attendance rate and attendance risk.
- `riskAnalytics.ts` — multi-indicator student risk scoring.
- `interventionAnalytics.ts` — indicator-driven intervention recommendations.
- `seedsAnalytics.ts` — Foundation → Elite classification for Tingkatan 1–3.
- `growAnalytics.ts` — strength, gap, target and action for Tingkatan 4.
- `reapAnalytics.ts` — target gap, priority and SPM readiness for Tingkatan 5.
- `stemAnalytics.ts` — STEM Elite / Boost / Rescue / Monitor classification.
- `kpiAnalytics.ts` — dynamic school KPI aggregation and GPS gap.

### KPI Convention

GPS is a strategic school KPI where **lower is better**.

```text
GPS Semasa = 5.11
GPS Sasaran = 4.84
Jurang = 5.11 - 4.84 = 0.27
```

GPI, GPMP and GPS are kept as distinct concepts in the analytics API and should not be substituted for one another.

### Risk Engine

The risk engine uses G grades, subject failures, attendance and academic performance. The primary policy is:

- 4+ G grades → Critical
- 2–3 G grades → High
- 1 G grade → Moderate
- no G → Low unless other indicators elevate risk

Attendance risk defaults to `< 90%` and is configurable.

### Data Quality

`src/utils/dataValidation.ts` detects duplicate student IDs, invalid marks, marks above maximum, missing student/class/subject fields and invalid grades. Invalid records are surfaced as validation issues rather than silently accepted.

### Mock Data Policy

The existing seeded generator remains available for prototype compatibility, but business logic is isolated into services and analytics. Student IDs are deterministic and stable for a given seed.

### Supabase Roadmap

Phase 3 will implement the `SupabaseDataProvider` against PostgreSQL tables and environment variables. UI pages and hooks should remain unchanged. No service keys, passwords, tokens or API credentials belong in source control.

## Phase 3 Direction

1. Connect Supabase/PostgreSQL.
2. Add authentication and role-based access.
3. Replace mock provider with live provider behind the same contract.
4. Add persistence for interventions and audit logs.
5. Add automated tests and CI build validation.
6. Introduce AI insight services only after the live data model is validated.
