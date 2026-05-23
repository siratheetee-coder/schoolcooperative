# คู่มือติดตั้งระบบสหกรณ์โรงเรียน — สำหรับโรงเรียนใหม่

ระบบนี้เป็น **Open Source** — โรงเรียนใดก็สามารถนำไปใช้ได้ฟรี ✨

**เวลาที่ใช้:** 30-60 นาที (ครั้งแรก)
**ค่าใช้จ่าย:** **ฟรีตลอด** (ใช้ Free tier ของ Supabase + Vercel)
**ต้องมี:**
- บัญชี Email (Gmail แนะนำ)
- บัญชี GitHub
- โลโก้โรงเรียน (PNG พื้นใส ขนาด 512×512)

---

## 📋 ขั้นตอนทั้งหมด (8 ขั้น)

```
1. Fork GitHub repository
2. สมัคร Supabase + สร้าง project
3. รัน SQL schema ทั้ง 2 ไฟล์
4. แก้ supabase-config.js
5. ตั้งค่า Push Notification (VAPID)
6. แก้ school-config.js
7. เปลี่ยนโลโก้
8. Deploy ผ่าน Vercel
```

---

## ขั้นที่ 1: Fork GitHub Repository

1. เข้า https://github.com/siratheetee-coder/schoolcooperative
2. กด **Fork** มุมขวาบน
3. ตั้งชื่อ Repository ของคุณ เช่น `coop-myschool`
4. กด **Create fork**

→ ตอนนี้คุณมีสำเนา code ของระบบเป็นของคุณเองแล้ว

---

## ขั้นที่ 2: สมัคร Supabase + สร้าง Project

1. เข้า https://supabase.com → Sign Up ด้วย GitHub
2. กด **New Project**
3. กรอกข้อมูล:
   - **Name:** ชื่อโรงเรียน เช่น `myschool-coop`
   - **Database Password:** สุ่มรหัสยาก ๆ (เก็บไว้ดี ๆ)
   - **Region:** เลือก `Southeast Asia (Singapore)` (ใกล้ไทยที่สุด)
   - **Plan:** Free
4. กด **Create new project** → รอ ~2 นาที

5. หลังสร้างเสร็จ ไปที่ **Project Settings → API** จะเห็น:
   - **Project URL:** `https://xxxxx.supabase.co` (เก็บไว้)
   - **anon public key:** เริ่มต้นด้วย `eyJ...` (เก็บไว้)

---

## ขั้นที่ 3: รัน SQL Schema

ใน Supabase → **SQL Editor** → **New query**

### 3.1 รัน schema.sql

1. เปิดไฟล์ `schema.sql` ใน Repository ของคุณ
2. Copy ทั้งหมด
3. วางใน SQL Editor → กด **Run**
4. ต้องเห็น `Success. No rows returned.`

### 3.2 รัน push-schema.sql

1. กด **New query** อีกครั้ง
2. เปิดไฟล์ `push-schema.sql`
3. Copy ทั้งหมด → วาง → Run

→ ตรวจสอบที่ **Table Editor** จะเห็นตารางทั้งหมด:
`products`, `members`, `sales`, `sale_items`, `share_txns`, `pending_requests`, `shift_assignments`, `audit_logs`, `push_subscriptions`

---

## ขั้นที่ 4: แก้ supabase-config.js

ใน GitHub Repository ของคุณ → คลิก `supabase-config.js` → กด ✏️ Edit

แก้บรรทัด:

```js
url:     'https://znbtmgbcbdnrbtmxgnhj.supabase.co',
anonKey: 'eyJ...เก่า',
```

เป็น URL + anon key ของ Project Supabase ของคุณ (จากขั้นที่ 2)

กด **Commit changes** (ยังไม่ต้อง deploy)

---

## ขั้นที่ 5: ตั้งค่า Push Notification (VAPID)

### 5.1 สร้าง VAPID keys

เปิดเบราว์เซอร์ (Chrome/Edge) → กด F12 → Tab **Console** → วางสคริปต์นี้:

```js
(async () => {
  const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = await crypto.subtle.exportKey('raw', kp.publicKey);
  const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  const b64url = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  console.log('Public:',  b64url(pub));
  console.log('Private:', jwk.d);
})();
```

→ Enter → จะได้ Public + Private key (เก็บไว้ทั้งคู่)

### 5.2 ตั้ง Secrets ใน Supabase

Supabase → **Project Settings → Edge Functions → Secrets** → Add new secret 3 ตัว:

| Name | Value |
|------|-------|
| `VAPID_PUBLIC_KEY` | (Public Key) |
| `VAPID_PRIVATE_KEY` | (Private Key) |
| `VAPID_SUBJECT` | `mailto:your-email@example.com` |

### 5.3 Deploy Edge Function

Supabase → **Edge Functions** → **Deploy a new function**

- **Name:** `send-push`
- **Verify JWT:** ⛔ **ปิด** (สำคัญ!)
- เปิดไฟล์ `supabase/functions/send-push/index.ts` ใน Repository → Copy ทั้งหมด → วาง
- กด **Deploy function**

### 5.4 ใส่ Public Key ลง config

ใน GitHub → แก้ `supabase-config.js` อีกครั้ง:

```js
vapidPublicKey: 'BNn...',  // ← Public key จาก 5.1
```

Commit changes

---

## ขั้นที่ 6: แก้ school-config.js

ใน GitHub → คลิก `school-config.js` → ✏️ Edit

แก้ทุกค่าให้ตรงโรงเรียนของคุณ:

```js
window.SCHOOL_CONFIG = {
  schoolName: 'โรงเรียนของคุณ',
  appTitle: 'สหกรณ์โรงเรียนของคุณ',
  schoolNameEn: 'Your School',
  subtitleEn: 'Digital School Cooperative System',
  districtOffice: 'สำนักงานเขตพื้นที่การศึกษา...',
  ministry: 'สังกัดสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน กระทรวงศึกษาธิการ',
  principalTitle: 'ผู้อำนวยการโรงเรียน...',
  advisorTitle: 'ผู้จัดทำรายงาน / ครูที่ปรึกษาสหกรณ์',
  developer: 'ครู...',  // ชื่อครูผู้ดูแลระบบ
  logoPath: './logo-no-bg.png',
  description: '...',
  defaultStudentPin: '1234',  // เปลี่ยน PIN เริ่มต้นเพื่อความปลอดภัย
  defaultTeacherPin: '9999',
  bigSaleThreshold: 100,  // บิลขนาด >= ฿100 จะแจ้งครู
};
```

Commit changes

---

## ขั้นที่ 7: เปลี่ยนโลโก้

1. เตรียมไฟล์โลโก้โรงเรียน:
   - **ชื่อไฟล์:** `logo-no-bg.png` (ตรง ๆ)
   - **ขนาด:** 512×512 px
   - **พื้น:** ใส (PNG transparent)
   - **ขนาดไฟล์:** < 200KB

2. ใน GitHub → คลิก `logo-no-bg.png` → กดปุ่ม **Delete** (🗑) → Commit

3. กด **Add file → Upload files** → ลากไฟล์โลโก้ใหม่ของคุณเข้าไป → ตั้งชื่อ `logo-no-bg.png` → Commit

---

## ขั้นที่ 8: Deploy ผ่าน Vercel

1. เข้า https://vercel.com → Sign Up ด้วย GitHub
2. กด **Add New → Project**
3. เลือก Repository ของคุณ (ที่ Fork ไว้)
4. กด **Deploy** (ไม่ต้องตั้งค่าอะไร)
5. รอ ~1-2 นาที

→ ได้ URL เช่น `https://coop-myschool.vercel.app` 🎉

---

## ✅ ทดสอบ

1. เปิด URL ที่ได้
2. ครูเข้าระบบด้วยรหัส `T0001` PIN `9999`
3. ทดสอบขายสินค้า, ดูรายงาน, จ่ายปันผล
4. เปลี่ยน PIN ครู: เข้า Members → แก้รหัสครูเป็น PIN ของจริง

---

## 📝 หลังติดตั้ง — สิ่งที่ต้องทำต่อ

### เพิ่มสมาชิกจริงในโรงเรียน

1. ครูเข้าระบบ → ไป **Admin → 👥 นำเข้าสมาชิก**
2. Copy รายชื่อจาก Excel → Paste
3. รูปแบบ: `รหัส, ชื่อ, ชั้น`

### เพิ่มสินค้า

**Admin → 📦 นำเข้าสินค้า** → Paste จาก Excel
รูปแบบ: `ชื่อ, ราคาขาย, ต้นทุน, หมวด, อีโมจิ, สต็อก`

### ตั้งตารางเวรขาย

ไป **Admin → ตารางเวร** (จะเพิ่มในเวอร์ชันถัดไป — ตอนนี้แก้ที่ DB)

---

## 🆘 ขอความช่วยเหลือ

หากติดขัด:
- **GitHub Issues:** https://github.com/siratheetee-coder/schoolcooperative/issues
- **Email ผู้พัฒนา:** (กรอกอีเมลของคุณ)

---

## 🔄 อัปเดตเมื่อมีเวอร์ชันใหม่

1. ไปที่ Repository ของคุณ → กด **Sync fork** → Update branch
2. Vercel deploy อัตโนมัติ — ไม่ต้องทำอะไรเพิ่ม

> ⚠ ก่อน sync: เช็คว่าไฟล์ `supabase-config.js`, `school-config.js`, `logo-no-bg.png` ของคุณยังอยู่
> (ถ้าโค้ดต้นทาง edit ไฟล์เดียวกันจะเกิด conflict ต้องแก้)

---

## 📊 Resource Limits (Free Tier)

| Service | Free Limit | เหมาะกับ |
|---------|-----------|----------|
| Supabase Database | 500 MB | ~100K records |
| Supabase Realtime | ไม่จำกัด connection | OK |
| Supabase Edge Function | 500K invocations/เดือน | OK |
| Supabase Storage | 1 GB | รูปสินค้าเยอะมาก |
| Vercel Hosting | ไม่จำกัด | OK |
| Vercel Bandwidth | 100 GB/เดือน | ~1M page views |

**สรุป:** โรงเรียนทั่วไป (50-500 คน) ใช้ free tier ได้สบายมาก

---

ขอให้ใช้งานสนุก — ระบบนี้สร้างขึ้นเพื่อพัฒนาการศึกษาไทย 🇹🇭
