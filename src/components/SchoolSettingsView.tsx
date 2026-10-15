import React, { useState } from 'react';
import {
  Building2,
  Users2,
  CalendarRange,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  KeyRound,
  History,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { SchoolSettings, QuotaSetting } from '../types';

interface SchoolSettingsViewProps {
  settings: SchoolSettings | null;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => Promise<boolean>;
  onTestLine: () => Promise<{ success: boolean; error?: string }>;
  onSyncSheets: () => Promise<{ success: boolean; message: string }>;
  onResetAllLeaves: (pin: string) => Promise<{ success: boolean; message: string }>;
  backups: { id: string; timestamp: string; note: string; recordCount: number }[];
  onCreateBackup: (note: string) => Promise<boolean>;
  onRestoreBackup: (backupId: string, pin: string) => Promise<boolean>;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTestLine,
  onSyncSheets,
  onResetAllLeaves,
  backups,
  onCreateBackup,
  onRestoreBackup
}) => {
  // Settings Form
  const [schoolName, setSchoolName] = useState(settings?.schoolName || 'โรงเรียนบ้านห้วยไคร้');
  const [jurisdiction, setJurisdiction] = useState(settings?.jurisdiction || 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2');
  const [phone, setPhone] = useState(settings?.phone || '055-681-234');
  const [address, setAddress] = useState(settings?.address || 'หมู่ที่ 4 ตำบลห้วยไคร้ อำเภอทุ่งเสลี่ยม จังหวัดสุโขทัย 64150');
  const [directorName, setDirectorName] = useState(settings?.directorName || 'นายพิเชษฐ์ ยั่งยืน');
  const [academicHeadName, setAcademicHeadName] = useState(settings?.academicHeadName || 'นางนภาพร เกียรติวิทยา');
  const [adminName, setAdminName] = useState(settings?.adminName || 'นายชัชวาลย์ ใจภักดี');
  const [lineNotifyEnabled, setLineNotifyEnabled] = useState(settings?.lineNotifyEnabled ?? true);
  const [quotas, setQuotas] = useState<QuotaSetting[]>(settings?.quotas || []);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isTestingLine, setIsTestingLine] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [hasCopiedScript, setHasCopiedScript] = useState(false);

  // Reset Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  // Backup Modal
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState('');
  const [restorePin, setRestorePin] = useState('');

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const success = await onUpdateSettings({
      schoolName,
      jurisdiction,
      phone,
      address,
      directorName,
      academicHeadName,
      adminName,
      lineNotifyEnabled,
      quotas
    });

    setIsSaving(false);
    if (success) {
      setStatusMsg({ text: 'บันทึกการตั้งค่าข้อมูลหน่วยงานและโควตาวันลาเรียบร้อยแล้ว', type: 'success' });
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      setStatusMsg({ text: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', type: 'error' });
    }
  };

  const handleTestLineNotification = async () => {
    setIsTestingLine(true);
    setStatusMsg(null);
    const result = await onTestLine();
    setIsTestingLine(false);
    if (result.success) {
      setStatusMsg({ text: 'ส่งข้อความทดสอบเข้ากลุ่ม LINE สำเร็จแล้ว!', type: 'success' });
    } else {
      setStatusMsg({ text: `ส่งข้อความ LINE ไม่สำเร็จ: ${result.error || 'ตรวจสอบ Token หรือ Group ID'}`, type: 'error' });
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    setStatusMsg(null);
    const result = await onSyncSheets();
    setIsSyncingSheets(false);
    if (result.success) {
      setStatusMsg({ text: 'ซิงค์ข้อมูลกับ Google Sheets สำเร็จเรียบร้อย!', type: 'success' });
    } else {
      setStatusMsg({ text: `ซิงค์กับ Google Sheets ไม่สำเร็จ: ${result.message}`, type: 'error' });
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setIsResetting(true);
    const result = await onResetAllLeaves(resetPin);
    setIsResetting(false);
    if (result.success) {
      setShowResetModal(false);
      setResetPin('');
      setStatusMsg({ text: result.message, type: 'success' });
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      setResetError(result.message || 'รหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleConfirmRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBackupId) return;
    const success = await onRestoreBackup(selectedBackupId, restorePin);
    if (success) {
      setShowRestoreModal(false);
      setRestorePin('');
      setStatusMsg({ text: 'กู้คืนข้อมูลสำเร็จ ระบบกลับสู่สถานะตามจุดสำรองข้อมูลแล้ว', type: 'success' });
    } else {
      alert('รหัสผ่านไม่ถูกต้อง หรือไม่สามารถกู้คืนได้');
    }
  };

  const updateQuota = (index: number, field: keyof QuotaSetting, value: any) => {
    const updated = [...quotas];
    updated[index] = { ...updated[index], [field]: value };
    setQuotas(updated);
  };

  const scriptCodeSample = `// Google Apps Script สำหรับเชื่อมโยงระบบลากับ Google Sheets
const SHEET_ID = "1B2Ak8GlFJAjOLs9IJwoRX2-ZoSTDHbtMr5wRo6z5TIE";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwDZC4JzpZ2Lu98vWl41jCd76eXRxtZXaJHyGXdz8p-C-vFMrvnah-zXdrA6U70JMss/exec";
const FOLDER_ID = "1GsXRxJGCvwtD0MLnmR1m3RwIaWhncPLt";
const ADMIN_PASSWORD = "1234";

// ดูโค้ดฉบับเต็มได้ที่ไฟล์ Code.gs ในโปรเจกต์นี้`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            การบริหารจัดการและโครงสร้างระบบ
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ข้อมูลหน่วยงานและโควตาวันลา
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2 (LINE Messaging API & Google Sheets Sync)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncSheets}
            disabled={isSyncingSheets}
            className="px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            {isSyncingSheets ? 'กำลังซิงค์...' : 'ซิงค์ Google Sheets ทันที'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* 1. ข้อมูลทั่วไปของสถานศึกษา */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            1. ข้อมูลทั่วไปของสถานศึกษา
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ชื่อโรงเรียน *</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">สังกัดสำนักงานเขตพื้นที่การศึกษา *</label>
              <input
                type="text"
                required
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์โรงเรียน</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ที่ตั้งสถานศึกษา</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="pt-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">ฐานข้อมูลภายนอก (Google Sheets):</span>{' '}
                <span className="font-mono text-slate-600">ID: 1B2Ak8...5TIE (สพป.สุโขทัย เขต 2)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <Check className="w-3 h-3" /> ออนไลน์
              </span>
              <button
                type="button"
                onClick={() => setShowScriptModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer text-xs flex items-center gap-1"
              >
                <Code className="w-3.5 h-3.5" />
                ดูสคริปต์ Code.gs
              </button>
            </div>
          </div>
        </div>

        {/* 2. ผู้มีอำนาจพิจารณาและผู้ดูแลระบบ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Users2 className="w-4 h-4 text-blue-600" />
            2. ผู้มีอำนาจพิจารณาและผู้ดูแลระบบ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ผู้อำนวยการโรงเรียน (ผู้มีอำนาจอนุมัติใบลา) *
              </label>
              <input
                type="text"
                required
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                หัวหน้าฝ่ายบริหารงานวิชาการ (ผู้ตรวจความเห็น) *
              </label>
              <input
                type="text"
                required
                value={academicHeadName}
                onChange={(e) => setAcademicHeadName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ผู้ดูแลระบบ (Admin) *
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. กำหนดสิทธิวันลาแต่ละประเภท (ระบุโควต้าจำนวนครั้งและจำนวนวัน) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-blue-600" />
                3. กำหนดสิทธิวันลาแต่ละประเภท (ตามระเบียบ พ.ศ. 2555)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                สามารถปรับเปลี่ยนโควต้าจำนวนวันและครั้ง ให้เหมาะสมกับบริบทของโรงเรียนได้
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowScriptModal(true)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold cursor-pointer"
            >
              ตั้งค่า Google Apps Script Web App
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ประเภทการลา</th>
                  <th className="py-2.5 px-3 text-center w-28">โควต้าวันสูงสุด (วัน)</th>
                  <th className="py-2.5 px-3 text-center w-28">โควต้าครั้งสูงสุด (ครั้ง)</th>
                  <th className="py-2.5 px-3">คำอธิบายและเงื่อนไข</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotas.map((q, idx) => (
                  <tr key={q.leaveType} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {q.leaveType}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={q.maxDays}
                        onChange={(e) => updateQuota(idx, 'maxDays', parseInt(e.target.value) || 0)}
                        className="w-20 text-center py-1 px-2 border border-slate-300 rounded-lg font-bold text-blue-700"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={q.maxTimes}
                        onChange={(e) => updateQuota(idx, 'maxTimes', parseInt(e.target.value) || 0)}
                        className="w-16 text-center py-1 px-2 border border-slate-300 rounded-lg text-slate-700"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={q.description}
                        onChange={(e) => updateQuota(idx, 'description', e.target.value)}
                        className="w-full py-1 px-2 border border-slate-200 rounded-lg text-slate-600 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. การแจ้งเตือนผ่านกลุ่ม LINE (LINE Messaging API) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              4. การแจ้งเตือนผ่านกลุ่ม LINE (LINE Messaging API)
            </h3>

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lineNotifyEnabled}
                  onChange={(e) => setLineNotifyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-xs font-semibold text-slate-700">
                {lineNotifyEnabled ? 'เปิดระบบแจ้งเตือน' : 'ปิดระบบ'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            ระบบจะส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE อัตโนมัติทันที เมื่อครูกดยื่นใบลา หรือ เมื่อผู้อำนวยการ/หัวหน้าวิชาการ อนุมัติใบลา
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div>
                <span className="font-semibold text-slate-500 block">Channel Access Token (Long-lived):</span>
                <span className="font-mono text-emerald-800 text-[11px] truncate block bg-white p-1.5 rounded border border-slate-200">
                  6MKdC7Jkh4/acf4lIOegOi...nyilFU=
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">รหัสกลุ่ม LINE (Group ID):</span>
                <span className="font-mono text-slate-800 text-xs font-bold bg-white p-1.5 rounded border border-slate-200 block">
                  Cd6926103d0753bbc0bc55f449083f47a
                </span>
              </div>
            </div>

            {/* ตัวอย่างข้อความแจ้งเตือน */}
            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-mono space-y-1">
              <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" /> ตัวอย่างข้อความแจ้งเตือนที่จะส่งเข้ากลุ่ม LINE:
              </div>
              <p>🔔 แจ้งเตือนบันทึกคำขอลาออนไลน์</p>
              <p>โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2</p>
              <p>━━━━━━━━━━━━━━━━━━━━</p>
              <p>📋 เลขที่คำขอ: ลร.04/2570</p>
              <p>👤 ผู้ขอลา: นายชัชวาลย์ ใจภักดี</p>
              <p>💼 ตำแหน่ง: ครู ชำนาญการ</p>
              <p>📌 ประเภทการลา: ลาป่วย</p>
              <p>📅 วันที่ลา: 15 ต.ค. 2569 (1 วันทำการ)</p>
              <p>📝 เหตุผล: 123</p>
              <p>📞 เบอร์โทรติดต่อ: 087-654-3210</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isTestingLine}
              onClick={handleTestLineNotification}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              {isTestingLine ? 'กำลังส่งทดสอบ...' : 'ทดสอบส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE'}
            </button>
          </div>
        </div>

        {/* Save button for settings */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลงทั้งหมด'}
          </button>
        </div>
      </form>

      {/* 5. การจัดการข้อมูลและการรีเซ็ตวันลาทั้งหมด (สำหรับ Admin/ผู้บริหาร) */}
      <div className="bg-rose-50/60 rounded-3xl p-6 border border-rose-200 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-rose-950 text-base">
                การจัดการข้อมูลและการรีเซ็ตวันลาทั้งหมด
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                สำหรับผู้ดูแลระบบ / ผู้บริหาร: ล้างรายการใบลาทั้งหมด และปรับยอดสถิติวันลาสะสมของทุกคนให้เป็น 0 วัน (โควตากลับคืนเต็มจำนวน)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setResetPin('');
              setResetError('');
              setShowResetModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer shrink-0"
          >
            รีเซ็ตวันลาและสถิติทั้งหมด
          </button>
        </div>

        <p className="text-[11px] text-rose-700 leading-relaxed">
          * เหมาะสำหรับการเริ่มต้นปีงบประมาณใหม่ หรือการล้างข้อมูลทดสอบระบบ ระบบจะทำการสำรองข้อมูลอัตโนมัติก่อนล้างเสมอ
        </p>
      </div>

      {/* 6. ระบบสำรองข้อมูลอัตโนมัติ (Automated Daily Backups) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              ระบบสำรองข้อมูลอัตโนมัติ (Daily Backups)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบบันทึกข้อมูลย้อนหลังทุกวันและจัดเก็บไว้บนเซิร์ฟเวอร์แบบปลอดภัย
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await onCreateBackup('สำรองข้อมูลด้วยตนเอง');
              setStatusMsg({ text: 'สร้างจุดสำรองข้อมูลเรียบร้อยแล้ว', type: 'success' });
              setTimeout(() => setStatusMsg(null), 3000);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            + สร้างจุดสำรองข้อมูลตอนนี้
          </button>
        </div>

        <div className="space-y-2">
          {backups.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีประวัติการสำรองข้อมูล</p>
          ) : (
            backups.map(b => (
              <div
                key={b.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{b.note}</span>
                  <span className="text-slate-500 ml-2">({b.recordCount} รายการใบลา)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    บันทึกเมื่อ: {new Date(b.timestamp).toLocaleString('th-TH')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedBackupId(b.id);
                    setRestorePin('');
                    setShowRestoreModal(true);
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium cursor-pointer"
                >
                  กู้คืน (Restore)
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">
              ยืนยันการรีเซ็ตข้อมูลวันลาทั้งหมด
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 mb-4 leading-relaxed">
              การกดปุ่มนี้จะลบรายการใบลาทั้งหมด และปรับยอดสถิติวันลาสะสมของครูทุกคนให้เริ่มต้นใหม่ที่ 0 วัน (โควตากลับคืนเต็มจำนวน)
            </p>

            {resetError && (
              <div className="mb-3 p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 text-center">
                {resetError}
              </div>
            )}

            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  กรอกรหัสผ่านผู้ดูแลระบบ (1234) เพื่อยืนยัน:
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="รหัสผ่าน 4 หลัก (1234)"
                  value={resetPin}
                  onChange={(e) => setResetPin(e.target.value)}
                  className="w-full text-center text-lg tracking-widest font-mono py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? 'กำลังดำเนินการ...' : 'ยืนยันล้างข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 text-center">
              ยืนยันการกู้คืนข้อมูล (Restore)
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-4">
              กรุณากรอกรหัสผ่านเพื่อยืนยันการกู้คืน
            </p>

            <form onSubmit={handleConfirmRestore} className="space-y-4">
              <input
                type="password"
                required
                autoFocus
                placeholder="กรอกรหัสผ่าน (1234)"
                value={restorePin}
                onChange={(e) => setRestorePin(e.target.value)}
                className="w-full text-center text-lg tracking-widest font-mono py-2.5 px-3 rounded-xl border border-slate-300"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  กู้คืนข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Apps Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                การตั้งค่า Google Apps Script Web App
              </h3>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ไฟล์ <code>Code.gs</code> พร้อมใช้งานในระบบเรียบร้อยแล้ว โดยกำหนดค่าคงที่ 4 บรรทัดบนสุดตรงตามข้อกำหนด:
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto">
                {scriptCodeSample}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scriptCodeSample);
                  setHasCopiedScript(true);
                  setTimeout(() => setHasCopiedScript(false), 2000);
                }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                {hasCopiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {hasCopiedScript ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-blue-50 p-3.5 rounded-2xl border border-blue-200">
              <p className="font-bold text-blue-900">ขั้นตอนการนำไปใช้บน Google Sheets:</p>
              <p>1. เปิด Google Sheets ที่มี ID: <code>1B2Ak8GlFJAjOLs9IJwoRX2-ZoSTDHbtMr5wRo6z5TIE</code></p>
              <p>2. ไปที่เมนู ส่วนขยาย (Extensions) &gt; Apps Script</p>
              <p>3. วางโค้ดจากไฟล์ Code.gs ทั้งหมด แล้วกด บันทึก</p>
              <p>4. กด ทำให้ใช้งานได้ (Deploy) &gt; รายการทำให้ใช้งานได้ใหม่ (New deployment) &gt; ประเภท: เว็บแอป (Web app)</p>
              <p>5. กำหนด สิทธิ์เข้าถึง (Who has access) เป็น "ทุกคน (Anyone)"</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
