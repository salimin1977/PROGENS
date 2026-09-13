# PROGENS Phase 2 Architecture

PROGENS keeps the existing React UI and routes. Data access now has an explicit boundary:

UI → Hooks → Services → Analytics → DataProvider → Mock/Supabase

Pages must not own persistence logic. Analytics functions are pure and reusable by pages, services and future reporting jobs.
