# 🚀 คู่มือใช้ Supabase แบบละเอียด

คู่มือนี้พาคุณตั้งแต่ไม่เคยใช้ Supabase เลย → จนแอปสหกรณ์ใช้ฐานข้อมูลจริงได้

ใช้เวลาทั้งหมด ~15 นาที

---

## 📋 สารบัญ

1. [Supabase คืออะไร?](#1-supabase-คืออะไร)
2. [สมัครและสร้าง Project](#2-สมัครและสร้าง-project)
3. [สร้างตารางด้วย SQL](#3-สร้างตารางด้วย-sql)
4. [คัดลอก API Keys](#4-คัดลอก-api-keys)
5. [ใส่ค่าในแอป](#5-ใส่ค่าในแอป)
6. [ทดสอบการเชื่อม](#6-ทดสอบการเชื่อม)
7. [ใช้งาน Dashboard บริหารข้อมูล](#7-ใช้งาน-dashboard-บริหารข้อมูล)
8. [Backup และ Export](#8-backup-และ-export)
9. [แก้ปัญหา](#9-แก้ปัญหา-troubleshooting)
10. [Deploy ขึ้นเว็บจริง](#10-deploy-ขึ้นเว็บจริง)
11. [ความปลอดภัยก่อนใช้จริง](#11-ความปลอดภัยก่อนใช้จริง)

---

## 1. Supabase คืออะไร?

**Supabase** = ฐานข้อมูล PostgreSQL + API พร้อมใช้ บน cloud
- **ฟรี** สำหรับใช้งานทั่วไป (มี limit แต่เพียงพอสำหรับสหกรณ์โรงเรียน)
- ใช้ผ่าน JavaScript ได้ตรงๆ ไม่ต้องเขียน backend server
- มี dashboard สวยงามสำหรับดู/แก้ข้อมูล

**Free tier:**
- 500 MB ฐานข้อมูล
- 50,000 monthly active users
- 5 GB bandwidth/เดือน
- (เกินกว่านี้สำหรับสหกรณ์ระดับโรงเรียนแน่นอน)

---

## 2. สมัครและสร้าง Project

### 2.1 สมัครบัญชี

1. เปิด <https://supabase.com>
2. กดปุ่ม **"Start your project"** มุมขวาบน
3. เลือกสมัครด้วย:
   - **GitHub** (แนะนำ — ง่ายสุด)
   - หรือ **Email + Password**
4. ยืนยันอีเมล (ถ้าใช้ email)

### 2.2 สร้าง Organization (ครั้งแรกเท่านั้น)

ถ้ามีหน้าให้สร้าง Organization:
- **Organization name**: ชื่ออะไรก็ได้ เช่น `My School` หรือ `Cooperative`
- **Plan**: เลือก **Free**
- กด **"Create organization"**

### 2.3 สร้าง Project

1. กด **"New project"** (ปุ่มเขียวใหญ่)
2. กรอกข้อมูล:

   | ช่อง | ค่าที่แนะนำ |
   |---|---|
   | **Project name** | `school-cooperative` |
   | **Database Password** | ตั้งรหัสยาวๆ จดไว้ในที่ปลอดภัย (ใช้คืนค่าฐานข้อมูล) |
   | **Region** | **Southeast Asia (Singapore)** — ใกล้ไทยที่สุด ช้าน้อย |
   | **Pricing Plan** | Free (เลือกอยู่แล้ว) |

3. กด **"Create new project"**
4. **รอ ~2 นาที** — Supabase กำลังสร้าง database server ให้คุณ
5. เมื่อเสร็จจะเข้าหน้า Dashboard ของ project

> 💡 **Tip**: ถ้ารอนานเกิน 5 นาที ลอง refresh หน้า

---

## 3. สร้างตารางด้วย SQL

### 3.1 เปิด SQL Editor

ในหน้า Dashboard ของ project:
1. มองที่ **เมนูซ้าย** จะเห็นไอคอนเรียงลงมา
2. กดไอคอน **`</>`** ที่ชื่อ **"SQL Editor"**
3. กด **"+ New query"** มุมขวาบน

### 3.2 รัน Schema

1. เปิดไฟล์ **`schema.sql`** ใน folder นี้ด้วย Notepad / VS Code
2. **กด Ctrl+A** เลือกทั้งหมด → **Ctrl+C** คัดลอก
3. กลับไปที่หน้า SQL Editor ของ Supabase → คลิกในช่องสี่เหลี่ยมใหญ่ → **Ctrl+V** วาง
4. กดปุ่ม **"Run"** สีเขียว (มุมขวาล่าง หรือ Ctrl+Enter)
5. รอ ~3-5 วินาที

### 3.3 ตรวจสอบว่าสำเร็จ

ต้องเห็นข้อความ:
```
Success. No rows returned
```
หรือ
```
Success. Rows: N
```

**ถ้า error** → ดู [section 9 แก้ปัญหา](#9-แก้ปัญหา-troubleshooting)

### 3.4 ดูตารางที่สร้าง

1. เมนูซ้าย → กดไอคอน **ตาราง** ชื่อ **"Table Editor"**
2. จะเห็น 5 ตาราง:
   - ✅ `products` — 8 รายการสินค้า
   - ✅ `members` — 8 คน
   - ✅ `sales` — ว่าง (จะมีข้อมูลเมื่อขายจริง)
   - ✅ `sale_items` — ว่าง
   - ✅ `share_txns` — 14 รายการ (หุ้นเริ่มต้น)

3. ลองกด `products` → จะเห็นรายการสินค้า: นมจืด, ขนมปัง, ฯลฯ

---

## 4. คัดลอก API Keys

### 4.1 เปิดหน้า Settings

1. **เมนูซ้าย** → กดไอคอน **ฟันเฟือง** ที่ **"Project Settings"** (อยู่ล่างสุด)
2. ในเมนูย่อยที่เปิดขึ้น → กด **"API"**

### 4.2 คัดลอก 2 ค่า

ในหน้านี้จะเห็น:

#### 📌 Project URL
```
https://xxxxxxxxxxxxxx.supabase.co
```
- กดปุ่ม **"Copy"** ข้างๆ → คัดลอกไว้

#### 🔑 anon public key (Project API keys section)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```
(ยาวมาก ขึ้นต้น `eyJ...`)

- เลื่อนลงมาที่หัวข้อ **"Project API keys"**
- หา row ที่ชื่อ **`anon`** **`public`**
- กดปุ่ม **"Reveal"** หรือไอคอนตา → กด **"Copy"**

> ⚠️ **อย่าใช้ `service_role` key!**
> Key ตัวนั้นมีอำนาจสูงสุด ห้ามใส่ในไฟล์ที่ deploy ขึ้นเว็บ
> ใช้แค่ **`anon public`** เท่านั้น

---

## 5. ใส่ค่าในแอป

### 5.1 เปิดไฟล์ config

เปิดไฟล์ **`supabase-config.js`** ใน folder นี้ ด้วย Notepad / VS Code

### 5.2 แก้ค่า

จะเห็นแบบนี้:
```js
window.SUPABASE_CONFIG = {
  url:     'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
};
```

แทนที่ด้วยค่าที่คัดลอกมา:
```js
window.SUPABASE_CONFIG = {
  url:     'https://abcdefghijk.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...',
};
```

### 5.3 บันทึก

**Ctrl+S** บันทึกไฟล์

---

## 6. ทดสอบการเชื่อม

### 6.1 เปิดแอป

- ดับเบิลคลิกเปิด `app.html` ใน browser
- หรือ refresh ถ้าเปิดอยู่แล้ว

### 6.2 สังเกตสัญลักษณ์

มุมขวาบนของแอป จะเห็น **pill เล็กๆ**:
- 🟢 **"☁ Cloud"** = เชื่อมสำเร็จ
- 🟡 **"⚙ Local"** = ยังเชื่อมไม่ได้ → [ดู section 9](#9-แก้ปัญหา-troubleshooting)

ถ้าเชื่อมสำเร็จจะมี **toast เด้งขึ้นมา** "🟢 เชื่อม Supabase สำเร็จ"

### 6.3 ทดสอบขายของ

1. ขายของ 1 บิล (เลือกสินค้า → ชำระเงิน → ยืนยัน)
2. กลับไปที่ Supabase Dashboard → **Table Editor** → **`sales`**
3. ควรเห็น**บิลใหม่**ที่เพิ่ง insert ✨
4. กดดูตาราง **`sale_items`** → เห็นรายการสินค้าในบิลนั้น

### 6.4 ทดสอบ multi-device

1. เปิดแอปจากเครื่อง/มือถืออื่น (URL เดียวกัน) 
2. เพิ่มสินค้าใหม่ในเครื่อง A
3. Refresh ในเครื่อง B → เห็นสินค้าใหม่ที่เพิ่ม ✨

---

## 7. ใช้งาน Dashboard บริหารข้อมูล

### 7.1 ดูข้อมูล

**Table Editor** → เลือกตาราง → เห็นทุกแถว
- กดที่แถว → แก้ค่าตรงๆ ได้
- กด **"+"** เพิ่มแถวใหม่
- กดติ๊ก checkbox → **"Delete N rows"** ลบ

### 7.2 ค้นหา / กรอง

- ปุ่ม **"Filter"** → เพิ่มเงื่อนไข เช่น `total > 100`
- ปุ่ม **"Sort"** → เรียงตาม column

### 7.3 รัน SQL Query เอง

**SQL Editor** → New query → เขียน SQL ได้เลย เช่น:

```sql
-- ยอดขายรวมเดือนนี้
select sum(total) as ยอดรวม
from sales
where date >= date_trunc('month', now());

-- 5 สินค้าขายดี
select p.name, sum(si.qty) as จำนวนชิ้น, sum(si.qty * si.price) as รายได้
from sale_items si
join products p on p.id = si.product_id
group by p.name
order by รายได้ desc
limit 5;

-- สมาชิกที่มีหุ้นมากที่สุด
select m.name, m.class, sum(st.shares) as หุ้นรวม
from share_txns st
join members m on m.id = st.member_id
where st.type = 'buy'
group by m.id, m.name, m.class
order by หุ้นรวม desc;
```

### 7.4 ดูสถิติการใช้

**Project Settings → Usage** — ดูว่าใช้ database / API / bandwidth ไปเท่าไหร่

---

## 8. Backup และ Export

### 8.1 Backup อัตโนมัติ

Free plan: backup รายวัน เก็บไว้ **7 วัน** ย้อนหลัง (Supabase ทำเองอัตโนมัติ)

**Project Settings → Database → Backups** — เห็นรายการ backup ย้อนหลัง

### 8.2 Export เป็น CSV/Excel

1. **Table Editor** → เลือกตาราง
2. กดปุ่ม **"..."** (3 จุด) มุมขวาบน
3. เลือก **"Export data as CSV"**
4. เปิดด้วย Excel / Google Sheets ได้เลย

### 8.3 Export ทั้ง database

**Project Settings → Database** → **"Download backup"** (ได้ไฟล์ .sql ใหญ่ครบทุกตาราง)

---

## 9. แก้ปัญหา Troubleshooting

### 🔴 Pill ขึ้น "⚙ Local" ไม่ใช่ "☁ Cloud"

**สาเหตุที่เป็นไปได้:**

1. **ลืมแก้ค่าใน `supabase-config.js`**
   - เปิดไฟล์ดูซ้ำ — ยังเป็น `YOUR_...` อยู่ไหม?

2. **เปิดจาก `file://` (ดับเบิลคลิกไฟล์)**
   - บางครั้ง CORS block — ลอง host ผ่าน HTTP server:
   ```bash
   # ใน folder นี้
   python -m http.server 8000
   # แล้วเปิด http://localhost:8000/app.html
   ```

3. **CDN script load ไม่ทัน**
   - เปิด DevTools (F12) → Console → ดู error
   - ถ้าเห็น `supabase is undefined` → refresh อีกครั้ง

### 🔴 ขายของไม่ขึ้นใน Supabase

1. **F12 → Console** — มี error สีแดงไหม?
2. **F12 → Network** — มี request ไป `xxxxx.supabase.co` ที่ status 401 หรือ 403?
   - 401 = anon key ผิด → คัดลอกใหม่
   - 403 = RLS policy block → รัน schema.sql ซ้ำให้ครบ

### 🔴 SQL Error ตอนรัน schema.sql

ถ้าเห็น error เช่น:
```
relation "products" already exists
```
- ปกติ — ตารางมีแล้ว ไม่ต้องสนใจ
- ถ้าอยากเริ่มใหม่: รันก่อน
```sql
drop table if exists share_txns, sale_items, sales, members, products cascade;
```
แล้วรัน schema.sql ใหม่อีกครั้ง

### 🔴 ข้อมูลไม่ sync ข้ามอุปกรณ์

- รีเฟรชหน้าเว็บอีกครั้ง — แอปจะดึงข้อมูลใหม่จาก Supabase
- ตอนนี้ยังไม่มี real-time sync (ต้อง refresh เอง)

### 🔴 อยากเริ่มใหม่หมด

```sql
-- รันใน SQL Editor
truncate sale_items, sales, share_txns restart identity cascade;
```
จะลบข้อมูลขายและหุ้นทั้งหมด แต่สินค้า/สมาชิกยังอยู่

---

## 10. Deploy ขึ้นเว็บจริง

หลังเชื่อม Supabase แล้ว ควร deploy ขึ้นเว็บเพื่อ:
- เปิดจากมือถือนักเรียนได้
- PWA ติดตั้งเป็นแอปได้ (ต้อง HTTPS)
- ทำงานพร้อมกันหลายเครื่อง

### วิธีง่ายสุด — Vercel

1. ไปที่ <https://vercel.com> → Sign up ด้วย GitHub
2. กด **"Add New... → Project"**
3. ลาก folder `School Cooperative` ทั้ง folder ไปวาง (drag-drop)
4. กด **"Deploy"** → รอ ~30 วินาที
5. ได้ URL เช่น `https://school-cooperative.vercel.app`
6. แชร์ลิงก์นี้ให้นักเรียน

### หรือ — Netlify Drop

1. <https://app.netlify.com/drop>
2. ลาก folder วาง → ได้ URL ทันที

### หรือ — GitHub Pages

1. สร้าง repo ใน GitHub
2. Push folder ขึ้น
3. Settings → Pages → Source: main branch
4. ได้ URL `https://username.github.io/repo-name/app.html`

---

## 11. ความปลอดภัยก่อนใช้จริง

⚠️ **ตอนนี้** schema เปิดให้ทุกคนอ่าน/เขียน/ลบทุกตาราง (`policy "open" for all using (true)`) เพื่อความง่าย

ก่อนใช้งานจริงในโรงเรียน ควรเพิ่มความเข้มงวด:

### 11.1 ใช้ Supabase Auth แทน PIN

แทนที่จะใช้ PIN `1234`:
```js
// ใน app.html
const { data, error } = await sb.auth.signInWithPassword({
  email: studentEmail,
  password: studentPassword
});
```

### 11.2 จำกัด policy ตามสิทธิ์

```sql
-- ตัวอย่าง: ทุกคนอ่านได้ แต่แค่ครูเท่านั้นที่ลบสินค้า
drop policy "open" on products;

create policy "anyone can read" on products for select using (true);
create policy "anyone can insert sale" on products for insert with check (true);
create policy "only authenticated can update" on products for update 
  using (auth.role() = 'authenticated');
create policy "only admin can delete" on products for delete
  using (auth.jwt() ->> 'role' = 'admin');
```

### 11.3 ซ่อน anon key

- `anon` key ไม่ถือว่าเป็น secret 100% (เพราะอยู่ในโค้ด client) แต่ก็ไม่ควรเปิดเผยเกินจำเป็น
- ตั้ง **RLS policies ดีๆ** จะป้องกันได้แม้คนรู้ key

### 11.4 Rate limiting

Supabase free มี rate limit ในตัวอยู่แล้ว แต่ถ้ามีคน spam ขายได้ ควรเพิ่ม:
```sql
-- ตัวอย่าง: trigger ป้องกันสร้างบิลซ้ำใน 2 วินาที
create or replace function prevent_duplicate_sale() returns trigger as $$
begin
  if exists (
    select 1 from sales 
    where seller_name = new.seller_name 
      and total = new.total
      and date > now() - interval '2 seconds'
  ) then
    raise exception 'Duplicate sale detected';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger no_dupe_sales before insert on sales
  for each row execute function prevent_duplicate_sale();
```

อ่านเพิ่มเติม: <https://supabase.com/docs/guides/auth/row-level-security>

---

## ✅ ตรวจรายการความพร้อม

- [ ] สมัคร Supabase ฟรี
- [ ] สร้าง Project ใน region Singapore
- [ ] รัน `schema.sql` สำเร็จ
- [ ] เห็น 5 ตารางใน Table Editor
- [ ] คัดลอก Project URL และ anon key
- [ ] ใส่ค่าใน `supabase-config.js`
- [ ] เปิดแอป → เห็น pill "☁ Cloud"
- [ ] ขายของ → เห็นบิลใน Supabase
- [ ] Deploy ขึ้น Vercel/Netlify (ถ้าจะแชร์ให้นักเรียน)
- [ ] ตั้ง RLS policies เข้มงวด (ก่อนใช้งานจริง)

---

## 🆘 ติดปัญหา?

1. F12 เปิด Console → ดู error สีแดง
2. ลอง Google คำ error
3. ถาม ChatGPT / Claude พร้อมแชร์ error message
4. Supabase Discord: <https://discord.supabase.com>
