# PROGENS — Progress Genesis System

A digital Student Progress, Performance, Intervention and School
Intelligence ecosystem for a Malaysian secondary school.

**Potential &rarr; Progress &rarr; Excellence**

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app opens directly on the **PROGENS
Command Centre**. No Supabase project or environment variables are
required to run the full demo: every module reads from an in-memory,
seeded mock dataset via `MockDataProvider`.

```bash
npm run build    # type-check and produce a production build in dist/
npm run test     # run the Vitest unit test suite
npm run preview  # preview the production build locally
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS (dark navy / teal / gold design system)
- Recharts for data visualization
- Lucide React for icons
- React Router for navigation
- Vitest for unit tests
- `@supabase/supabase-js`, wired but inactive until configured (see below)

## Modules

| Route | Module | Focus |
| --- | --- | --- |
| `/` | Command | Executive command centre — KPIs, GPS trend, risk & intervention overview |
| `/students` | Students | Student directory, filters and full profiles |
| `/academic` | Academic | GPS, GPMP, subject performance, grade distribution |
| `/attendance` | Attendance | Attendance rate, chronic absence, risk correlation |
| `/intervention` | Intervention | Active intervention case management |
| `/seeds` | SEEDS | Tingkatan 1-3 early excellence & development funnel |
| `/grow` | GROW | Tingkatan 4 growth & readiness optimization |
| `/reap` | REAP | Tingkatan 5 SPM results excellence, Road to target GPS |
| `/stem` | STEM | Mathematics/Science STEM A Pipeline (pre-streaming, Tingkatan 1-3) |
| `/olympus` | OLYMPUS | Strategic leadership executive scorecard with traffic-light status |
| `/nexus` | NEXUS | Integrated data & AI insight hub |
| `/reports` | Reports | Report centre (mock generate/preview) |
| `/settings` | Settings | School profile, KPI targets, risk thresholds, users |

A global search (header, or `Cmd/Ctrl`-click the search box) finds
students, classes, teachers and subjects and links straight to the
relevant page.

## Phase 2 — Data, Database & System Engine

Phase 2 turned the Phase 1 frontend prototype into a data-driven
application, following `DATA → DATABASE → LOGIC → API/SERVICE → UI`.
Full detail lives in `docs/`:

- **[docs/architecture.md](docs/architecture.md)** — layering, folder
  structure, and why services/engines/providers are separated
- **[docs/database.md](docs/database.md)** — every table, its purpose,
  and how they relate (full SQL in `supabase/migrations/`)
- **[docs/analytics.md](docs/analytics.md)** — GPM vs GPMP vs GPS, the
  academic engine, the KPI engine, NEXUS insight generation
- **[docs/risk-engine.md](docs/risk-engine.md)** — the G-grade-count risk
  rule, its attendance/trend modifiers, and edge cases
- **[docs/intervention-engine.md](docs/intervention-engine.md)** — how a
  risk assessment becomes a concrete intervention recommendation

### What's new in Phase 2

- A normalized relational schema (`src/types/schema.ts` /
  `supabase/migrations/`) covering students, teachers, classes, subjects,
  assessments, academic results, attendance, interventions (+ action
  history), SEEDS/GROW/REAP/STEM profiles, KPI targets/snapshots, users
  and roles.
- A `DataProvider` abstraction (`src/providers/`) — `MockDataProvider`
  (default) and `SupabaseDataProvider` implement the same interface, so
  the UI never knows or cares which one is active.
- A calculation/classification engine layer (`src/engines/`,
  `src/analytics/`) — every KPI, risk score, and programme classification
  is computed in exactly one place and unit-tested there.
- A services layer (`src/services/`) that is the *only* code allowed to
  call the DataProvider; pages call services, never raw data.
- Realistic seed data: ~415 students across 17 classes (Tingkatan 1-5),
  20 teachers, 16 subjects, two assessments per year with real
  student-level results and a sampled attendance calendar — deterministic
  and reproducible (see `src/data/seed/`).
- Named demonstration rosters — **NOVA** (Top Tingkatan 2) and
  **SUPERNOVA** (Top Tingkatan 3) — seeded with their exact given names
  and GPM figures, and the **STEM A Pipeline 2027** cohort reproduced
  exactly (33 total: 3 Cekap 23, 3 Amanah 4, 3 Damai 6, 3 Berani 0, with
  every 3 Berani student failing Mathematics).
- Loading / error / empty states everywhere (`useAsync` +
  `AsyncSection`), and a data-integrity check
  (`src/utils/validation.ts`) that runs once against the dataset in dev
  mode and warns on any inconsistency instead of silently accepting it.

### Data model

See `docs/database.md` for the full table-by-table breakdown. The two
type files to know:

- `src/types/schema.ts` — normalized DB rows (matches the SQL schema exactly)
- `src/types/index.ts` — UI view models that services build from those rows

### Risk & KPI engines

See `docs/risk-engine.md`, `docs/intervention-engine.md` and
`docs/analytics.md`. In short: `calculateStudentRisk()` is the only
place risk is computed; `generateInterventionRecommendation()` is the
only place an intervention is proposed; `calculateGP` / `calculateGPS` /
`calculateGPMP` / `calculateStudentGPM` are three related but distinct
metrics (see `docs/analytics.md` for why they must not be conflated).

### Supabase preparation

The app runs with **zero** Supabase configuration. To point it at a real
project instead:

1. Run the SQL in `supabase/migrations/` against your project (schema +
   Row Level Security policies).
2. Run `supabase/seed/0001_reference_data.sql` for the static reference
   tables, then see `supabase/seed/README.md` for generating the bulk
   student/result/attendance/intervention data from the same TypeScript
   generator `MockDataProvider` uses.
3. Set the environment variables below and restart the dev server —
   `getDataProvider()` (`src/providers/index.ts`) automatically switches
   to `SupabaseDataProvider`.

#### Environment variables

Create a `.env.local` (already git-ignored):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Leaving either unset keeps the app on `MockDataProvider` — this is the
default and requires no setup.

### How to seed data

The mock dataset regenerates automatically on every app start from
`src/data/seed/` — there is no separate seed step to run for the demo.
For seeding a real Supabase project, see `supabase/seed/README.md`.

### Testing

```bash
npm run test
```

Unit tests cover the calculation/classification engines and their edge
cases: `calculateGP`, `calculateGPS`, `calculateGPMP`, `calculatePassRate`,
`calculateStudentRisk` (including the LOW→MEDIUM escalation modifiers and
a zero-results student), `generateInterventionRecommendation`, and the
data validation utilities.

## Future Roadmap (Phase 3+)

- Wire real Supabase Auth + the Row Level Security policies already
  defined in `supabase/migrations/0002_row_level_security.sql`.
- Materialise `seeds_profiles` / `grow_profiles` / `reap_profiles` /
  `stem_pipeline` via a scheduled Edge Function (see
  `supabase/functions/README.md`) instead of computing them on every
  request.
- Persist report generation as real exports (PDF/Excel) instead of the
  current in-app preview.
- Add write flows (editing a result, logging an intervention action)
  behind the role-based RLS policies already modelled.
