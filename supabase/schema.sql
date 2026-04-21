-- ============================================================
-- NTC Document Tracker — Supabase Schema
-- Run this entire file in the Supabase SQL editor once.
-- ============================================================

-- ── documents ──────────────────────────────────────────────
create table if not exists documents (
  id            text        primary key default gen_random_uuid()::text,
  entity        text        not null,
  contact       text        not null,
  email         text        not null,
  email_verified boolean    not null default false,
  remarks       text        not null default '',
  created_at    timestamptz not null default now(),

  -- Pre-assessment
  preassess     text        check (preassess in ('complete','incomplete')),
  pa_ts         timestamptz,

  -- NOD flags (per track)
  nod_legal     boolean     not null default false,
  nod_tech      boolean     not null default false,
  nod_fin       boolean     not null default false,

  -- Phase 3 merge decision
  p3decision    text        check (p3decision in ('compliant','nod')),
  p3merge_ts    timestamptz,

  -- Certificate outcome
  cert_outcome  text        check (cert_outcome in ('approved','disapproved')),
  cert_decision_ts timestamptz,

  -- Loose timestamps (not stage-keyed)
  p3b_notif_ts  timestamptz,
  p3b_return_ts timestamptz,
  p6a_notif_ts  timestamptz,
  p6b_notif_ts  timestamptz,
  p6b_return_ts timestamptz,

  updated_at    timestamptz not null default now()
);

-- ── stages ─────────────────────────────────────────────────
-- One row per recorded stage stamp per document.
create table if not exists stages (
  id          bigserial   primary key,
  doc_id      text        not null references documents(id) on delete cascade,
  stage_key   text        not null,
  stamped_at  timestamptz not null,
  passed_by   text,
  sent_by     text,
  created_at  timestamptz not null default now(),

  unique(doc_id, stage_key)
);

create index if not exists stages_doc_id_idx on stages(doc_id);

-- ── audit_log ───────────────────────────────────────────────
-- Written whenever a stage or ts_field is redacted.
create table if not exists audit_log (
  id          bigserial   primary key,
  doc_id      text        not null references documents(id) on delete cascade,
  action      text        not null,   -- 'redact_stage' | 'redact_ts'
  field_key   text        not null,   -- stage_key or ts field name
  prev_value  jsonb,                  -- snapshot of what was removed
  created_at  timestamptz not null default now()
);

-- ── updated_at trigger ──────────────────────────────────────
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_updated_at on documents;
create trigger documents_updated_at
  before update on documents
  for each row execute function touch_updated_at();

-- ── Row Level Security ──────────────────────────────────────
-- Access is gated by a server-side PIN check (see api/login.js):
-- the server signs in as a shared Supabase user and hands the
-- resulting JWT to the client. RLS therefore requires an
-- authenticated session — the anon key on its own is inert.
alter table documents  enable row level security;
alter table stages     enable row level security;
alter table audit_log  enable row level security;

-- Drop the old permissive policies if a previous version of this
-- schema was already applied.
drop policy if exists "anon_all_documents" on documents;
drop policy if exists "anon_all_stages"    on stages;
drop policy if exists "anon_all_audit_log" on audit_log;

-- Allow full access only to authenticated sessions (the shared
-- app account signed in via /api/login).
create policy "auth_all_documents" on documents
  for all to authenticated using (true) with check (true);
create policy "auth_all_stages" on stages
  for all to authenticated using (true) with check (true);
create policy "auth_all_audit_log" on audit_log
  for all to authenticated using (true) with check (true);

-- ── Enable Realtime (optional) ──────────────────────────────
-- Run these if you want live updates across browser tabs.
-- alter publication supabase_realtime add table documents;
-- alter publication supabase_realtime add table stages;