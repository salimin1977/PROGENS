# Planned Supabase Edge Functions

No edge functions are deployed yet — PROGENS Phase 2 runs entirely on
`MockDataProvider` with no Supabase project required. This directory is
reserved for Phase 3+ work:

- **recalculate-analytics** — scheduled (nightly) function that
  recomputes `seeds_profiles`, `grow_profiles`, `reap_profiles` and
  `stem_pipeline` for every student from `academic_results` +
  `attendance` + `interventions`, using the same rules as
  `src/engines/*.ts` (ported to Deno, or called via a thin HTTP wrapper
  around the existing TypeScript engines so the logic is never
  duplicated). Writes results into the four profile tables as a
  materialised snapshot for fast dashboard reads.
- **on-result-insert** — database webhook that re-runs the risk engine
  for a single student immediately after a new `academic_results` row
  lands, so Intervention Command reflects new failing grades without
  waiting for the nightly job.
