# PROGENS Phase 9 — Production Readiness

## 1. Objective

Phase 9 establishes a transparent production-readiness layer so PROGENS can distinguish development data from live school data and answer whether the system is technically safe to operate with live data.

## 2. Architecture

`Supabase → SupabaseDataProvider → DataProvider → existing analytics/Data Health → Production Readiness Engine → /production → Command status card`.

The provider contract remains the boundary. Notion remains a longitudinal command/view layer and is not introduced as a second student database.

## 3. Production checks

The engine evaluates environment configuration, Supabase connectivity, provider state, existing Data Health results, assessment freshness/coverage, attendance integrity, intervention integrity, identity policy, client-side secret policy, build readiness and the release gate.

## 4. Data governance

The existing `dataQualityEngine` is reused. Production readiness does not replace or duplicate the existing quality rules. Required linkage failures and invalid marks are treated as production-critical findings.

## 5. Privacy rules

PROGENS must not store or import No. Kad Pengenalan, MyKad, MyKID, passport numbers or government identity numbers. The production engine performs a practical recursive scan over supplied records for prohibited identity field names. It never displays detected values.

`SUPABASE_SERVICE_ROLE_KEY` is not a browser configuration variable and must remain server-side only. Only public Vite Supabase configuration is permitted in the client.

## 6. Attendance rules

If the source provides only `absentDays`, PROGENS displays absence days. It does not convert absence days into an invented attendance percentage. A percentage is only appropriate when a verified attendance rate/denominator exists.

## 7. Assessment freshness

Assessment identity uses the existing `assessmentId`, `assessmentName`, `assessmentDate` and assessment type model. Latest-assessment selection remains owned by the existing analytics layer. Missing dates are represented as `Date unavailable`; no date is fabricated.

## 8. Error handling

The production page exposes loading, error, fallback and live states. Supabase connectivity errors are converted to human-readable messages. Raw credentials and unnecessary database internals are not rendered.

## 9. Release gate

- **READY** — no FAIL checks and no warnings.
- **READY WITH WARNINGS** — no critical FAIL, but warnings or non-critical failures remain.
- **NOT READY** — one or more critical FAIL checks exist.

The gate is a decision aid, not a substitute for final school leadership review.

## 10. Known limitations

1. Browser-side checks cannot prove database-side RLS correctness; RLS must be verified in Supabase independently.
2. The client can verify that the approved environment variables are present, but cannot prove that deployment secrets are configured correctly outside the browser.
3. Freshness is limited to dates exposed by the provider contract.
4. Build and lint remain CI controls; the `/production` page does not execute shell commands.
5. No automatic deployment or database-policy modification is performed by Phase 9.

## 11. Deployment checklist

- [ ] Deploy from the reviewed Phase 9 PR, not directly from `main`.
- [ ] Configure `VITE_SUPABASE_URL`.
- [ ] Configure `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Confirm no service-role secret is exposed to the browser.
- [ ] Confirm `/production` reports LIVE — SUPABASE.
- [ ] Confirm Data Health has no production-critical FAIL.
- [ ] Confirm assessment freshness and coverage are understood.
- [ ] Confirm attendance is not presented as a fabricated percentage.
- [ ] Confirm identity policy PASS.
- [ ] Confirm `npm run build` and `npm run lint` pass in CI.
- [ ] Perform final human acceptance review.

## 12. Rollback considerations

Phase 9 is isolated in `feat/phase9-production` and does not modify `main`. Rollback can be performed by declining/closing the PR or reverting the Phase 9 commits on the target integration branch. No schema migration is introduced by this phase, so database rollback is not required for the application changes described here.
