// ============================================================
// Supabase Configuration
// ============================================================
// วิธีใช้:
//   1. สร้าง project ที่ https://supabase.com (ฟรี)
//   2. ไปที่ Project Settings → API
//   3. คัดลอก URL และ "anon public" key มาวางด้านล่าง
//   4. รัน SQL ใน schema.sql ผ่าน SQL Editor ของ Supabase
//   5. Refresh แอป → จะเชื่อม Supabase อัตโนมัติ
//
// ถ้าค่ายังเป็น YOUR_... อยู่ → แอปจะใช้ข้อมูล mock ใน memory (โหมดเดิม)
// ============================================================

window.SUPABASE_CONFIG = {
  url:     '',   // เช่น 'https://xxxxxxxxxxxx.supabase.co'  (กรอกผ่าน Setup Wizard ได้)
  anonKey: '',   // ใช้ "anon public" key เท่านั้น — ห้ามใช้ service_role
  // === Push Notifications (VAPID) — ไม่บังคับ ===
  // วิธีสร้าง: ดู PUSH-SETUP.md  (ปล่อยว่าง = ปิดการแจ้งเตือน แอปยังใช้งานได้ปกติ)
  vapidPublicKey: '',
};
