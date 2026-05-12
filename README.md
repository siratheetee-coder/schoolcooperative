# 🏫 สหกรณ์โรงเรียน — School Cooperative System

ระบบจัดการร้านสหกรณ์โรงเรียนสำหรับนักเรียนผู้ขาย ออกแบบให้ใช้บนมือถือเป็นหลัก

![Tech](https://img.shields.io/badge/HTML5-orange) ![Tech](https://img.shields.io/badge/CSS3-blue) ![Tech](https://img.shields.io/badge/JavaScript-yellow) ![Tech](https://img.shields.io/badge/Supabase-green) ![Tech](https://img.shields.io/badge/PWA-purple)

## ✨ ฟีเจอร์

- 🏪 **หน้าขาย (POS)** — เลือกสินค้าจากรูป, ตะกร้า, รับเงินสด, คำนวณเงินทอน
- 📦 **จัดการสต็อก** — เพิ่ม/แก้/ลบสินค้า, แจ้งของใกล้หมด
- 📊 **รายงานยอดขาย** — รายวัน/เดือน/เทอม/ปี + ดาวน์โหลด CSV/Excel/PDF
- 💎 **หุ้น & ปันผล** — สมาชิก, ซื้อหุ้น, คำนวณปันผลสิ้นปี
- 🔐 **Login** — รหัสนักเรียน + PIN
- 📱 **PWA** — ติดตั้งเป็นแอปบนมือถือได้, ใช้ offline ได้
- ☁️ **Cloud Sync** — เชื่อม Supabase ข้อมูลข้ามอุปกรณ์

## 🎨 ดีไซน์

- สไตล์ **3D neumorphism** — ปุ่ม chunky, shadow มีมิติ
- สี **60/30/10**: cream → green → gold
- Mobile-first, ใช้นิ้วแตะสะดวก

## 🚀 เริ่มใช้

### ใช้ทันที (ข้อมูล mock)
ดับเบิลคลิก `app.html` → ใช้ได้เลย

### เชื่อม Supabase (ฐานข้อมูลจริง)
ดู [SETUP.md](./SETUP.md) — คู่มือเต็ม

## 📦 ไฟล์ในโปรเจกต์

| ไฟล์ | หน้าที่ |
|---|---|
| `app.html` | แอปหลักทั้งหมด |
| `icon.svg` | ไอคอนแอป (PWA) |
| `manifest.webmanifest` | PWA manifest |
| `sw.js` | Service worker (offline) |
| `schema.sql` | SQL schema สำหรับ Supabase |
| `supabase-config.js` | Config Supabase credentials |
| `SETUP.md` | คู่มือเชื่อม Supabase |

## 🌐 Deploy

Deploy ได้ฟรีบน:
- [Vercel](https://vercel.com) — drag-drop folder
- [Netlify](https://app.netlify.com/drop) — drag-drop folder
- [GitHub Pages](https://pages.github.com) — Settings → Pages

## 📄 License

MIT
