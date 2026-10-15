/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LeaveFormView } from './components/LeaveFormView';
import { PersonnelView } from './components/PersonnelView';
import { ApprovalView } from './components/ApprovalView';
import { ReportsView } from './components/ReportsView';
import { SchoolSettingsView } from './components/SchoolSettingsView';
import { LeaveDetailModal } from './components/LeaveDetailModal';
import { Personnel, LeaveRequest, SchoolSettings, QuotaSetting } from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [backups, setBackups] = useState<any[]>([]);

  // Layout states
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState<LeaveRequest | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load initial data
  const fetchData = async () => {
    try {
      const [resP, resL, resS, resB] = await Promise.all([
        fetch('/api/personnel').then(r => r.json()),
        fetch('/api/leaves').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/backups').then(r => r.json())
      ]);

      if (resP.success && resP.personnel) {
        setPersonnelList(resP.personnel);
        if (!currentUser) {
          // Default to teacher นายชัชวาลย์ ใจภักดี if present, or first
          const defaultStaff = resP.personnel.find((p: Personnel) => p.id === 'P-003') || resP.personnel[0];
          setCurrentUser(defaultStaff);
        } else {
          // Update current user data
          const updatedCurrent = resP.personnel.find((p: Personnel) => p.id === currentUser.id);
          if (updatedCurrent) setCurrentUser(updatedCurrent);
        }
      }

      if (resL.success && resL.leaves) {
        setLeaves(resL.leaves);
      }

      if (resS.success && resS.settings) {
        setSettings(resS.settings);
      }

      if (resB.success && resB.backups) {
        setBackups(resB.backups);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Verify Pin (1234)
  const handleVerifyPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      return Boolean(data.success && data.authorized);
    } catch {
      return false;
    }
  };

  // Handle Submit Leave Request
  const handleSubmitLeave = async (leaveData: Partial<LeaveRequest>): Promise<boolean> => {
    try {
      setIsSubmittingLeave(true);
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });
      const data = await res.json();
      setIsSubmittingLeave(false);

      if (data.success && data.leave) {
        showToast('ยื่นคำขอลาออนไลน์สำเร็จ และส่งข้อความแจ้งเตือนเข้า LINE แล้ว', 'success');
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      setIsSubmittingLeave(false);
      showToast('เกิดข้อผิดพลาดในการส่งคำขอ', 'error');
      return false;
    }
  };

  // Handle Approve Leave
  const handleApproveLeave = async (
    leaveId: string,
    roleType: string,
    approverName: string,
    comment: string,
    signature: string,
    approved: boolean
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleType,
          approverName,
          comment,
          signature,
          approved
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          approved
            ? `อนุมัติคำขอลา ${leaveId} สำเร็จ แนบลายเซ็นและส่งแจ้งเตือน LINE แล้ว`
            : `บันทึกคำสั่งไม่อนุมัติ ${leaveId} แล้ว`,
          approved ? 'success' : 'info'
        );
        await fetchData();
        return true;
      }
      return false;
    } catch {
      showToast('ไม่สามารถบันทึกการอนุมัติได้', 'error');
      return false;
    }
  };

  // Handle Personnel Save / Edit
  const handleSavePersonnel = async (personnel: Partial<Personnel>): Promise<boolean> => {
    try {
      const isEdit = Boolean(personnel.id);
      const url = isEdit ? `/api/personnel/${personnel.id}` : '/api/personnel';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personnel)
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'อัปเดตข้อมูลบุคลากรเรียบร้อย' : 'เพิ่มบุคลากรใหม่เรียบร้อย', 'success');
        await fetchData();
        return true;
      }
      return false;
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกบุคลากร', 'error');
      return false;
    }
  };

  // Handle Personnel Delete
  const handleDeletePersonnel = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/personnel/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('ลบข้อมูลบุคลากรเรียบร้อย', 'info');
        await fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Handle Settings Update
  const handleUpdateSettings = async (newSettings: Partial<SchoolSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast('บันทึกการตั้งค่าหน่วยงานและโควต้าสำเร็จ', 'success');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Handle Test LINE
  const handleTestLine = async () => {
    try {
      const res = await fetch('/api/line/test', { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Handle Sync Google Sheets
  const handleSyncSheets = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync-sheets', { method: 'POST' });
      const data = await res.json();
      setIsSyncing(false);
      if (data.success) {
        showToast('ซิงค์ข้อมูลกับ Google Sheets สำเร็จเรียบร้อย', 'success');
      } else {
        showToast(`Google Sheets Sync: ${data.message || 'บันทึกบนเซิร์ฟเวอร์เรียบร้อย'}`, 'info');
      }
      return data;
    } catch (err: any) {
      setIsSyncing(false);
      showToast(`การเชื่อมต่อ Google Sheets: ${err.message}`, 'info');
      return { success: false, message: err.message };
    }
  };

  // Handle Reset All Leaves (Admin PIN)
  const handleResetAllLeaves = async (pin: string) => {
    try {
      const res = await fetch('/api/admin/reset-leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await fetchData();
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Handle Backup Create
  const handleCreateBackup = async (note: string) => {
    try {
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      const data = await res.json();
      await fetchData();
      return Boolean(data.success);
    } catch {
      return false;
    }
  };

  // Handle Backup Restore
  const handleRestoreBackup = async (backupId: string, pin: string) => {
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId, pin })
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const pendingApprovalsCount = leaves.filter(l => l.status === 'pending' || l.status === 'academic_approved').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-['Prompt',sans-serif]">
      {/* Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isTabletCollapsed={isTabletCollapsed}
        onToggleCollapse={() => setIsTabletCollapsed(!isTabletCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          personnelList={personnelList}
          currentUser={currentUser}
          onSelectUser={(u) => {
            setCurrentUser(u);
            showToast(`สลับผู้ใช้งานเป็น: ${u.prefix}${u.firstName} ${u.lastName}`, 'info');
          }}
          onSyncSheets={handleSyncSheets}
          isSyncing={isSyncing}
          lastSyncedAt={settings?.lastSyncedAt}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              leaves={leaves}
              quotas={settings?.quotas || []}
              onNavigateApply={() => setCurrentTab('apply')}
              onViewLeave={(l) => setSelectedLeaveDetail(l)}
            />
          )}

          {currentTab === 'apply' && (
            <LeaveFormView
              currentUser={currentUser}
              personnelList={personnelList}
              onSubmitLeave={handleSubmitLeave}
              isSubmitting={isSubmittingLeave}
              onSuccessNavigate={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'personnel' && (
            <PersonnelView
              personnelList={personnelList}
              onSavePersonnel={handleSavePersonnel}
              onDeletePersonnel={handleDeletePersonnel}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'approval' && (
            <ApprovalView
              leaves={leaves}
              personnelList={personnelList}
              currentUser={currentUser}
              onApproveLeave={handleApproveLeave}
              onVerifyPin={handleVerifyPin}
              isPinUnlocked={isPinUnlocked}
              setIsPinUnlocked={setIsPinUnlocked}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              leaves={leaves}
              personnelList={personnelList}
              onViewLeave={(l) => setSelectedLeaveDetail(l)}
            />
          )}

          {currentTab === 'school-info' && (
            <SchoolSettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onTestLine={handleTestLine}
              onSyncSheets={handleSyncSheets}
              onResetAllLeaves={handleResetAllLeaves}
              backups={backups}
              onCreateBackup={handleCreateBackup}
              onRestoreBackup={handleRestoreBackup}
            />
          )}
        </main>
      </div>

      {/* Leave Detail Modal */}
      <LeaveDetailModal
        leave={selectedLeaveDetail}
        onClose={() => setSelectedLeaveDetail(null)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="no-print fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/70 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
