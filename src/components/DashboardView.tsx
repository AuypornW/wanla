import React, { useState } from 'react';
import {
  User,
  CalendarCheck,
  HeartPulse,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  Phone,
  MapPin,
  Shield,
  Eye,
  Check
} from 'lucide-react';
import { Personnel, LeaveRequest, QuotaSetting } from '../types';
import { formatThaiDate, formatThaiDateTime } from '../utils/thaiDate';

interface DashboardViewProps {
  currentUser: Personnel | null;
  leaves: LeaveRequest[];
  quotas: QuotaSetting[];
  onNavigateApply: () => void;
  onViewLeave: (leave: LeaveRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  leaves,
  quotas,
  onNavigateApply,
  onViewLeave
}) => {
  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">กรุณาเลือกผู้ใช้งานจากแถบเมนูด้านบน</p>
      </div>
    );
  }

  // Filter leaves for this user
  const myLeaves = leaves.filter(l => l.personnelId === currentUser.id);
  const myApprovedLeaves = myLeaves.filter(l => l.status === 'approved');

  // Quota lookups
  const sickQuota = quotas.find(q => q.leaveType === 'ลาป่วย')?.maxDays || 60;
  const personalQuota = quotas.find(q => q.leaveType === 'ลากิจส่วนตัว')?.maxDays || 45;

  const sickRemaining = Math.max(0, sickQuota - (currentUser.leaveStats.sickUsed || 0));
  const personalRemaining = Math.max(0, personalQuota - (currentUser.leaveStats.personalUsed || 0));

  // Total all quotas sum
  const totalAllQuota = quotas.reduce((acc, q) => acc + q.maxDays, 0);
  const totalRemaining = Math.max(0, totalAllQuota - (currentUser.leaveStats.totalUsed || 0));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Check className="w-3.5 h-3.5" /> อนุมัติแล้ว
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
            ไม่อนุมัติ
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
      {/* 1. ข้อมูลผู้ใช้งานที่เข้าระบบ & Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-inner">
              {currentUser.firstName.charAt(0)}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-medium backdrop-blur-md border border-blue-400/20 mb-2">
                <Shield className="w-3.5 h-3.5 text-blue-300" />
                {currentUser.role.replace(/^\d/, '')}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {currentUser.prefix}{currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                ตำแหน่ง: {currentUser.position} {currentUser.academicStanding !== 'ไม่มี' && `(วิทยฐานะ: ${currentUser.academicStanding})`}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200/80 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {currentUser.phone}
                </span>
                <span className="flex items-center gap-1 truncate max-w-xs">
                  <MapPin className="w-3.5 h-3.5" /> {currentUser.address}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={onNavigateApply}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-800 font-semibold text-sm hover:bg-blue-50 transition shadow-lg shadow-black/10 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              ยื่นใบลาใหม่
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* วันลาสะสมที่ใช้ไป */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">วันลาสะสมที่ใช้ไป</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {currentUser.leaveStats.totalUsed} <span className="text-xs font-normal text-slate-400">วัน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">ปีงบประมาณปัจจุบัน</p>
          </div>
        </div>

        {/* สิทธิลาป่วยคงเหลือ */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">สิทธิลาป่วยคงเหลือ</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-rose-600">
              {sickRemaining} <span className="text-xs font-normal text-slate-400">/ {sickQuota} วัน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">ใช้ไปแล้ว {currentUser.leaveStats.sickUsed} วัน</p>
          </div>
        </div>

        {/* สิทธิลากิจส่วนตัวคงเหลือ */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between hover:border-amber-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">สิทธิลากิจคงเหลือ</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">
              {personalRemaining} <span className="text-xs font-normal text-slate-400">/ {personalQuota} วัน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">ใช้ไปแล้ว {currentUser.leaveStats.personalUsed} วัน</p>
          </div>
        </div>

        {/* รายการที่อนุมัติแล้ว */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รายการที่อนุมัติแล้ว</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {myApprovedLeaves.length} <span className="text-xs font-normal text-slate-400">รายการ</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">จากทั้งหมด {myLeaves.length} คำขอ</p>
          </div>
        </div>

        {/* สิทธิวันลาคงเหลือรวม */}
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">สิทธิวันลาคงเหลือ</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
              {totalRemaining} <span className="text-xs font-normal text-slate-400">วัน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">รวมทุกประเภทระเบียบ</p>
          </div>
        </div>
      </div>

      {/* 3. ประวัติการยื่นคำขอลาล่าสุดของท่าน */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              ประวัติการยื่นคำขอลาล่าสุดของท่าน
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงรายการคำขอลาออนไลน์ของคุณ {currentUser.prefix}{currentUser.firstName} {currentUser.lastName}
            </p>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {myLeaves.length} รายการ
          </span>
        </div>

        {myLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-medium text-sm">ยังไม่มีประวัติการยื่นขอลาในระบบ</p>
            <p className="text-slate-400 text-xs mt-1">ท่านสามารถกดยื่นใบลาใหม่ได้ตลอดเวลา</p>
            <button
              onClick={onNavigateApply}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition cursor-pointer"
            >
              ยื่นใบลาตอนนี้
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">เลขที่คำขอ</th>
                  <th className="py-3 px-4">ประเภทการลา</th>
                  <th className="py-3 px-4">ช่วงวันที่ลา</th>
                  <th className="py-3 px-4 text-center">จำนวนวัน</th>
                  <th className="py-3 px-4">เหตุผลการลา</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 text-right">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">
                      {leave.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {leave.leaveType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {leave.startDate === leave.endDate
                        ? formatThaiDate(leave.startDate)
                        : `${formatThaiDate(leave.startDate)} - ${formatThaiDate(leave.endDate)}`}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {leave.totalDays} วัน
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewLeave(leave)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        ดูใบลา
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
