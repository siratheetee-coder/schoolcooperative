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
  url:     'https://znbtmgbcbdnrbtmxgnhj.supabase.co',       // เช่น 'https://xxxxx.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuYnRtZ2JjYmRucmJ0bXhnbmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTAwNjEsImV4cCI6MjA5NDE2NjA2MX0.30TWJzCmC43S2RHJtuDEq4soBeLQfQv3vuntoZICRsg',  // ยาวมาก ขึ้นต้นด้วย 'eyJ...'
};
