import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Users,
  Award,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  X
} from 'lucide-react';
import { LeaveRequest, Personnel, LeaveType } from '../types';
import { formatThaiDate } from '../utils/thaiDate';
import { exportLeavesToExcel } from '../utils/exportExcel';

interface ReportsViewProps {
  leaves: LeaveRequest[];
  personnelList: Personnel[];
  onViewLeave: (leave: LeaveRequest) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  leaves,
  personnelList,
  onViewLeave
}) => {
  // Tab within Reports: 'all' | 'print-memo'
  const [reportMode, setReportMode] = useState<'standard' | 'memo'>('standard');

  // Filter states
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('2026-10-01');
  const [dateTo, setDateTo] = useState<string>('2026-10-31');

  // Memo report custom fields
  const [memoSubject, setMemoSubject] = useState('รายงานสรุปสถิติการลาของข้าราชการครูและบุคลากร ประจำเดือนตุลาคม 2569');
  const [memoNumber, setMemoNumber] = useState('ศธ 04113.04/พิเศษ');
  const [reporterName, setReporterName] = useState('นางนภาพร เกียรติวิทยา');
  const [reporterPosition, setReporterPosition] = useState('หัวหน้าฝ่ายบริหารงานวิชาการ');

  // Filtered leaves for Table & Excel
  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const matchPerson = selectedPersonnelId === 'all' || l.personnelId === selectedPersonnelId;
      const matchType = selectedLeaveType === 'all' || l.leaveType === selectedLeaveType;
      return matchPerson && matchType;
    });
  }, [leaves, selectedPersonnelId, selectedLeaveType]);

  // Section 2: Date-ranged stats
  const rangedLeaves = useMemo(() => {
    return leaves.filter(l => {
      const start = l.startDate;
      return (!dateFrom || start >= dateFrom) && (!dateTo || start <= dateTo);
    });
  }, [leaves, dateFrom, dateTo]);

  const totalRangedCount = rangedLeaves.length;
  const approvedRangedCount = rangedLeaves.filter(l => l.status === 'approved').length;
  const totalRangedDays = rangedLeaves.reduce((acc, l) => acc + (l.totalDays || 0), 0);
  const averageDaysPerLeave = totalRangedCount > 0 ? (totalRangedDays / totalRangedCount).toFixed(1) : '0';

  // Section 3: Graph stats
  // 1. By Type
  const statsByType = useMemo(() => {
    const typeMap: Record<string, number> = {};
    leaves.forEach(l => {
      typeMap[l.leaveType] = (typeMap[l.leaveType] || 0) + (l.totalDays || 0);
    });
    return Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
  }, [leaves]);

  const maxTypeDays = Math.max(...statsByType.map(s => s[1]), 1);

  // 2. By Person (ranked descending)
  const statsByPerson = useMemo(() => {
    const personMap: Record<string, { name: string; position: string; totalDays: number; count: number }> = {};
    
    // Seed all personnel with 0
    personnelList.forEach(p => {
      personMap[p.id] = {
        name: `${p.prefix}${p.firstName} ${p.lastName}`,
        position: p.position,
        totalDays: p.leaveStats?.totalUsed || 0,
        count: 0
      };
    });

    leaves.forEach(l => {
      if (personMap[l.personnelId]) {
        personMap[l.personnelId].count += 1;
      }
    });

    return Object.values(personMap).sort((a, b) => b.totalDays - a.totalDays);
  }, [leaves, personnelList]);

  const maxPersonDays = Math.max(...statsByPerson.map(p => p.totalDays), 1);

  const handleExportExcel = () => {
    exportLeavesToExcel(filteredLeaves);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">อนุมัติแล้ว</span>;
      case 'academic_approved':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">หน.วิชาการตรวจแล้ว</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">ไม่อนุมัติ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">รอพิจารณา</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Bar / Navigation between interactive and A4 memo */}
      <div className="no-print bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            รายงานสถิติและการประมวลผล
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            รายงานการลาและสถิติข้อมูล
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2 (รองรับส่งออก Excel และพิมพ์บันทึกข้อความเสนอ ผอ.)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportMode(reportMode === 'standard' ? 'memo' : 'standard')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
              reportMode === 'memo'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            {reportMode === 'memo' ? 'กลับสู่หน้ารายงานปกติ' : 'ดูบันทึกข้อความเสนอ ผอ. (A4)'}
          </button>

          {reportMode === 'memo' && (
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ / บันทึกเป็น PDF
            </button>
          )}
        </div>
      </div>

      {reportMode === 'memo' ? (
        /* =========================================================================
           ส่วนที่ 4: บันทึกข้อความรายงานสรุปสถิติการลาจำแนกตามรายบุคคล เสนอผู้อำนวยการ (A4 Official View)
           ========================================================================= */
        <div className="space-y-6">
          {/* Print Controller banner */}
          <div className="no-print bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                กำลังแสดง <strong>บันทึกข้อความทางการ A4</strong> เมื่อกดปุ่มสั่งพิมพ์หรือบันทึก PDF
                ระบบจะใช้ <code>@media print</code> ซ่อน Sidebar, Header, Button, Filter อัตโนมัติ
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer shrink-0"
            >
              สั่งพิมพ์ A4
            </button>
          </div>

          {/* Official Thai Government Memorandum A4 Paper */}
          <div className="print-container sarabun-doc bg-white max-w-[210mm] mx-auto p-10 sm:p-14 shadow-2xl rounded-2xl border border-slate-300 text-slate-900 leading-relaxed text-sm">
            {/* Thai Garuda & Memorandum Header */}
            <div className="relative mb-6">
              <div className="text-center font-bold text-2xl tracking-wider mb-2">
                บันทึกข้อความ
              </div>
              <div className="text-center text-xs text-slate-500 print:hidden">
                (แบบฟอร์มหนังสือราชการภายใน เสนอผู้อำนวยการโรงเรียน)
              </div>
            </div>

            {/* Official Header Fields */}
            <div className="border-b-2 border-black pb-4 mb-6 space-y-2 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <strong>ส่วนราชการ:</strong> โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2 โทร. 055-681-234
                </div>
                <div>
                  <strong>ที่:</strong> <input
                    type="text"
                    value={memoNumber}
                    onChange={(e) => setMemoNumber(e.target.value)}
                    className="border-b border-slate-300 px-1 font-mono text-xs w-36 print:border-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <strong>วันที่:</strong> {new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                </div>
              </div>

              <div>
                <strong>เรื่อง:</strong> <input
                  type="text"
                  value={memoSubject}
                  onChange={(e) => setMemoSubject(e.target.value)}
                  className="border-b border-slate-300 px-1 w-full max-w-xl font-medium print:border-none"
                />
              </div>

              <div>
                <strong>เรียน:</strong> ผู้อำนวยการโรงเรียนบ้านห้วยไคร้
              </div>
            </div>

            {/* Memo Body */}
            <div className="space-y-4 text-justify leading-relaxed">
              <p className="indent-8">
                ด้วย กลุ่มงานบริหารงานบุคคลและฝ่ายวิชาการ ได้ดำเนินการรวบรวมและตรวจสอบสถิติข้อมูลการลาของข้าราชการครู
                และบุคลากรทางการศึกษา โรงเรียนบ้านห้วยไคร้ สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2
                ผ่านระบบจัดการวันลาออนไลน์ เพื่อให้การปฏิบัติราชการเป็นไปด้วยความเรียบร้อย ถูกต้องตามระเบียบสำนักนายกรัฐมนตรี
                ว่าด้วยการลาของข้าราชการ พ.ศ. 2555 และระเบียบกระทรวงศึกษาธิการ
              </p>

              <p className="indent-8">
                จึงขอรายงานสรุปสถิติการลาของบุคลากรจำแนกตามรายบุคคล ดังมีรายละเอียดปรากฏตามตารางด้านล่างนี้:
              </p>
            </div>

            {/* Official Table */}
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse border border-black text-xs text-center">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-100">
                    <th className="border border-black p-2 w-10">ลำดับ</th>
                    <th className="border border-black p-2 text-left">ชื่อ - นามสกุล</th>
                    <th className="border border-black p-2">ตำแหน่ง / วิทยฐานะ</th>
                    <th className="border border-black p-2 w-16">ลาป่วย (วัน)</th>
                    <th className="border border-black p-2 w-16">ลากิจ (วัน)</th>
                    <th className="border border-black p-2 w-16">ลาอื่น ๆ</th>
                    <th className="border border-black p-2 w-20 font-bold">รวมสะสม (วัน)</th>
                    <th className="border border-black p-2 w-24">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {personnelList.map((person, idx) => {
                    const stats = person.leaveStats || { sickUsed: 0, personalUsed: 0, totalUsed: 0 };
                    const otherUsed = (stats.totalUsed || 0) - (stats.sickUsed || 0) - (stats.personalUsed || 0);
                    return (
                      <tr key={person.id} className="hover:bg-slate-50">
                        <td className="border border-black p-2">{idx + 1}</td>
                        <td className="border border-black p-2 text-left font-medium">
                          {person.prefix}{person.firstName} {person.lastName}
                        </td>
                        <td className="border border-black p-2 text-slate-700">
                          {person.position} {person.academicStanding !== 'ไม่มี' && `(${person.academicStanding})`}
                        </td>
                        <td className="border border-black p-2">{stats.sickUsed || 0}</td>
                        <td className="border border-black p-2">{stats.personalUsed || 0}</td>
                        <td className="border border-black p-2">{otherUsed > 0 ? otherUsed : 0}</td>
                        <td className="border border-black p-2 font-bold">{stats.totalUsed || 0}</td>
                        <td className="border border-black p-2 text-[10px] text-slate-500">ตามระเบียบ</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="indent-8 text-justify">
              จึงเรียนมาเพื่อโปรดทราบและพิจารณา
            </p>

            {/* Signature Area (2 Columns) */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-center text-xs">
              {/* Reporter Signature */}
              <div className="space-y-2">
                <p>ลงชื่อ..............................................................ผู้รายงาน</p>
                <p className="font-medium">
                  ({reporterName})
                </p>
                <p className="text-slate-600">{reporterPosition}</p>
                <p>โรงเรียนบ้านห้วยไคร้</p>
              </div>

              {/* Director Signature & Order */}
              <div className="space-y-2 border-l border-slate-300 pl-4 print:border-black">
                <p className="font-bold">คำสั่ง / ความเห็นของผู้อำนวยการโรงเรียน</p>
                <div className="text-left space-y-1 my-2">
                  <p>⚪ ทราบ</p>
                  <p>⚪ มอบหมายฝ่ายวิชาการดำเนินการตามระเบียบ</p>
                </div>
                <p className="pt-2">ลงชื่อ..............................................................</p>
                <p className="font-bold">
                  (นายพิเชษฐ์ ยั่งยืน)
                </p>
                <p className="text-slate-600">ผู้อำนวยการโรงเรียนบ้านห้วยไคร้</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           Standard Interactive View (ส่วนที่ 1, ส่วนที่ 2, ส่วนที่ 3)
           ========================================================================= */
        <div className="space-y-8">
          {/* ส่วนที่ 2: สถิติการลา (Date Range Filter & KPI Summary) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  ส่วนที่ 2: สถิติการลาตามช่วงเวลา
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบุช่วงวันที่เพื่อประมวลผลข้อมูลทางสถิติ
                </p>
              </div>

              {/* Date Filter Inputs */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">ตั้งแต่วันที่:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                />
                <span className="text-slate-500 font-medium">ถึงวันที่:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
                <span className="text-xs font-semibold text-blue-800">รวมจำนวนครั้งที่ลา</span>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-blue-900">{totalRangedCount}</span>
                  <span className="text-xs text-blue-600 ml-1.5 font-medium">ครั้ง</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                <span className="text-xs font-semibold text-emerald-800">อนุมัติแล้ว</span>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-emerald-900">{approvedRangedCount}</span>
                  <span className="text-xs text-emerald-600 ml-1.5 font-medium">รายการ</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex flex-col justify-between">
                <span className="text-xs font-semibold text-indigo-800">เฉลี่ยต่อการลาหนึ่งครั้ง</span>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-indigo-900">{averageDaysPerLeave}</span>
                  <span className="text-xs text-indigo-600 ml-1.5 font-medium">วันทำการ / ครั้ง</span>
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 3: กราฟสถิติ (Charts & Visualizations) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* กราฟสถิติการลาแยกตามประเภท (จำนวนวัน) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  กราฟสถิติการลาแยกตามประเภท (จำนวนวัน)
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {statsByType.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีข้อมูลการลา</p>
                ) : (
                  statsByType.map(([type, days]) => {
                    const percentage = Math.round((days / maxTypeDays) * 100);
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{type}</span>
                          <span className="font-bold text-blue-700">{days} วัน</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* กราฟสถิติการลาจำแนกตามรายบุคคล เรียงตามวันลาสูงสุด */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  กราฟสถิติการลาจำแนกตามรายบุคคล (เรียงตามวันลาสูงสุด)
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {statsByPerson.map((person, idx) => {
                  const percentage = maxPersonDays > 0 ? Math.round((person.totalDays / maxPersonDays) * 100) : 0;
                  return (
                    <div key={person.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 truncate">{person.name}</span>
                          <span className="text-[10px] text-slate-400">({person.position})</span>
                        </div>
                        <span className="font-bold text-indigo-700">{person.totalDays} วัน</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ส่วนที่ 1: ประวัติการลา & ปุ่ม ส่งออก Excel & ฟิลเตอร์ & ตาราง */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  ส่วนที่ 1: ประวัติการลาทั้งหมด
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>ยื่นทั้งหมด: <strong className="text-slate-800">{leaves.length}</strong> ครั้ง</span>
                  <span>•</span>
                  <span>อนุมัติแล้ว: <strong className="text-emerald-700">{leaves.filter(l => l.status === 'approved').length}</strong> รายการ</span>
                </div>
              </div>

              {/* Action: Export Excel */}
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                ส่งออก Excel (.xlsx / .csv)
              </button>
            </div>

            {/* Filter Controls: เลือกบุคลากร, เลือกประเภทการลา */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลือกบุคลากร:</label>
                <select
                  value={selectedPersonnelId}
                  onChange={(e) => setSelectedPersonnelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="all">บุคลากรทุกคน (ทั้งหมด)</option>
                  {personnelList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.prefix}{p.firstName} {p.lastName} — {p.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประเภทการลา:</label>
                <select
                  value={selectedLeaveType}
                  onChange={(e) => setSelectedLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="all">ทุกประเภทการลา</option>
                  <option value="ลาป่วย">ลาป่วย</option>
                  <option value="ลากิจส่วนตัว">ลากิจส่วนตัว</option>
                  <option value="ลาคลอดบุตร">ลาคลอดบุตร</option>
                  <option value="ลาอุปสมบทหรือไปประกอบพิธีฮัจญ์">ลาอุปสมบทหรือไปประกอบพิธีฮัจญ์</option>
                  <option value="ลาไปช่วยเหลือภริยาที่คลอดบุตร">ลาไปช่วยเหลือภริยาที่คลอดบุตร</option>
                  <option value="ลาเข้ารับการตรวจเลือกหรือเตรียมพล">ลาเข้ารับการตรวจเลือกหรือเตรียมพล</option>
                  <option value="ลาประเภทอื่น ๆ / อบรมพัฒนา">ลาประเภทอื่น ๆ / อบรมพัฒนา</option>
                </select>
              </div>
            </div>

            {/* Leaves Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">เลขที่คำขอ</th>
                    <th className="py-3 px-3">ผู้ขอลา</th>
                    <th className="py-3 px-3">ประเภทการลา</th>
                    <th className="py-3 px-3">ช่วงวันที่ลา</th>
                    <th className="py-3 px-3 text-center">จำนวนวัน</th>
                    <th className="py-3 px-3">สถานะ</th>
                    <th className="py-3 px-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        ไม่พบข้อมูลตามตัวกรองที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-3 font-mono font-medium text-blue-700">
                          {l.id}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-900">
                          <div>{l.requesterName}</div>
                          <div className="text-[10px] text-slate-400">{l.requesterPosition}</div>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">
                          {l.leaveType}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {l.startDate === l.endDate
                            ? formatThaiDate(l.startDate)
                            : `${formatThaiDate(l.startDate)} - ${formatThaiDate(l.endDate)}`}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {l.totalDays} วัน
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          {getStatusBadge(l.status)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => onViewLeave(l)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            ดูใบลา
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
