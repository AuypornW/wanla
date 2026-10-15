import React from 'react';
import { X, Printer, CheckCircle2, Clock, XCircle, FileText, School } from 'lucide-react';
import { LeaveRequest } from '../types';
import { formatThaiDate } from '../utils/thaiDate';

interface LeaveDetailModalProps {
  leave: LeaveRequest | null;
  onClose: () => void;
}

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({ leave, onClose }) => {
  if (!leave) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">อนุมัติแล้ว</span>;
      case 'academic_approved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">หัวหน้าวิชาการตรวจแล้ว</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">ไม่อนุมัติ</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">รอการพิจารณา</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 space-y-6">
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
              {leave.id}
            </span>
            <div>{getStatusBadge(leave.status)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="พิมพ์ใบลา"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Leave Slip Card */}
        <div className="print-container sarabun-doc bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-900 leading-relaxed shadow-xs">
          {/* Official Header */}
          <div className="text-center space-y-1 border-b border-slate-200 pb-4">
            <h3 className="font-bold text-lg text-slate-900">
              ใบลาออนไลน์ โรงเรียนบ้านห้วยไคร้
            </h3>
            <p className="text-xs text-slate-500">
              สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              เลขที่คำขอ: {leave.id} | ยื่นเมื่อ: {leave.createdAt || '-'}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <strong>ข้าพเจ้า:</strong> {leave.requesterName}
              <span className="text-slate-600">ตำแหน่ง: {leave.requesterPosition}</span>
              {leave.requesterAcademicStanding && leave.requesterAcademicStanding !== 'ไม่มี' && (
                <span className="text-slate-600">วิทยฐานะ: {leave.requesterAcademicStanding}</span>
              )}
            </div>

            <div>
              <strong>มีความประสงค์ขอ:</strong>{' '}
              <span className="font-bold text-blue-800 underline decoration-blue-300 underline-offset-4">
                {leave.leaveType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <strong>ตั้งแต่วันที่:</strong> {formatThaiDate(leave.startDate, true)}
              </div>
              <div>
                <strong>ถึงวันที่:</strong> {formatThaiDate(leave.endDate, true)}
              </div>
              <div className="sm:col-span-2">
                <strong>กำหนด:</strong> {leave.totalDays} วันทำการ{' '}
                {leave.isHalfDay && `(${leave.halfDayType === 'morning' ? 'ช่วงเช้า' : 'ช่วงบ่าย'})`}
              </div>
            </div>

            <div>
              <strong>เนื่องจาก / เหตุผลความจำเป็น:</strong>
              <p className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-800">
                {leave.reason}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div>
                <strong>สถานที่ติดต่อระหว่างลา:</strong> {leave.contactAddress}
              </div>
              <div>
                <strong>เบอร์โทรศัพท์:</strong> {leave.contactPhone}
              </div>
            </div>

            {/* Requester Signature */}
            <div className="pt-4 flex flex-col items-end">
              <div className="text-center w-64 space-y-1">
                {leave.requesterSignature && (
                  <img
                    src={leave.requesterSignature}
                    alt="Requester Signature"
                    className="h-10 mx-auto object-contain"
                  />
                )}
                <p>(ลงชื่อ)....................................................................</p>
                <p className="font-medium text-xs">({leave.requesterName})</p>
                <p className="text-[11px] text-slate-500">ผู้ขอลา</p>
              </div>
            </div>
          </div>

          {/* Approvals Section */}
          <div className="border-t border-slate-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Academic Approval */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-800 mb-1">
                  1. ความเห็นหัวหน้าฝ่ายบริหารงานวิชาการ
                </p>
                <p className="text-slate-700 italic">
                  "{leave.academicApproval?.comment || 'รอการตรวจสอบ'}"
                </p>
              </div>

              <div className="pt-4 text-center">
                {leave.academicApproval?.signature && (
                  <img
                    src={leave.academicApproval.signature}
                    alt="Academic Head Signature"
                    className="h-9 mx-auto object-contain mb-1"
                  />
                )}
                <p className="font-medium">
                  ({leave.academicApproval?.approverName || '...................................................'})
                </p>
                <p className="text-[10px] text-slate-400">
                  {leave.academicApproval?.date || 'หัวหน้าฝ่ายบริหารงานวิชาการ'}
                </p>
              </div>
            </div>

            {/* Director Approval */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-800 mb-1">
                  2. คำสั่ง / การอนุมัติผู้อำนวยการโรงเรียน
                </p>
                <p className="text-slate-700 italic">
                  "{leave.directorApproval?.comment || 'รอการอนุมัติ'}"
                </p>
              </div>

              <div className="pt-4 text-center">
                {leave.directorApproval?.signature && (
                  <img
                    src={leave.directorApproval.signature}
                    alt="Director Signature"
                    className="h-9 mx-auto object-contain mb-1"
                  />
                )}
                <p className="font-medium">
                  ({leave.directorApproval?.approverName || '...................................................'})
                </p>
                <p className="text-[10px] text-slate-400">
                  {leave.directorApproval?.date || 'ผู้อำนวยการโรงเรียนบ้านห้วยไคร้'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
