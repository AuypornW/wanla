import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  Users,
  CheckCircle2,
  FileBarChart,
  Building2,
  School,
  Lock,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export type NavTab = 'dashboard' | 'apply' | 'personnel' | 'approval' | 'reports' | 'school-info';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isTabletCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isTabletCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  pendingApprovalsCount
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'แดชบอร์ด',
      icon: LayoutDashboard,
      desc: 'ภาพรวมและสิทธิวันลา'
    },
    {
      id: 'apply' as NavTab,
      label: 'ยื่นใบลา',
      icon: FilePlus2,
      desc: 'กรอกแบบฟอร์มคำขอออนไลน์'
    },
    {
      id: 'personnel' as NavTab,
      label: 'ข้อมูลบุคลากร',
      icon: Users,
      desc: 'รายชื่อครูและลายมือชื่อ'
    },
    {
      id: 'approval' as NavTab,
      label: 'การอนุมัติ',
      icon: CheckCircle2,
      desc: 'ตรวจและอนุมัติใบลา',
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      locked: true
    },
    {
      id: 'reports' as NavTab,
      label: 'รายงานการลา',
      icon: FileBarChart,
      desc: 'สถิติ กราฟ และบันทึกข้อความ'
    },
    {
      id: 'school-info' as NavTab,
      label: 'ข้อมูลหน่วยงาน',
      icon: Building2,
      desc: 'โควต้าวันลา & แจ้งเตือน LINE'
    }
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-white">
            <School className="w-5 h-5" />
          </div>
          {(!isTabletCollapsed || isMobileOpen) && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-white truncate leading-tight">
                โรงเรียนบ้านห้วยไคร้
              </h1>
              <p className="text-[11px] text-blue-400 truncate">
                สพป.สุโขทัย เขต 2
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group relative ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="shrink-0 relative">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                {item.badge && isTabletCollapsed && !isMobileOpen && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    {item.badge}
                  </span>
                )}
              </div>

              {(!isTabletCollapsed || isMobileOpen) && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="truncate">
                    <div className="text-sm font-medium leading-none flex items-center gap-1.5">
                      {item.label}
                      {item.locked && (
                        <span title="ต้องใช้รหัสผ่าน 1234">
                          <Lock className="w-3 h-3 text-slate-400 inline shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300 mt-1 truncate">
                      {item.desc}
                    </div>
                  </div>

                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800">
        {(!isTabletCollapsed || isMobileOpen) ? (
          <div className="bg-slate-800/50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>ระบบจัดการวันลาออนไลน์</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Google Sheets & LINE Bot Active
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="ระบบออนไลน์" />
          </div>
        )}

        {/* Tablet collapse toggle button */}
        <div className="hidden md:flex justify-end pt-2">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title={isTabletCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
          >
            {isTabletCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`no-print hidden md:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${
          isTabletCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          className="no-print fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 h-full bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
