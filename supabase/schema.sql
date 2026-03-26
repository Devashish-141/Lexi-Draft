-- ============================================================
-- LexiDraft AI — Stateless Identity Protocol Schema (v2)
-- Applies to: Supabase SQL Editor
-- Columns: 16 total on bonds table
-- ============================================================

-- 0. Lexi-ID Generator (e.g. LEXI-2026-001A)
create sequence if not exists public.lexi_bond_seq start 1 increment 1;

create or replace function public.generate_lexi_id()
returns text language plpgsql as $$
declare
  seq_val  int;
  year_val text;
  suffix   text;
begin
  seq_val  := nextval('public.lexi_bond_seq');
  year_val := to_char(now(), 'YYYY');
  suffix   := chr(64 + ((seq_val - 1) % 26) + 1);
  return 'LEXI-' || year_val || '-' || lpad(seq_val::text, 3, '0') || suffix;
end;
$$;

-- ============================================================
-- 1. Profiles
-- ============================================================
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  full_name  text,
  role       text default 'citizen' check (role in ('citizen', 'notary')),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- 2. Bonds (columns: 16)
-- STATELESS IDENTITY PROTOCOL: No raw ID numbers persisted.
-- ============================================================
create table if not exists public.bonds (
  -- Identity
  id                   uuid default gen_random_uuid() primary key,
  lexi_id              text unique default public.generate_lexi_id(),
  user_id              uuid references public.profiles(id) on delete cascade not null,

  -- Document metadata
  doc_type             text not null
                         check (doc_type in (
                           'Rent Agreement', 'Affidavit',
                           'Indemnity Bond', 'Employment Bond', 'Custom/Blank Bond'
                         )),
  parties              text,          -- e.g. "Rajesh Kumar & Priya Sharma"

  -- Party info (name & address only — no Aadhaar / ID numbers)
  legal_name           text,
  legal_address        text,

  -- Document content
  content              text,          -- full legalese body
  xai_summary          text,          -- plain-language / Marathi summary
  custom_requirements  text,          -- user-supplied special clauses

  -- Execution metadata
  execution_method     text default 'Aadhaar eSign / e-Stamp',
  blockchain_hash      text,          -- populated after notary blockchain anchor

  -- Lifecycle status — matches CitizenDashboard display labels
  status               text default 'PENDING NOTARY'
                         check (status in (
                           'PENDING NOTARY', 'VERIFIED DRAFT',
                           'ESIGNED', 'PRINTED', 'REJECTED'
                         )),
  health_score         int default 0,
  created_at           timestamp with time zone default now(),
  updated_at           timestamp with time zone default now()
);

create index if not exists bonds_user_id_idx  on public.bonds (user_id);
create index if not exists bonds_status_idx   on public.bonds (status);
create index if not exists bonds_lexi_id_idx  on public.bonds (lexi_id);
create index if not exists bonds_doc_type_idx on public.bonds (doc_type);

-- ============================================================
-- 3. Transient Session Data (30-min TTL, purged by pg_cron)
-- ============================================================
create table if not exists public.temp_session_data (
  session_id    uuid default gen_random_uuid() primary key,
  legal_name    text,
  legal_address text,
  doc_type      text,
  bond_type     text,
  expires_at    timestamp with time zone not null
                  default (now() + interval '30 minutes')
);

create index if not exists temp_session_expires_idx
  on public.temp_session_data (expires_at);

-- ============================================================
-- 4. Notary Queue View
-- ============================================================
drop view if exists public.notary_queue;

create view public.notary_queue as
  select
    b.id, b.lexi_id, b.user_id,
    b.doc_type, b.parties,
    b.legal_name, b.legal_address,
    b.content, b.xai_summary,
    b.execution_method, b.blockchain_hash,
    b.status, b.health_score, b.created_at,
    p.full_name as citizen_name
  from public.bonds b
  join public.profiles p on b.user_id = p.id
  where b.status in ('VERIFIED DRAFT', 'ESIGNED', 'PRINTED');

-- ============================================================
-- 5. Row Level Security
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.bonds             enable row level security;
alter table public.temp_session_data enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Bonds — citizen
create policy "Citizens can view own bonds"
  on public.bonds for select using (auth.uid() = user_id);

create policy "Citizens can insert own bonds"
  on public.bonds for insert with check (auth.uid() = user_id);

create policy "Citizens can update own bonds"
  on public.bonds for update using (auth.uid() = user_id);

-- Bonds — notary
create policy "Notaries view verified bonds"
  on public.bonds for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'notary'
    )
    and status in ('VERIFIED DRAFT', 'ESIGNED', 'PRINTED')
  );

-- Temp session policies
create policy "Allow insert temp session"
  on public.temp_session_data for insert with check (true);

create policy "Allow select unexpired temp session"
  on public.temp_session_data for select using (expires_at > now());

create policy "Allow delete temp session"
  on public.temp_session_data for delete using (true);

-- ============================================================
-- 6. pg_cron Cleanup (enable pg_cron extension first)
--    Dashboard → Database → Extensions → pg_cron
-- ============================================================
select cron.schedule(
  'purge-expired-sessions',
  '0 * * * *',
  $$DELETE FROM public.temp_session_data WHERE expires_at < now();$$
);

-- ============================================================
-- 7. Seed Data (dev/staging only)
--    Replace UUID with a real auth.users id before running.
-- ============================================================
/*
insert into public.bonds
  (user_id, lexi_id, doc_type, parties, legal_name, legal_address,
   content, xai_summary, status, execution_method, blockchain_hash, health_score)
values
  ( '00000000-0000-0000-0000-000000000001', 'LEXI-2026-001A',
    'Rent Agreement', 'Rajesh Kumar & Priya Sharma', 'Rajesh Kumar',
    'Flat 402, Shivshakti Apartments, Nashik',
    'This Rent Agreement is made and entered into...',
    'Residential lease of Flat 402, Nashik for 11 months.',
    'VERIFIED DRAFT', 'Aadhaar eSign / e-Stamp', '0xabc123def456', 98 ),

  ( '00000000-0000-0000-0000-000000000001', 'LEXI-2026-042B',
    'Affidavit', 'John Doe', 'John Doe', 'Nashik Municipal Corporation Area',
    'I, John Doe, do hereby solemnly affirm...',
    'Self-declaration for address proof correction.',
    'PENDING NOTARY', 'Aadhaar eSign / e-Stamp', null, 72 ),

  ( '00000000-0000-0000-0000-000000000001', 'LEXI-2026-089C',
    'Indemnity Bond', 'Amit Shah & HDFC Bank', 'Amit Shah', 'HDFC Bank, Nashik Branch',
    'This Indemnity Bond is executed by Amit Shah...',
    'Indemnity bond for duplicate FD receipts worth ₹5,00,000.',
    'VERIFIED DRAFT', 'Aadhaar eSign / e-Stamp', '0xdef789ghi012', 95 );
*/
