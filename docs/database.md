# PROGENS Database Schema

Full SQL lives in `supabase/migrations/`. This is the map of what exists
and how it relates.

## Core reference tables

| Table | Purpose |
| --- | --- |
| `schools` | Single-row school identity |
| `academic_years` | One row per year; exactly one `is_current = true` |
| `roles` | The 6 fixed `app_role` values and their description |
| `teachers` | Staff directory |
| `users` | App accounts, each with one `role`, optionally linked to a `teacher` |
| `classes` | One row per class per academic year (`name`, `form`, `stream`) |
| `subjects` | Subject catalogue with `department` and SPM flag |

## Student & academic

| Table | Purpose |
| --- | --- |
| `students` | Core roster; `class_id` is the student's current class |
| `student_classes` | Historical class membership across years (a student can move classes year to year) |
| `student_subjects` | Which subjects a student is registered for, per year |
| `assessments` | Named exam events (`PPT`, `PASA`, `SPM`, …) per year |
| `academic_results` | One row per student × subject × assessment. `grade` and `gp` are always kept in sync via `src/utils/grading.ts` — never computed ad hoc |
| `attendance` | One row per student per school day attended/recorded |

## Intervention

| Table | Purpose |
| --- | --- |
| `interventions` | One case per (student, problem). `risk_level` and `status` are tracked independently — a case can be `ACTIVE` at any risk level |
| `intervention_actions` | Chronological action log per intervention (the "history") |

## Analytical profiles (materialised views in a live deployment)

| Table | Computed by |
| --- | --- |
| `seeds_profiles` | `src/engines/seedsEngine.ts` — Tingkatan 1-3 |
| `grow_profiles` | `src/engines/growEngine.ts` — Tingkatan 4 |
| `reap_profiles` | `src/engines/reapEngine.ts` — Tingkatan 5 |
| `stem_pipeline` | `src/engines/stemEngine.ts` — pre-streaming STEM candidates |

See `docs/architecture.md` for why these have no hand-written seed rows.

## KPI

| Table | Purpose |
| --- | --- |
| `kpi_targets` | Current/target value per named KPI, direction-aware (`higher_is_better`) |
| `kpi_snapshots` | Historical point-in-time values for trend charts |

## Key relationships

```
schools 1──* academic_years 1──* classes 1──* students
students 1──* academic_results *──1 subjects
students 1──* academic_results *──1 assessments
students 1──* attendance
students 1──* interventions 1──* intervention_actions
students 1──1 seeds_profiles | grow_profiles | reap_profiles | stem_pipeline  (per academic_year)
```

## Known 2027 STEM A Pipeline cohort

The Tingkatan 3 seed data reproduces the known 2027 cohort exactly:
33 total pipeline candidates — 3 Cekap 23, 3 Amanah 4, 3 Damai 6,
3 Berani 0. Every student in 3 Berani fails Mathematics, which is why the
class contributes zero candidates (`stemEngine.classifyStemPipeline`
excludes any student failing Math or Science from the pipeline pool
entirely, rather than ranking them last within it). See
`src/data/seed/students.ts` (`STEM_ELIGIBLE_COUNT`,
`FORCE_MATH_FAIL_CLASSES`) for how this is seeded, and
`docs/risk-engine.md` / `src/services/stemService.ts` for how it surfaces
as a NEXUS insight.
