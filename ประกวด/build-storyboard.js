// Build storyboard .docx for school cooperative competition video
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, HeadingLevel, PageNumber, PageBreak, PageOrientation
} = require('docx');

// === Styling constants ===
const FONT_TH = 'TH Sarabun New';
const FONT_FALLBACK = 'Sarabun';
const COLOR_GREEN_DARK = '174740';
const COLOR_GREEN = '2D7D6F';
const COLOR_GREEN_LIGHT = '46A697';
const COLOR_GOLD = 'E89A0E';
const COLOR_GOLD_BG = 'FFF6E0';
const COLOR_CREAM = 'FFF8EE';
const COLOR_INK = '2A2218';
const COLOR_INK_SOFT = '6B5E4C';
const COLOR_RED = 'CC4444';

// === Helper functions ===
const t = (text, opts = {}) => new TextRun({ text, font: FONT_TH, ...opts });
const para = (children, opts = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts });
const heading1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: FONT_TH, size: 36, bold: true, color: COLOR_GREEN_DARK })],
  spacing: { before: 320, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_GREEN } },
});
const heading2 = (text, color = COLOR_GREEN) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: FONT_TH, size: 30, bold: true, color })],
  spacing: { before: 260, after: 140 },
});
const heading3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: FONT_TH, size: 26, bold: true, color: COLOR_GREEN_DARK })],
  spacing: { before: 200, after: 120 },
});
const body = (text, opts = {}) => para(t(text, { size: 22, ...opts }), { spacing: { after: 120 } });
const small = (text, opts = {}) => para(t(text, { size: 20, color: COLOR_INK_SOFT, ...opts }), { spacing: { after: 100 } });
const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [t(text, { size: 22 })],
  spacing: { after: 80 },
});
const quote = (text) => new Paragraph({
  children: [t(text, { size: 22, italics: true, color: COLOR_GREEN_DARK })],
  spacing: { before: 120, after: 120 },
  indent: { left: 720 },
  border: { left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_GOLD, space: 8 } },
});
const tip = (text) => new Paragraph({
  children: [t('💡 ' + text, { size: 20, color: COLOR_GOLD, bold: true })],
  spacing: { before: 80, after: 120 },
  indent: { left: 360 },
});

// === Table helpers ===
const border = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

const cellHeader = (text, colorBg = COLOR_GREEN) => new TableCell({
  borders,
  shading: { fill: colorBg, type: ShadingType.CLEAR },
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  children: [para(t(text, { size: 22, bold: true, color: 'FFFFFF' }))],
});

const cell = (text, opts = {}) => new TableCell({
  borders,
  width: opts.width,
  shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  children: typeof text === 'string'
    ? [para(t(text, { size: 22, ...opts.run }))]
    : (Array.isArray(text) ? text : [text]),
});

// === Build the scene table for one scene ===
const sceneTable = ({ sceneNo, title, time, duration, shots, voiceOver, tips, color = COLOR_GREEN }) => {
  const totalWidth = 9360;
  const colWidths = [1800, 7560];

  const rows = [
    // Scene header row (full width via merge)
    new TableRow({
      children: [
        new TableCell({
          borders,
          columnSpan: 2,
          shading: { fill: color, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 160, right: 160 },
          children: [
            para([
              new TextRun({ text: `Scene ${sceneNo}: `, font: FONT_TH, size: 28, bold: true, color: 'FFFFFF' }),
              new TextRun({ text: title, font: FONT_TH, size: 28, bold: true, color: 'FFFFFF' }),
            ]),
            para([
              new TextRun({ text: `⏱ ${time}  ·  ความยาว ${duration}`, font: FONT_TH, size: 22, color: 'FFE9C8' }),
            ]),
          ],
        }),
      ],
    }),
    // Shots row
    new TableRow({
      children: [
        cell('ภาพ (Shots)', { width: { size: colWidths[0], type: WidthType.DXA }, bg: COLOR_GOLD_BG, run: { bold: true } }),
        cell(shots.map(s => new Paragraph({
          numbering: { reference: 'bullets', level: 0 },
          children: [t(s, { size: 22 })],
          spacing: { after: 60 },
        })), { width: { size: colWidths[1], type: WidthType.DXA } }),
      ],
    }),
    // Voice-over row
    new TableRow({
      children: [
        cell('บทพูด (Voice-over)', { width: { size: colWidths[0], type: WidthType.DXA }, bg: COLOR_GREEN_LIGHT, run: { bold: true, color: 'FFFFFF' } }),
        cell(voiceOver.map(v => quote(v)), { width: { size: colWidths[1], type: WidthType.DXA } }),
      ],
    }),
  ];

  if (tips && tips.length) {
    rows.push(new TableRow({
      children: [
        cell('Tips', { width: { size: colWidths[0], type: WidthType.DXA }, bg: COLOR_GOLD, run: { bold: true, color: 'FFFFFF' } }),
        cell(tips.map(tt => new Paragraph({
          children: [t('💡 ' + tt, { size: 20, color: COLOR_GOLD })],
          spacing: { after: 60 },
        })), { width: { size: colWidths[1], type: WidthType.DXA } }),
      ],
    }));
  }

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows,
  });
};

// === Build document ===
const doc = new Document({
  creator: 'ครูสิรธีร์ ตีเมืองซ้าย',
  title: 'Storyboard วิดีโอนำเสนอ — ระบบสหกรณ์โรงเรียนดิจิทัล',
  description: 'Storyboard + Voice-over Script for TECH CREATIVE LEARNING AWARDS 2569',
  styles: {
    default: { document: { run: { font: FONT_TH, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: FONT_TH, color: COLOR_GREEN_DARK },
        paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: FONT_TH, color: COLOR_GREEN },
        paragraph: { spacing: { before: 260, after: 140 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: FONT_TH, color: COLOR_GREEN_DARK },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        ],
      },
      {
        reference: 'numbers',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        ],
      },
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
            children: [t('Storyboard — ระบบสหกรณ์โรงเรียนดิจิทัล', { size: 18, color: COLOR_INK_SOFT, italics: true })],
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_GREEN, space: 4 } },
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
              t('ครูสิรธีร์ ตีเมืองซ้าย · โรงเรียนบ้านหินลาด · พฤษภาคม 2569 · หน้า ', { size: 18, color: COLOR_INK_SOFT }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT_TH, size: 18, color: COLOR_INK_SOFT }),
            ],
          }),
        ],
      }),
    },
    children: [
      // === Cover ===
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('🎬 STORYBOARD วิดีโอนำเสนอนวัตกรรม', { size: 30, bold: true, color: COLOR_GOLD })],
        spacing: { before: 1800, after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('ระบบสหกรณ์โรงเรียนดิจิทัล', { size: 56, bold: true, color: COLOR_GREEN_DARK })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('Digital School Cooperative System', { size: 28, italics: true, color: COLOR_GREEN })],
        spacing: { after: 600 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('โครงการประกวด', { size: 22, color: COLOR_INK_SOFT })],
        spacing: { after: 60 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('TECH CREATIVE LEARNING AWARDS 2569', { size: 28, bold: true, color: COLOR_GREEN })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('มหาวิทยาลัยศรีปทุม', { size: 22, color: COLOR_INK_SOFT })],
        spacing: { after: 800 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('พัฒนาโดย', { size: 22, color: COLOR_INK_SOFT })],
        spacing: { after: 40 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('นายสิรธีร์ ตีเมืองซ้าย', { size: 30, bold: true, color: COLOR_GREEN_DARK })],
        spacing: { after: 60 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('ครู โรงเรียนบ้านหินลาด', { size: 22, color: COLOR_INK_SOFT })],
        spacing: { after: 40 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('สำนักงานเขตพื้นที่การศึกษาประถมศึกษามหาสารคาม เขต 1', { size: 20, color: COLOR_INK_SOFT })],
      }),

      // === Page 2: Overview ===
      new Paragraph({ children: [new PageBreak()] }),
      heading1('📋 ภาพรวมวิดีโอ'),

      heading3('ข้อมูลพื้นฐาน'),
      bullet('ความยาวรวม: 4 นาที 45 วินาที (กรอบที่กำหนดไม่เกิน 5 นาที)'),
      bullet('สัดส่วนภาพ: 16:9 แนวนอน (1920×1080)'),
      bullet('ภาษา: ไทย พร้อม subtitle ทุกประโยค'),
      bullet('อัปโหลด: YouTube พร้อมตั้งเป็น Public/Unlisted ตามเกณฑ์'),

      heading3('โครงสร้าง 7 ฉาก'),
      // Overview table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 1500, 4960, 2000],
        rows: [
          new TableRow({
            children: [
              cellHeader('Scene'),
              cellHeader('Time'),
              cellHeader('เนื้อหา'),
              cellHeader('ระยะเวลา'),
            ],
          }),
          ...[
            ['1', '0:00–0:15', 'Hook — เปิดประเด็นปัญหา (80% ใช้กระดาษ)', '15 วินาที'],
            ['2', '0:15–0:35', 'Title — แนะนำตัว + ชื่อนวัตกรรม', '20 วินาที'],
            ['3', '0:35–1:20', 'Feature Montage — ภาพรวมฟีเจอร์ทั้งหมด', '45 วินาที'],
            ['4', '1:20–2:50', 'วิธีใช้ — Demo ทีละขั้น (POS / รายงาน / Quiz)', '1 นาที 30 วิ'],
            ['5', '2:50–4:00', 'การนำไปใช้จริง — นักเรียนใช้งานในห้องสหกรณ์', '1 นาที 10 วิ'],
            ['6', '4:00–4:30', 'ผลลัพธ์ที่เกิดกับผู้เรียน — สัมภาษณ์นักเรียน', '30 วินาที'],
            ['7', '4:30–4:45', 'สรุป + Call to Action', '15 วินาที'],
          ].map(row => new TableRow({
            children: row.map((c, i) => cell(c, { run: { size: 22, bold: i === 0 } })),
          })),
        ],
      }),

      heading3('อุปกรณ์ที่ต้องเตรียม'),
      bullet('โทรศัพท์ 2 เครื่อง (เครื่องหนึ่งถ่าย เครื่องสอง demo)'),
      bullet('ขาตั้งกล้องหรือ Gorillapod'),
      bullet('ไมโครโฟนเล็ก (Lavalier) หากมี'),
      bullet('Ring light หรือถ่ายข้างหน้าต่างเวลาเช้า'),
      bullet('Laptop เปิด demo'),
      bullet('แบบฟอร์มขออนุญาตผู้ปกครองให้นักเรียนถ่ายภาพ'),

      heading3('โปรแกรมที่ใช้'),
      bullet('ตัดต่อ: CapCut (ฟรี รองรับภาษาไทย แนะนำ) หรือ DaVinci Resolve'),
      bullet('Title cards: ไฟล์ title-cards.html ที่เตรียมไว้'),
      bullet('Screen recording: Control Center (iOS) / แถบ Quick Settings (Android)'),
      bullet('เพลงประกอบ: YouTube Audio Library (ฟรี ไม่มี copyright)'),

      // === Page 3+: Scenes ===
      new Paragraph({ children: [new PageBreak()] }),
      heading1('🎥 รายละเอียดแต่ละฉาก'),

      // Scene 1
      sceneTable({
        sceneNo: 1,
        title: 'Hook — เปิดประเด็นปัญหา',
        time: '0:00 – 0:15',
        duration: '15 วินาที',
        color: 'CC4444',
        shots: [
          'ภาพระยะใกล้ของสมุดบันทึกการขายแบบเดิม มีลายมือ ตัวเลขขีดฆ่า รอยแก้',
          'ภาพนักเรียนนั่งนับเงินบนโต๊ะ มีกองเหรียญ ใบหน้าครุ่นคิด',
          'ตัวอักษรขึ้นบนภาพ: "เงินขาด 5 บาท?"',
          'ภาพสุดท้าย: ครูถือสมุดด้วยสีหน้าเครียด — fade to title',
        ],
        voiceOver: [
          '"สหกรณ์โรงเรียน... กิจกรรมพัฒนาผู้เรียนที่ทุกโรงเรียนมี"',
          '"แต่กว่า 80 เปอร์เซ็นต์ ยังใช้สมุดและกระดาษบันทึก"',
          '"ทำให้ข้อมูลผิดพลาด ตรวจสอบยาก และนักเรียนไม่ได้สัมผัสเทคโนโลยีจริง"',
        ],
        tips: [
          'ถ่ายมุมต่ำ-ใกล้ๆ ของสมุดเพื่อให้ดูดราม่า',
          'ใช้แสงสีอบอุ่นหรือหม่น สื่อความน่าเบื่อ',
          'เพลงเปิดควรช้า มีความหม่นเล็กน้อย',
          'อาจใช้ Title Card ใบที่ 2 ของ title-cards.html ในวินาทีสุดท้าย',
        ],
      }),

      // Scene 2
      new Paragraph({ children: [new PageBreak()] }),
      sceneTable({
        sceneNo: 2,
        title: 'Title Card — แนะนำตัว + ชื่อนวัตกรรม',
        time: '0:15 – 0:35',
        duration: '20 วินาที',
        color: COLOR_GREEN,
        shots: [
          'Title Card ใบที่ 1 ของ title-cards.html — ชื่อนวัตกรรมเด่นกลางจอ',
          'ภาพ B-roll: แอปบนมือถือและ laptop วางเคียงกัน (ถ่ายมุมเฉียง)',
          'Animation: ตัวอักษรเด้งขึ้นทีละบรรทัด',
          'Transition: cross dissolve เข้าสู่ Scene 3',
        ],
        voiceOver: [
          '"ผมครูสิรธีร์ ตีเมืองซ้าย ครูโรงเรียนบ้านหินลาด"',
          '"สำนักงานเขตพื้นที่การศึกษาประถมศึกษามหาสารคาม เขต 1"',
          '"ขอนำเสนอ ระบบสหกรณ์โรงเรียนดิจิทัล"',
          '"นวัตกรรม Progressive Web Application ที่พัฒนาขึ้น"',
          '"เพื่อเปลี่ยนสหกรณ์โรงเรียนเป็นห้องเรียนแบบ Active Learning"',
        ],
        tips: [
          'พูดด้วยเสียงทรงพลัง มั่นใจ ไม่รีบ',
          'อัด voice-over ห้องเงียบ ใกล้ผ้าม่านหรือที่นอน (ลด echo)',
          'อัดหลายเทค เลือกที่ดีที่สุด',
          'Background music: ปรับเป็น upbeat (เริ่มขึ้น)',
        ],
      }),

      // Scene 3
      new Paragraph({ children: [new PageBreak()] }),
      sceneTable({
        sceneNo: 3,
        title: 'Feature Montage — ภาพรวมฟีเจอร์',
        time: '0:35 – 1:20',
        duration: '45 วินาที',
        color: COLOR_GREEN,
        shots: [
          'ตัด 6 cuts เร็วๆ ๆ ละ 6-8 วินาที พร้อม overlay text',
          'Cut 1: หน้า POS ขายสินค้า + "POS — บันทึกการขายแบบเรียลไทม์"',
          'Cut 2: Dashboard 3 กราฟ + "วิเคราะห์ผลด้วย 3 กราฟอัตโนมัติ"',
          'Cut 3: หน้า Quiz กำลังตอบ + "Quiz บูรณาการกับการเรียนการสอน"',
          'Cut 4: Push notification เด้งบนหน้าจอล็อค + "แจ้งเตือนทันทีบนมือถือ"',
          'Cut 5: Realtime sync 2 เครื่องพร้อมกัน + "Sync ทุกเครื่องแบบ Real-time"',
          'Cut 6: หน้าหุ้น/ปันผล + "หุ้น · ปันผล · เฉลี่ยคืน ตามหลักสหกรณ์สากล"',
          'แทรก Title Card "Stats Grid" (ใบที่ 5) ที่ 1:00 เป็นเวลา 5 วินาที',
        ],
        voiceOver: [
          '"Point-of-Sale แบบมืออาชีพ"',
          '"แดชบอร์ดวิเคราะห์ผล 3 รูปแบบ"',
          '"แบบฝึกหัด Pre-test และ Post-test"',
          '"การแจ้งเตือนผ่าน Web Push API"',
          '"การซิงค์ข้อมูลแบบ Real-time ผ่าน WebSocket"',
          '"และการจัดการหุ้นตามหลักการสหกรณ์สากล 7 ข้อ"',
          '"ทั้งหมดในแอปเดียว — ใช้งานได้ทั้งบนมือถือและคอมพิวเตอร์"',
        ],
        tips: [
          'แต่ละ cut ไม่เกิน 8 วินาที — รักษา pacing',
          'ใช้ transition แบบ snap หรือ quick zoom',
          'พื้นหลังเพลง upbeat รุนแรงกว่า Scene 2',
          'Subtitle ขึ้นทุก cut ให้กรรมการอ่านทัน',
        ],
      }),

      // Scene 4
      new Paragraph({ children: [new PageBreak()] }),
      heading2('Scene 4 — วิธีใช้ (Demo)', COLOR_GREEN),
      body('Scene 4 แบ่งเป็น 3 sub-scenes แต่ละ sub-scene demo คนละบทบาท'),

      sceneTable({
        sceneNo: '4a',
        title: 'Demo นักเรียนผู้ขาย',
        time: '1:20 – 1:50',
        duration: '30 วินาที',
        color: COLOR_GREEN_LIGHT,
        shots: [
          'แทรก Title Card "วิธีการใช้งาน" (ใบที่ 3) เป็นเวลา 2 วินาที',
          'Screen recording หน้าจอมือถือพร้อมแสดงนิ้วกด (ใช้ลูกศรใน CapCut)',
          'Login: พิมพ์รหัส 05421 + PIN 1234 → Toast: "ยินดีต้อนรับ น้องนภา"',
          'แตะสินค้า 3-4 ชิ้น → ตะกร้าขึ้น ฿85',
          'แตะปุ่ม "เปลี่ยน" ผู้ซื้อ → กดที่ Avatar "ลูกค้าล่าสุด" → instant!',
          'กดชำระเงิน → กด "พอดี" → Toast: "บันทึกการขาย ฿85 เรียบร้อย!"',
          'ตัวเลข timer แสดงมุมจอ: 8 วินาที',
        ],
        voiceOver: [
          '"นักเรียนผู้ขายเข้าระบบด้วยรหัส 5 หลักและ PIN — ปลอดภัยและจดจำง่าย"',
          '"เลือกสินค้าด้วยการแตะ — ระบุผู้ซื้อจากแถบลูกค้าล่าสุด — แล้วกดชำระเงิน"',
          '"บันทึก 1 บิล ใช้เวลาเพียง 8 วินาที"',
        ],
        tips: [
          'ก่อนถ่าย: เพิ่มสินค้าให้มีอย่างน้อย 10 รายการ',
          'สร้างบิลล่วงหน้า 5-10 บิล เพื่อให้ "ลูกค้าล่าสุด" มีข้อมูล',
          'ปิด Do Not Disturb และ notification อื่นๆ ระหว่างถ่าย',
          'ใช้ Screen Recording จาก Control Center (iOS) หรือ Quick Settings (Android)',
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),
      sceneTable({
        sceneNo: '4b',
        title: 'Demo ครูดูรายงาน',
        time: '1:50 – 2:20',
        duration: '30 วินาที',
        color: COLOR_GREEN_LIGHT,
        shots: [
          'Logout จาก nักเรียน → Login ครู (T0001 + 9999) → ธีมเหลือง Admin',
          'เข้าหน้ารายงาน → ยอดวันนี้, กำไร, ต้นทุน, จำนวนบิล',
          'กราฟ 3 ตัวเลื่อนปรากฏแบบ animation: bar / line / donut',
          'กดปุ่ม "PDF" → เปิดหัวกระดาษโรงเรียนสวยๆ พร้อมโลโก้',
          'กดปุ่ม "Excel" → ไฟล์ download (แสดง notification)',
        ],
        voiceOver: [
          '"ครูเห็นข้อมูลแบบเรียลไทม์ — ยอดขาย ต้นทุน กำไร และอัตรากำไร"',
          '"พร้อมกราฟวิเคราะห์ 3 รูปแบบที่เปลี่ยนไปตามช่วงเวลา"',
          '"สามารถ Export เป็น PDF ที่มีหัวกระดาษโรงเรียนสำหรับนำเสนอผู้บริหาร"',
          '"หรือ Excel สำหรับนำไปวิเคราะห์ต่อ"',
        ],
        tips: [
          'ใช้ค่าเงินที่ดูดี เช่น ยอด ฿2,450 (ไม่ใช่ ฿7)',
          'ก่อนถ่าย: ทำการขายล่วงหน้าให้กราฟดูครบช่วงเวลา',
          'ตอน export PDF: ถ่ายให้เห็นหัวกระดาษโรงเรียนชัดๆ',
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),
      sceneTable({
        sceneNo: '4c',
        title: 'Demo Quiz การเรียนรู้',
        time: '2:20 – 2:50',
        duration: '30 วินาที',
        color: COLOR_GREEN_LIGHT,
        shots: [
          'เข้าหน้า Quiz → เลือกระดับ "ป.4-6"',
          'เลือกหัวข้อ "📐 คณิตและการคำนวณ"',
          'ทำข้อ 1: "นมจืดต้นทุน 7 บาท ขาย 10 บาท กำไรกี่บาทต่อกล่อง?"',
          'คลิกตอบ "3 บาท" → ขึ้น "✅ ถูกต้อง!" + อธิบาย',
          'ข้ามไปข้อสุดท้าย → หน้าจอผลคะแนน: 9/10 ⭐',
          'แสดง Leaderboard อันดับนักเรียน',
        ],
        voiceOver: [
          '"ระบบมีแบบฝึกหัด 40 ข้อ แบ่งเป็น 2 ระดับชั้น — ป.4-6 และ ม.1-3"',
          '"รองรับ Pre-test และ Post-test เพื่อวัดพัฒนาการของผู้เรียน"',
          '"ใช้ข้อมูลจริงจากการขายในห้องสหกรณ์มาสร้างโจทย์"',
          '"เป็นการเรียนรู้เชิงประจักษ์ บูรณาการกับวิชาคณิตศาสตร์และสังคมศึกษา"',
        ],
        tips: [
          'ก่อนถ่าย: ให้นักเรียนทำ Quiz ล่วงหน้า เพื่อให้ Leaderboard มีข้อมูล',
          'เลือกหัวข้อที่มีคำถามคำนวณ — กรรมการจะเห็นการเรียนรู้ชัด',
          'แสดงหน้าจอ "เปรียบเทียบ Pre-test vs Post-test" หากมีเวลา',
        ],
      }),

      // Scene 5
      new Paragraph({ children: [new PageBreak()] }),
      sceneTable({
        sceneNo: 5,
        title: 'การนำไปใช้จริง — ในห้องสหกรณ์',
        time: '2:50 – 4:00',
        duration: '1 นาที 10 วินาที',
        color: COLOR_GOLD,
        shots: [
          'แทรก Title Card "การนำไปใช้จริง" (ใบที่ 4) เป็นเวลา 2 วินาที',
          'นักเรียน 2 คนยืนหลังโต๊ะสหกรณ์ ใช้มือถือ + แท็บเล็ตขายให้รุ่นน้อง',
          'Over-the-shoulder shot: ลูกค้านักเรียนเลือกสินค้า สแกน QR (ถ้ามี)',
          'ครูดูข้อมูลจาก laptop ที่โต๊ะครู (อยู่อีกห้องหรือมุมห้องเดียวกัน)',
          'นักเรียนหลายคนนั่งบนพื้น/โต๊ะ เปิดมือถือทำ Quiz พร้อมกัน',
          'Push notification เด้งบนมือถือครู: "💰 บิลใหญ่ ฿250" — ถ่ายชัดๆ ตอนเด้ง',
          'B-roll: นักเรียนยิ้มแย้ม / ตั้งใจ / ทำงานเป็นทีม',
        ],
        voiceOver: [
          '"ที่โรงเรียนบ้านหินลาด นักเรียนได้เป็นผู้ขาย ผู้ซื้อ และผู้ถือหุ้น"',
          '"พวกเขาสวมหน้ากากของผู้ประกอบการตัวจริง"',
          '"ไม่ได้เรียนรู้แค่ในห้องเรียน แต่เรียนรู้ผ่านการลงมือทำในชีวิตจริง"',
          '"ครูสามารถติดตาม ดูแล และให้คำแนะนำได้ตลอดเวลา"',
          '"ผ่านระบบที่โปร่งใส ตรวจสอบได้ และเชื่อถือได้"',
        ],
        tips: [
          'ต้องมีแบบฟอร์มขออนุญาตปกครองก่อนถ่ายหน้านักเรียนใกล้ๆ',
          'หากไม่ได้อนุญาต — ถ่ายมุมหลัง over-the-shoulder หรือเบลอหน้าใน CapCut',
          'มุมล่างจะดูสวย: ถ่ายเงาผ่านแสง — golden hour 16:00-17:30',
          'เพลงประกอบเปลี่ยนเป็น warm/uplifting ที่นี่',
          'ฉากนี้สำคัญที่สุดสำหรับเกณฑ์ "ประโยชน์ต่อผู้เรียน" — ต้องดูเป็นจริง',
        ],
      }),

      // Scene 6
      new Paragraph({ children: [new PageBreak()] }),
      sceneTable({
        sceneNo: 6,
        title: 'ผลที่เกิดกับผู้เรียน — สัมภาษณ์',
        time: '4:00 – 4:30',
        duration: '30 วินาที',
        color: COLOR_GREEN,
        shots: [
          'สัมภาษณ์นักเรียน 2-3 คน (15-20 วินาทีต่อคน → ตัดเหลือ 5-7 วินาที)',
          'ถ่ายระยะ medium shot — เห็นใบหน้า + ไหล่ + พื้นหลังห้องสหกรณ์',
          'นั่งเก้าอี้ ไม่ยืน — ลดความเกร็ง',
          'B-roll: นักเรียนถือเงินปันผล / ใบประกาศ Badge / Certificate',
        ],
        voiceOver: [
          '(ปล่อยเสียงนักเรียนพูดเอง + voice-over ทับเล็กน้อย)',
          'Quote ที่อยากให้ได้: "ได้รู้ว่ากำไรคิดยังไง"',
          'Quote ที่อยากให้ได้: "ต่อเงินทอนเก่งขึ้น"',
          'Quote ที่อยากให้ได้: "รู้สึกเป็นเจ้าของจริงๆ"',
          'Quote ที่อยากให้ได้: "อยากเปิดร้านของตัวเองตอนโตขึ้น"',
          '(Voice-over ปิดท้าย): "นักเรียนได้พัฒนาทักษะแห่งศตวรรษที่ 21"',
          '"การคิดเชิงวิเคราะห์ การทำงานเป็นทีม ความรับผิดชอบ และความซื่อสัตย์"',
        ],
        tips: [
          'คำถามให้ถาม: "ใช้ระบบนี้แล้วเรียนรู้อะไรบ้าง?" และ "ก่อนหน้ากับตอนนี้ ต่างกันยังไง?"',
          'ถ้านักเรียนเกร็ง — ให้ตอบหลายรอบ เลือกที่ดีที่สุด',
          'ระวังถ่ายหน้านักเรียนตรงๆ — ต้องมีอนุญาตปกครองเสมอ',
          'เพิ่ม Subtitle ภาษาไทยทุกคำที่นักเรียนพูด',
        ],
      }),

      // Scene 7
      new Paragraph({ children: [new PageBreak()] }),
      sceneTable({
        sceneNo: 7,
        title: 'สรุป + Call to Action',
        time: '4:30 – 4:45',
        duration: '15 วินาที',
        color: COLOR_GREEN_DARK,
        shots: [
          'Title Card ใบที่ 9 (Closing CTA) — แสดง URL, GitHub, ขอบคุณ',
          'Title Card ใบที่ 10 (Final Logo) — โลโก้แอป + ชื่อโครงการประกวด',
          'Fade to black 1-2 วินาที',
        ],
        voiceOver: [
          '"ระบบนี้เผยแพร่แบบ Open Source"',
          '"โรงเรียนทุกแห่งสามารถนำไปใช้ได้ฟรี"',
          '"เปลี่ยนสหกรณ์โรงเรียนเป็นห้องเรียน Active Learning ที่นักเรียนได้เรียนรู้จริง"',
          '"ขอบคุณครับ"',
        ],
        tips: [
          'เพลงเปลี่ยนเป็น emotional/uplifting ending',
          'ปรับเสียงครูให้นุ่มและจริงใจ — ไม่ขายของ',
          'แสดง URL ให้ใหญ่และค้างนานพอให้กรรมการจดได้',
          'อย่าลืม Subtitle "ขอบคุณครับ" ด้วย',
        ],
      }),

      // === Voice-over script (continuous) ===
      new Paragraph({ children: [new PageBreak()] }),
      heading1('🎤 บทพูดต่อเนื่อง (สำหรับอัด Voice-over)'),
      body('พิมพ์หน้าตัวหนาๆ แล้วถือพร้อมตอนอัด — อ่านช้าๆ มีจังหวะหยุดพักหายใจ'),

      heading2('Scene 1 — Hook (0:00-0:15)', 'CC4444'),
      quote('"สหกรณ์โรงเรียน... กิจกรรมพัฒนาผู้เรียนที่ทุกโรงเรียนมี"'),
      quote('"แต่กว่า 80 เปอร์เซ็นต์ ยังใช้สมุดและกระดาษบันทึก"'),
      quote('"ทำให้ข้อมูลผิดพลาด ตรวจสอบยาก และนักเรียนไม่ได้สัมผัสเทคโนโลยีจริง"'),

      heading2('Scene 2 — Title (0:15-0:35)', COLOR_GREEN),
      quote('"ผมครูสิรธีร์ ตีเมืองซ้าย ครูโรงเรียนบ้านหินลาด สำนักงานเขตพื้นที่การศึกษาประถมศึกษามหาสารคาม เขต 1"'),
      quote('"ขอนำเสนอ ระบบสหกรณ์โรงเรียนดิจิทัล"'),
      quote('"นวัตกรรม Progressive Web Application ที่พัฒนาขึ้นเพื่อเปลี่ยนสหกรณ์โรงเรียนเป็นห้องเรียนแบบ Active Learning"'),

      heading2('Scene 3 — Features (0:35-1:20)', COLOR_GREEN),
      quote('"Point-of-Sale แบบมืออาชีพ — แดชบอร์ดวิเคราะห์ผล 3 รูปแบบ — แบบฝึกหัด Pre-test และ Post-test"'),
      quote('"การแจ้งเตือนผ่าน Web Push API — การซิงค์ข้อมูลแบบ Real-time ผ่าน WebSocket"'),
      quote('"และการจัดการหุ้นตามหลักการสหกรณ์สากล 7 ข้อของ International Cooperative Alliance"'),
      quote('"ทั้งหมดในแอปเดียว ใช้งานได้ทั้งบนมือถือและคอมพิวเตอร์"'),

      heading2('Scene 4 — Demo (1:20-2:50)', COLOR_GREEN),
      heading3('4a Demo นักเรียน (1:20-1:50)'),
      quote('"นักเรียนผู้ขายเข้าระบบด้วยรหัส 5 หลักและ PIN — ปลอดภัยและจดจำง่าย"'),
      quote('"เลือกสินค้าด้วยการแตะ ระบุผู้ซื้อจากแถบลูกค้าล่าสุด แล้วกดชำระเงิน"'),
      quote('"บันทึก 1 บิล ใช้เวลาเพียง 8 วินาที"'),

      heading3('4b Demo ครู (1:50-2:20)'),
      quote('"ครูเห็นข้อมูลแบบเรียลไทม์ — ยอดขาย ต้นทุน กำไร และอัตรากำไร"'),
      quote('"พร้อมกราฟวิเคราะห์ 3 รูปแบบ ที่เปลี่ยนไปตามช่วงเวลาที่เลือก"'),
      quote('"สามารถ Export เป็น PDF ที่มีหัวกระดาษโรงเรียนสำหรับนำเสนอผู้บริหาร หรือ Excel สำหรับวิเคราะห์ต่อ"'),

      heading3('4c Demo Quiz (2:20-2:50)'),
      quote('"ระบบมีแบบฝึกหัด 40 ข้อ แบ่งเป็น 2 ระดับชั้น — ป.4-6 และ ม.1-3"'),
      quote('"รองรับ Pre-test และ Post-test เพื่อวัดพัฒนาการของผู้เรียน"'),
      quote('"ใช้ข้อมูลจริงจากการขายในห้องสหกรณ์มาสร้างโจทย์ — เป็นการเรียนรู้เชิงประจักษ์ที่บูรณาการกับวิชาคณิตศาสตร์และสังคมศึกษา"'),

      heading2('Scene 5 — การนำไปใช้จริง (2:50-4:00)', COLOR_GOLD),
      quote('"ที่โรงเรียนบ้านหินลาด นักเรียนได้เป็นผู้ขาย ผู้ซื้อ และผู้ถือหุ้น"'),
      quote('"พวกเขาสวมหน้ากากของผู้ประกอบการตัวจริง"'),
      quote('"ไม่ได้เรียนรู้แค่ในห้องเรียน แต่เรียนรู้ผ่านการลงมือทำในชีวิตจริง"'),
      quote('"ครูสามารถติดตาม ดูแล และให้คำแนะนำได้ตลอดเวลา ผ่านระบบที่โปร่งใส ตรวจสอบได้ และเชื่อถือได้"'),

      heading2('Scene 6 — สัมภาษณ์ (4:00-4:30)', COLOR_GREEN),
      body('(ปล่อยเสียงนักเรียนพูดเอง — Voice-over ทับเฉพาะช่วงสรุป)'),
      quote('"นักเรียนไม่เพียงเรียนรู้คณิตศาสตร์และการเงิน"'),
      quote('"แต่ได้พัฒนาทักษะแห่งศตวรรษที่ 21 — การคิดเชิงวิเคราะห์ การทำงานเป็นทีม ความรับผิดชอบ และความซื่อสัตย์"'),

      heading2('Scene 7 — Closing (4:30-4:45)', COLOR_GREEN_DARK),
      quote('"ระบบนี้เผยแพร่แบบ Open Source โรงเรียนทุกแห่งสามารถนำไปใช้ได้ฟรี"'),
      quote('"เปลี่ยนสหกรณ์โรงเรียนเป็นห้องเรียน Active Learning ที่นักเรียนได้เรียนรู้จริง"'),
      quote('"ขอบคุณครับ"'),

      // === Checklist ===
      new Paragraph({ children: [new PageBreak()] }),
      heading1('✅ Checklist ก่อนถ่าย'),

      heading2('ในระบบแอป'),
      bullet('ใส่ข้อมูล demo ให้ดูเหมือนจริง (สินค้า 10+ รายการ, สมาชิก 10+ คน)'),
      bullet('มียอดขายจริง 5-10 บิลแล้ว เพื่อให้รายงาน/กราฟดูครบ'),
      bullet('เตรียมบัญชี Login: ครู (T0001/9999) และ นักเรียน (05421/1234)'),
      bullet('ทดสอบ Push notification ใช้ได้บนเครื่องที่จะถ่าย'),
      bullet('ทำ Quiz ล่วงหน้าให้ Leaderboard มีข้อมูล'),
      bullet('ปิด Do Not Disturb และ notification อื่นๆ'),
      bullet('ปิด tab/แอปอื่นๆ ที่อาจขึ้นมาขัดจังหวะ'),

      heading2('อุปกรณ์'),
      bullet('โทรศัพท์ 2 เครื่อง — เครื่องถ่าย + เครื่อง demo'),
      bullet('ขาตั้งกล้องหรือ Gorillapod ป้องกันมือสั่น'),
      bullet('ไมโครโฟน Lavalier (ถ้ามี) หรือพูดใกล้มือถือ 30 ซม.'),
      bullet('Ring light หรือถ่ายข้างหน้าต่างเวลาเช้า/บ่ายแก่ๆ'),
      bullet('Laptop เปิด demo สำรอง'),
      bullet('แบตเตอรี่สำรอง / สายชาร์จ'),

      heading2('เอกสาร'),
      bullet('แบบฟอร์มอนุญาตปกครอง สำหรับนักเรียนที่ถ่ายหน้าใกล้ๆ'),
      bullet('สคริปต์พูดพิมพ์ใส่กระดาษถือ (ตัวอักษรใหญ่ๆ)'),
      bullet('Storyboard นี้พิมพ์ออกมาแล้ว — กางตอนถ่าย'),

      heading2('Setting'),
      bullet('สถานที่ถ่าย: ห้องสหกรณ์ของจริง (มีบรรยากาศ)'),
      bullet('เวลา: เช้า 9-11 โมง หรือ บ่ายแก่ 14-16 น. (แสงสวย)'),
      bullet('นักเรียนผู้ช่วยถ่าย 2-3 คน (รับบทผู้ขาย/ผู้ซื้อ)'),
      bullet('ครูแต่งกายสุภาพ — เสื้อสีอ่อนเข้าได้กับโทนแอป'),

      heading2('Software'),
      bullet('CapCut หรือ DaVinci Resolve ติดตั้งและเปิดได้'),
      bullet('Title cards (title-cards.html) ใช้งานได้'),
      bullet('YouTube account พร้อมสำหรับอัปโหลด'),
      bullet('เพลงพื้นหลังจาก YouTube Audio Library เลือกไว้แล้ว'),

      // === Tips final ===
      new Paragraph({ children: [new PageBreak()] }),
      heading1('💡 เคล็ดลับสุดท้าย'),

      heading2('กฎ 10 วินาทีแรก'),
      body('ต้อง hook กรรมการได้ภายใน 10 วินาที — เปิดด้วยปัญหาที่ทุกคนรู้สึก ไม่ใช่แนะนำตัวยาวๆ ที่กรรมการจะข้าม'),

      heading2('Pacing'),
      bullet('หลีกเลี่ยง shot ค้าง > 3 วินาที (ยกเว้นสัมภาษณ์)'),
      bullet('ใส่ transitions เร็วๆ ระหว่าง cut'),
      bullet('เพลงพื้นหลังเปลี่ยน mood ตาม scene: intro → energetic, classroom → warm, ending → uplifting'),

      heading2('Voice-over'),
      bullet('พูดช้าๆ ชัดๆ แต่มีน้ำเสียงตื่นเต้น'),
      bullet('หยุดพักหายใจระหว่างประโยค'),
      bullet('อัดหลายเทค เลือกที่ดีที่สุด'),
      bullet('บันทึกในห้องเงียบ ใกล้ผ้าม่าน/ที่นอน (ลด echo)'),

      heading2('Editing'),
      bullet('Subtitle ภาษาไทยทุกประโยค (กรรมการบางท่านหูไม่ดี)'),
      bullet('Watermark ชื่อนวัตกรรม + ครู มุมล่างตลอดเรื่อง'),
      bullet('ใส่ QR Code ใน Closing Card ลิงก์ไปที่ YouTube + แอปจริง'),
      bullet('Export 1080p MP4 — ความละเอียดสูงสุดสำหรับ YouTube'),

      heading2('สิ่งที่ห้ามทำ'),
      bullet('❌ ห้ามใช้เพลงมีลิขสิทธิ์ (ใช้ YouTube Audio Library ฟรี)'),
      bullet('❌ ห้ามถ่ายหน้านักเรียนตรงๆ โดยไม่มีอนุญาตปกครอง'),
      bullet('❌ ห้ามเกิน 5 นาที — กรรมการตัดสิทธิ์ทันที'),
      bullet('❌ ห้ามใส่ข้อมูลเท็จเกี่ยวกับโรงเรียน/ครู'),

      // === Closing ===
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('🎬 ขอให้ถ่ายทำได้สนุก', { size: 36, bold: true, color: COLOR_GREEN_DARK })],
        spacing: { before: 2000, after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('และขอให้ได้รางวัล! 🏆', { size: 28, color: COLOR_GOLD, bold: true })],
        spacing: { after: 600 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('━━━━━━━━━━━━━━━━━━━━━━', { size: 22, color: COLOR_GREEN })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('TECH CREATIVE LEARNING AWARDS 2569', { size: 22, color: COLOR_INK_SOFT })],
        spacing: { after: 60 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [t('มหาวิทยาลัยศรีปทุม · 14 มิถุนายน 2569', { size: 20, color: COLOR_INK_SOFT })],
      }),
    ],
  }],
});

const outPath = path.resolve(process.argv[2] || 'Storyboard-วิดีโอนำเสนอ.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log('Created:', outPath);
});
