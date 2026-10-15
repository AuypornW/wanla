export type RoleType = 
  | '1ครูผู้สอน / บุคลากรทั่วไป'
  | '2หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)'
  | '3ผู้อำนวยการโรงเรียน (อนุมัติใบลา)'
  | '4ผู้ดูแลระบบ';

export type LeaveType = 
  | 'ลาป่วย'
  | 'ลากิจส่วนตัว'
  | 'ลาคลอดบุตร'
  | 'ลาอุปสมบทหรือไปประกอบพิธีฮัจญ์'
  | 'ลาไปช่วยเหลือภริยาที่คลอดบุตร'
  | 'ลาเข้ารับการตรวจเลือกหรือเตรียมพล'
  | 'ลาประเภทอื่น ๆ / อบรมพัฒนา';

export type LeaveStatus = 'pending' | 'academic_approved' | 'director_approved' | 'approved' | 'rejected';

export interface LeaveStats {
  sickUsed: number;
  personalUsed: number;
  maternityUsed: number;
  ordinationUsed: number;
  wifeCareUsed: number;
  militaryUsed: number;
  otherUsed: number;
  totalUsed: number;
}

export interface Personnel {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  academicStanding: string;
  phone: string;
  address: string;
  role: RoleType;
  signatureUrl?: string;
  leaveStats: LeaveStats;
}

export interface ApprovalRecord {
  approved: boolean;
  approverName: string;
  approverRole: string;
  comment: string;
  signature: string;
  date: string;
}

export interface LeaveRequest {
  id: string;
  personnelId: string;
  requesterName: string;
  requesterPosition: string;
  requesterAcademicStanding: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayType?: 'morning' | 'afternoon' | 'full';
  totalDays: number;
  reason: string;
  contactAddress: string;
  contactPhone: string;
  requesterSignature: string;
  status: LeaveStatus;
  academicApproval?: ApprovalRecord | null;
  directorApproval?: ApprovalRecord | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotaSetting {
  leaveType: LeaveType;
  maxDays: number;
  maxTimes: number;
  description: string;
  conditions: string;
}

export interface SchoolSettings {
  schoolName: string;
  jurisdiction: string;
  phone: string;
  address: string;
  directorName: string;
  academicHeadName: string;
  adminName: string;
  lineNotifyEnabled: boolean;
  lineTokenMasked?: string;
  lineGroupId?: string;
  quotas: QuotaSetting[];
  lastSyncedAt?: string;
  backupCount?: number;
}
