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
| `/intelligence` | Intelligence | Cross-domain decision support |
| `/data-health` | Data Health | Data quality governance |
| `/production` | Production | Production readiness and release gate |
| `/reports` | Reports | Reporting |
| `/settings` | Settings | Configuration |

## Operational Intelligence

Phase 10 establishes the operating loop:

```text
DATA
  ↓
SIGNAL
  ↓
BOTTLENECK
  ↓
STUDENT 360
  ↓
ACTION
  ↓
INTERVENTION
  ↓
FOLLOW-UP
  ↓
OUTCOME
```

`src/analytics/operationalIntelligenceEngine.ts` orchestrates current provider data into deterministic student-level operational signals and intervention-state summaries. It reuses the existing latest-assessment selector rather than creating a second assessment-selection rule.

### Longitudinal pathway

```text
Tingkatan 1–3  →  SEEDS
                    ↓
Tingkatan 4    →  GROW
                    ↓
Tingkatan 5    →  REAP
                    ↓
                SPM readiness
```

Student 360 remains the longitudinal student view. Command remains the current decision surface. Intelligence remains decision support. Supabase remains the structured source of truth when configured.

## Phase 9–10 Governance

- Live and mock data must remain distinguishable.
- Missing data is surfaced as a coverage gap, not invented.
- Absence days are not converted into an attendance percentage without verified denominator/rate.
- No government identity numbers are introduced or displayed.
- No service-role credentials belong in browser code.
- Existing Data Health and Production Readiness controls remain part of release review.
- Phase 10 does not automatically create intervention history or claim causal impact.

## Data Provider Architecture

```text
PROGENS UI
    ↓
React Hooks / Pages
    ↓
Analytics / Business Logic
    ↓
DataProvider
   ↙       ↘
Mock     Supabase
```

`src/providers/DataProvider.ts` remains the persistence-independent contract. Pages should not bypass this boundary.

## Analytics

Pure calculation modules live under `src/analytics/`. Existing academic, attendance, risk, intervention, SEEDS, GROW, REAP, STEM, KPI, bottleneck, intelligence, data-quality and production-readiness engines remain reusable.

## Phase 10 limitation

The current provider contract exposes intervention status and progress but does not expose a persistent intervention-action journal. Therefore Phase 10 summarizes the current intervention state safely. Full action/outcome history requires a future persistence contract and should not be fabricated in the UI.
