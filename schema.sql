-- ============================================================
-- สหกรณ์โรงเรียน — Database Schema
-- รันใน Supabase SQL Editor (Project → SQL → New query)
-- ============================================================

-- 1. PRODUCTS
create table if not exists products (
  id bigserial primary key,
  name text not null,
  emoji text default '🍱',
  price int not null default 0,
  stock int not null default 0,
  low_at int not null default 10,
  unit text default '/ชิ้น',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. MEMBERS
create table if not exists members (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  class text,
  avatar text,
  color int default 1,
  pin text default '1234',
  role text default 'student' check (role in ('student','teacher')),
  created_at timestamptz default now()
);
-- อัปเกรดตารางเดิมถ้ายังไม่มี role
alter table members add column if not exists role text default 'student';

-- 3. SALES (header)
create table if not exists sales (
  id bigserial primary key,
  seller_id bigint references members(id) on delete set null,
  seller_name text,
  total int not null,
  date timestamptz default now(),
  is_voided boolean default false,
  void_reason text,
  voided_by_id bigint references members(id) on delete set null,
  voided_by_name text,
  voided_at timestamptz
);
-- อัปเกรดตารางเดิม
alter table sales add column if not exists is_voided boolean default false;
alter table sales add column if not exists void_reason text;
alter table sales add column if not exists voided_by_id bigint;
alter table sales add column if not exists voided_by_name text;
alter table sales add column if not exists voided_at timestamptz;
create index if not exists sales_date_idx on sales (date desc);

-- 4. SALE ITEMS (line items)
create table if not exists sale_items (
  id bigserial primary key,
  sale_id bigint references sales(id) on delete cascade,
  product_id bigint references products(id) on delete set null,
  name text,
  emoji text,
  price int,
  qty int
);
create index if not exists sale_items_sale_idx on sale_items (sale_id);

-- 7. SHIFT ASSIGNMENTS (ตารางเวรขาย — recurring รายสัปดาห์)
create table if not exists shift_assignments (
  id bigserial primary key,
  day_of_week int not null check (day_of_week between 1 and 5),  -- 1=จันทร์, 5=ศุกร์
  slot text not null check (slot in ('morning','lunch','after')), -- เช้า, กลางวัน, หลังเลิก
  member_id bigint references members(id) on delete cascade,
  member_name text,
  created_at timestamptz default now(),
  unique (day_of_week, slot, member_id)
);
create index if not exists shift_dow_idx on shift_assignments (day_of_week, slot);

-- 6. PENDING REQUESTS (นักเรียนขออนุมัติ → ครูอนุมัติ)
create table if not exists pending_requests (
  id bigserial primary key,
  requested_by_id bigint references members(id) on delete set null,
  requested_by_name text,
  type text not null check (type in ('add_product','edit_product','delete_product','restock')),
  payload jsonb not null,
  summary text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz default now(),
  reviewed_by_id bigint references members(id) on delete set null,
  reviewed_by_name text,
  reviewed_at timestamptz,
  notes text
);
create index if not exists pending_requests_status_idx on pending_requests (status, requested_at desc);

-- 5. SHARE TRANSACTIONS (buy หุ้น / รับปันผล)
create table if not exists share_txns (
  id bigserial primary key,
  member_id bigint references members(id) on delete cascade,
  type text not null check (type in ('buy','dividend')),
  shares int default 0,
  amount int not null,
  date timestamptz default now()
);
create index if not exists share_txns_member_idx on share_txns (member_id);

-- ============================================================
-- ROW LEVEL SECURITY (เปิดให้ทุกคนอ่าน-เขียนได้สำหรับ prototype)
-- ⚠️ ก่อน production ควรเข้มงวดกว่านี้!
-- ============================================================
alter table products           enable row level security;
alter table members            enable row level security;
alter table sales              enable row level security;
alter table sale_items         enable row level security;
alter table share_txns         enable row level security;
alter table pending_requests   enable row level security;
alter table shift_assignments  enable row level security;

drop policy if exists "open" on products;
drop policy if exists "open" on members;
drop policy if exists "open" on sales;
drop policy if exists "open" on sale_items;
drop policy if exists "open" on share_txns;
drop policy if exists "open" on pending_requests;
drop policy if exists "open" on shift_assignments;

create policy "open" on products           for all using (true) with check (true);
create policy "open" on members            for all using (true) with check (true);
create policy "open" on sales              for all using (true) with check (true);
create policy "open" on sale_items         for all using (true) with check (true);
create policy "open" on share_txns         for all using (true) with check (true);
create policy "open" on pending_requests   for all using (true) with check (true);
create policy "open" on shift_assignments  for all using (true) with check (true);

-- ============================================================
-- REALTIME (เปิดให้ตารางส่ง event ผ่าน WebSocket)
-- ============================================================
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table sales;
alter publication supabase_realtime add table sale_items;
alter publication supabase_realtime add table pending_requests;
alter publication supabase_realtime add table share_txns;
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table shift_assignments;
-- ถ้า error "already member of publication" ไม่ต้องสนใจ

-- ============================================================
-- SEED DATA
-- ============================================================

-- Products
insert into products (name, emoji, price, stock, low_at, unit) values
  ('นมจืด',          '🥛', 10, 24,  10, '/กล่อง'),
  ('ขนมปังไส้ครีม',   '🥐', 12, 8,   10, '/ชิ้น'),
  ('น้ำดื่ม',         '💧', 7,  42,  15, '/ขวด'),
  ('ดินสอ HB',       '✏️', 8,  60,  20, '/แท่ง'),
  ('ยางลบ',          '🧽', 5,  0,   10, '/ก้อน'),
  ('สมุดเส้น',       '📒', 15, 18,  10, '/เล่ม'),
  ('ลูกอม',          '🍬', 2,  120, 30, '/เม็ด'),
  ('ช็อกโกแลต',     '🍫', 18, 4,   10, '/แท่ง')
on conflict do nothing;

-- Members (8 นักเรียน + 1 ครู)
insert into members (code, name, class, avatar, color, pin, role) values
  ('T0001', 'ครูสมศักดิ์ ใจดี',  'ครูที่ปรึกษา', 'คร', 4, '9999', 'teacher'),
  ('05421', 'น้องนภา ศรีสุข',    'ม.5/2', 'นภ', 1, '1234', 'student'),
  ('05422', 'น้องบอส ใจดี',      'ม.5/2', 'บอ', 2, '1234', 'student'),
  ('05323', 'น้องแพรว มงคล',    'ม.5/1', 'แพ', 3, '1234', 'student'),
  ('05524', 'น้องเก่ง วงศ์ทอง',  'ม.5/3', 'เก', 4, '1234', 'student'),
  ('04125', 'น้องฟ้า สวยงาม',    'ม.4/1', 'ฟ้', 5, '1234', 'student'),
  ('04226', 'น้องโอ๊ต พิทักษ์',  'ม.4/2', 'โอ', 6, '1234', 'student'),
  ('06127', 'น้องน้ำ ขำขัน',     'ม.6/1', 'น้', 1, '1234', 'student'),
  ('03128', 'น้องเจ ภูมิใจ',     'ม.3/1', 'เจ', 2, '1234', 'student')
on conflict (code) do update set role = excluded.role;

-- Shift assignments (ตารางเวรเริ่มต้น — สมาชิก 8 คน หมุนเวียน 5 วัน × 3 ช่วง)
insert into shift_assignments (day_of_week, slot, member_id, member_name) values
  -- จันทร์
  (1, 'morning', 2, 'น้องบอส ใจดี'),       -- เบรค 10:00
  (1, 'lunch',   3, 'น้องแพรว มงคล'),     -- 12:00
  (1, 'lunch',   1, 'น้องนภา ศรีสุข'),
  (1, 'after',   4, 'น้องเก่ง วงศ์ทอง'),   -- 15:00
  -- อังคาร
  (2, 'morning', 5, 'น้องฟ้า สวยงาม'),
  (2, 'lunch',   6, 'น้องโอ๊ต พิทักษ์'),
  (2, 'lunch',   7, 'น้องน้ำ ขำขัน'),
  (2, 'after',   8, 'น้องเจ ภูมิใจ'),
  -- พุธ
  (3, 'morning', 1, 'น้องนภา ศรีสุข'),
  (3, 'lunch',   2, 'น้องบอส ใจดี'),
  (3, 'after',   3, 'น้องแพรว มงคล'),
  -- พฤหัสบดี
  (4, 'morning', 4, 'น้องเก่ง วงศ์ทอง'),
  (4, 'lunch',   5, 'น้องฟ้า สวยงาม'),
  (4, 'lunch',   6, 'น้องโอ๊ต พิทักษ์'),
  (4, 'after',   7, 'น้องน้ำ ขำขัน'),
  -- ศุกร์
  (5, 'morning', 8, 'น้องเจ ภูมิใจ'),
  (5, 'lunch',   1, 'น้องนภา ศรีสุข'),
  (5, 'after',   2, 'น้องบอส ใจดี')
on conflict do nothing;

-- Share transactions (initial holdings)
insert into share_txns (member_id, type, shares, amount, date) values
  (1, 'buy', 30,  300,  '2025-05-20'),
  (1, 'buy', 20,  200,  '2025-08-15'),
  (1, 'buy', 10,  100,  '2026-02-10'),
  (2, 'buy', 50,  500,  '2025-05-22'),
  (2, 'buy', 15,  150,  '2026-01-08'),
  (3, 'buy', 25,  250,  '2025-06-01'),
  (3, 'buy', 25,  250,  '2025-11-15'),
  (4, 'buy', 100, 1000, '2025-05-15'),
  (5, 'buy', 20,  200,  '2025-07-10'),
  (5, 'buy', 10,  100,  '2026-03-05'),
  (6, 'buy', 15,  150,  '2025-09-20'),
  (7, 'buy', 80,  800,  '2025-05-18'),
  (7, 'buy', 20,  200,  '2026-04-12'),
  (8, 'buy', 12,  120,  '2025-10-05')
on conflict do nothing;
