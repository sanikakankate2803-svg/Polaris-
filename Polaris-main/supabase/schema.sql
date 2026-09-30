-- ==============================================================================
-- POLARIS PLATFORM - SUPABASE POSTGRESQL SCHEMA
-- Government Innovation & Startup Procurement Escrow Platform
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('department_official', 'startup', 'validator', 'admin')),
  name text not null,
  org_or_department text not null,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index on role and verification_status
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_verification on public.profiles(verification_status);

-- 2. PROBLEM STATEMENTS TABLE
create table if not exists public.problem_statements (
  id uuid default gen_random_uuid() primary key,
  department_id uuid references public.profiles(id) on delete cascade not null,
  raw_input text not null,
  title text not null,
  background text not null,
  outcome text not null,
  metrics jsonb not null default '[]'::jsonb,
  category_tags jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'matching', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_problem_statements_dept on public.problem_statements(department_id);
create index if not exists idx_problem_statements_status on public.problem_statements(status);

-- 3. STARTUPS TABLE
-- create table if not exists public.startups (
--   id uuid default gen_random_uuid() primary key,
--   profile_id uuid references public.profiles(id) on delete set null,
--   name text not null,
--   description text not null,
--   sector text not null,
--   website text,
--   team_info text not null,
--   references text[] default array[]::text[],
--   eligibility_score integer default 75 check (eligibility_score between 0 and 100),
--   product_maturity text not null default 'prototype' check (product_maturity in ('concept', 'prototype', 'deployed', 'scaling')),
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );
create table if not exists public.startups (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  description text not null,
  sector text not null,
  website text,
  team_info text not null,
  client_references text[] default array[]::text[],
  eligibility_score integer default 75 check (eligibility_score between 0 and 100),
  product_maturity text not null default 'prototype' check (product_maturity in ('concept', 'prototype', 'deployed', 'scaling')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
  
create index if not exists idx_startups_sector on public.startups(sector);
create index if not exists idx_startups_profile on public.startups(profile_id);

-- 4. MATCHES TABLE
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  problem_statement_id uuid references public.problem_statements(id) on delete cascade not null,
  startup_id uuid references public.startups(id) on delete cascade not null,
  relevance_score integer not null check (relevance_score between 0 and 100),
  eligibility_breakdown jsonb not null default '{}'::jsonb,
  match_explanation text not null,
  status text not null default 'new' check (status in ('new', 'shortlisted', 'rejected', 'invited_to_pilot')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(problem_statement_id, startup_id)
);

create index if not exists idx_matches_ps on public.matches(problem_statement_id);
create index if not exists idx_matches_startup on public.matches(startup_id);

-- 5. PILOTS TABLE
create table if not exists public.pilots (
  id uuid default gen_random_uuid() primary key,
  problem_statement_id uuid references public.problem_statements(id) on delete cascade not null,
  startup_id uuid references public.startups(id) on delete cascade not null,
  department_id uuid references public.profiles(id) on delete cascade not null,
  scope text not null,
  timeline text not null,
  budget numeric(12, 2) default 0.00,
  status text not null default 'draft' check (status in ('draft', 'active', 'in_review', 'completed', 'terminated')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_pilots_dept on public.pilots(department_id);
create index if not exists idx_pilots_startup on public.pilots(startup_id);
create index if not exists idx_pilots_status on public.pilots(status);

-- 6. MILESTONES TABLE
create table if not exists public.milestones (
  id uuid default gen_random_uuid() primary key,
  pilot_id uuid references public.pilots(id) on delete cascade not null,
  milestone_number integer not null,
  title text not null,
  description text not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'submitted', 'approved', 'paid')),
  payment_amount numeric(12, 2) not null default 0.00,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'escrowed', 'processing', 'paid')),
  deliverable_url text,
  deliverable_filename text,
  submission_notes text,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_milestones_pilot on public.milestones(pilot_id);

-- 7. VALIDATION REPORTS TABLE
create table if not exists public.validation_reports (
  id uuid default gen_random_uuid() primary key,
  pilot_id uuid references public.pilots(id) on delete cascade not null,
  validator_id uuid references public.profiles(id) on delete cascade not null,
  findings text not null,
  metrics_achieved boolean not null default false,
  scale_up_readiness_score integer not null check (scale_up_readiness_score between 1 and 10),
  decision text not null check (decision in ('approve', 'reject', 'request_data')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_validation_pilot on public.validation_reports(pilot_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS INSERT
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_name text;
  user_org text;
  user_status text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'startup');
  user_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  user_org := coalesce(new.raw_user_meta_data->>'org_or_department', 'Independent');
  
  -- Strict rule: Startups are verified upon registration; official roles require Admin approval
  if user_role = 'startup' then
    user_status := 'verified';
  else
    user_status := 'pending';
  end if;

  insert into public.profiles (
    id,
    email,
    role,
    name,
    org_or_department,
    verification_status
  ) values (
    new.id,
    new.email,
    user_role,
    user_name,
    user_org,
    user_status
  );

  -- If the role is startup, also link or create an initial startup record
  if user_role = 'startup' then
    insert into public.startups (
      profile_id,
      name,
      description,
      sector,
      team_info,
      product_maturity
    ) values (
      new.id,
      user_org,
      'Innovative technology provider registered on Polaris.',
      'GovTech & Public Infrastructure',
      'Team led by ' || user_name,
      'prototype'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.problem_statements enable row level security;
alter table public.startups enable row level security;
alter table public.matches enable row level security;
alter table public.pilots enable row level security;
alter table public.milestones enable row level security;
alter table public.validation_reports enable row level security;

-- PROFILES POLICIES
-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins and Validators can view all profiles
create policy "Admins and Validators can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'validator')
    )
  );

-- Admins can update any profile (e.g. approve pending status)
create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Users can update own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- PROBLEM STATEMENTS POLICIES
-- Departments can see their own statements; all authenticated users can see published statements
create policy "View problem statements"
  on public.problem_statements for select
  using (
    status = 'published'
    or department_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Departments can insert problem statements"
  on public.problem_statements for insert
  with check (
    auth.uid() = department_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'department_official' and p.verification_status = 'verified'
    )
  );

create policy "Departments can update own problem statements"
  on public.problem_statements for update
  using (auth.uid() = department_id);

-- STARTUPS POLICIES
create policy "Startups are visible to authenticated users"
  on public.startups for select
  to authenticated
  using (true);

create policy "Startup owners can edit their profile"
  on public.startups for update
  using (
    profile_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- MATCHES POLICIES
create policy "Matches visible to department and matched startup"
  on public.matches for select
  using (
    exists (
      select 1 from public.problem_statements ps
      where ps.id = matches.problem_statement_id and ps.department_id = auth.uid()
    )
    or exists (
      select 1 from public.startups s
      where s.id = matches.startup_id and s.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'validator')
    )
  );

-- PILOTS POLICIES
create policy "Pilots visible to participating parties and validators"
  on public.pilots for select
  using (
    department_id = auth.uid()
    or exists (
      select 1 from public.startups s
      where s.id = pilots.startup_id and s.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'validator')
    )
  );

-- MILESTONES POLICIES
create policy "Milestones visible to pilot participants"
  on public.milestones for select
  using (
    exists (
      select 1 from public.pilots p
      where p.id = milestones.pilot_id and (
        p.department_id = auth.uid()
        or exists (select 1 from public.startups s where s.id = p.startup_id and s.profile_id = auth.uid())
        or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role in ('admin', 'validator'))
      )
    )
  );

-- VALIDATION REPORTS POLICIES
create policy "Validation reports public when approved, else visible to validator and pilot parties"
  on public.validation_reports for select
  using (
    decision = 'approve'
    or validator_id = auth.uid()
    or exists (
      select 1 from public.pilots p
      where p.id = validation_reports.pilot_id and (
        p.department_id = auth.uid()
        or exists (select 1 from public.startups s where s.id = p.startup_id and s.profile_id = auth.uid())
        or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
      )
    )
  );

-- STORAGE BUCKET CONFIGURATION
insert into storage.buckets (id, name, public)
values ('milestone-deliverables', 'milestone-deliverables', false)
on conflict (id) do nothing;
