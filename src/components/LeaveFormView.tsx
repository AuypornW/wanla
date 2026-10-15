import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  Calendar,
  Phone,
  MapPin,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Clock
} from 'lucide-react';
import { Personnel, LeaveType, LeaveRequest } from '../types';
import { calculateWorkingDays, formatThaiDate } from '../utils/thaiDate';
import { SignaturePad } from './SignaturePad';

interface LeaveFormViewProps {
  currentUser: Personnel | null;
  personnelList: Personnel[];
  onSubmitLeave: (leaveData: Partial<LeaveRequest>) => Promise<boolean>;
  isSubmitting: boolean;
  onSuccessNavigate: () => void;
}

const LEAVE_TYPES: { type: LeaveType; desc: string; maxDays: string }[] = [
  { type: 'ลาป่วย', desc: 'มีอาการเจ็บป่วยหรือพบแพทย์', maxDays: 'ไม่เกิน 60 วัน/ปี' },
  { type: 'ลากิจส่วนตัว', desc: 'มีกิจธุระจำเป็นที่ไม่สามารถมอบหมายผู้อื่นได้', maxDays: 'ไม่เกิน 45 วัน/ปี' },
  { type: 'ลาคลอดบุตร', desc: 'คลอดบุตรตามระเบียบข้าราชการ', maxDays: 'ไม่เกิน 90 วัน' },
  { type: 'ลาอุปสมบทหรือไปประกอบพิธีฮัจญ์', desc: 'บรรพชาอุปสมบทในพระพุทธศาสนา หรือประกอบพิธีฮัจญ์', maxDays: 'ไม่เกิน 120 วัน' },
  { type: 'ลาไปช่วยเหลือภริยาที่คลอดบุตร', desc: 'ช่วยเหลือภริยาโดยชอบด้วยกฎหมายที่คลอดบุตร', maxDays: 'ไม่เกิน 15 วันทำการ' },
  { type: 'ลาเข้ารับการตรวจเลือกหรือเตรียมพล', desc: 'ตามหมายเรียกของทางราชการทหาร', maxDays: 'ตามหมายเรียก' },
  { type: 'ลาประเภทอื่น ๆ / อบรมพัฒนา', desc: 'ไปอบรม สัมมนา ศึกษาดูงาน หรือปฏิบัติราชการพิเศษ', maxDays: 'ตามระเบียบ' },
];

export const LeaveFormView: React.FC<LeaveFormViewProps> = ({
  currentUser,
  personnelList,
  onSubmitLeave,
  isSubmitting,
  onSuccessNavigate
}) => {
  // Current date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>(currentUser?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('ลาป่วย');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [halfDayType, setHalfDayType] = useState<'morning' | 'afternoon'>('morning');
  const [totalDays, setTotalDays] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [contactAddress, setContactAddress] = useState<string>(currentUser?.address || '');
  const [contactPhone, setContactPhone] = useState<string>(currentUser?.phone || '');
  const [signature, setSignature] = useState<string>(currentUser?.signatureUrl || '');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Update fields when current user changes
  useEffect(() => {
    if (currentUser) {
      setSelectedPersonnelId(currentUser.id);
      setContactAddress(currentUser.address || '');
      setContactPhone(currentUser.phone || '');
      setSignature(currentUser.signatureUrl || '');
    }
  }, [currentUser]);

  // Auto calculate working days
  useEffect(() => {
    if (isHalfDay) {
      setTotalDays(0.5);
      setEndDate(startDate);
    } else {
      const calculated = calculateWorkingDays(startDate, endDate, false);
      setTotalDays(calculated > 0 ? calculated : 1);
    }
  }, [startDate, endDate, isHalfDay]);

  const activeStaff = personnelList.find(p => p.id === selectedPersonnelId) || currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!activeStaff) {
      setErrorMsg('กรุณาเลือกผู้ขอลา');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('กรุณาระบุเหตุผลความจำเป็นในการลา');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้');
      return;
    }
    if (!contactAddress.trim()) {
      setErrorMsg('กรุณาระบุสถานที่ติดต่อได้ระหว่างลา');
      return;
    }
    if (!signature) {
      setErrorMsg('กรุณาลงลายมือชื่ออิเล็กทรอนิกส์ผู้ขอลา (วาดสดใหม่หรือใช้ลายเซ็นในระบบ)');
      return;
    }

    const payload: Partial<LeaveRequest> = {
      personnelId: activeStaff.id,
      requesterName: `${activeStaff.prefix}${activeStaff.firstName} ${activeStaff.lastName}`,
      requesterPosition: activeStaff.position,
      requesterAcademicStanding: activeStaff.academicStanding,
      leaveType,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      isHalfDay,
      halfDayType: isHalfDay ? halfDayType : 'full',
      totalDays,
      reason: reason.trim(),
      contactAddress: contactAddress.trim(),
      contactPhone: contactPhone.trim(),
      requesterSignature: signature
    };

    const success = await onSubmitLeave(payload);
    if (success) {
      setSuccessMsg('บันทึกคำขอลาออนไลน์และส่งการแจ้งเตือนเข้ากลุ่ม LINE เรียบร้อยแล้ว!');
      setTimeout(() => {
        onSuccessNavigate();
      }, 1500);
    } else {
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกคำขอลา กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            แบบฟอร์มขออนุมัติลาทางราชการ
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ยื่นแบบฟอร์มคำขอลาออนไลน์
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2 (เชื่อมโยง Google Sheets และ LINE อัตโนมัติ)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: ข้อมูลผู้ขอลา */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            1. ข้อมูลผู้ยื่นคำขอลา
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ผู้ยื่นคำขอลา *
              </label>
              <select
                value={selectedPersonnelId}
                onChange={(e) => {
                  setSelectedPersonnelId(e.target.value);
                  const staff = personnelList.find(p => p.id === e.target.value);
                  if (staff) {
                    setContactAddress(staff.address || '');
                    setContactPhone(staff.phone || '');
                    setSignature(staff.signatureUrl || '');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {personnelList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.prefix}{p.firstName} {p.lastName} — {p.position} ({p.role.replace(/^\d/, '')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ตำแหน่ง / วิทยฐานะ
              </label>
              <input
                type="text"
                disabled
                value={`${activeStaff?.position || ''} ${activeStaff?.academicStanding && activeStaff.academicStanding !== 'ไม่มี' ? `(วิทยฐานะ: ${activeStaff.academicStanding})` : ''}`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: รายละเอียดการลา */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            2. รายละเอียดและกำหนดวันลา
          </h3>

          {/* เลือกประเภทการลา */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              เลือกประเภทการลา *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {LEAVE_TYPES.map(item => {
                const isSelected = leaveType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setLeaveType(item.type)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{item.type}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ลาครึ่งวัน Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <div>
                <span className="text-xs font-bold text-slate-800">ลาครึ่งวัน (0.5 วันทำการ)</span>
                <p className="text-[11px] text-slate-500">เลือกเมื่อต้องการลาเพียงครึ่งวัน เช้า หรือ บ่าย</p>
              </div>
            </div>

            {isHalfDay && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHalfDayType('morning')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                    halfDayType === 'morning'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ช่วงเช้า (08.30 - 12.00 น.)
                </button>
                <button
                  type="button"
                  onClick={() => setHalfDayType('afternoon')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                    halfDayType === 'afternoon'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ช่วงบ่าย (13.00 - 16.30 น.)
                </button>
              </div>
            )}
          </div>

          {/* ช่วงวันที่ลา */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ตั้งแต่วันที่ *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (isHalfDay || e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatThaiDate(startDate, true)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ถึงวันที่ *
              </label>
              <input
                type="date"
                required
                disabled={isHalfDay}
                value={isHalfDay ? startDate : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatThaiDate(isHalfDay ? startDate : endDate, true)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                จำนวนวันทำการที่ลา *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={totalDays}
                  onChange={(e) => setTotalDays(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-blue-50/30 text-blue-900 font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">
                  วันทำการ
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                * คำนวณวันทำการอัตโนมัติ (หักวันหยุดเสาร์-อาทิตย์)
              </span>
            </div>
          </div>

          {/* เหตุผลความจำเป็นในการลา */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เหตุผลความจำเป็นในการลา *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผล เช่น มีอาการป่วยเป็นไข้หวัดเจ็บคอ, มีธุระจำเป็นติดต่อราชการที่ว่าการอำเภอ, ฯลฯ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: การติดต่อและลายมือชื่อ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            3. ข้อมูลการติดต่อและลายมือชื่ออิเล็กทรอนิกส์
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                สถานที่ติดต่อได้ระหว่างลา *
              </label>
              <input
                type="text"
                required
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="ระบุบ้านเลขที่ ตำบล อำเภอ จังหวัด"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เบอร์โทรศัพท์ที่ติดต่อได้ *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="เช่น 087-654-3210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ลายมือชื่ออิเล็กทรอนิกส์ผู้ขอลา */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ลายมือชื่ออิเล็กทรอนิกส์ผู้ขอลา *
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              ระบบจะใช้ภาพลายมือชื่ออิเล็กทรอนิกส์ที่บันทึกไว้ในระบบ หรือท่านสามารถวาดลายเซ็นสดใหม่ได้
            </p>
            <SignaturePad
              initialSignature={signature}
              savedProfileSignature={activeStaff?.signatureUrl}
              onSave={(dataUrl) => setSignature(dataUrl)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <p className="text-xs text-slate-500 text-right">
            เมื่อกดยื่นคำขอ ข้อมูลจะถูกบันทึกและส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE อัตโนมัติทันที
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'กำลังบันทึกและแจ้งเตือน...' : 'บันทึกและยื่นคำขอลาออนไลน์'}
          </button>
        </div>
      </form>
    </div>
  );
};
