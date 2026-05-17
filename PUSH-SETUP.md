# Push Notifications — Setup Guide

ตั้งค่า Web Push สำหรับระบบสหกรณ์โรงเรียน (5 ขั้นตอน · ~20 นาที)

---

## ขั้นที่ 1: สร้าง VAPID Keys

VAPID = identity ของเซิร์ฟเวอร์ในการส่ง push ต้องมี public + private key

### วิธีที่ 1: ใช้ Online Generator (ง่ายสุด)

ไปที่: https://vapidkeys.com/ → กด Generate → คัดลอกทั้ง Public + Private key

### วิธีที่ 2: ใช้ npx (ถ้ามี Node.js)

```bash
npx web-push generate-vapid-keys
```

จะได้ออกมาแบบนี้:
```
Public Key:  BNn7XR...
Private Key: yE3K4...
```

---

## ขั้นที่ 2: รัน SQL Schema

เปิด Supabase → SQL Editor → New query → วางเนื้อหาจากไฟล์ `push-schema.sql` → Run

ตรวจสอบว่ามีตาราง `push_subscriptions` ใน Table Editor

---

## ขั้นที่ 3: ตั้งค่า Supabase Edge Function Secrets

เปิด Supabase → Project Settings → Edge Functions → Secrets

เพิ่ม 3 ค่า:

| Name | Value |
|------|-------|
| `VAPID_PUBLIC_KEY` | (Public Key จากขั้นที่ 1) |
| `VAPID_PRIVATE_KEY` | (Private Key จากขั้นที่ 1) |
| `VAPID_SUBJECT` | `mailto:your-email@example.com` |

> 💡 `SUPABASE_URL` กับ `SUPABASE_SERVICE_ROLE_KEY` มีอยู่แล้วโดย Supabase

---

## ขั้นที่ 4: Deploy Edge Function

ต้องติดตั้ง Supabase CLI ก่อน: https://supabase.com/docs/guides/cli

```bash
# Login
supabase login

# Link โปรเจกต์ (ถ้ายังไม่ link)
supabase link --project-ref znbtmgbcbdnrbtmxgnhj

# Deploy
supabase functions deploy send-push --no-verify-jwt
```

ตรวจสอบ: Supabase → Edge Functions → ต้องเห็น `send-push` มีสถานะ Active

---

## ขั้นที่ 5: ใส่ VAPID Public Key ลง config

แก้ไฟล์ `supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
  url:     '...',
  anonKey: '...',
  vapidPublicKey: 'BNn7XR...',  // ← วาง Public Key ที่นี่
};
```

Commit + Push → Vercel auto-deploy

---

## วิธีใช้งาน

### นักเรียน / ครู

1. เข้าระบบ
2. หลัง login 3 วินาที จะมี popup ถามว่าจะเปิดแจ้งเตือนหรือไม่ → กดตกลง
3. อนุญาต permission ของเบราว์เซอร์
4. เสร็จ! รอรับการแจ้งเตือน

### ครู (เพิ่มเติม)

- ไปที่หน้า **Admin → 🔔 การแจ้งเตือน** → เลือก `2` เพื่อทดสอบ

---

## Trigger ที่จะส่ง Push อัตโนมัติ

| Event | ถึงใคร |
|-------|--------|
| 💰 บิลใหญ่ ≥ 100 บาท | ครูทุกคน |
| ⚠ สินค้าใกล้หมด | ครูทุกคน |
| ❗ สินค้าหมดสต็อก | ครูทุกคน |
| 📋 คำขออนุมัติใหม่ | ครูทุกคน |
| ✅ คำขอได้รับอนุมัติ | นักเรียนผู้ขอ |
| ❌ คำขอถูกปฏิเสธ | นักเรียนผู้ขอ |
| 🚫 บิลถูกยกเลิก | ครูทุกคน (ยกเว้นผู้ยกเลิก) |

---

## ⚠ ข้อจำกัด iOS

- iPhone ต้องเป็น **iOS 16.4 ขึ้นไป** (Mar 2023+)
- ต้อง **Install เป็น PWA** ก่อน (Add to Home Screen)
- ใช้บน Safari ปกติไม่ได้

Android: ใช้ได้ทุกอย่าง (Chrome, Firefox, Edge, Samsung Internet)

---

## Troubleshooting

**Push ไม่ทำงาน?**

1. เช็ค Console (F12) — ต้องไม่มี error
2. เช็ค `vapidPublicKey` ใน supabase-config.js ว่าวางถูก
3. เช็ค Supabase → Edge Functions → Logs ของ `send-push`
4. ตรวจสอบ Notification.permission === 'granted'
5. ตรวจสอบว่ามี subscription record ในตาราง `push_subscriptions`

**ทดสอบส่งด้วย curl:**

```bash
curl -X POST 'https://znbtmgbcbdnrbtmxgnhj.supabase.co/functions/v1/send-push' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"audience":"teachers","title":"Test","body":"Hello from curl"}'
```
