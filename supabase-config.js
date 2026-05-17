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
  url:     'https://znbtmgbcbdnrbtmxgnhj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuYnRtZ2JjYmRucmJ0bXhnbmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTAwNjEsImV4cCI6MjA5NDE2NjA2MX0.30TWJzCmC43S2RHJtuDEq4soBeLQfQv3vuntoZICRsg',
  // === Push Notifications (VAPID) ===
  // วิธีสร้าง: ดู PUSH-SETUP.md
  // วาง public key ที่นี่ (Base64URL); ใส่ private key ใน Supabase Secret
  vapidPublicKey: 'BLOekTSLxGegh0WcTuHro3N6KOjrIBonyD3pAFRB1apfyNlPa_ChLsb0Hcx7siD1RsfM2cF5axYOXOoxobaVi7g',  // เช่น 'BNn...XYz'  ← ว่างไว้ = ปิดการแจ้งเตือน
};
