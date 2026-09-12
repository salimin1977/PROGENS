# PROGENS — Progress Genesis System

A digital Student Progress, Performance, Intervention and School Intelligence
ecosystem for a Malaysian secondary school.

**Potential &rarr; Progress &rarr; Excellence**

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app opens directly on the **PROGENS Command
Centre**.

```bash
npm run build    # type-check and produce a production build in dist/
npm run preview  # preview the production build locally
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS (dark navy / teal / gold design system)
- Recharts for data visualization
- Lucide React for icons
- React Router for navigation

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
| `/reap` | REAP | Tingkatan 5 SPM results excellence, Road to 4.84 |
| `/stem` | STEM | Mathematics/Science STEM A pipeline |
| `/olympus` | OLYMPUS | Strategic leadership executive scorecard |
| `/nexus` | NEXUS | Integrated data & AI insight hub |
| `/reports` | Reports | Report centre (mock generate/preview) |
| `/settings` | Settings | School profile, KPI targets, risk thresholds, users |

## Data Layer

All data lives under `src/data/` as deterministic, seeded mock datasets
(`src/data/random.ts` provides a reproducible PRNG) modelled on realistic
Malaysian secondary school structures — Tingkatan 1-5, class names, subjects
by stream. Types are defined in `src/types/index.ts` to mirror a future
Supabase/PostgreSQL schema (`students`, `classes`, `subjects`,
`academic_results`, `attendance`, `interventions`, `teachers`, `kpi`,
`stem_pipeline`, `users`), so mock data can be swapped for live queries
without changing UI components.
