# Seeding PROGENS in Supabase

`0001_reference_data.sql` seeds the small, hand-authored reference tables:
`schools`, `academic_years`, `subjects`, `teachers`, `classes`,
`kpi_targets`, `kpi_snapshots`.

Bulk operational data — `students`, `academic_results`, `attendance`,
`interventions`, `intervention_actions` — is **not** hand-written as SQL.
It is generated deterministically by the same TypeScript logic that powers
`MockDataProvider` (`src/data/seed/*.ts`), including the named NOVA/
SUPERNOVA demonstration students and the 2027 STEM A Pipeline cohort
counts. Hand-authoring hundreds of `INSERT` statements would drift out of
sync with that generator immediately.

To populate a real Supabase project with the same demo dataset:

1. Run the migrations in `supabase/migrations/` and this reference seed.
2. Write a small Node script that imports `src/data/seed` (the same module
   `MockDataProvider` reads from) and bulk-inserts each collection via
   `@supabase/supabase-js`, mapping the reference UUIDs above onto the
   matching `school_id` / `class_id` / `subject_id` / `teacher_id` values.
3. Re-run `getFlagshipRoster('NOVA' | 'SUPERNOVA')` output as a one-off
   insert if you want the pinned demo rosters preserved; otherwise the app
   falls back to computing top-N by GPM automatically (see
   `src/services/seedsService.ts`).

This keeps exactly one source of truth for what "realistic seed data"
means, whether the app is running on the mock provider or a live project.
