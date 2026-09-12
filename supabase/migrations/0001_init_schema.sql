-- PROGENS Phase 2 — core schema
-- Mirrors src/types/schema.ts exactly. Column names are snake_case to
-- match Supabase/PostgreSQL convention and the DataProvider contract.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type student_status as enum ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED');
create type attendance_status as enum ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
create type risk_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type intervention_status as enum ('PLANNED', 'ACTIVE', 'COMPLETED', 'CLOSED');
create type assessment_type as enum ('TOV', 'PPT', 'PPSA', 'PASA', 'SPM', 'ETR');
create type department as enum ('Kemanusiaan', 'Bahasa', 'Sains', 'Matematik', 'Teknik & Vokasional', 'Pendidikan Jasmani', 'Others');
create type grade as enum ('A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'G');
create type result_status as enum ('PASS', 'FAIL');
create type stem_status as enum ('PASS', 'FAIL', 'NOT_TAKEN');
create type stem_pipeline_status as enum ('ELITE', 'BOOST', 'RESCUE', 'MONITOR');
create type reap_priority as enum ('P1', 'P2', 'P3');
create type kpi_status as enum ('ACHIEVED', 'ON_TRACK', 'ATTENTION');
create type app_role as enum ('ADMIN', 'PENGETUA', 'GKMP', 'TEACHER', 'COUNSELLOR', 'VIEWER');
create type class_stream as enum ('General', 'Akaun', 'Sains', 'Ekonomi', 'Seni');
create type seeds_status as enum ('FOUNDATION', 'DEVELOPING', 'PROMISING', 'HIGH POTENTIAL', 'ELITE');
create type grow_status as enum ('ON TRACK', 'NEEDS SUPPORT', 'AT RISK');
create type kpi_unit as enum ('%', 'gps', 'count');

-- ---------------------------------------------------------------------
-- Reference tables
-- ---------------------------------------------------------------------
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text not null,
  principal_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table academic_years (
  id uuid primary key default gen_random_uuid(),
  year int not null unique,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false
);
create unique index one_current_academic_year on academic_years (is_current) where is_current;

create table roles (
  role app_role primary key,
  description text not null
);
insert into roles (role, description) values
  ('ADMIN', 'Full system configuration and user management'),
  ('PENGETUA', 'Principal — full read access, strategic KPI ownership'),
  ('GKMP', 'Head of subject panel — academic and reporting access'),
  ('TEACHER', 'Subject/class teacher — assigned classes and students'),
  ('COUNSELLOR', 'Intervention and student welfare access'),
  ('VIEWER', 'Read-only dashboard access');

create table teachers (
  id uuid primary key default gen_random_uuid(),
  staff_no text not null unique,
  name text not null,
  department department not null,
  position text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE'))
);

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role app_role not null references roles (role),
  teacher_id uuid references teachers (id) on delete set null
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  form smallint not null check (form between 1 and 5),
  stream class_stream not null,
  teacher_id uuid references teachers (id) on delete set null,
  capacity int not null,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  unique (name, academic_year_id)
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  department department not null,
  is_spm_subject boolean not null default true
);

-- ---------------------------------------------------------------------
-- Students
-- ---------------------------------------------------------------------
create table students (
  id uuid primary key default gen_random_uuid(),
  student_no text not null unique,
  name text not null,
  gender text not null check (gender in ('Male', 'Female')),
  ic_last4 text not null check (char_length(ic_last4) = 4),
  form smallint not null check (form between 1 and 5),
  class_id uuid not null references classes (id) on delete restrict,
  status student_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_students_class on students (class_id);

create table student_classes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  is_current boolean not null default true,
  unique (student_id, academic_year_id)
);

create table student_subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  unique (student_id, subject_id, academic_year_id)
);

-- ---------------------------------------------------------------------
-- Academic
-- ---------------------------------------------------------------------
create table assessments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  assessment_type assessment_type not null,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  date date not null
);

create table academic_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  assessment_id uuid not null references assessments (id) on delete cascade,
  marks numeric(5, 2) not null check (marks >= 0 and marks <= 100),
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  grade grade not null,
  gp numeric(4, 2) not null check (gp between 1 and 10),
  status result_status not null,
  created_at timestamptz not null default now(),
  unique (student_id, subject_id, assessment_id)
);
create index idx_results_student on academic_results (student_id);
create index idx_results_assessment on academic_results (assessment_id);
create index idx_results_subject on academic_results (subject_id);

-- ---------------------------------------------------------------------
-- Attendance
-- ---------------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  date date not null,
  status attendance_status not null,
  class_id uuid not null references classes (id) on delete restrict,
  reason text,
  unique (student_id, date)
);
create index idx_attendance_student on attendance (student_id);
create index idx_attendance_class on attendance (class_id);
create index idx_attendance_date on attendance (date);

-- ---------------------------------------------------------------------
-- Intervention
-- ---------------------------------------------------------------------
create table interventions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  category text not null,
  risk_level risk_level not null,
  problem text not null,
  objective text not null,
  strategy text not null,
  teacher_id uuid not null references teachers (id) on delete restrict,
  start_date date not null,
  target_date date not null,
  status intervention_status not null default 'PLANNED',
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_interventions_student on interventions (student_id);
create index idx_interventions_status on interventions (status);

create table intervention_actions (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references interventions (id) on delete cascade,
  action_date date not null,
  action text not null,
  person_in_charge text not null,
  result text not null,
  next_action text not null
);
create index idx_intervention_actions_intervention on intervention_actions (intervention_id);

-- ---------------------------------------------------------------------
-- SEEDS / GROW / REAP / STEM
--
-- These are analytical profiles recomputed by the application's
-- engines (src/engines/*.ts) from students + academic_results +
-- attendance + interventions. They are modelled here as regular tables
-- so a scheduled job / Postgres function can materialise them for fast
-- reads and historical tracking, but the values themselves are always
-- derived — never hand-edited.
-- ---------------------------------------------------------------------
create table seeds_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  potential_level text not null check (potential_level in ('LOW', 'MEDIUM', 'HIGH')),
  academic_level text not null check (academic_level in ('LOW', 'MEDIUM', 'HIGH')),
  attendance_level text not null check (attendance_level in ('LOW', 'MEDIUM', 'HIGH')),
  stem_interest boolean not null default false,
  risk_level risk_level not null,
  recommended_action text not null,
  status seeds_status not null,
  unique (student_id, academic_year_id)
);

create table grow_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  academic_level text not null check (academic_level in ('LOW', 'MEDIUM', 'HIGH')),
  career_interest text not null,
  strength text not null,
  gap text not null,
  target text not null,
  action text not null,
  status grow_status not null,
  unique (student_id, academic_year_id)
);

create table reap_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  current_gps numeric(4, 2) not null,
  target_gps numeric(4, 2) not null,
  risk_level risk_level not null,
  priority reap_priority not null,
  intervention_status text not null,
  spm_readiness numeric(5, 2) not null check (spm_readiness between 0 and 100),
  unique (student_id, academic_year_id)
);

create table stem_pipeline (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  current_form smallint not null check (current_form between 1 and 5),
  math_status stem_status not null,
  science_status stem_status not null,
  stem_interest boolean not null default false,
  potential text not null check (potential in ('LOW', 'MEDIUM', 'HIGH')),
  pipeline_status stem_pipeline_status not null,
  recommended_action text not null,
  unique (student_id, academic_year_id)
);

-- ---------------------------------------------------------------------
-- KPI
-- ---------------------------------------------------------------------
create table kpi_targets (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  kpi_name text not null,
  current_value numeric(8, 2) not null,
  target_value numeric(8, 2) not null,
  unit kpi_unit not null,
  higher_is_better boolean not null,
  unique (kpi_name, academic_year_id)
);

create table kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  snapshot_date date not null,
  kpi_name text not null,
  value numeric(8, 2) not null
);
create index idx_kpi_snapshots_name_date on kpi_snapshots (kpi_name, snapshot_date);
