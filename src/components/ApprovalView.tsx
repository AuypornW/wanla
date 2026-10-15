import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldAlert,
  Clock,
  XCircle,
  FileText,
  UserCheck,
  Send,
  X,
  AlertCircle,
  Check,
  Eye
} from 'lucide-react';
import { LeaveRequest, Personnel } from '../types';
import { formatThaiDate } from '../utils/thaiDate';
import { SignaturePad } from './SignaturePad';

interface ApprovalViewProps {
  leaves: LeaveRequest[];
  personnelList: Personnel[];
  currentUser: Personnel | null;
  onApproveLeave: (
    leaveId: string,
    roleType: string,
    approverName: string,
    comment: string,
    signature: string,
    approved: boolean
  ) => Promise<boolean>;
  onVerifyPin: (pin: string) => Promise<boolean>;
  isPinUnlocked: boolean;
  setIsPinUnlocked: (unlocked: boolean) => void;
}

export const ApprovalView: React.FC<ApprovalViewProps> = ({
  leaves,
  personnelList,
  currentUser,
  onApproveLeave,
  onVerifyPin,
  isPinUnlocked,
  setIsPinUnlocked
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Tab filter
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [approverRole, setApproverRole] = useState<'academic' | 'director'>('director');
  const [approverName, setApproverName] = useState('');
  const [comment, setComment] = useState('เห็นควรอนุญาต / อนุมัติการลาตามระเบียบ');
  const [signature, setSignature] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalError, setApprovalError] = useState('');

  // Handle PIN verification
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsVerifying(true);
    const valid = await onVerifyPin(pinInput);
    setIsVerifying(false);
    if (valid) {
      setIsPinUnlocked(true);
      setPinInput('');
    } else {
      setPinError('รหัสผ่านไม่ถูกต้อง (กรุณาใส่รหัส 1234)');
    }
  };

  // Open Approval Modal
  const openApprovalModal = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setApprovalError('');

    // Pre-populate approver details based on currentUser or school executives
    if (currentUser?.role.includes('วิชาการ')) {
      setApproverRole('academic');
      setApproverName(`${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`);
      setComment('ตรวจสอบแล้ว ถูกต้องตามระเบียบ เห็นควรอนุญาต');
      setSignature(currentUser.signatureUrl || '');
    } else if (currentUser?.role.includes('ผู้อำนวยการ')) {
      setApproverRole('director');
      setApproverName(`${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`);
      setComment('อนุมัติการลาตามระเบียบ');
      setSignature(currentUser.signatureUrl || '');
    } else {
      // Admin or other: default to Director
      const dir = personnelList.find(p => p.role.includes('ผู้อำนวยการ'));
      setApproverRole('director');
      setApproverName(dir ? `${dir.prefix}${dir.firstName} ${dir.lastName}` : 'นายพิเชษฐ์ ยั่งยืน');
      setComment('อนุมัติการลาตามระเบียบ');
      setSignature(dir?.signatureUrl || '');
    }
  };

  const handleRoleChange = (role: 'academic' | 'director') => {
    setApproverRole(role);
    if (role === 'academic') {
      const acad = personnelList.find(p => p.role.includes('วิชาการ'));
      setApproverName(acad ? `${acad.prefix}${acad.firstName} ${acad.lastName}` : 'นางนภาพร เกียรติวิทยา');
      setComment('ตรวจสอบแล้ว ถูกต้องตามระเบียบ เห็นควรอนุญาต');
      setSignature(acad?.signatureUrl || '');
    } else {
      const dir = personnelList.find(p => p.role.includes('ผู้อำนวยการ'));
      setApproverName(dir ? `${dir.prefix}${dir.firstName} ${dir.lastName}` : 'นายพิเชษฐ์ ยั่งยืน');
      setComment('อนุมัติการลาตามระเบียบ');
      setSignature(dir?.signatureUrl || '');
    }
  };

  const submitDecision = async (approved: boolean) => {
    if (!selectedLeave) return;
    if (!approverName.trim()) {
      setApprovalError('กรุณาระบุชื่อผู้พิจารณา');
      return;
    }
    if (!signature) {
      setApprovalError('กรุณาลงลายมือชื่ออิเล็กทรอนิกส์ผู้พิจารณา');
      return;
    }

    setIsSubmittingApproval(true);
    setApprovalError('');

    const roleString = approverRole === 'academic'
      ? 'หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)'
      : 'ผู้อำนวยการโรงเรียน (อนุมัติใบลา)';

    const success = await onApproveLeave(
      selectedLeave.id,
      roleString,
      approverName,
      comment,
      signature,
      approved
    );

    setIsSubmittingApproval(false);
    if (success) {
      setSelectedLeave(null);
    } else {
      setApprovalError('เกิดข้อผิดพลาดในการบันทึกผลการพิจารณา');
    }
  };

  // If not unlocked, render PIN screen
  if (!isPinUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          พื้นที่เฉพาะผู้บริหารและผู้ตรวจใบลา
        </h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          เข้าเมนูนี้ได้เฉพาะ หัวหน้าวิชาการ, ผู้อำนวยการโรงเรียน และผู้ดูแลระบบ กรุณาใส่รหัสผ่าน 4 หลัก เพื่อปลดล็อก (1234)
        </p>

        {pinError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={8}
              autoFocus
              placeholder="กรอกรหัสผ่าน 4 หลัก (1234)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-xl tracking-widest font-mono py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            {isVerifying ? 'กำลังตรวจสอบ...' : 'เข้าสู่เมนูการอนุมัติ'}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 mt-6">
          ระบบความปลอดภัย โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2
        </p>
      </div>
    );
  }

  // Filter leaves
  const filteredLeaves = leaves.filter(l => {
    if (filterTab === 'pending') return l.status === 'pending' || l.status === 'academic_approved';
    if (filterTab === 'approved') return l.status === 'approved';
    if (filterTab === 'rejected') return l.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแล้ว
          </span>
        );
      case 'academic_approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" /> หน.วิชาการตรวจแล้ว
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> ไม่อนุมัติ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> รอการพิจารณา
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            ระบบพิจารณาและอนุมัติคำขอลา
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            การตรวจและอนุมัติใบลาออนไลน์
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            หัวหน้าวิชาการหรือผู้อำนวยการโรงเรียนใครอนุมัติก่อนก็ได้ เมื่ออนุมัติจะแนบลายเซ็นและส่งแจ้งเตือนเข้า LINE ทันที
          </p>
        </div>

        <button
          onClick={() => setIsPinUnlocked(false)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer shrink-0"
        >
          ล็อกหน้าจอ (Lock)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setFilterTab('pending')}
          className={`pb-3 px-2 transition border-b-2 cursor-pointer ${
            filterTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          รอพิจารณา ({leaves.filter(l => l.status === 'pending' || l.status === 'academic_approved').length})
        </button>
        <button
          onClick={() => setFilterTab('approved')}
          className={`pb-3 px-2 transition border-b-2 cursor-pointer ${
            filterTab === 'approved'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          อนุมัติแล้ว ({leaves.filter(l => l.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilterTab('rejected')}
          className={`pb-3 px-2 transition border-b-2 cursor-pointer ${
            filterTab === 'rejected'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ไม่อนุมัติ ({leaves.filter(l => l.status === 'rejected').length})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`pb-3 px-2 transition border-b-2 cursor-pointer ${
            filterTab === 'all'
              ? 'border-slate-800 text-slate-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ทั้งหมด ({leaves.length})
        </button>
      </div>

      {/* Leaves List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-slate-600 font-medium text-sm">ไม่มีรายการคำขอลาในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    {leave.id}
                  </span>
                  <span className="font-bold text-slate-900 text-base">
                    {leave.requesterName}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({leave.requesterPosition} {leave.requesterAcademicStanding !== 'ไม่มี' && leave.requesterAcademicStanding})
                  </span>
                  <div>{getStatusBadge(leave.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="font-semibold text-slate-700">ประเภทการลา: </span>
                    <span className="text-blue-700 font-medium">{leave.leaveType}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">ช่วงวันที่: </span>
                    <span>
                      {leave.startDate === leave.endDate
                        ? formatThaiDate(leave.startDate)
                        : `${formatThaiDate(leave.startDate)} - ${formatThaiDate(leave.endDate)}`}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">จำนวน: </span>
                    <span className="font-bold text-slate-800">{leave.totalDays} วันทำการ</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700">เหตุผลความจำเป็น: </span>
                  <span>{leave.reason}</span>
                </div>

                {/* Display existing approvals */}
                <div className="flex flex-wrap gap-3 pt-2 text-[11px]">
                  {leave.academicApproval && (
                    <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <div>
                        <span className="font-semibold text-blue-900">หน.วิชาการ ({leave.academicApproval.approverName}):</span>{' '}
                        <span className="text-blue-800">{leave.academicApproval.comment}</span>
                      </div>
                    </div>
                  )}

                  {leave.directorApproval && (
                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      <div>
                        <span className="font-semibold text-emerald-900">ผู้อำนวยการ ({leave.directorApproval.approverName}):</span>{' '}
                        <span className="text-emerald-800">{leave.directorApproval.comment}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => openApprovalModal(leave)}
                  className="w-full md:w-auto px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  พิจารณา / แนบลายเซ็น
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedLeave.id}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">
                  พิจารณาคำขอลา — {selectedLeave.requesterName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {approvalError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {approvalError}
              </div>
            )}

            {/* Leave Details Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs mb-5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">ประเภทการลา:</span>{' '}
                  <span className="font-bold text-slate-800">{selectedLeave.leaveType}</span>
                </div>
                <div>
                  <span className="text-slate-500">จำนวนวันทำการ:</span>{' '}
                  <span className="font-bold text-slate-800">{selectedLeave.totalDays} วัน</span>
                </div>
                <div>
                  <span className="text-slate-500">กำหนดวันที่:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {formatThaiDate(selectedLeave.startDate)} ถึง {formatThaiDate(selectedLeave.endDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">เบอร์โทรติดต่อ:</span>{' '}
                  <span className="font-medium text-slate-800">{selectedLeave.contactPhone}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500">เหตุผลความจำเป็น:</span>{' '}
                <span className="font-medium text-slate-800">{selectedLeave.reason}</span>
              </div>
              <div>
                <span className="text-slate-500">สถานที่ติดต่อ:</span>{' '}
                <span className="font-medium text-slate-800">{selectedLeave.contactAddress}</span>
              </div>
              {selectedLeave.requesterSignature && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-slate-500">ลายเซ็นผู้ขอลา:</span>
                  <img
                    src={selectedLeave.requesterSignature}
                    alt="Requester Signature"
                    className="h-7 border border-slate-200 rounded px-2 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Approver Selection */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  พิจารณาในบทบาท:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('director')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                      approverRole === 'director'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ผู้อำนวยการโรงเรียน (อนุมัติใบลา)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('academic')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                      approverRole === 'academic'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อผู้พิจารณา *
                </label>
                <input
                  type="text"
                  required
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ความเห็น / คำสั่ง *
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* แนบลายเซ็นอิเล็กทรอนิกส์ */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ลายมือชื่ออิเล็กทรอนิกส์ผู้พิจารณา *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  เมื่อกดอนุมัติ ระบบจะแนบลายเซ็นนี้ลงในเอกสารและส่งรายงานเข้า LINE
                </p>
                <SignaturePad
                  initialSignature={signature}
                  savedProfileSignature={signature}
                  onSave={(dataUrl) => setSignature(dataUrl)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={() => submitDecision(false)}
                  className="px-5 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold cursor-pointer transition disabled:opacity-50"
                >
                  ไม่อนุมัติ
                </button>
                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={() => submitDecision(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSubmittingApproval ? 'กำลังบันทึก...' : 'อนุมัติ / เห็นชอบคำขอลา'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
