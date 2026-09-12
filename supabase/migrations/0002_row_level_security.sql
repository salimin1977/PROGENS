-- PROGENS Phase 2 — Row Level Security
--
-- Policies assume Supabase Auth is configured and `users.id = auth.uid()`.
-- They are inert until Auth is wired up (VITE_SUPABASE_URL/ANON_KEY unset
-- means the app runs entirely on MockDataProvider and never touches these
-- tables), but the schema is ready the moment it is.

create or replace function current_app_role() returns app_role
language sql stable
as $$
  select role from users where id = auth.uid();
$$;

create or replace function current_teacher_id() returns uuid
language sql stable
as $$
  select teacher_id from users where id = auth.uid();
$$;

create or replace function is_privileged() returns boolean
language sql stable
as $$
  select current_app_role() in ('ADMIN', 'PENGETUA', 'GKMP');
$$;

-- Students: privileged roles and counsellors see everyone; teachers see
-- only students in a class they teach; viewers see none (dashboard-level
-- aggregates only).
alter table students enable row level security;

create policy students_privileged_read on students
  for select using (is_privileged() or current_app_role() = 'COUNSELLOR');

create policy students_teacher_read on students
  for select using (
    current_app_role() = 'TEACHER'
    and class_id in (select id from classes where teacher_id = current_teacher_id())
  );

-- Academic results: same visibility as the student they belong to.
alter table academic_results enable row level security;

create policy academic_results_privileged_read on academic_results
  for select using (is_privileged());

create policy academic_results_teacher_read on academic_results
  for select using (
    current_app_role() = 'TEACHER'
    and student_id in (
      select id from students where class_id in (
        select id from classes where teacher_id = current_teacher_id()
      )
    )
  );

-- Attendance: mirrors academic_results visibility.
alter table attendance enable row level security;

create policy attendance_privileged_read on attendance
  for select using (is_privileged());

create policy attendance_teacher_read on attendance
  for select using (
    current_app_role() = 'TEACHER'
    and class_id in (select id from classes where teacher_id = current_teacher_id())
  );

-- Interventions & actions: counsellors and privileged roles see every
-- case; a teacher sees only cases they are assigned to run.
alter table interventions enable row level security;
alter table intervention_actions enable row level security;

create policy interventions_privileged_read on interventions
  for select using (is_privileged() or current_app_role() = 'COUNSELLOR');

create policy interventions_teacher_read on interventions
  for select using (current_app_role() = 'TEACHER' and teacher_id = current_teacher_id());

create policy intervention_actions_read on intervention_actions
  for select using (
    intervention_id in (
      select id from interventions
      where is_privileged()
        or current_app_role() = 'COUNSELLOR'
        or (current_app_role() = 'TEACHER' and teacher_id = current_teacher_id())
    )
  );

-- SEEDS / GROW / REAP / STEM profiles: same rule as students.
alter table seeds_profiles enable row level security;
alter table grow_profiles enable row level security;
alter table reap_profiles enable row level security;
alter table stem_pipeline enable row level security;

create policy seeds_profiles_read on seeds_profiles
  for select using (
    is_privileged() or current_app_role() = 'COUNSELLOR'
    or (current_app_role() = 'TEACHER' and student_id in (
      select id from students where class_id in (select id from classes where teacher_id = current_teacher_id())
    ))
  );

create policy grow_profiles_read on grow_profiles
  for select using (
    is_privileged() or current_app_role() = 'COUNSELLOR'
    or (current_app_role() = 'TEACHER' and student_id in (
      select id from students where class_id in (select id from classes where teacher_id = current_teacher_id())
    ))
  );

create policy reap_profiles_read on reap_profiles
  for select using (
    is_privileged() or current_app_role() = 'COUNSELLOR'
    or (current_app_role() = 'TEACHER' and student_id in (
      select id from students where class_id in (select id from classes where teacher_id = current_teacher_id())
    ))
  );

create policy stem_pipeline_read on stem_pipeline
  for select using (
    is_privileged() or current_app_role() = 'COUNSELLOR'
    or (current_app_role() = 'TEACHER' and student_id in (
      select id from students where class_id in (select id from classes where teacher_id = current_teacher_id())
    ))
  );

-- KPI targets/snapshots are school-wide aggregates with no student PII —
-- every authenticated role, including VIEWER, may read them.
alter table kpi_targets enable row level security;
alter table kpi_snapshots enable row level security;

create policy kpi_targets_read on kpi_targets for select using (auth.uid() is not null);
create policy kpi_snapshots_read on kpi_snapshots for select using (auth.uid() is not null);

-- Writes are intentionally left to service-role/server contexts only
-- (no insert/update/delete policy is defined for any authenticated role
-- above) until an admin write-flow is designed in a later phase.
