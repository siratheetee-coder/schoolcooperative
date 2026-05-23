// Build user-friendly setup guide .docx — สำหรับครู/ผู้บริหารโรงเรียน
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, HeadingLevel, PageNumber, PageBreak
} = require('docx');

const FONT = 'TH Sarabun New';
const C_GREEN_DARK = '174740';
const C_GREEN = '2D7D6F';
const C_GREEN_LIGHT = '46A697';
const C_GOLD = 'E89A0E';
const C_GOLD_BG = 'FFF6E0';
const C_CREAM = 'FFF8EE';
const C_CREAM_2 = 'F5EAD3';
const C_INK = '2A2218';
const C_INK_SOFT = '6B5E4C';
const C_RED = 'CC4444';
const C_BLUE = '2D6FA3';

const t = (text, opts = {}) => new TextRun({ text, font: FONT, ...opts });
const para = (children, opts = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  ...opts,
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: FONT, size: 40, bold: true, color: C_GREEN_DARK })],
  spacing: { before: 360, after: 220 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: C_GREEN } },
});
const h2 = (text, color = C_GREEN) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: FONT, size: 32, bold: true, color })],
  spacing: { before: 280, after: 160 },
});
const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: C_GREEN_DARK })],
  spacing: { before: 220, after: 140 },
});
const p = (text, opts = {}) => para(t(text, { size: 26, ...opts }), { spacing: { after: 140 } });
const small = (text) => para(t(text, { size: 22, color: C_INK_SOFT, italics: true }), { spacing: { after: 100 } });
const bullet = (text, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: typeof text === 'string'
    ? [t(text, { size: 26, ...opts })]
    : text,
  spacing: { after: 100 },
});
const numItem = (text, opts = {}) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  children: typeof text === 'string'
    ? [t(text, { size: 26, ...opts })]
    : text,
  spacing: { after: 100 },
});

// Callout box (warning / tip / note)
const callout = (label, body, color = C_GOLD, bgColor = C_GOLD_BG) => {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.SINGLE, size: 32, color },
            },
            margins: { top: 200, bottom: 200, left: 240, right: 240 },
            children: [
              para([
                new TextRun({ text: label + ' ', font: FONT, size: 26, bold: true, color }),
                new TextRun({ text: body, font: FONT, size: 26, color: C_INK }),
              ]),
            ],
          }),
        ],
      }),
    ],
  });
};

// Step-number badge (large number prefix)
const stepHeader = (num, title) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [
    new TextRun({ text: `ขั้นที่ ${num}  `, font: FONT, size: 28, color: C_GOLD, bold: true }),
    new TextRun({ text: title, font: FONT, size: 40, bold: true, color: C_GREEN_DARK }),
  ],
  spacing: { before: 480, after: 220 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: C_GREEN } },
});

// Field box for "ตัวอย่างที่ต้องกรอก"
const fieldBox = (label, value) => {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2800, type: WidthType.DXA },
            shading: { fill: C_CREAM_2, type: ShadingType.CLEAR },
            borders: tinyBorders,
            margins: { top: 100, bottom: 100, left: 160, right: 120 },
            children: [para(t(label, { size: 24, bold: true, color: C_GREEN_DARK }))],
          }),
          new TableCell({
            width: { size: 6560, type: WidthType.DXA },
            borders: tinyBorders,
            margins: { top: 100, bottom: 100, left: 160, right: 120 },
            children: [para(t(value, { size: 24, color: C_INK }))],
          }),
        ],
      }),
    ],
  });
};

const tinyBorder = { style: BorderStyle.SINGLE, size: 4, color: 'D8D8D8' };
const tinyBorders = { top: tinyBorder, bottom: tinyBorder, left: tinyBorder, right: tinyBorder };

// Table helpers
const headerCell = (text, color = C_GREEN) => new TableCell({
  borders: tinyBorders,
  shading: { fill: color, type: ShadingType.CLEAR },
  margins: { top: 120, bottom: 120, left: 160, right: 160 },
  children: [para(t(text, { size: 24, bold: true, color: 'FFFFFF' }))],
});
const dataCell = (text, opts = {}) => new TableCell({
  borders: tinyBorders,
  shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
  margins: { top: 100, bottom: 100, left: 160, right: 160 },
  children: [para(t(text, { size: 24, ...opts.run }))],
});

// === Build the document ===
const doc = new Document({
  creator: 'ครูสิรธีร์ ตีเมืองซ้าย',
  title: 'คู่มือติดตั้งระบบสหกรณ์โรงเรียนดิจิทัล',
  description: 'Beginner-friendly setup guide',
  styles: {
    default: { document: { run: { font: FONT, size: 26 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 40, bold: true, font: FONT, color: C_GREEN_DARK },
        paragraph: { spacing: { before: 360, after: 220 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: C_GREEN },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: C_GREEN_DARK },
        paragraph: { spacing: { before: 220, after: 140 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      { reference: 'numbers',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [t('คู่มือติดตั้งระบบสหกรณ์โรงเรียนดิจิทัล', { size: 20, color: C_INK_SOFT, italics: true })],
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C_GREEN, space: 4 } },
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              t('พัฒนาโดย ครูสิรธีร์ ตีเมืองซ้าย · โรงเรียนบ้านหินลาด · หน้า ', { size: 20, color: C_INK_SOFT }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20, color: C_INK_SOFT }),
            ],
          }),
        ],
      }),
    },
    children: [
      // ============== COVER ==============
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('📚 คู่มือติดตั้ง', { size: 32, color: C_GOLD, bold: true })],
        spacing: { before: 1800, after: 100 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('ระบบสหกรณ์โรงเรียนดิจิทัล', { size: 60, bold: true, color: C_GREEN_DARK })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('สำหรับโรงเรียนใหม่ที่ต้องการนำไปใช้', { size: 28, italics: true, color: C_GREEN })],
        spacing: { after: 600 },
      }),
      callout('💡 อ่านก่อนเริ่ม',
        'คู่มือนี้เขียนให้ครูทุกท่านอ่านเข้าใจได้ ไม่จำเป็นต้องเป็นนักโปรแกรม ' +
        'หากทำตามทีละขั้นจะใช้เวลาประมาณ 30-60 นาที และจะได้ระบบของโรงเรียนคุณเอง ใช้งานฟรีตลอดไป'),
      new Paragraph({ children: [new TextRun({ text: '', size: 8 })], spacing: { after: 400 } }),

      // Summary box
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({
            children: [
              dataCell('⏱ เวลาที่ใช้', { bg: C_CREAM, run: { bold: true, color: C_GREEN_DARK } }),
              dataCell('30 - 60 นาที (ทำครั้งเดียวจบ)'),
            ],
          }),
          new TableRow({
            children: [
              dataCell('💰 ค่าใช้จ่าย', { bg: C_CREAM, run: { bold: true, color: C_GREEN_DARK } }),
              dataCell('ฟรีตลอดไป — ไม่มีค่าใช้จ่ายแอบแฝง'),
            ],
          }),
          new TableRow({
            children: [
              dataCell('🎓 ทักษะที่ต้องมี', { bg: C_CREAM, run: { bold: true, color: C_GREEN_DARK } }),
              dataCell('ใช้คอมพิวเตอร์เบื้องต้น พิมพ์/copy/paste ได้'),
            ],
          }),
          new TableRow({
            children: [
              dataCell('📝 ต้องเตรียม', { bg: C_CREAM, run: { bold: true, color: C_GREEN_DARK } }),
              dataCell('อีเมล Gmail + รูปโลโก้โรงเรียน (PNG พื้นใส)'),
            ],
          }),
        ],
      }),

      // ============== ภาพรวม ==============
      new Paragraph({ children: [new PageBreak()] }),
      h1('🗺 ภาพรวมขั้นตอนทั้งหมด'),
      p('การติดตั้งแบ่งออกเป็น 8 ขั้น ทำเรียงตามลำดับ ห้ามข้ามขั้น'),
      p('แต่ละขั้นใช้เวลาประมาณ 5-10 นาที สามารถพักเหนื่อยระหว่างทางได้ ไม่มีอะไรเสียหาย'),

      h2('สิ่งที่จะได้เมื่อทำครบทุกขั้น'),
      bullet('เว็บไซต์ระบบสหกรณ์ของโรงเรียนคุณเอง เปิดผ่านลิงก์ที่จดจำง่าย'),
      bullet('ติดตั้งบนมือถือนักเรียนได้เหมือนแอปจริง'),
      bullet('ข้อมูลสมาชิก สินค้า ยอดขาย เก็บบนเซิร์ฟเวอร์ปลอดภัย'),
      bullet('ปรับชื่อโรงเรียน โลโก้ สี ได้ตามต้องการ'),

      h2('แผนภาพขั้นตอน'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 3000, 2200, 3260],
        rows: [
          new TableRow({
            children: [
              headerCell('ขั้น'),
              headerCell('ทำอะไร'),
              headerCell('เวลา'),
              headerCell('สิ่งที่ได้'),
            ],
          }),
          ...[
            ['1', 'ทำสำเนาโค้ดระบบ', '3 นาที', 'มีโค้ดของคุณเองใน GitHub'],
            ['2', 'สมัครและสร้างฐานข้อมูล', '5 นาที', 'พื้นที่เก็บข้อมูลออนไลน์'],
            ['3', 'สร้างตารางเก็บข้อมูล', '5 นาที', 'โครงสร้างฐานข้อมูลพร้อมใช้'],
            ['4', 'บอกระบบให้รู้จักฐานข้อมูล', '3 นาที', 'ระบบเชื่อมกับฐานข้อมูลได้'],
            ['5', 'ตั้งค่าการแจ้งเตือน', '10 นาที', 'เด้งแจ้งเตือนบนมือถือได้'],
            ['6', 'ตั้งชื่อโรงเรียนและข้อมูล', '5 นาที', 'ระบบโชว์ชื่อโรงเรียนคุณ'],
            ['7', 'เปลี่ยนโลโก้', '3 นาที', 'โลโก้โรงเรียนคุณบนระบบ'],
            ['8', 'นำขึ้นออนไลน์', '3 นาที', 'ได้ลิงก์เปิดใช้งานจริง'],
          ].map((row, i) => new TableRow({
            children: row.map((c, j) => dataCell(c, {
              bg: i % 2 === 0 ? 'FFFFFF' : C_CREAM,
              run: { bold: j === 0, color: j === 0 ? C_GREEN_DARK : C_INK },
            })),
          })),
        ],
      }),

      // ============== ขั้นที่ 1 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('1', 'ทำสำเนาโค้ดระบบ (Fork)'),
      callout('🎯 จุดประสงค์',
        'ทำสำเนาโค้ดของระบบมาเก็บไว้ในบัญชี GitHub ของคุณ เพื่อให้คุณแก้ไขและใช้งานได้เป็นของตัวเอง ' +
        'เหมือนการถ่ายเอกสารหนังสือมาเป็นของตัวเอง', C_BLUE, 'E8F0F7'),

      h3('💻 ขั้นตอนทีละขั้น'),

      numItem('สมัคร GitHub (ถ้ายังไม่มี)', { bold: true }),
      bullet([t('เปิดเว็บ ', { size: 26 }), t('https://github.com/signup', { size: 26, color: C_BLUE, underline: {} })]),
      bullet('กรอกอีเมล + ตั้งรหัสผ่าน + ตั้งชื่อผู้ใช้ (เป็นภาษาอังกฤษ)'),
      bullet('ยืนยันอีเมลผ่านลิงก์ที่ส่งมา'),

      numItem('เข้าหน้าโค้ดต้นทาง', { bold: true }),
      bullet([t('เปิดลิงก์: ', { size: 26 }), t('https://github.com/siratheetee-coder/schoolcooperative', { size: 26, color: C_BLUE, underline: {} })]),

      numItem('กดปุ่ม "Fork"', { bold: true }),
      bullet('มองหาปุ่ม Fork ที่มุมขวาบนของหน้าจอ'),
      bullet('คลิกที่ Fork'),

      numItem('ตั้งชื่อสำเนาของคุณ', { bold: true }),
      bullet('ในช่อง Repository name ใส่ชื่อ เช่น coop-myschool หรือ banhinlad-coop'),
      bullet('ส่วนอื่น ๆ ปล่อยตามค่าเริ่มต้น'),
      bullet('กดปุ่มสีเขียว Create fork'),

      callout('✅ สำเร็จ',
        'ตอนนี้คุณมีสำเนาโค้ดเป็นของตัวเองแล้ว — แสดงที่ URL: github.com/(ชื่อคุณ)/coop-myschool', C_GREEN, 'E0F0EB'),

      // ============== ขั้นที่ 2 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('2', 'สมัครและสร้างฐานข้อมูล (Supabase)'),
      callout('🎯 จุดประสงค์',
        'สร้างพื้นที่เก็บข้อมูลออนไลน์สำหรับโรงเรียนคุณ ใช้บริการ Supabase ที่ฟรีและปลอดภัย ' +
        'เหมือนการสมัครเปิดบัญชีธนาคารใหม่ของระบบ', C_BLUE, 'E8F0F7'),

      h3('💻 ขั้นตอนทีละขั้น'),

      numItem('เข้าเว็บ Supabase', { bold: true }),
      bullet([t('เปิด ', { size: 26 }), t('https://supabase.com', { size: 26, color: C_BLUE, underline: {} })]),
      bullet('กดปุ่ม Start your project (มุมขวาบน)'),

      numItem('สมัครด้วย GitHub', { bold: true }),
      bullet('คลิก Continue with GitHub'),
      bullet('อนุญาตให้ Supabase เข้าถึงบัญชี GitHub ของคุณ'),

      numItem('สร้างโปรเจกต์ใหม่', { bold: true }),
      bullet('กด New Project (ปุ่มสีเขียว)'),
      bullet('เลือก Organization (ถ้าถาม)'),

      numItem('กรอกข้อมูลโปรเจกต์', { bold: true }),
      fieldBox('Name', 'ใส่ชื่อโรงเรียน เช่น myschool-coop'),
      fieldBox('Database Password', 'สร้างรหัสผ่านที่แข็งแรง — เก็บไว้ในที่ปลอดภัย'),
      fieldBox('Region', 'เลือก Southeast Asia (Singapore) — ใกล้ไทยที่สุด'),
      fieldBox('Plan', 'Free (ฟรี) — เพียงพอสำหรับโรงเรียนทั่วไป'),
      new Paragraph({ children: [new TextRun({ text: '', size: 8 })], spacing: { after: 100 } }),

      bullet('กดปุ่ม Create new project'),
      bullet('รอประมาณ 2 นาที จนเห็นข้อความ Your project is ready'),

      numItem('เก็บข้อมูลสำคัญสองอย่าง', { bold: true }),
      p('ไปที่เมนูซ้าย: Project Settings → API'),
      p('คุณจะเห็นข้อมูล 2 อย่างที่ต้องคัดลอกเก็บไว้:'),
      fieldBox('Project URL', 'ขึ้นต้นด้วย https://...supabase.co — copy เก็บไว้'),
      fieldBox('anon public key', 'ตัวอักษรยาวมาก ขึ้นต้นด้วย eyJ... — copy เก็บไว้'),

      callout('💡 เคล็ดลับ', 'เปิด Notepad / Note app ในมือถือ paste เก็บไว้ จะใช้ในขั้นที่ 4', C_GOLD, C_GOLD_BG),

      // ============== ขั้นที่ 3 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('3', 'สร้างตารางเก็บข้อมูล'),
      callout('🎯 จุดประสงค์',
        'บอก Supabase ว่าจะเก็บข้อมูลอะไรบ้าง (สินค้า สมาชิก ยอดขาย ฯลฯ) ' +
        'โดยการรัน SQL Script ที่เราเตรียมไว้ให้ — ไม่ต้องเขียนเอง', C_BLUE, 'E8F0F7'),

      h3('💻 ขั้นตอนทีละขั้น'),

      numItem('เปิด SQL Editor', { bold: true }),
      bullet('ใน Supabase Dashboard มองเมนูซ้าย หา SQL Editor'),
      bullet('กด New Query (ปุ่มสีเขียวมุมขวาบน)'),

      numItem('คัดลอกโค้ด schema.sql มาวาง', { bold: true }),
      bullet([t('เปิดอีกแท็บไปที่: ', { size: 26 }), t('github.com/(ชื่อคุณ)/coop-myschool/blob/main/schema.sql', { size: 26, color: C_BLUE })]),
      bullet('กดปุ่ม Raw (มุมขวาบนของไฟล์)'),
      bullet('กด Ctrl+A เลือกทั้งหมด แล้ว Ctrl+C คัดลอก'),
      bullet('กลับมา SQL Editor — กดในช่องว่าง แล้ว Ctrl+V วาง'),

      numItem('กดรัน', { bold: true }),
      bullet('กดปุ่ม Run มุมขวาล่าง'),
      bullet('รอประมาณ 10-30 วินาที'),
      bullet('ต้องเห็นข้อความ Success. No rows returned. หรือคล้าย ๆ กัน'),

      numItem('ทำซ้ำกับ push-schema.sql', { bold: true }),
      bullet('กด New Query อีกครั้ง'),
      bullet('คัดลอก push-schema.sql มาวาง → Run'),

      numItem('ทำซ้ำกับ quiz-schema.sql', { bold: true }),
      bullet('กด New Query อีกครั้ง'),
      bullet('คัดลอก quiz-schema.sql มาวาง → Run'),

      callout('🔎 ตรวจสอบ',
        'ไปที่เมนู Table Editor ทางซ้าย — ควรเห็นตารางขึ้นมาหลายอัน เช่น products, members, sales ฯลฯ ' +
        'ถ้าเห็นแสดงว่าสำเร็จ', C_GREEN, 'E0F0EB'),

      // ============== ขั้นที่ 4 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('4', 'บอกระบบให้รู้จักฐานข้อมูล'),
      callout('🎯 จุดประสงค์',
        'เอา 2 ข้อมูลที่จดไว้จากขั้นที่ 2 (URL + anon key) ใส่ลงในไฟล์ config ของระบบ ' +
        'เหมือนการบอกระบบว่า "ฐานข้อมูลของฉันอยู่ที่นี่นะ"', C_BLUE, 'E8F0F7'),

      h3('💻 ขั้นตอนทีละขั้น'),

      numItem('กลับไปที่ GitHub สำเนาของคุณ', { bold: true }),
      bullet('เปิด github.com/(ชื่อคุณ)/coop-myschool'),
      bullet('คลิกที่ไฟล์ supabase-config.js'),

      numItem('แก้ไขไฟล์', { bold: true }),
      bullet('กดไอคอนรูปดินสอ (✏️ Edit this file) มุมขวาบน'),
      bullet('หาบรรทัดที่เริ่มด้วย url: และ anonKey:'),
      bullet('แทนที่ค่าเดิมด้วยข้อมูลที่จดไว้จากขั้นที่ 2'),

      p('ตัวอย่าง:'),
      callout('📝 ตัวอย่างที่ถูกต้อง',
        'url: \'https://abcdef123.supabase.co\',\n' +
        'anonKey: \'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(ตัวอักษรยาวมาก)...\',',
        C_BLUE, 'E8F0F7'),
      new Paragraph({ children: [new TextRun({ text: '', size: 8 })], spacing: { after: 100 } }),

      numItem('บันทึกการแก้ไข', { bold: true }),
      bullet('เลื่อนลงไปด้านล่างของหน้า'),
      bullet('กดปุ่มสีเขียว Commit changes'),
      bullet('กด Commit changes อีกครั้ง ใน dialog ที่ขึ้นมา'),

      callout('⚠️ ระวัง',
        'อย่าลบเครื่องหมาย \' ออกจากค่า — ต้องมีเครื่องหมาย \' ครอบค่าทุกครั้ง ' +
        'มิฉะนั้นระบบจะอ่านค่าไม่ถูก', C_RED, 'FBEAEA'),

      // ============== ขั้นที่ 5 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('5', 'ตั้งค่าการแจ้งเตือนบนมือถือ'),
      callout('🎯 จุดประสงค์',
        'ทำให้ระบบส่งแจ้งเตือนเด้งบนมือถือนักเรียนและครูได้ ' +
        'เหมือนแจ้งเตือนจาก Line หรือ Facebook ขั้นนี้ใช้เวลานานสุด แต่สำคัญ', C_BLUE, 'E8F0F7'),

      h3('💻 ส่วนที่ 5.1: สร้าง "กุญแจดิจิทัล" (VAPID Keys)'),
      p('กุญแจดิจิทัลใช้เพื่อยืนยันว่าการแจ้งเตือนมาจากระบบเราจริง — ไม่ใช่จากผู้ไม่หวังดี ใช้เวลา 30 วินาที'),

      numItem('เปิดเบราว์เซอร์ (Chrome หรือ Edge)', { bold: true }),
      numItem('กดปุ่ม F12 บนคีย์บอร์ด', { bold: true }),
      bullet('จะมีหน้าต่าง Developer Tools ขึ้นมาด้านล่างหรือด้านขวา'),

      numItem('คลิกแท็บ Console', { bold: true }),
      bullet('เห็นช่องว่างให้พิมพ์ — นี่คือ Console'),

      numItem('คัดลอกโค้ดนี้ไปวาง', { bold: true }),
      callout('📋 โค้ดสำหรับสร้างกุญแจ',
        '(async () => {\n' +
        '  const kp = await crypto.subtle.generateKey({name:\'ECDSA\',namedCurve:\'P-256\'},true,[\'sign\',\'verify\']);\n' +
        '  const pub = await crypto.subtle.exportKey(\'raw\',kp.publicKey);\n' +
        '  const jwk = await crypto.subtle.exportKey(\'jwk\',kp.privateKey);\n' +
        '  const b = b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\\+/g,\'-\').replace(/\\//g,\'_\').replace(/=+$/,\'\');\n' +
        '  console.log(\'Public:\', b(pub));\n' +
        '  console.log(\'Private:\', jwk.d);\n' +
        '})();',
        C_INK, C_CREAM),
      new Paragraph({ children: [new TextRun({ text: '', size: 8 })], spacing: { after: 100 } }),

      numItem('กด Enter รันโค้ด', { bold: true }),
      bullet('จะเห็น 2 บรรทัด: Public: ... และ Private: ...'),
      bullet('คัดลอกทั้ง 2 ค่าเก็บไว้ (paste ใน Notepad)'),

      h3('💻 ส่วนที่ 5.2: ใส่กุญแจใน Supabase'),

      numItem('เปิด Supabase Dashboard', { bold: true }),
      bullet('ไปที่ Project Settings (ฟันเฟืองมุมล่างซ้าย)'),
      bullet('เลือก Edge Functions → Secrets'),

      numItem('เพิ่มข้อมูล 3 ตัว', { bold: true }),
      bullet('กดปุ่ม Add new secret'),

      fieldBox('Name', 'VAPID_PUBLIC_KEY'),
      fieldBox('Value', '(วาง Public Key ที่คัดลอกไว้)'),
      new Paragraph({ children: [new TextRun({ text: '', size: 8 })], spacing: { after: 100 } }),

      fieldBox('Name', 'VAPID_PRIVATE_KEY'),
      fieldBox('Value', '(วาง Private Key ที่คัดลอกไว้)'),
      new Paragraph({ children: [new TextRun({ text: '', size: 8 })], spacing: { after: 100 } }),

      fieldBox('Name', 'VAPID_SUBJECT'),
      fieldBox('Value', 'mailto:อีเมลของครูคุณ@gmail.com'),
      new Paragraph({ children: [new TextRun({ text: '', size: 8 })], spacing: { after: 100 } }),

      h3('💻 ส่วนที่ 5.3: ติดตั้งฟังก์ชันส่งแจ้งเตือน'),

      numItem('ใน Supabase: เลือก Edge Functions ที่เมนูซ้าย', { bold: true }),
      numItem('กดปุ่ม Deploy a new function', { bold: true }),
      bullet('Name: send-push (สำคัญ — ต้องเป็นชื่อนี้)'),
      bullet('Verify JWT: ปิด (toggle off) — สำคัญมาก!'),

      numItem('คัดลอกโค้ดจาก GitHub มาวาง', { bold: true }),
      bullet('เปิด github.com/(ชื่อคุณ)/coop-myschool/blob/main/supabase/functions/send-push/index.ts'),
      bullet('กด Raw → Ctrl+A → Ctrl+C'),
      bullet('กลับมา Supabase → ลบโค้ดตัวอย่าง → Ctrl+V วาง'),

      numItem('กด Deploy function', { bold: true }),
      bullet('รอประมาณ 30 วินาที จนเห็น Active'),

      h3('💻 ส่วนที่ 5.4: ใส่ Public Key ลงในไฟล์ config'),

      numItem('กลับไป GitHub → ไฟล์ supabase-config.js → กด Edit', { bold: true }),
      numItem('หาบรรทัด vapidPublicKey:', { bold: true }),
      bullet('เปลี่ยนค่าให้เป็น Public Key ที่จดไว้'),
      bullet('ตัวอย่าง: vapidPublicKey: \'BNn7XRzL...\','),
      numItem('กด Commit changes', { bold: true }),

      callout('🎉 สำเร็จขั้นที่ 5', 'การแจ้งเตือนพร้อมใช้งานแล้ว ทดสอบในขั้นสุดท้าย', C_GREEN, 'E0F0EB'),

      // ============== ขั้นที่ 6 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('6', 'ตั้งชื่อโรงเรียนและข้อมูล'),
      callout('🎯 จุดประสงค์',
        'แก้ไขให้ระบบแสดงชื่อโรงเรียน สังกัด และข้อมูลผู้บริหารของโรงเรียนคุณ ' +
        'แทนข้อมูลของโรงเรียนต้นแบบ', C_BLUE, 'E8F0F7'),

      h3('💻 ขั้นตอนทีละขั้น'),

      numItem('ไปที่ GitHub → คลิกไฟล์ school-config.js', { bold: true }),
      numItem('กด Edit (รูปดินสอ)', { bold: true }),
      numItem('แก้ค่าทุกบรรทัดให้ตรงโรงเรียนของคุณ', { bold: true }),

      p('สิ่งที่ต้องแก้ทั้งหมด:'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({
            children: [
              headerCell('ค่า'),
              headerCell('ตัวอย่างที่ต้องใส่'),
            ],
          }),
          ...[
            ['schoolName', 'โรงเรียนของคุณ'],
            ['appTitle', 'สหกรณ์โรงเรียนของคุณ'],
            ['schoolNameEn', 'Your School (ภาษาอังกฤษ)'],
            ['subtitleEn', 'Digital School Cooperative System'],
            ['districtOffice', 'สำนักงานเขตพื้นที่การศึกษา...'],
            ['ministry', 'สังกัดสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน...'],
            ['principalTitle', 'ผู้อำนวยการโรงเรียน(ชื่อโรงเรียน)'],
            ['advisorTitle', 'ครูที่ปรึกษาสหกรณ์'],
            ['developer', 'ครู(ชื่อครูผู้ดูแล)'],
            ['defaultStudentPin', '1234 (เปลี่ยนเพื่อความปลอดภัย)'],
            ['defaultTeacherPin', '9999 (เปลี่ยนเพื่อความปลอดภัย)'],
            ['bigSaleThreshold', '100 (ค่าที่ถือว่า "บิลใหญ่" แจ้งครู)'],
          ].map((row, i) => new TableRow({
            children: row.map((c, j) => dataCell(c, {
              bg: i % 2 === 0 ? 'FFFFFF' : C_CREAM,
              run: { bold: j === 0, color: j === 0 ? C_GREEN_DARK : C_INK },
            })),
          })),
        ],
      }),

      new Paragraph({ children: [new TextRun({ text: '', size: 12 })], spacing: { after: 100 } }),
      numItem('กด Commit changes', { bold: true }),

      callout('⚠️ ระวัง',
        'อย่าลบเครื่องหมาย \' หรือ ; ออก — ต้องมีครบทุกบรรทัด ' +
        'ถ้าผิดพลาด ระบบจะใช้ค่าเริ่มต้นโรงเรียนบ้านหินลาดแทน', C_RED, 'FBEAEA'),

      // ============== ขั้นที่ 7 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('7', 'เปลี่ยนโลโก้โรงเรียน'),
      callout('🎯 จุดประสงค์',
        'เปลี่ยนโลโก้จากโรงเรียนต้นแบบเป็นโลโก้ของโรงเรียนคุณ ' +
        'จะแสดงในหน้าเข้าระบบ หัวกระดาษ PDF และไอคอนแอป', C_BLUE, 'E8F0F7'),

      h3('💻 เตรียมไฟล์โลโก้'),

      p('ก่อนเริ่ม ต้องเตรียมไฟล์โลโก้ของโรงเรียนคุณ:'),
      bullet([t('ชื่อไฟล์: ', { bold: true, size: 26 }), t('logo-no-bg.png (สำคัญ — ต้องเป็นชื่อนี้)', { size: 26 })]),
      bullet([t('ประเภท: ', { bold: true, size: 26 }), t('PNG พื้นใส (Transparent Background)', { size: 26 })]),
      bullet([t('ขนาดที่เหมาะ: ', { bold: true, size: 26 }), t('512 × 512 pixels (สี่เหลี่ยมจัตุรัส)', { size: 26 })]),
      bullet([t('ขนาดไฟล์: ', { bold: true, size: 26 }), t('ไม่เกิน 200 KB', { size: 26 })]),

      callout('💡 ถ้าโลโก้พื้นไม่ใส',
        'เปิดเว็บ remove.bg → อัปโหลดโลโก้ → ดาวน์โหลดภาพไม่มีพื้น → เปลี่ยนชื่อเป็น logo-no-bg.png',
        C_GOLD, C_GOLD_BG),

      h3('💻 อัปโหลดไฟล์'),

      numItem('ลบโลโก้เดิมก่อน', { bold: true }),
      bullet('ใน GitHub → คลิกไฟล์ logo-no-bg.png'),
      bullet('กดปุ่มถังขยะ (Delete this file)'),
      bullet('เลื่อนลง → กด Commit changes'),

      numItem('อัปโหลดโลโก้ใหม่', { bold: true }),
      bullet('กลับมาที่หน้าหลักของ Repository'),
      bullet('กดปุ่ม Add file → Upload files'),
      bullet('ลากไฟล์โลโก้ของคุณเข้าไป'),
      bullet('ตรวจให้แน่ใจว่าชื่อไฟล์เป็น logo-no-bg.png ทุกอย่าง'),
      bullet('เลื่อนลง → กด Commit changes'),

      // ============== ขั้นที่ 8 ==============
      new Paragraph({ children: [new PageBreak()] }),
      stepHeader('8', 'นำขึ้นออนไลน์ (Deploy)'),
      callout('🎯 จุดประสงค์',
        'นำระบบที่ตั้งค่าทั้งหมดขึ้นเซิร์ฟเวอร์ออนไลน์ฟรีของ Vercel เพื่อให้นักเรียนและครูเข้าใช้งานผ่าน URL ได้ทันที',
        C_BLUE, 'E8F0F7'),

      h3('💻 ขั้นตอนทีละขั้น'),

      numItem('เข้าเว็บ Vercel', { bold: true }),
      bullet([t('เปิด ', { size: 26 }), t('https://vercel.com', { size: 26, color: C_BLUE, underline: {} })]),
      bullet('กด Sign Up'),
      bullet('เลือก Continue with GitHub'),
      bullet('อนุญาตให้ Vercel เข้าถึงบัญชี GitHub'),

      numItem('สร้างโปรเจกต์ใหม่', { bold: true }),
      bullet('กดปุ่ม Add New → Project'),
      bullet('ระบบจะแสดงรายการ Repository ของคุณ'),
      bullet('หา coop-myschool (หรือชื่อที่ตั้งไว้) → กดปุ่ม Import'),

      numItem('Deploy', { bold: true }),
      bullet('ไม่ต้องตั้งค่าอะไรเพิ่ม'),
      bullet('กดปุ่มสีดำ Deploy'),
      bullet('รอประมาณ 1-2 นาที จะเห็นวงกลมหมุน ๆ'),
      bullet('เมื่อเสร็จจะมีรูปดอกไม้ปะทุ — สำเร็จ!'),

      numItem('ได้ลิงก์ของคุณแล้ว!', { bold: true }),
      bullet('Vercel จะให้ URL เช่น https://coop-myschool.vercel.app'),
      bullet('คลิกเปิด — ระบบควรขึ้นมาแล้ว'),

      callout('🎊 ยินดีด้วย!',
        'ระบบสหกรณ์โรงเรียนของคุณพร้อมใช้งานแล้ว แชร์ลิงก์ให้นักเรียนและครูใช้ได้ทันที',
        C_GREEN, 'E0F0EB'),

      // ============== ทดสอบ ==============
      new Paragraph({ children: [new PageBreak()] }),
      h1('✅ ทดสอบระบบ'),

      h2('ทดสอบขั้นที่ 1: เข้าระบบเป็นครู'),
      numItem('เปิด URL ของคุณ', { bold: true }),
      numItem('ใส่รหัส T0001 ในช่องรหัสนักเรียน', { bold: true }),
      numItem('ใส่ PIN 9999', { bold: true }),
      numItem('กด เข้าระบบ', { bold: true }),
      bullet('ควรเห็นหน้าหลักของสหกรณ์ พร้อมแถบ Admin'),

      h2('ทดสอบขั้นที่ 2: ขายสินค้า'),
      numItem('แตะสินค้าตัวอย่าง 1-2 ชิ้น', { bold: true }),
      numItem('กดปุ่ม ชำระเงิน', { bold: true }),
      numItem('กดปุ่ม พอดี', { bold: true }),
      bullet('ควรเห็นข้อความ "บันทึกการขายเรียบร้อย"'),

      h2('ทดสอบขั้นที่ 3: ดูรายงาน'),
      numItem('แตะแท็บ รายงาน ด้านล่าง', { bold: true }),
      bullet('ควรเห็นยอดวันนี้ + กราฟ'),

      h2('ทดสอบขั้นที่ 4: แจ้งเตือน'),
      numItem('ไปที่ Admin → 🔔 การแจ้งเตือน', { bold: true }),
      numItem('พิมพ์ 2 → กด OK', { bold: true }),
      bullet('ควรเห็นแจ้งเตือนเด้งบนหน้าจอ'),

      callout('🎯 ผ่านทุกขั้น = สำเร็จสมบูรณ์!',
        'ระบบของคุณพร้อมใช้งานจริง — นำลิงก์ไปแชร์ให้นักเรียนและครูได้เลย',
        C_GREEN, 'E0F0EB'),

      // ============== ใช้งานต่อไป ==============
      new Paragraph({ children: [new PageBreak()] }),
      h1('🚀 หลังติดตั้งเสร็จ — สิ่งที่ควรทำต่อ'),

      h2('1. เปลี่ยน PIN ครูเป็นรหัสจริง'),
      p('PIN เริ่มต้น 9999 ไม่ปลอดภัย ต้องเปลี่ยน:'),
      numItem('เข้าระบบเป็นครู (T0001 / 9999)', { bold: true }),
      numItem('ไปแท็บ Admin → จัดการสมาชิก', { bold: true }),
      numItem('คลิกชื่อครู → เปลี่ยน PIN', { bold: true }),
      numItem('บันทึก', { bold: true }),

      h2('2. เพิ่มสมาชิก (นักเรียน + ครู) ในโรงเรียน'),
      p('มีสองวิธี:'),

      h3('วิธีที่ 1: นำเข้าหลายคนพร้อมกัน (เร็ว)'),
      bullet('เตรียมรายชื่อใน Excel: รหัส, ชื่อ, ชั้น (3 คอลัมน์)'),
      bullet('Copy ข้อมูลทั้งหมด'),
      bullet('Admin → 👥 นำเข้าสมาชิก → Paste → Confirm'),

      h3('วิธีที่ 2: เพิ่มทีละคน'),
      bullet('Admin → เพิ่มสมาชิกใหม่ (ปุ่มลอย ๆ ด้านล่าง)'),
      bullet('กรอกข้อมูล → บันทึก'),

      h2('3. เพิ่มสินค้าจริง'),
      h3('นำเข้าหลายรายการพร้อมกัน'),
      bullet('เตรียม Excel: ชื่อ, ราคาขาย, ต้นทุน, หมวด, อีโมจิ, สต็อก'),
      bullet('Copy → Admin → 📦 นำเข้าสินค้า → Paste → Confirm'),

      h2('4. ตั้งตารางเวรขาย'),
      bullet('ไปที่ Admin → ตารางเวร'),
      bullet('กำหนดผู้ขายในแต่ละวันและเวลา'),

      // ============== ปัญหาที่พบบ่อย ==============
      new Paragraph({ children: [new PageBreak()] }),
      h1('🆘 ปัญหาที่พบบ่อย + วิธีแก้'),

      h2('ปัญหา: เปิดเว็บแล้วขึ้น "Local" ไม่ใช่ "Cloud"'),
      p('สาเหตุ: ระบบเชื่อมฐานข้อมูลไม่ได้ — ค่าใน supabase-config.js ผิด'),
      p('วิธีแก้:'),
      numItem('กลับไป GitHub → supabase-config.js → ตรวจสอบ URL และ anonKey', { bold: true }),
      numItem('ต้องไม่มีช่องว่างหน้า/หลังค่า', { bold: true }),
      numItem('ต้องมีเครื่องหมาย \' ครอบค่าทั้งหมด', { bold: true }),

      h2('ปัญหา: บันทึกสินค้าแล้วหายไปตอนรีเฟรช'),
      p('สาเหตุ: ยังไม่ได้รันไฟล์ schema.sql ใน Supabase'),
      p('วิธีแก้: กลับไปทำขั้นที่ 3 ใหม่'),

      h2('ปัญหา: แจ้งเตือนไม่ทำงาน'),
      p('สาเหตุที่พบบ่อย:'),
      bullet('Edge Function ไม่ได้ deploy → กลับไปขั้นที่ 5.3'),
      bullet('VAPID Public Key ไม่ตรงระหว่าง Supabase Secrets กับ supabase-config.js'),
      bullet('โทรศัพท์ปิด battery optimization สำหรับเบราว์เซอร์'),

      h2('ปัญหา: นักเรียนเข้าระบบไม่ได้'),
      p('สาเหตุ: ยังไม่ได้เพิ่มเป็นสมาชิก หรือใส่รหัส/PIN ผิด'),
      p('วิธีแก้:'),
      numItem('ครูเข้าระบบ → Admin → จัดการสมาชิก', { bold: true }),
      numItem('ตรวจดูว่ามีรายชื่อนักเรียนหรือยัง', { bold: true }),
      numItem('ถ้าไม่มี → เพิ่มสมาชิกใหม่ (ขั้นข้างบน)', { bold: true }),

      // ============== Resource limits ==============
      new Paragraph({ children: [new PageBreak()] }),
      h1('📊 ขีดจำกัดการใช้งานฟรี'),
      p('Supabase และ Vercel ฟรีตลอด แต่มีขีดจำกัดการใช้งาน:'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 2800, 3440],
        rows: [
          new TableRow({
            children: [
              headerCell('บริการ'),
              headerCell('ขีดจำกัดฟรี'),
              headerCell('เหมาะกับ'),
            ],
          }),
          ...[
            ['Supabase Database', '500 MB', 'ประมาณ 100,000 รายการ'],
            ['Realtime', 'ไม่จำกัด', 'ใช้ได้สบาย'],
            ['Edge Function', '500,000 ครั้ง/เดือน', 'ใช้ได้สบาย'],
            ['Supabase Storage', '1 GB', 'รูปสินค้าได้เยอะ'],
            ['Vercel Hosting', 'ไม่จำกัด', 'ใช้ได้สบาย'],
            ['Vercel Bandwidth', '100 GB/เดือน', 'ใช้ได้สบาย'],
          ].map((row, i) => new TableRow({
            children: row.map((c, j) => dataCell(c, {
              bg: i % 2 === 0 ? 'FFFFFF' : C_CREAM,
              run: { bold: j === 0, color: j === 0 ? C_GREEN_DARK : C_INK },
            })),
          })),
        ],
      }),

      new Paragraph({ children: [new TextRun({ text: '', size: 12 })], spacing: { after: 120 } }),
      callout('💡 สรุปสำหรับโรงเรียน', 'โรงเรียนขนาด 50 - 500 คน ใช้งานได้สบายตลอดไป ไม่ต้องเสียเงิน', C_GREEN, 'E0F0EB'),

      // ============== ขอความช่วยเหลือ ==============
      new Paragraph({ children: [new PageBreak()] }),
      h1('💬 ขอความช่วยเหลือ'),

      h2('ติดต่อผู้พัฒนา'),
      bullet([t('GitHub Issues: ', { bold: true, size: 26 }), t('https://github.com/siratheetee-coder/schoolcooperative/issues', { size: 26, color: C_BLUE })]),
      bullet([t('ครูสิรธีร์ ตีเมืองซ้าย ', { bold: true, size: 26 }), t('โรงเรียนบ้านหินลาด', { size: 26 })]),

      h2('อัปเดตเวอร์ชันใหม่'),
      p('เมื่อมีฟีเจอร์ใหม่:'),
      numItem('ไปที่ GitHub repository ของคุณ', { bold: true }),
      numItem('กดปุ่ม Sync fork (ด้านบน)', { bold: true }),
      numItem('กด Update branch', { bold: true }),
      bullet('Vercel จะ deploy อัตโนมัติ ไม่ต้องทำอะไรเพิ่ม'),

      callout('⚠️ ก่อน Sync',
        'ตรวจสอบว่าไฟล์ supabase-config.js, school-config.js, logo-no-bg.png ของคุณยังถูกต้อง ' +
        'ถ้าโค้ดต้นทางมีการแก้ไฟล์เดียวกันอาจเกิด conflict ต้องแก้ก่อน sync', C_RED, 'FBEAEA'),

      // ============== ปิด ==============
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('🎓', { size: 80 })],
        spacing: { before: 1800, after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('ขอให้ใช้งานสนุก', { size: 44, bold: true, color: C_GREEN_DARK })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('ระบบนี้สร้างขึ้นเพื่อพัฒนาการศึกษาไทย', { size: 28, color: C_GREEN, italics: true })],
        spacing: { after: 600 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('━━━━━━━━━━━━━━━━━━━━', { size: 22, color: C_GREEN })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('พัฒนาโดย', { size: 22, color: C_INK_SOFT })],
        spacing: { after: 60 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('นายสิรธีร์ ตีเมืองซ้าย', { size: 30, bold: true, color: C_GREEN_DARK })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('โรงเรียนบ้านหินลาด · มหาสารคาม', { size: 22, color: C_INK_SOFT })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('🇹🇭', { size: 40 })],
      }),
    ],
  }],
});

const outPath = path.resolve(process.argv[2] || 'C:\\Users\\Lenovo_\\Desktop\\School Cooperative\\คู่มือติดตั้งระบบสหกรณ์โรงเรียน.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log('Created:', outPath);
});
