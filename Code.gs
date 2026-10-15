const SHEET_ID = "1B2Ak8GlFJAjOLs9IJwoRX2-ZoSTDHbtMr5wRo6z5TIE";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwDZC4JzpZ2Lu98vWl41jCd76eXRxtZXaJHyGXdz8p-C-vFMrvnah-zXdrA6U70JMss/exec";
const FOLDER_ID = "1GsXRxJGCvwtD0MLnmR1m3RwIaWhncPLt";
const ADMIN_PASSWORD = "1234";

/**
 * Google Apps Script for Online Leave Management System
 * โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2
 * 
 * Instructions:
 * 1. Open Google Sheets with ID: SHEET_ID
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code and deploy as Web App (Execute as: Me, Access: Anyone)
 */

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
    const ss = SpreadsheetApp.openById(SHEET_ID.trim());

    if (action === 'ping') {
      return jsonResponse({ status: 'success', message: 'Connected to โรงเรียนบ้านห้วยไคร้ Sheets API' });
    }

    if (action === 'getData') {
      const leavesSheet = getOrCreateSheet(ss, 'Leaves');
      const personnelSheet = getOrCreateSheet(ss, 'Personnel');
      const leavesData = sheetToObjects(leavesSheet);
      const personnelData = sheetToObjects(personnelSheet);
      return jsonResponse({ status: 'success', leaves: leavesData, personnel: personnelData });
    }

    return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : '';
    const data = JSON.parse(rawData || '{}');
    const action = data.action || 'sync';
    const ss = SpreadsheetApp.openById(SHEET_ID.trim());

    if (action === 'verifyPassword') {
      if (String(data.password).trim() === ADMIN_PASSWORD) {
        return jsonResponse({ status: 'success', authorized: true });
      } else {
        return jsonResponse({ status: 'error', authorized: false, message: 'Invalid password' });
      }
    }

    if (action === 'saveLeave') {
      const sheet = getOrCreateSheet(ss, 'Leaves');
      const row = [
        data.id || ('ลร.' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss')),
        data.requesterName || '',
        data.requesterPosition || '',
        data.leaveType || '',
        data.startDate || '',
        data.endDate || '',
        data.totalDays || 0,
        data.reason || '',
        data.contactPhone || '',
        data.status || 'pending',
        data.academicApproval ? 'approved' : 'pending',
        data.directorApproval ? 'approved' : 'pending',
        new Date().toISOString()
      ];
      sheet.appendRow(row);
      return jsonResponse({ status: 'success', message: 'Saved to Google Sheets', id: row[0] });
    }

    if (action === 'syncAll') {
      if (data.leaves && Array.isArray(data.leaves)) {
        const sheet = getOrCreateSheet(ss, 'Leaves');
        sheet.clearContents();
        sheet.appendRow([
          'เลขที่คำขอ', 'ผู้ขอลา', 'ตำแหน่ง', 'ประเภทการลา', 'เริ่มวันที่', 'ถึงวันที่',
          'จำนวนวัน', 'เหตุผล', 'เบอร์ติดต่อ', 'สถานะ', 'หน.วิชาการ', 'ผอ.', 'บันทึกเวลา'
        ]);
        data.leaves.forEach(function(l) {
          sheet.appendRow([
            l.id, l.requesterName, l.requesterPosition, l.leaveType, l.startDate, l.endDate,
            l.totalDays, l.reason, l.contactPhone, l.status,
            l.academicApproval?.approved ? 'อนุมัติ' : 'รอพิจารณา',
            l.directorApproval?.approved ? 'อนุมัติ' : 'รอพิจารณา',
            l.createdAt || new Date().toISOString()
          ]);
        });
      }

      if (data.personnel && Array.isArray(data.personnel)) {
        const pSheet = getOrCreateSheet(ss, 'Personnel');
        pSheet.clearContents();
        pSheet.appendRow([
          'รหัส', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'ตำแหน่ง', 'วิทยฐานะ', 'เบอร์โทร', 'บทบาท', 'วันลาสะสมใช้ไป'
        ]);
        data.personnel.forEach(function(p) {
          pSheet.appendRow([
            p.id, p.prefix, p.firstName, p.lastName, p.position, p.academicStanding,
            p.phone, p.role, p.leaveStats?.totalUsed || 0
          ]);
        });
      }

      return jsonResponse({ status: 'success', message: 'Synced all records successfully' });
    }

    if (action === 'resetAllLeaves') {
      if (String(data.password).trim() !== ADMIN_PASSWORD) {
        return jsonResponse({ status: 'error', message: 'Unauthorized' });
      }
      const sheet = getOrCreateSheet(ss, 'Leaves');
      sheet.clearContents();
      sheet.appendRow([
        'เลขที่คำขอ', 'ผู้ขอลา', 'ตำแหน่ง', 'ประเภทการลา', 'เริ่มวันที่', 'ถึงวันที่',
        'จำนวนวัน', 'เหตุผล', 'เบอร์ติดต่อ', 'สถานะ', 'หน.วิชาการ', 'ผอ.', 'บันทึกเวลา'
      ]);
      return jsonResponse({ status: 'success', message: 'Reset all leaves on Google Sheets' });
    }

    return jsonResponse({ status: 'error', message: 'Unknown post action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
