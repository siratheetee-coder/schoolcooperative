-- ============================================================
-- Quiz System — บันทึกผลทำแบบฝึกหัด
-- รันใน Supabase SQL Editor หลัง schema.sql หลัก
-- ============================================================

create table if not exists quiz_attempts (
  id bigserial primary key,
  member_id bigint references members(id) on delete cascade,
  member_name text,
  level text not null check (level in ('p4-6','m1-3')),
  topic text default 'mix',
  phase text default 'pre' check (phase in ('pre','post')),
  score int not null,
  total int not null default 10,
  correct_ids int[] default '{}',
  wrong_ids int[] default '{}',
  duration_sec int default 0,
  created_at timestamptz default now()
);
-- Upgrade existing table (เผื่อสร้างด้วยเวอร์ชันเก่าที่ยังไม่มีคอลัมน์ครบ)
alter table quiz_attempts add column if not exists topic text default 'mix';
alter table quiz_attempts add column if not exists phase text default 'pre';
alter table quiz_attempts add column if not exists member_name text;
alter table quiz_attempts add column if not exists total int default 10;
alter table quiz_attempts add column if not exists correct_ids int[] default '{}';
alter table quiz_attempts add column if not exists wrong_ids int[] default '{}';
alter table quiz_attempts add column if not exists duration_sec int default 0;
do $$
begin
  alter table quiz_attempts drop constraint if exists quiz_attempts_phase_check;
  alter table quiz_attempts add constraint quiz_attempts_phase_check check (phase in ('pre','post'));
exception when others then null;
end $$;
create index if not exists quiz_member_idx on quiz_attempts (member_id);
create index if not exists quiz_level_idx on quiz_attempts (level, score desc);
create index if not exists quiz_date_idx on quiz_attempts (created_at desc);

alter table quiz_attempts enable row level security;
drop policy if exists "quiz_open" on quiz_attempts;
create policy "quiz_open" on quiz_attempts for all using (true) with check (true);

-- ============================================================
-- App Settings — เก็บค่าตั้งค่าระบบที่ครูควบคุม
-- เช่น เปิด/ปิด post-test, วันเปิดประเมินผล
-- ============================================================
create table if not exists app_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now(),
  updated_by_id bigint references members(id) on delete set null,
  updated_by_name text
);

alter table app_settings enable row level security;
drop policy if exists "settings_open" on app_settings;
create policy "settings_open" on app_settings for all using (true) with check (true);

-- ค่าเริ่มต้น: ปิด post-test
insert into app_settings (key, value) values
  ('post_test_enabled', 'false'::jsonb)
on conflict (key) do nothing;

-- Realtime
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table quiz_attempts';
  exception when others then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table app_settings';
  exception when others then null;
  end;
end $$;

-- บังคับให้ PostgREST โหลด schema ใหม่ทันที (กัน error PGRST205 "table not found in schema cache"
-- หลังเพิ่งสร้างตาราง — ถ้าไม่สั่งนี้ การ insert คะแนน quiz อาจล้มเหลวเงียบ ๆ ชั่วคราว)
notify pgrst, 'reload schema';
