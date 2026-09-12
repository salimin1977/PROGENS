# PROGENS Architecture

## Layering

```
DATA  →  DATABASE  →  LOGIC  →  API/SERVICE  →  UI
```

```
src/
├── types/
│   ├── schema.ts        Normalized DB row types (mirrors supabase/migrations)
│   └── index.ts          UI view-model types (what components render)
├── utils/
│   ├── grading.ts        Grade <-> point <-> percentage — single source of truth
│   └── validation.ts     Data integrity checks
├── data/
│   ├── random.ts          Deterministic seeded PRNG
│   └── seed/               Mock "database" — config, generators, aggregator
├── providers/
│   ├── DataProvider.ts        Interface every backend implements
│   ├── MockDataProvider.ts    Reads src/data/seed
│   ├── SupabaseDataProvider.ts Reads a real Supabase project
│   └── index.ts                getDataProvider() factory
├── engines/                 Pure calculation/classification logic
│   ├── academicEngine.ts    GPM / GPS / GPMP / pass rate / distributions
│   ├── attendanceEngine.ts  Attendance rate, monthly/yearly rollups
│   ├── riskEngine.ts        calculateStudentRisk()
│   ├── interventionEngine.ts generateInterventionRecommendation()
│   ├── seedsEngine.ts       Tingkatan 1-3 classification
│   ├── growEngine.ts        Tingkatan 4 growth score
│   ├── reapEngine.ts        Tingkatan 5 priority matrix
│   ├── stemEngine.ts        STEM A Pipeline classification
│   └── kpiEngine.ts         KPI status/variance, direction-aware
├── analytics/
│   └── nexusEngine.ts       Insight generation (what/why/who/action/what-if)
├── services/                 Orchestration: provider + engines -> view models
├── hooks/
│   ├── useAsync.ts           Loading/success/error state for any service call
│   └── use{Students,Student,Academic,Attendance,Interventions,KPIs,Risk,STEM}.ts
│                              Named, single-purpose wrappers over useAsync + one service call each
└── components, pages, ...    UI (unchanged Phase 1 visual identity)
```

## Why a DataProvider abstraction

Every page calls a `services/*.ts` function, never a data file or a
Supabase client directly. Services call `getDataProvider()` from
`src/providers`, which returns `MockDataProvider` (default, zero
configuration) or `SupabaseDataProvider` (when `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are set). Both implement the exact same
`DataProvider` interface, so no UI or service code changes when switching
backends.

## Why engines are separate from services

Engines (`src/engines`, `src/analytics`) are pure functions: given rows,
they return a calculation or classification, with no I/O. This is what
makes them unit-testable in isolation (see `src/**/*.test.ts`) and what
guarantees a KPI is calculated in exactly one place — a UI component never
re-derives a formula an engine already owns.

Services are the only layer allowed to call `getDataProvider()`. They
fetch rows, call the relevant engine(s), and shape the result into the
view models `src/types/index.ts` defines for the UI.

## Why some "tables" have no seed rows

`seeds_profiles`, `grow_profiles`, `reap_profiles` and `stem_pipeline` are
defined as real tables in `supabase/migrations/0001_init_schema.sql`
because a live deployment would materialise them (e.g. via a nightly
Postgres function or Edge Function — see `supabase/functions/README.md`)
for fast reads. In this demo, `MockDataProvider` doesn't need that
materialisation step: `src/services/{seeds,grow,reap,stem}Service.ts`
compute them on every call directly from `students` + `academic_results`
+ `attendance` + `interventions` via the matching engine. The shape
returned to the UI is identical either way.
