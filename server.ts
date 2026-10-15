import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read configurations strictly from the top of Code.gs
function loadConfigFromCodeGs() {
  const codeGsPath = path.join(__dirname, 'Code.gs');
  if (!fs.existsSync(codeGsPath)) {
    throw new Error('Code.gs not found!');
  }
  const content = fs.readFileSync(codeGsPath, 'utf-8');
  
  const getConst = (name: string): string => {
    const match = content.match(new RegExp(`const\\s+${name}\\s*=\\s*["']([^"']+)["']`));
    return match ? match[1].trim() : '';
  };

  return {
    SHEET_ID: getConst('SHEET_ID'),
    WEB_APP_URL: getConst('WEB_APP_URL'),
    FOLDER_ID: getConst('FOLDER_ID'),
    ADMIN_PASSWORD: getConst('ADMIN_PASSWORD'),
  };
}

const config = loadConfigFromCodeGs();

// LINE Configuration as requested
const LINE_CHANNEL_ACCESS_TOKEN = "6MKdC7Jkh4/acf4lIOegOi7diwULWXIeZzZKdyGwo4Bp6jPwT/bAhVZxBBMVEpqosnvrFBX7EH7DJ4DKLvD4tuUReasJWhLJav03a8bau44Cq0QDNc0trdo0jO1M4j+N4gRNoTytEWQClQq3Cq6rWwdB04t89/1O/w1cDnyilFU=";
const LINE_GROUP_ID = "Cd6926103d0753bbc0bc55f449083f47a";

// Data directory & Database file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initial Data Seeds
const initialPersonnel = [
  {
    id: 'P-001',
    prefix: 'นาย',
    firstName: 'พิเชษฐ์',
    lastName: 'ยั่งยืน',
    position: 'ผู้อำนวยการโรงเรียน',
    academicStanding: 'ชำนาญการพิเศษ',
    phone: '081-987-6543',
    address: 'โรงเรียนบ้านห้วยไคร้ ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    role: '3ผู้อำนวยการโรงเรียน (อนุมัติใบลา)',
    signatureUrl: '',
    leaveStats: { sickUsed: 1, personalUsed: 2, maternityUsed: 0, ordinationUsed: 0, wifeCareUsed: 0, militaryUsed: 0, otherUsed: 0, totalUsed: 3 }
  },
  {
    id: 'P-002',
    prefix: 'นาง',
    firstName: 'นภาพร',
    lastName: 'เกียรติวิทยา',
    position: 'ครู',
    academicStanding: 'ชำนาญการพิเศษ',
    phone: '089-123-4567',
    address: 'หมู่ 4 ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    role: '2หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)',
    signatureUrl: '',
    leaveStats: { sickUsed: 2, personalUsed: 1, maternityUsed: 0, ordinationUsed: 0, wifeCareUsed: 0, militaryUsed: 0, otherUsed: 0, totalUsed: 3 }
  },
  {
    id: 'P-003',
    prefix: 'นาย',
    firstName: 'ชัชวาลย์',
    lastName: 'ใจภักดี',
    position: 'ครู',
    academicStanding: 'ชำนาญการ',
    phone: '087-654-3210',
    address: '123 หมู่ 2 ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    role: '4ผู้ดูแลระบบ',
    signatureUrl: '',
    leaveStats: { sickUsed: 1, personalUsed: 0, maternityUsed: 0, ordinationUsed: 0, wifeCareUsed: 0, militaryUsed: 0, otherUsed: 0, totalUsed: 1 }
  },
  {
    id: 'P-004',
    prefix: 'นางสาว',
    firstName: 'ศิริพร',
    lastName: 'บุญมี',
    position: 'ครู',
    academicStanding: 'ชำนาญการ',
    phone: '084-555-8899',
    address: '45 หมู่ 1 ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    role: '1ครูผู้สอน / บุคลากรทั่วไป',
    signatureUrl: '',
    leaveStats: { sickUsed: 3, personalUsed: 1, maternityUsed: 0, ordinationUsed: 0, wifeCareUsed: 0, militaryUsed: 0, otherUsed: 0, totalUsed: 4 }
  },
  {
    id: 'P-005',
    prefix: 'นาย',
    firstName: 'สมศักดิ์',
    lastName: 'สุขเกษม',
    position: 'ครูผู้ช่วย',
    academicStanding: 'ไม่มี',
    phone: '082-333-7744',
    address: '78 หมู่ 4 ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    role: '1ครูผู้สอน / บุคลากรทั่วไป',
    signatureUrl: '',
    leaveStats: { sickUsed: 0, personalUsed: 0, maternityUsed: 0, ordinationUsed: 0, wifeCareUsed: 0, militaryUsed: 0, otherUsed: 0, totalUsed: 0 }
  }
];

const initialQuotas = [
  { leaveType: 'ลาป่วย', maxDays: 60, maxTimes: 10, description: 'ลาป่วยได้ตามที่ป่วยจริง รวมไม่เกิน 60 วันทำการต่อปีงบประมาณ', conditions: 'ลา 3 วันทำการขึ้นไปต้องมีใบรับรองแพทย์แนบ' },
  { leaveType: 'ลากิจส่วนตัว', maxDays: 45, maxTimes: 8, description: 'ลากิจส่วนตัวได้ไม่เกิน 45 วันทำการต่อปีงบประมาณ (ปีแรกบรรจุไม่เกิน 15 วัน)', conditions: 'ต้องยื่นล่วงหน้าอย่างน้อย 1 วันทำการ และได้รับอนุญาตก่อนหยุด' },
  { leaveType: 'ลาคลอดบุตร', maxDays: 90, maxTimes: 1, description: 'ลาคลอดบุตรได้ไม่เกิน 90 วันทำการ โดยไม่ต้องมีใบรับรองแพทย์', conditions: 'ได้รับเงินเดือนระหว่างลาไม่เกิน 90 วัน' },
  { leaveType: 'ลาอุปสมบทหรือไปประกอบพิธีฮัจญ์', maxDays: 120, maxTimes: 1, description: 'ไม่เกิน 120 วันทำการ (รับราชการไม่น้อยกว่า 1 ปี)', conditions: 'เสนอใบลาต่อผู้บังคับบัญชาก่อนวันอุปสมบทไม่น้อยกว่า 60 วัน' },
  { leaveType: 'ลาไปช่วยเหลือภริยาที่คลอดบุตร', maxDays: 15, maxTimes: 2, description: 'ลาไปช่วยเหลือภริยาโดยชอบด้วยกฎหมายที่คลอดบุตรได้ไม่เกิน 15 วันทำการ', conditions: 'ลาภายใน 90 วันนับแต่วันที่ภริยาคลอดบุตร' },
  { leaveType: 'ลาเข้ารับการตรวจเลือกหรือเตรียมพล', maxDays: 60, maxTimes: 2, description: 'ลาตามหมายเรียกของทางราชการทหาร', conditions: 'รายงานตัวต่อผู้บังคับบัญชาภายใน 48 ชั่วโมงนับแต่ได้รับหมาย' },
  { leaveType: 'ลาประเภทอื่น ๆ / อบรมพัฒนา', maxDays: 30, maxTimes: 5, description: 'ลาไปศึกษา ฝึกอบรม ดูงาน หรือปฏิบัติการวิจัย', conditions: 'ตามระเบียบและได้รับอนุมัติจากผู้มีอำนาจ' }
];

const initialLeaves = [
  {
    id: 'ลร.01/2569',
    personnelId: 'P-004',
    requesterName: 'นางสาวศิริพร บุญมี',
    requesterPosition: 'ครู',
    requesterAcademicStanding: 'ชำนาญการ',
    leaveType: 'ลาป่วย',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
    isHalfDay: false,
    halfDayType: 'full',
    totalDays: 2,
    reason: 'มีอาการไข้หวัด ไอ เจ็บคอ แพทย์แนะนำให้พักผ่อน',
    contactAddress: '45 หมู่ 1 ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    contactPhone: '084-555-8899',
    requesterSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 25 Q30 5 60 25 T90 20" stroke="%230284c7" stroke-width="2" fill="none"/></svg>',
    status: 'approved',
    academicApproval: {
      approved: true,
      approverName: 'นางนภาพร เกียรติวิทยา',
      approverRole: 'หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)',
      comment: 'เห็นควรอนุญาต จัดสอนชดเชยเรียบร้อย',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M5 20 Q40 5 80 30" stroke="%2316a34a" stroke-width="2" fill="none"/></svg>',
      date: '2026-10-05 08:30'
    },
    directorApproval: {
      approved: true,
      approverName: 'นายพิเชษฐ์ ยั่งยืน',
      approverRole: 'ผู้อำนวยการโรงเรียน (อนุมัติใบลา)',
      comment: 'อนุมัติการลาตามระเบียบ',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 30 C30 10 70 35 95 15" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
      date: '2026-10-05 09:00'
    },
    createdAt: '2026-10-05 08:00',
    updatedAt: '2026-10-05 09:00'
  },
  {
    id: 'ลร.02/2569',
    personnelId: 'P-001',
    requesterName: 'นายพิเชษฐ์ ยั่งยืน',
    requesterPosition: 'ผู้อำนวยการโรงเรียน',
    requesterAcademicStanding: 'ชำนาญการพิเศษ',
    leaveType: 'ลากิจส่วนตัว',
    startDate: '2026-10-08',
    endDate: '2026-10-09',
    isHalfDay: false,
    halfDayType: 'full',
    totalDays: 2,
    reason: 'มีธุระส่วนตัวจำเป็นเกี่ยวกับการจัดการมรดกครอบครัว',
    contactAddress: 'ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    contactPhone: '081-987-6543',
    requesterSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 30 C30 10 70 35 95 15" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
    status: 'approved',
    academicApproval: {
      approved: true,
      approverName: 'นางนภาพร เกียรติวิทยา',
      approverRole: 'หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)',
      comment: 'รับทราบ มอบหมายรองฯ รักษาราชการแทน',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M5 20 Q40 5 80 30" stroke="%2316a34a" stroke-width="2" fill="none"/></svg>',
      date: '2026-10-07 15:00'
    },
    directorApproval: {
      approved: true,
      approverName: 'นายพิเชษฐ์ ยั่งยืน',
      approverRole: 'ผู้อำนวยการโรงเรียน (อนุมัติใบลา)',
      comment: 'อนุมัติ',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 30 C30 10 70 35 95 15" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
      date: '2026-10-07 16:00'
    },
    createdAt: '2026-10-07 14:00',
    updatedAt: '2026-10-07 16:00'
  },
  {
    id: 'ลร.03/2569',
    personnelId: 'P-002',
    requesterName: 'นางนภาพร เกียรติวิทยา',
    requesterPosition: 'ครู',
    requesterAcademicStanding: 'ชำนาญการพิเศษ',
    leaveType: 'ลาป่วย',
    startDate: '2026-10-12',
    endDate: '2026-10-12',
    isHalfDay: true,
    halfDayType: 'morning',
    totalDays: 0.5,
    reason: 'พบแพทย์ตามนัดเพื่อตรวจสุขภาพประจำปี',
    contactAddress: 'รพ.ทุ่งเสลี่ยม จ.สุโขทัย',
    contactPhone: '089-123-4567',
    requesterSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M5 20 Q40 5 80 30" stroke="%2316a34a" stroke-width="2" fill="none"/></svg>',
    status: 'approved',
    academicApproval: {
      approved: true,
      approverName: 'นางนภาพร เกียรติวิทยา',
      approverRole: 'หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)',
      comment: 'สลับคาบสอนเรียบร้อย',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M5 20 Q40 5 80 30" stroke="%2316a34a" stroke-width="2" fill="none"/></svg>',
      date: '2026-10-11 10:00'
    },
    directorApproval: {
      approved: true,
      approverName: 'นายพิเชษฐ์ ยั่งยืน',
      approverRole: 'ผู้อำนวยการโรงเรียน (อนุมัติใบลา)',
      comment: 'อนุญาต',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 30 C30 10 70 35 95 15" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
      date: '2026-10-11 11:00'
    },
    createdAt: '2026-10-11 09:30',
    updatedAt: '2026-10-11 11:00'
  },
  {
    id: 'ลร.04/2570',
    personnelId: 'P-003',
    requesterName: 'นายชัชวาลย์ ใจภักดี',
    requesterPosition: 'ครู',
    requesterAcademicStanding: 'ชำนาญการ',
    leaveType: 'ลาป่วย',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    isHalfDay: false,
    halfDayType: 'full',
    totalDays: 1,
    reason: 'มีอาการป่วยเป็นไข้หวัดเจ็บคอ',
    contactAddress: '123 หมู่ 2 ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย',
    contactPhone: '087-654-3210',
    requesterSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 20 Q50 35 90 10" stroke="%236366f1" stroke-width="2" fill="none"/></svg>',
    status: 'pending',
    academicApproval: null,
    directorApproval: null,
    createdAt: '2026-10-15 07:00',
    updatedAt: '2026-10-15 07:00'
  }
];

const initialSettings = {
  schoolName: 'โรงเรียนบ้านห้วยไคร้',
  jurisdiction: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2',
  phone: '055-681-234',
  address: 'หมู่ที่ 4 ตำบลห้วยไคร้ อำเภอทุ่งเสลี่ยม จังหวัดสุโขทัย 64150',
  directorName: 'นายพิเชษฐ์ ยั่งยืน',
  academicHeadName: 'นางนภาพร เกียรติวิทยา',
  adminName: 'นายชัชวาลย์ ใจภักดี',
  lineNotifyEnabled: true,
  quotas: initialQuotas,
  lastSyncedAt: new Date().toISOString()
};

// Database storage helpers
interface DatabaseStructure {
  personnel: typeof initialPersonnel;
  leaves: typeof initialLeaves;
  settings: typeof initialSettings;
  backups: { id: string; timestamp: string; note: string; recordCount: number }[];
}

function loadDB(): DatabaseStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
  }
  const defaultDB: DatabaseStructure = {
    personnel: initialPersonnel,
    leaves: initialLeaves,
    settings: initialSettings,
    backups: []
  };
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(db: DatabaseStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB_FILE:', err);
  }
}

// Automatic backup creation (e.g. daily/on major action)
function createBackup(db: DatabaseStructure, note: string) {
  try {
    const timestamp = new Date().toISOString();
    const backupId = `backup_${Date.now()}`;
    const backupFilePath = path.join(BACKUP_DIR, `${backupId}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify(db, null, 2), 'utf-8');
    db.backups.unshift({
      id: backupId,
      timestamp,
      note,
      recordCount: db.leaves.length
    });
    // Keep max 15 backups
    if (db.backups.length > 15) {
      const removed = db.backups.pop();
      if (removed) {
        const oldFile = path.join(BACKUP_DIR, `${removed.id}.json`);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
    }
    saveDB(db);
  } catch (err) {
    console.error('Backup creation error:', err);
  }
}

// LINE Push Notification Helper
async function sendLineNotification(messageText: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: LINE_GROUP_ID,
        messages: [
          {
            type: 'text',
            text: messageText
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('LINE API Warning/Error:', response.status, errorText);
      return { success: false, error: `LINE API status ${response.status}: ${errorText}` };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('LINE Notification network error:', err.message);
    return { success: false, error: err.message };
  }
}

// Google Sheets Sync Helper using WEB_APP_URL
async function syncToGoogleSheets(leaves: any[], personnel: any[]): Promise<{ success: boolean; message: string }> {
  const targetUrl = config.WEB_APP_URL;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, message: 'Google Apps Script WEB_APP_URL is not configured' };
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'syncAll',
        sheetId: config.SHEET_ID,
        leaves,
        personnel
      })
    });

    const result = await response.json();
    return { success: true, message: result.message || 'Synced successfully' };
  } catch (err: any) {
    console.warn('Google Sheets sync notice:', err.message);
    return { success: false, message: err.message };
  }
}

// Format Thai Date string for messages
function formatThaiDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

// Initialize Express
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure database is initialized
let db = loadDB();
if (!db.backups || db.backups.length === 0) {
  createBackup(db, 'Initial system backup');
}

// API Routes

// 1. Auth / Verification
app.post('/api/auth/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (String(pin).trim() === config.ADMIN_PASSWORD) {
    return res.json({ success: true, authorized: true });
  }
  return res.status(401).json({ success: false, authorized: false, message: 'รหัสผ่านไม่ถูกต้อง (PIN 4 หลัก)' });
});

// 2. Personnel
app.get('/api/personnel', (req, res) => {
  db = loadDB();
  res.json({ success: true, personnel: db.personnel });
});

app.post('/api/personnel', async (req, res) => {
  db = loadDB();
  const newStaff = {
    ...req.body,
    id: req.body.id || `P-${String(db.personnel.length + 1).padStart(3, '0')}`,
    leaveStats: req.body.leaveStats || {
      sickUsed: 0,
      personalUsed: 0,
      maternityUsed: 0,
      ordinationUsed: 0,
      wifeCareUsed: 0,
      militaryUsed: 0,
      otherUsed: 0,
      totalUsed: 0
    }
  };

  db.personnel.push(newStaff);
  saveDB(db);

  // Sync with sheets in background
  syncToGoogleSheets(db.leaves, db.personnel).catch(() => {});

  res.json({ success: true, personnel: newStaff });
});

app.put('/api/personnel/:id', (req, res) => {
  db = loadDB();
  const idx = db.personnel.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบบุคลากร' });
  }

  db.personnel[idx] = {
    ...db.personnel[idx],
    ...req.body
  };
  saveDB(db);
  syncToGoogleSheets(db.leaves, db.personnel).catch(() => {});
  res.json({ success: true, personnel: db.personnel[idx] });
});

app.delete('/api/personnel/:id', (req, res) => {
  db = loadDB();
  const idx = db.personnel.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบบุคลากร' });
  }
  db.personnel.splice(idx, 1);
  saveDB(db);
  res.json({ success: true });
});

// 3. Leaves
app.get('/api/leaves', (req, res) => {
  db = loadDB();
  res.json({ success: true, leaves: db.leaves });
});

app.post('/api/leaves', async (req, res) => {
  db = loadDB();
  const leaveData = req.body;

  // Generate ID e.g. ลร.05/2570
  const currentYearBE = new Date().getFullYear() + 543;
  const count = db.leaves.length + 1;
  const leaveId = leaveData.id || `ลร.${String(count).padStart(2, '0')}/${currentYearBE}`;

  const newLeave = {
    ...leaveData,
    id: leaveId,
    status: 'pending',
    academicApproval: null,
    directorApproval: null,
    createdAt: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
    updatedAt: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
  };

  db.leaves.unshift(newLeave);

  // Update requester's used statistics
  const staff = db.personnel.find(p => p.id === newLeave.personnelId);
  if (staff) {
    const days = Number(newLeave.totalDays) || 0;
    if (newLeave.leaveType === 'ลาป่วย') staff.leaveStats.sickUsed += days;
    else if (newLeave.leaveType === 'ลากิจส่วนตัว') staff.leaveStats.personalUsed += days;
    else if (newLeave.leaveType === 'ลาคลอดบุตร') staff.leaveStats.maternityUsed += days;
    else if (newLeave.leaveType === 'ลาอุปสมบทหรือไปประกอบพิธีฮัจญ์') staff.leaveStats.ordinationUsed += days;
    else if (newLeave.leaveType === 'ลาไปช่วยเหลือภริยาที่คลอดบุตร') staff.leaveStats.wifeCareUsed += days;
    else if (newLeave.leaveType === 'ลาเข้ารับการตรวจเลือกหรือเตรียมพล') staff.leaveStats.militaryUsed += days;
    else staff.leaveStats.otherUsed += days;

    staff.leaveStats.totalUsed += days;
  }

  saveDB(db);

  // Send LINE Notification
  if (db.settings.lineNotifyEnabled) {
    const dateDisplay = newLeave.startDate === newLeave.endDate 
      ? `${formatThaiDate(newLeave.startDate)} (${newLeave.totalDays} วันทำการ)`
      : `${formatThaiDate(newLeave.startDate)} ถึง ${formatThaiDate(newLeave.endDate)} (${newLeave.totalDays} วันทำการ)`;

    const lineMessage = `🔔 แจ้งเตือนบันทึกคำขอลาออนไลน์
โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2
━━━━━━━━━━━━━━━━━━━━
📋 เลขที่คำขอ: ${newLeave.id}
👤 ผู้ขอลา: ${newLeave.requesterName}
💼 ตำแหน่ง: ${newLeave.requesterPosition} ${newLeave.requesterAcademicStanding || ''}
📌 ประเภทการลา: ${newLeave.leaveType}
📅 วันที่ลา: ${dateDisplay}
📝 เหตุผล: ${newLeave.reason}
📞 เบอร์โทรติดต่อ: ${newLeave.contactPhone}`;

    sendLineNotification(lineMessage).catch(err => console.error(err));
  }

  // Google Sheets sync
  syncToGoogleSheets(db.leaves, db.personnel).catch(() => {});

  res.json({ success: true, leave: newLeave });
});

// Approve Leave
app.put('/api/leaves/:id/approve', async (req, res) => {
  db = loadDB();
  const { id } = req.params;
  const { roleType, approverName, comment, signature, approved } = req.body;

  const leaveIndex = db.leaves.findIndex(l => l.id === id);
  if (leaveIndex === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบรายการใบลา' });
  }

  const leave = db.leaves[leaveIndex];
  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

  const approvalRecord = {
    approved: Boolean(approved),
    approverName,
    approverRole: roleType,
    comment: comment || (approved ? 'เห็นควรอนุญาต/อนุมัติ' : 'ไม่อนุมัติ'),
    signature,
    date: now
  };

  // Rule: "หัวหน้าวิชาการหรือผู้อำนวยการโรงเรียนใครอนุมัติก่อนก็ได้ เมือกดอนุมัติมีการแนบลายเซ็น"
  if (roleType.includes('วิชาการ')) {
    leave.academicApproval = approvalRecord;
  } else if (roleType.includes('ผู้อำนวยการ') || roleType.includes('ผู้ดูแลระบบ')) {
    leave.directorApproval = approvalRecord;
  }

  // Determine overall status
  if (!approved) {
    leave.status = 'rejected';
  } else if (leave.directorApproval?.approved) {
    // If director approved, it is officially fully approved
    leave.status = 'approved';
  } else if (leave.academicApproval?.approved) {
    // Academic head approved first
    leave.status = 'academic_approved';
  }

  leave.updatedAt = now;
  db.leaves[leaveIndex] = leave;
  saveDB(db);

  // Send LINE Notification for Approval
  if (db.settings.lineNotifyEnabled) {
    const statusText = leave.status === 'approved' 
      ? 'อนุมัติเรียบร้อยแล้ว' 
      : leave.status === 'academic_approved' 
        ? 'ผ่านการตรวจเห็นชอบโดยหัวหน้าวิชาการแล้ว' 
        : 'ไม่อนุมัติ';

    const dateDisplay = leave.startDate === leave.endDate 
      ? `${formatThaiDate(leave.startDate)} (${leave.totalDays} วันทำการ)`
      : `${formatThaiDate(leave.startDate)} ถึง ${formatThaiDate(leave.endDate)} (${leave.totalDays} วันทำการ)`;

    const lineMessage = `✅ แจ้งเตือนการพิจารณาคำขอลา
โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2
━━━━━━━━━━━━━━━━━━━━
📋 เลขที่คำขอ: ${leave.id}
👤 ผู้ขอลา: ${leave.requesterName}
📌 ประเภทการลา: ${leave.leaveType}
📅 วันที่ลา: ${dateDisplay}
✍️ ผู้พิจารณา: ${approverName} (${roleType.replace(/^\d/, '')})
📊 สถานะ: ${statusText}
💬 ความเห็น: ${approvalRecord.comment}`;

    sendLineNotification(lineMessage).catch(err => console.error(err));
  }

  syncToGoogleSheets(db.leaves, db.personnel).catch(() => {});

  res.json({ success: true, leave });
});

// Delete Leave
app.delete('/api/leaves/:id', (req, res) => {
  db = loadDB();
  const idx = db.leaves.findIndex(l => l.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบรายการใบลา' });
  }
  db.leaves.splice(idx, 1);
  saveDB(db);
  res.json({ success: true });
});

// 4. Settings & Quotas
app.get('/api/settings', (req, res) => {
  db = loadDB();
  // Never send raw admin password to client
  res.json({
    success: true,
    settings: {
      ...db.settings,
      lineTokenMasked: '6MKd...ilFU=',
      lineGroupId: LINE_GROUP_ID,
      sheetIdMasked: config.SHEET_ID.slice(0, 5) + '...' + config.SHEET_ID.slice(-5),
      webAppConfigured: Boolean(config.WEB_APP_URL),
      backupCount: db.backups.length
    }
  });
});

app.put('/api/settings', (req, res) => {
  db = loadDB();
  db.settings = {
    ...db.settings,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveDB(db);
  res.json({ success: true, settings: db.settings });
});

// Test LINE notification
app.post('/api/line/test', async (req, res) => {
  const testMsg = `🔔 ทดสอบการเชื่อมต่อระบบแจ้งเตือน LINE
โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2
━━━━━━━━━━━━━━━━━━━━
ระบบสามารถส่งการแจ้งเตือนคำขอลาออนไลน์เข้ากลุ่ม LINE ได้อย่างสมบูรณ์
เวลาทดสอบ: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;

  const result = await sendLineNotification(testMsg);
  res.json(result);
});

// Sync to Google Sheets
app.post('/api/sync-sheets', async (req, res) => {
  db = loadDB();
  const result = await syncToGoogleSheets(db.leaves, db.personnel);
  db.settings.lastSyncedAt = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  saveDB(db);
  res.json(result);
});

// Reset all leaves (Admin/Director feature with password)
app.post('/api/admin/reset-leaves', (req, res) => {
  const { pin } = req.body;
  if (String(pin).trim() !== config.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง (PIN 4 หลัก)' });
  }

  db = loadDB();
  // Create backup before wiping
  createBackup(db, 'Backup before resetting all leaves');

  // Clear all leave records
  db.leaves = [];

  // Reset all staff leave stats to 0
  db.personnel.forEach(staff => {
    staff.leaveStats = {
      sickUsed: 0,
      personalUsed: 0,
      maternityUsed: 0,
      ordinationUsed: 0,
      wifeCareUsed: 0,
      militaryUsed: 0,
      otherUsed: 0,
      totalUsed: 0
    };
  });

  saveDB(db);

  // Sync reset to Google Sheets
  syncToGoogleSheets(db.leaves, db.personnel).catch(() => {});

  res.json({
    success: true,
    message: 'รีเซ็ตข้อมูลวันลาและสถิติการลาทั้งหมดเรียบร้อยแล้ว โควตาวันลากลับคืนเต็มจำนวน'
  });
});

// Backups API
app.get('/api/backups', (req, res) => {
  db = loadDB();
  res.json({ success: true, backups: db.backups });
});

app.post('/api/backups/create', (req, res) => {
  const { note } = req.body;
  db = loadDB();
  createBackup(db, note || 'Manual safe backup snapshot');
  res.json({ success: true, message: 'สำรองข้อมูลเรียบร้อยแล้ว' });
});

app.post('/api/backups/restore', (req, res) => {
  const { backupId, pin } = req.body;
  if (String(pin).trim() !== config.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
  }

  const backupFile = path.join(BACKUP_DIR, `${backupId}.json`);
  if (!fs.existsSync(backupFile)) {
    return res.status(404).json({ success: false, message: 'ไม่พบไฟล์สำรองข้อมูล' });
  }

  try {
    const backupContent = fs.readFileSync(backupFile, 'utf-8');
    const restoredDB = JSON.parse(backupContent);
    db = restoredDB;
    saveDB(db);
    res.json({ success: true, message: 'กู้คืนข้อมูลสำเร็จ' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Dynamic import vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (http://localhost:${PORT})`);
  });
}

startServer();
