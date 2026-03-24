-- ============================================================
-- LexiDraft AI — Stateless Identity Protocol Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'citizen' check (role in ('citizen', 'notary')),
  updated_at timestamp with time zone default now()
);

-- 2. Bonds table (Stateless Identity Protocol)
-- CRITICAL: NO party_details, NO id_number columns.
-- Only legal_name and legal_address are permitted for persistence.
create table if not exists public.bonds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  doc_type text not null,
  legal_name text,          -- Extracted Name only (no ID number)
  legal_address text,       -- Extracted Address only (no image)
  content text,             -- The Legalese
  xai_summary text,         -- Marathi/Hindi summary
  status text default 'draft' check (status in ('draft', 'verified', 'printed', 'esigned', 'digilocker')),
  health_score int default 0,
  created_at timestamp with time zone default now()
);

-- Index for high-performance dashboard filtering
create index if not exists bonds_user_id_idx on public.bonds (user_id);
create index if not exists bonds_status_idx on public.bonds (status);

-- 3. Transient Session Data (30-minute TTL for demo / multi-page flows)
-- Records are purged by pg_cron hourly. Do NOT store raw ID numbers here.
create table if not exists public.temp_session_data (
  session_id uuid default gen_random_uuid() primary key,
  legal_name text,
  legal_address text,
  doc_type text,
  expires_at timestamp with time zone not null default (now() + interval '30 minutes')
);

create index if not exists temp_session_expires_idx on public.temp_session_data (expires_at);

-- 4. Secure Notary View
create or replace view public.notary_queue as
  select
    b.id, b.user_id, b.doc_type,
    b.legal_name, b.legal_address,
    b.content, b.xai_summary,
    b.status, b.health_score, b.created_at,
    p.full_name as citizen_name
  from public.bonds b
  join public.profiles p on b.user_id = p.id
  where b.status in ('verified', 'esigned', 'digilocker', 'printed');

-- 5. Row Level Security
alter table public.profiles enable row level security;
alter table public.bonds enable row level security;
alter table public.temp_session_data enable row level security;

-- Bonds policies
create policy "Users can view own bonds"
  on public.bonds for select using (auth.uid() = user_id);

create policy "Users can insert own bonds"
  on public.bonds for insert with check (auth.uid() = user_id);

create policy "Users can update own bonds"
  on public.bonds for update using (auth.uid() = user_id);

create policy "Notaries view verified"
  on public.bonds for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'notary')
    and status in ('verified', 'esigned', 'digilocker', 'printed')
  );

-- temp_session_data policies (session-scoped, no user_id needed)
create policy "Allow insert temp session"
  on public.temp_session_data for insert with check (true);

create policy "Allow select unexpired temp session"
  on public.temp_session_data for select using (expires_at > now());

create policy "Allow delete own session"
  on public.temp_session_data for delete using (true);

-- 6. pg_cron Cleanup Job (requires pg_cron extension enabled in Supabase)
-- Enable via: Supabase Dashboard → Database → Extensions → pg_cron
-- This ensures that transient sessions (the closest thing to state) are entirely ephemeral.
select cron.schedule(
  'purge-expired-sessions',         -- job name
  '0 * * * *',                      -- every hour
  $$DELETE FROM public.temp_session_data WHERE expires_at < now();$$
);
