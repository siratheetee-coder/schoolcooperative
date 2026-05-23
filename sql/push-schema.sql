-- ============================================================
-- Push Notifications — เพิ่มตาราง subscription
-- รันใน Supabase SQL Editor หลัง schema.sql หลัก
-- ============================================================

create table if not exists push_subscriptions (
  id bigserial primary key,
  member_id bigint references members(id) on delete cascade,
  member_name text,
  role text check (role in ('student','teacher')),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  last_used_at timestamptz default now()
);
create index if not exists push_subs_member_idx on push_subscriptions (member_id);
create index if not exists push_subs_role_idx on push_subscriptions (role);

alter table push_subscriptions enable row level security;

drop policy if exists "push_open" on push_subscriptions;
create policy "push_open" on push_subscriptions for all using (true) with check (true);

-- Realtime ไม่จำเป็นสำหรับตารางนี้ (ไม่ broadcast)
