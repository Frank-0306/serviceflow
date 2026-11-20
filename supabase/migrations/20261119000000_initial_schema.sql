-- ServiceFlow / BrightNest Cleaning — initial schema
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- Security model
-- • Visitors (anon role) have NO access to any table. Public requests are inserted
--   by the Next.js server route using the secret key, after validation and re-pricing.
-- • Signed-in users can read/update requests ONLY if their user id is in public.admins.
-- • Admins can change only `status` and `admin_notes`; every other column is read-only.
-- • Every status change is recorded in request_status_events by a trigger.

-- ─── Types ──────────────────────────────────────────────────────────────────
create type public.request_status as enum ('new', 'contacted', 'scheduled', 'completed', 'cancelled');
create type public.service_type   as enum ('regular', 'deep', 'move', 'office');
create type public.time_window    as enum ('morning', 'midday', 'afternoon');

-- ─── Admins ─────────────────────────────────────────────────────────────────
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admins is 'Users allowed into /admin. Being signed in is not enough.';

-- ─── Service requests ───────────────────────────────────────────────────────
create table public.service_requests (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique check (reference ~ '^BN-\d{6}-[A-Z0-9]{4}$'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  status          public.request_status not null default 'new',
  source          text not null default 'website' check (source in ('website', 'demo-seed')),

  -- Contact
  first_name      text not null check (char_length(first_name) between 1 and 60),
  last_name       text not null check (char_length(last_name) between 1 and 60),
  email           text not null check (char_length(email) <= 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text not null check (char_length(phone) <= 30),

  -- Location and timing
  street          text not null check (char_length(street) between 3 and 120),
  unit            text not null default '' check (char_length(unit) <= 30),
  city            text not null check (char_length(city) between 2 and 80),
  zip             text not null check (zip ~ '^\d{5}(-\d{4})?$'),
  preferred_date  date not null,
  time_window     public.time_window not null,
  access_notes    text not null default '' check (char_length(access_notes) <= 500),

  -- Estimate (calculated on the server at submission time)
  service         public.service_type not null,
  frequency       text not null check (frequency in ('one-time', 'weekly', 'biweekly', 'monthly')),
  quote_input     jsonb not null,
  quote_lines     jsonb not null,
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  discount_cents  integer not null default 0 check (discount_cents >= 0),
  total_cents     integer not null check (total_cents >= 0),
  labor_hours_min numeric(4, 1) not null,
  labor_hours_max numeric(4, 1) not null,

  -- Internal
  admin_notes     text not null default '' check (char_length(admin_notes) <= 2000),

  -- Lowercased text used by the admin search box
  search_text     text generated always as (
    lower(reference || ' ' || first_name || ' ' || last_name || ' ' || email || ' ' || phone || ' ' || city || ' ' || zip)
  ) stored
);

create index service_requests_created_idx on public.service_requests (created_at desc);
create index service_requests_status_idx  on public.service_requests (status, created_at desc);
create index service_requests_service_idx on public.service_requests (service);

-- ─── Status history (one request → many events) ─────────────────────────────
create table public.request_status_events (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references public.service_requests (id) on delete cascade,
  from_status public.request_status,
  to_status   public.request_status not null,
  changed_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index request_status_events_request_idx on public.request_status_events (request_id, created_at);

-- ─── Helper: is the current user an admin? ──────────────────────────────────
-- security definer so policies can call it without recursive RLS checks.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- ─── Triggers ───────────────────────────────────────────────────────────────
create or replace function public.service_requests_before_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    insert into public.request_status_events (request_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create or replace function public.service_requests_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.request_status_events (request_id, from_status, to_status, changed_by, created_at)
  values (new.id, null, new.status, null, new.created_at);
  return null;
end;
$$;

revoke execute on function public.service_requests_before_update() from public, anon, authenticated;
revoke execute on function public.service_requests_after_insert()  from public, anon, authenticated;

create trigger service_requests_before_update
  before update on public.service_requests
  for each row execute function public.service_requests_before_update();

create trigger service_requests_after_insert
  after insert on public.service_requests
  for each row execute function public.service_requests_after_insert();

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.admins                enable row level security;
alter table public.service_requests      enable row level security;
alter table public.request_status_events enable row level security;

-- Admins can read requests and history, and update requests. No insert/delete
-- policies exist: inserts come only from the server with the secret key.
create policy "Admins can read requests"
  on public.service_requests for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can update requests"
  on public.service_requests for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can read status history"
  on public.request_status_events for select to authenticated
  using ((select public.is_admin()));

create policy "Users can see their own admin row"
  on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

-- ─── Grants (defense in depth on top of RLS) ────────────────────────────────
revoke all on public.service_requests, public.request_status_events, public.admins from anon;
revoke all on public.service_requests, public.request_status_events, public.admins from authenticated;

grant select on public.service_requests, public.request_status_events, public.admins to authenticated;
grant update (status, admin_notes) on public.service_requests to authenticated;

-- Server inserts (secret key → service_role). Newer Supabase projects don't grant
-- table privileges to service_role automatically, so grant only what's needed.
grant select, insert on public.service_requests to service_role;
grant select on public.request_status_events, public.admins to service_role;
