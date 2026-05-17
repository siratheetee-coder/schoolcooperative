-- ============================================================
-- Quiz System — บันทึกผลทำแบบฝึกหัด
-- รันใน Supabase SQL Editor หลัง schema.sql หลัก
-- ============================================================

create table if not exists quiz_attempts (
  id bigserial primary key,
  member_id bigint references members(id) on delete cascade,
  member_name text,
  level text not null check (level in ('p4-6','m1-3')),
  score int not null,
  total int not null default 10,
  correct_ids int[] default '{}',
  wrong_ids int[] default '{}',
  duration_sec int default 0,
  created_at timestamptz default now()
);
create index if not exists quiz_member_idx on quiz_attempts (member_id);
create index if not exists quiz_level_idx on quiz_attempts (level, score desc);
create index if not exists quiz_date_idx on quiz_attempts (created_at desc);

alter table quiz_attempts enable row level security;
drop policy if exists "quiz_open" on quiz_attempts;
create policy "quiz_open" on quiz_attempts for all using (true) with check (true);

-- Realtime
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table quiz_attempts';
  exception when others then null;
  end;
end $$;
