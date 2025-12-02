
import React from 'react';
import { Users, Clock, Calculator, LayoutDashboard, BrainCircuit, HardHat, Plane, Wallet, ClipboardCheck, BarChart3, Settings, LogOut, FileBadge, Gift, Shield, Scale, Briefcase } from 'lucide-react';
import { Page, User } from '../types';

interface SidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage, currentUser, onLogout }) => {
  const menuItems = [
    { id: Page.DASHBOARD, label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
    { id: Page.EMPLOYEES, label: 'سجل الموظفين', icon: <Users size={20} /> },
    { id: Page.STATUS_STATEMENT, label: 'بيان حالة', icon: <FileBadge size={20} /> },
    { id: Page.ATTENDANCE, label: 'الحضور والانصراف', icon: <Clock size={20} /> },
    { id: Page.LEAVES, label: 'الإجازات والمأموريات', icon: <Plane size={20} /> },
    { id: Page.LOANS, label: 'السلف والقروض', icon: <Wallet size={20} /> },
    { id: Page.BONUSES, label: 'المكافآت والمنح', icon: <Gift size={20} /> },
    { id: Page.EXTERNAL_WORKERS, label: 'عميل من الخارج', icon: <Briefcase size={20} /> },
    { id: Page.PAYROLL, label: 'المرتبات والأجور', icon: <Calculator size={20} /> },
    { id: Page.TAX_SETTLEMENT, label: 'التسوية الضريبية', icon: <Scale size={20} /> },
    { id: Page.PERFORMANCE, label: 'تقييم الأداء', icon: <ClipboardCheck size={20} /> },
    { id: Page.REPORTS, label: 'مركز التقارير', icon: <BarChart3 size={20} /> },
    { id: Page.AI_ADVISOR, label: 'المستشار القانوني', icon: <BrainCircuit size={20} /> },
  ];

  if (currentUser.role === 'admin') {
      menuItems.push({ id: Page.USERS, label: 'إدارة المستخدمين', icon: <Shield size={20} /> });
  }

  const handleLogout = () => {
      onLogout();
  };

  return (
    <aside className="w-72 glass-dark text-white min-h-screen flex flex-col shadow-2xl z-50 sticky top-0 h-screen transition-all duration-300">
      
      {/* Logo Section */}
      <div className="p-6 flex flex-col items-center gap-4 border-b border-emerald-500/20 bg-gradient-to-b from-emerald-950 to-transparent relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.3)] border border-emerald-400/30 w-32 h-32 flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-500 hover:rotate-3 group cursor-pointer">
             <img 
                src="/logo.png" 
                alt="شعار النقابة" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                onError={(e: any) => {
                    e.currentTarget.src = "/logo.svg"; 
                    e.currentTarget.onerror = (ev: any) => {
                        (ev.target as HTMLImageElement).style.display = 'none';
                        (ev.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }
                }}
             />
             <HardHat size={48} className="text-emerald-400 hidden" />
        </div>
        
        <div className="text-center mt-2 animate-fade-in delay-100 z-10">
            <h1 className="font-extrabold text-xl leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">نقابة المهندسين</h1>
            <p className="text-sm text-emerald-300 font-medium tracking-wide mt-1">الفرعية بأسيوط</p>
        </div>
      </div>
      
      {/* User Info */}
      <div className="mx-4 mt-4 animate-fade-in delay-200">
          <div className="bg-emerald-800/30 backdrop-blur-md p-3 rounded-2xl text-center border border-emerald-500/20 shadow-inner flex items-center justify-center gap-3 group hover:bg-emerald-800/50 transition-colors">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                  <p className="text-[10px] text-emerald-300/80 uppercase tracking-wider mb-0.5">تسجيل دخول</p>
                  <p className="font-bold text-white truncate text-sm group-hover:text-emerald-200 transition-colors">{currentUser.name}</p>
              </div>
          </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700/50 scrollbar-track-transparent">
        {menuItems.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{ animationDelay: `${idx * 50}ms` }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group animate-slide-in-right relative overflow-hidden ${
              activePage === item.id
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/30 translate-x-[-6px]'
                : 'text-emerald-100/90 hover:bg-white/10 hover:text-white hover:translate-x-[-4px]'
            }`}
          >
            {activePage === item.id && (
                <div className="absolute left-0 top-0 h-full w-1 bg-white/50 rounded-r-full shadow-[0_0_10px_white]"></div>
            )}
            
            <span className={`transition-transform duration-300 relative z-10 ${activePage === item.id ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-emerald-300'}`}>
                {item.icon}
            </span>
            <span className="text-sm relative z-10">{item.label}</span>
            
            {activePage === item.id && (
                <div className="mr-auto w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse"></div>
            )}
          </button>
        ))}

        <div className="my-4 border-t border-emerald-500/20 mx-6"></div>

        <button
            onClick={() => setPage(Page.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
              activePage === Page.SETTINGS
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/30 translate-x-[-6px]'
                : 'text-emerald-100/90 hover:bg-white/10 hover:text-white hover:translate-x-[-4px]'
            }`}
          >
            <Settings size={20} className={`transition-transform duration-700 ${activePage === Page.SETTINGS ? 'rotate-180' : 'group-hover:rotate-90'}`} />
            <span className="text-sm">الإعدادات</span>
        </button>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-emerald-500/20 bg-gradient-to-t from-emerald-950/80 to-transparent backdrop-blur-sm">
        <button 
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/90 text-red-200 hover:text-white py-3 rounded-xl transition-all duration-300 text-sm font-bold border border-red-500/20 hover:border-red-500 shadow-lg hover:shadow-red-900/30 group btn-interactive"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          تسجيل خروج
        </button>
      </div>
    </aside>
  );
};
