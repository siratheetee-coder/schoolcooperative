# Title Cards — วิธีใช้สำหรับวิดีโอนำเสนอ

ไฟล์ `title-cards.html` มี **10 การ์ด** สำเร็จรูป รองรับ 16:9 (1920×1080) สำหรับใส่ในวิดีโอ

---

## 10 การ์ดที่มี

| # | การ์ด | ใช้ที่ Scene | ความยาวที่แนะนำ |
|---|--------|---------------|------------------|
| 1 | Opening Title — ชื่อนวัตกรรม + ผู้พัฒนา | Scene 2 (0:15) | 5 วินาที |
| 2 | Problem Hook — 80% ใช้กระดาษ | Scene 1 (0:00) | 4 วินาที |
| 3 | Section — วิธีการใช้งาน (01) | Scene 4 (1:20) | 2 วินาที |
| 4 | Section — การนำไปใช้จริง (02) | Scene 5 (2:50) | 2 วินาที |
| 5 | Stats Grid — 9 โมดูล · 40 ข้อ · 7 หลักการ · ∞ | Scene 3 (0:35) | 5 วินาที |
| 6 | Feature — POS (เขียว) | Scene 3 montage | 3 วินาที |
| 7 | Feature — Charts (เขียว) | Scene 3 montage | 3 วินาที |
| 8 | Feature — Quiz (เขียว) | Scene 3 montage | 3 วินาที |
| 9 | Closing CTA — Links + ขอบคุณ | Scene 7 (4:30) | 8 วินาที |
| 10 | Final Logo — TECH CREATIVE LEARNING AWARDS | Final frame | 3 วินาที |

---

## วิธีบันทึกเป็นรูปภาพ (PNG)

### วิธีที่ 1: Screenshot ทีละการ์ด (ง่ายสุด)

1. เปิดไฟล์ `title-cards.html` ในเบราว์เซอร์
2. กด **F** (เข้า Fullscreen)
3. กด **C** (ซ่อนเมนูล่าง)
4. ใช้ปุ่ม **PrintScreen** หรือ **Snipping Tool** (Win+Shift+S)
5. ใช้ ← / → หรือกดเลข **1-9, 0** เพื่อสลับการ์ด
6. กดถ่ายแต่ละการ์ด — เซฟเป็น `card-1.png`, `card-2.png` ...

### วิธีที่ 2: Screen Record (ได้ animation + transitions)

1. เปิด screen recorder (Win+G ใน Windows / QuickTime ใน Mac)
2. เปิดไฟล์ → กด F → C → เริ่มอัด
3. กด → ทีละการ์ด ค้างไว้ 3-5 วินาทีต่อใบ
4. หยุดอัด → ได้ไฟล์ MP4 พร้อมใช้

### วิธีที่ 3: ใช้ Chrome DevTools Capture (ได้ภาพคุณภาพสูงสุด)

1. เปิดไฟล์ใน Chrome
2. กด **F12** → Cmd/Ctrl + Shift + P
3. พิมพ์ "Capture node screenshot"
4. คลิกที่ `<div class="card active">` ใน Elements panel
5. กด Enter → ดาวน์โหลด PNG ขนาดเต็ม 1920×1080

---

## ใส่ลงใน Video Editor

### CapCut (แนะนำ — ฟรี ไทย)

1. import รูป PNG ทั้ง 10
2. ลากเข้า timeline ตามลำดับ Scene
3. ตั้งระยะเวลาแต่ละใบตามตาราง
4. เพิ่ม **Transition** ระหว่างใบ:
   - Card 1 → 2: Fade (0.3s)
   - Card 5 → 6/7/8: Zoom in (0.2s)
   - Card 9 → 10: Cross dissolve (0.5s)
5. ใส่ **Animation** บนใบที่อยู่นาน เช่น Card 1 → Slow zoom (Ken Burns)

### Premiere Pro / DaVinci Resolve

นำเข้าเหมือนกัน — แต่ใช้ keyframe animation ได้เนียนกว่า

---

## Customize ได้ตามต้องการ

ทุก text/สี/font อยู่ใน HTML — แก้ในโปรแกรม Notepad/VS Code ได้

ตัวอย่างที่ต้องการเปลี่ยน:
- **ชื่อครู:** ค้นหา "ครูสิรธีร์ ตีเมืองซ้าย" แก้ทั้งหมด
- **ชื่อโรงเรียน:** ค้นหา "บ้านหินลาด"
- **URL:** ค้นหา "schoolcooperative.vercel.app"
- **ตัวเลขสถิติ (9, 40, 7):** ใน Card 5 ค้นหา `<div class="stat-num">`

---

## Keyboard Shortcuts ในไฟล์

| ปุ่ม | ทำงาน |
|------|--------|
| `→` / `Space` | การ์ดถัดไป |
| `←` | การ์ดก่อน |
| `1-9, 0` | กระโดดไปการ์ดเลขนั้น |
| `F` | Fullscreen |
| `C` | ซ่อน/แสดงเมนูล่าง (สำหรับ capture) |

---

## Tip การออกแบบเพิ่มเติม

ถ้าอยากเพิ่ม:
- **โลโก้โรงเรียน:** แทรกเข้าใน Card 1 ตำแหน่ง `.logo-circle` → ใส่ `<img src="../logo-no-bg.png">` แทน emoji 📚
- **ภาพประกอบ:** เพิ่ม `<img>` ใน `.deco-dots` หรือมุมของการ์ด
- **เปลี่ยนสี:** แก้ตัวแปร `--green-500`, `--gold-500` ที่ส่วนบนของ `<style>`

---

## ตัวอย่างเรียงลำดับใน Timeline (สำหรับ 5 นาที)

```
00:00 │ Card 2 (Problem)                   4s
00:04 │ B-roll: สมุดบันทึกเก่า              11s
00:15 │ Card 1 (Opening Title)             5s
00:20 │ Voice-over intro                   15s
00:35 │ Card 5 (Stats Grid)                5s
00:40 │ Card 6/7/8 + Demo footage         40s
01:20 │ Card 3 (Section "วิธีใช้")          2s
01:22 │ Demo screen recording             88s
02:50 │ Card 4 (Section "การนำไปใช้")      2s
02:52 │ B-roll: นักเรียนใช้งานจริง         68s
04:00 │ สัมภาษณ์นักเรียน                  30s
04:30 │ Card 9 (Closing CTA)               8s
04:38 │ Card 10 (Final Logo)               3s
04:41 │ Fade to black                      4s
04:45 │ END
```

---

โชคดีกับการถ่ายทำพรุ่งนี้ครับ! 🎬
