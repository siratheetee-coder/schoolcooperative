# 🏫 ระบบจัดการสหกรณ์โรงเรียนดิจิทัล

ระบบ POS ขายของในสหกรณ์โรงเรียน · จัดการสต็อก · ปันผล · รายงาน · แจ้งเตือนแบบเรียลไทม์
**ฟรี · Open Source · ใช้งานได้บนทุกอุปกรณ์ (iPhone/Android/PC)**

![Tech](https://img.shields.io/badge/HTML5-orange) ![Tech](https://img.shields.io/badge/JavaScript-yellow) ![Tech](https://img.shields.io/badge/Supabase-green) ![Tech](https://img.shields.io/badge/PWA-purple) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ⚡ ติดตั้งใช้งานทันที (One-Click Deploy)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsiratheetee-coder%2Fschoolcooperative&project-name=school-coop&repository-name=school-coop)   

หลังกดปุ่ม:
1. Vercel จะ fork repo + deploy อัตโนมัติ (~2 นาที)
2. เปิด URL ที่ได้ + ต่อท้ายด้วย `/setup.html`  
   เช่น: `https://your-app.vercel.app/setup.html`
3. กรอกข้อมูลโรงเรียน + Supabase credentials ใน Wizard 5 ขั้น
4. กดปุ่ม "เริ่มใช้งาน" → กลับไปแอปใช้งานได้เลย

---

## 🎭 ทดลองใช้แบบ Demo (ไม่ต้องสมัคร)

[**👉 เปิดโหมดทดลอง**](https://schoolcooperative.vercel.app/?demo=1) — มีข้อมูลตัวอย่างพร้อมเล่น 30 วัน

---

## 📋 ขั้นตอนติดตั้งฉบับเต็ม

```
1. กดปุ่ม Deploy with Vercel ด้านบน
   → ได้ URL เช่น https://your-app.vercel.app

2. เปิด URL — Setup Wizard จะเปิดอัตโนมัติ:
   - ใส่ชื่อโรงเรียน, สังกัด, ครูที่ปรึกษา
   - สร้าง Supabase project ฟรีที่ supabase.com
   - คัดลอก URL + anon key มาวางใน Wizard
   - รัน SQL schema (Wizard จะลิงก์ไฟล์ให้)

3. (ทางเลือก) ดาวน์โหลดไฟล์ config จาก Wizard
   → upload เข้า GitHub repo ของคุณ
   → ทุกอุปกรณ์จะใช้การตั้งค่าเดียวกัน

4. ใช้งานได้แล้ว!
```

> ⏱ ใช้เวลาทั้งหมด **~15 นาที** สำหรับครั้งแรก

📖 อ่านคู่มือฉบับเต็ม → [SETUP-GUIDE-TH.md](SETUP-GUIDE-TH.md)

---

## ✨ ฟีเจอร์หลัก

| | |
|---|---|
| 🛒 **POS ขายของ** | กดเร็ว เด็กใช้ได้ |
| 📦 **จัดการสต็อก** | เตือนสินค้าใกล้หมด/หมด อัตโนมัติ |
| 👥 **สมาชิก + หุ้น** | คำนวณปันผล / เฉลี่ยคืน |
| 📊 **รายงานเรียลไทม์** | เลือกวันย้อนหลังได้, Export Excel/PDF |
| 🔔 **แจ้งเตือนสด** | บิลใหญ่/คำขออนุมัติส่งถึงครูทันที (iOS/Android) |
| 📚 **Quiz Pre/Post-test** | ป.4-ม.3 พร้อมเฉลย |
| ✅ **ระบบอนุมัติ** | นักเรียนขอ → ครูตรวจสอบ |
| 📅 **ตารางเวรขาย** | จัดเวรนักเรียนอัตโนมัติ |
| 🎭 **Demo Mode** | แชร์ QR ให้คนอื่นทดลอง |

---

## 🛠 Tech Stack

- **Frontend:** Vanilla JS + HTML (PWA, ไม่มี build step)
- **Backend:** Supabase (PostgreSQL + Realtime + Edge Functions)
- **Hosting:** Vercel (Static)
- **Push:** Web Push (VAPID)

---

## 💰 ค่าใช้จ่าย

| Service | Free Tier | เหมาะกับโรงเรียนขนาด |
|---------|-----------|--------------------|
| Supabase | 500 MB DB + 500K Function calls/เดือน | 50–1,000 คน |
| Vercel | 100 GB Bandwidth/เดือน | ~1M page views |
| **รวม** | **ฟรีตลอด** | โรงเรียนทั่วไป |

---

## 🤝 ขอความช่วยเหลือ

- 🐛 พบบั๊ก: [GitHub Issues](https://github.com/siratheetee-coder/schoolcooperative/issues)
- 💬 ถามคำถาม: Line OpenChat (เร็วๆ นี้)

---

## 📜 License

**MIT** — ใช้ฟรี แก้ฟรี แจกฟรี · **โรงเรียนใดก็เอาไปใช้ได้**

สร้างด้วย ❤ เพื่อการศึกษาไทย โดย ครูสิรธีร์ ตีเมืองซ้าย โรงเรียนบ้านหินลาด
