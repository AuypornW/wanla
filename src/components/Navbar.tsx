import React, { useState } from 'react';
import { Menu, UserCheck, RefreshCw, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { Personnel } from '../types';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  personnelList: Personnel[];
  currentUser: Personnel | null;
  onSelectUser: (user: Personnel) => void;
  onSyncSheets: () => void;
  isSyncing: boolean;
  lastSyncedAt?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  personnelList,
  currentUser,
  onSelectUser,
  onSyncSheets,
  isSyncing
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Format today's date in Thai
  const todayStr = new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                ระบบจัดการวันลาออนไลน์
              </h2>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {todayStr}
            </p>
          </div>
        </div>

        {/* Right: Sync & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Google Sheets Sync Button */}
          <button
            onClick={onSyncSheets}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="ซิงค์ข้อมูลกับ Google Sheets ทันที"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ Google Sheets'}</span>
          </button>

          {/* User Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser ? `${currentUser.firstName.charAt(0)}` : 'ครู'}
              </div>

              <div className="hidden lg:block min-w-0 max-w-[140px]">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {currentUser ? `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}` : 'เลือกผู้ใช้งาน'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentUser?.position}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      สลับผู้ใช้งานในระบบ (Demo)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      เลือกเพื่อจำลองมุมมองของแต่ละตำแหน่ง
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                    {personnelList.map((user) => {
                      const isCurrent = currentUser?.id === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSelectUser(user);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="truncate font-medium">
                              {user.prefix}{user.firstName} {user.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {user.position} {user.academicStanding !== 'ไม่มี' ? user.academicStanding : ''}
                            </div>
                            <div className="text-[10px] text-blue-600 mt-0.5 font-normal">
                              {user.role.replace(/^\d/, '')}
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
