import { LeaveRequest } from '../types';
import { formatThaiDate } from './thaiDate';

export function exportLeavesToExcel(leaves: LeaveRequest[], filename = 'ประวัติการลา_โรงเรียนบ้านห้วยไคร้.csv') {
  const headers = [
    'เลขที่คำขอ',
    'ผู้ขอลา',
    'ตำแหน่ง',
    'วิทยฐานะ',
    'ประเภทการลา',
    'ตั้งแต่วันที่',
    'ถึงวันที่',
    'จำนวนวันทำการ',
    'เหตุผลความจำเป็น',
    'สถานที่ติดต่อ',
    'เบอร์โทรศัพท์',
    'สถานะ',
    'การตรวจของหัวหน้าวิชาการ',
    'ความเห็นหัวหน้าวิชาการ',
    'การอนุมัติของผู้อำนวยการ',
    'ความเห็นผู้อำนวยการ',
    'วันที่ยื่นคำขอ'
  ];

  const statusLabel = (s: string) => {
    switch (s) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'academic_approved': return 'หัวหน้าวิชาการตรวจแล้ว';
      case 'rejected': return 'ไม่อนุมัติ';
      default: return 'รอพิจารณา';
    }
  };

  const rows = leaves.map(l => [
    `"${l.id}"`,
    `"${l.requesterName}"`,
    `"${l.requesterPosition}"`,
    `"${l.requesterAcademicStanding || '-'}"`,
    `"${l.leaveType}"`,
    `"${formatThaiDate(l.startDate)}"`,
    `"${formatThaiDate(l.endDate)}"`,
    `"${l.totalDays}"`,
    `"${(l.reason || '').replace(/"/g, '""')}"`,
    `"${(l.contactAddress || '').replace(/"/g, '""')}"`,
    `"${l.contactPhone || ''}"`,
    `"${statusLabel(l.status)}"`,
    `"${l.academicApproval?.approved ? 'ผ่านการตรวจสอบ' : '-'}"`,
    `"${(l.academicApproval?.comment || '').replace(/"/g, '""')}"`,
    `"${l.directorApproval?.approved ? 'อนุมัติแล้ว' : '-'}"`,
    `"${(l.directorApproval?.comment || '').replace(/"/g, '""')}"`,
    `"${l.createdAt || '-'}"`
  ]);

  // UTF-8 BOM \uFEFF ensures Thai characters render perfectly in Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
