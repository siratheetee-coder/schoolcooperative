-- ============================================================
-- สหกรณ์โรงเรียน — Database Schema (CLEAN / สำหรับโรงเรียนใหม่)
-- ============================================================
-- ไฟล์นี้เหมือน schema.sql ทุกอย่าง ยกเว้น "ไม่มีข้อมูลคนจริง"
-- มีแต่โครงสร้างตาราง + สินค้าตัวอย่าง + บัญชีครูตัวอย่าง 1 คน
--
-- ใช้ไฟล์นี้เมื่อ "ตั้งค่าโรงเรียนใหม่" (ผ่าน Setup Wizard / setup.html ขั้นที่ 4)
-- วิธีใช้: เปิด Supabase project ของโรงเรียนใหม่ → SQL Editor → New query
--          → วางทั้งไฟล์นี้ → Run (รันครั้งเดียวพอ)
-- ============================================================

-- 1. PRODUCTS
create table if not exists products (
  id bigserial primary key,
  name text not null,
  emoji text default '🍱',
  price int not null default 0,
  cost numeric(10,2) not null default 0,
  category text default 'other' check (category in ('drink','snack','icecream','stationery','book','other')),
  stock int not null default 0,
  low_at int not null default 10,
  unit text default '/ชิ้น',
  is_active boolean default true,
  image_url text,
  created_at timestamptz default now()
);

-- ตารางรองรับหลาย barcode ต่อ 1 product (เช่น รสต่างกันแต่ stock เดียว)
create table if not exists product_barcodes (
  barcode text primary key,
  product_id bigint not null references products(id) on delete cascade,
  created_at timestamptz default now()
);
create index if not exists product_barcodes_product_id_idx
  on product_barcodes(product_id);

-- 2. MEMBERS (นักเรียน + ครู)
create table if not exists members (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  class text,
  avatar text,
  color int default 1,
  pin text default '1234',
  role text default 'student' check (role in ('student','teacher')),
  barcode text,
  created_at timestamptz default now()
);
create unique index if not exists members_barcode_uniq
  on members(barcode) where barcode is not null;

-- 3. SALES (header)
create table if not exists sales (
  id bigserial primary key,
  seller_id bigint references members(id) on delete set null,
  seller_name text,
  buyer_id bigint references members(id) on delete set null,
  buyer_name text,
  total int not null,
  date timestamptz default now(),
  is_voided boolean default false,
  void_reason text,
  voided_by_id bigint references members(id) on delete set null,
  voided_by_name text,
  voided_at timestamptz
);
create index if not exists sales_buyer_idx on sales (buyer_id);
create index if not exists sales_date_idx on sales (date desc);

-- 4. SALE ITEMS (line items)
create table if not exists sale_items (
  id bigserial primary key,
  sale_id bigint references sales(id) on delete cascade,
  product_id bigint references products(id) on delete set null,
  name text,
  emoji text,
  price int,
  cost numeric(10,2) default 0,
  qty int
);
create index if not exists sale_items_sale_idx on sale_items (sale_id);

-- 5. SHARE TRANSACTIONS (หุ้น / ปันผล / เฉลี่ยคืน)
create table if not exists share_txns (
  id bigserial primary key,
  member_id bigint references members(id) on delete cascade,
  type text not null check (type in ('buy','dividend','patronage')),
  shares int default 0,
  amount int not null,
  date timestamptz default now()
);
create index if not exists share_txns_member_idx on share_txns (member_id);

-- 6. PURCHASES (บิลซื้อของ — เงินออกตอนซื้อสต็อก)
create table if not exists purchases (
  id bigserial primary key,
  date timestamptz default now(),
  vendor text,
  note text,
  total numeric(10,2) not null,
  created_by_name text,
  created_at timestamptz default now()
);
create index if not exists purchases_date_idx on purchases (date desc);

-- 7. CAPITAL TRANSACTIONS (เงินทุน — ตั้งต้น/เพิ่ม/ถอน)
create table if not exists capital_txns (
  id bigserial primary key,
  date timestamptz default now(),
  type text not null check (type in ('initial','add','withdraw')),
  amount numeric(10,2) not null,
  note text,
  created_by_name text,
  created_at timestamptz default now()
);
create index if not exists capital_txns_date_idx on capital_txns (date desc);

-- 8. SHIFT ASSIGNMENTS (ตารางเวรขาย — รายสัปดาห์)
create table if not exists shift_assignments (
  id bigserial primary key,
  day_of_week int not null check (day_of_week between 1 and 5),
  slot text not null check (slot in ('morning','lunch','after')),
  member_id bigint references members(id) on delete cascade,
  member_name text,
  created_at timestamptz default now(),
  unique (day_of_week, slot, member_id)
);
create index if not exists shift_dow_idx on shift_assignments (day_of_week, slot);

-- 9. PENDING REQUESTS (นักเรียนขออนุมัติ → ครูอนุมัติ)
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

-- 10. AUDIT LOGS (บันทึกทุกการกระทำสำคัญ — ป้องกันการทุจริต)
create table if not exists audit_logs (
  id bigserial primary key,
  actor_id bigint references members(id) on delete set null,
  actor_name text,
  actor_role text,
  action text not null,
  target_type text,
  target_id text,
  target_name text,
  metadata jsonb,
  created_at timestamptz default now()
);
create index if not exists audit_created_idx on audit_logs (created_at desc);
create index if not exists audit_actor_idx on audit_logs (actor_id);
create index if not exists audit_action_idx on audit_logs (action);

-- ============================================================
-- ROW LEVEL SECURITY (เปิดอ่าน-เขียนสาธารณะ — เหมาะกับสหกรณ์โรงเรียน)
-- ⚠️ ทุกโรงเรียนแยก Supabase project กัน → ข้อมูลไม่ปนกันอยู่แล้ว
-- ============================================================
alter table products           enable row level security;
alter table product_barcodes   enable row level security;
alter table members            enable row level security;
alter table sales              enable row level security;
alter table sale_items         enable row level security;
alter table share_txns         enable row level security;
alter table purchases          enable row level security;
alter table capital_txns       enable row level security;
alter table shift_assignments  enable row level security;
alter table pending_requests   enable row level security;
alter table audit_logs         enable row level security;

drop policy if exists "open" on products;
drop policy if exists "barcodes_all" on product_barcodes;
drop policy if exists "open" on members;
drop policy if exists "open" on sales;
drop policy if exists "open" on sale_items;
drop policy if exists "open" on share_txns;
drop policy if exists "open" on purchases;
drop policy if exists "open" on capital_txns;
drop policy if exists "open" on shift_assignments;
drop policy if exists "open" on pending_requests;
drop policy if exists "audit_insert" on audit_logs;
drop policy if exists "audit_select" on audit_logs;
drop policy if exists "audit_delete" on audit_logs;

create policy "open" on products           for all using (true) with check (true);
create policy "barcodes_all" on product_barcodes for all using (true) with check (true);
create policy "open" on members            for all using (true) with check (true);
create policy "open" on sales              for all using (true) with check (true);
create policy "open" on sale_items         for all using (true) with check (true);
create policy "open" on share_txns         for all using (true) with check (true);
create policy "open" on purchases          for all using (true) with check (true);
create policy "open" on capital_txns       for all using (true) with check (true);
create policy "open" on shift_assignments  for all using (true) with check (true);
create policy "open" on pending_requests   for all using (true) with check (true);
create policy "audit_insert" on audit_logs for insert with check (true);
create policy "audit_select" on audit_logs for select using (true);
create policy "audit_delete" on audit_logs for delete using (true);

-- ============================================================
-- REALTIME (เปิดให้ตารางส่ง event ผ่าน WebSocket)
-- ============================================================
do $$
declare
  tbl text;
begin
  foreach tbl in array array['products','sales','sale_items','pending_requests','share_txns','members','shift_assignments','purchases','capital_txns','product_barcodes']
  loop
    begin
      execute format('alter publication supabase_realtime add table %I', tbl);
    exception
      when duplicate_object then null;
      when others then null;
    end;
  end loop;
end $$;

-- ============================================================
-- STORAGE BUCKET (เก็บรูปสินค้า)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

do $$
begin
  drop policy if exists "public read product images" on storage.objects;
  drop policy if exists "public upload product images" on storage.objects;
  drop policy if exists "public update product images" on storage.objects;
  drop policy if exists "public delete product images" on storage.objects;
exception when others then null;
end $$;

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "public upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images');
create policy "public update product images" on storage.objects
  for update using (bucket_id = 'product-images');
create policy "public delete product images" on storage.objects
  for delete using (bucket_id = 'product-images');

-- ============================================================
-- SEED DATA (ตัวอย่างกลางๆ — ไม่มีข้อมูลคนจริง)
-- ลบส่วนนี้ออกได้ถ้าต้องการเริ่มจากฐานว่างเปล่า
-- ============================================================

-- สินค้าตัวอย่าง (ลบ/แก้ได้ภายหลังในแอป)
insert into products (name, emoji, price, cost, category, stock, low_at, unit) values
  ('นมจืด',          '🥛', 10, 7,  'drink',     24,  10, '/กล่อง'),
  ('ขนมปังไส้ครีม',   '🥐', 12, 8,  'snack',     20,  10, '/ชิ้น'),
  ('น้ำดื่ม',         '💧', 7,  4,  'drink',     42,  15, '/ขวด'),
  ('ดินสอ HB',       '✏️', 8,  5,  'stationery',60,  20, '/แท่ง'),
  ('ยางลบ',          '🧽', 5,  3,  'stationery',30,  10, '/ก้อน'),
  ('สมุดเส้น',       '📒', 15, 10, 'book',      18,  10, '/เล่ม')
on conflict do nothing;

-- บัญชีครูตัวอย่าง 1 คน (ไว้ login ครั้งแรก)
-- ⚠️ หลัง login แล้ว ให้แก้ชื่อ + เปลี่ยน PIN ทันที แล้วเพิ่มครู/นักเรียนจริงในแอป
insert into members (code, name, class, avatar, color, pin, role) values
  ('T0001', 'ครูผู้ดูแลระบบ', 'ครูที่ปรึกษา', 'คร', 4, '9999', 'teacher')
on conflict (code) do nothing;
