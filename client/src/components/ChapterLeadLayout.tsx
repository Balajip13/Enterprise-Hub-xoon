import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  BarChart3, 
  Bell, 
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { apiService } from '../services/apiService';
import StatusBanner from './StatusBanner';

interface ChapterLeadLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const ChapterLeadLayout: React.FC<ChapterLeadLayoutProps> = ({ children, activeTab, onTabChange, onSignOut }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const user = useMemo(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchUnread = async () => {
      try {
        const { count } = await apiService.getUnreadNotificationCount(user.id);
        setUnreadCount(count || 0);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'referrals', label: 'Referrals', icon: BarChart3 },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'approvals', label: 'Approvals', icon: UserPlus },
    { id: 'reports', label: 'Reports', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 bg-slate-950 text-white p-4 flex items-center justify-between z-[60] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black italic shadow-lg">
            X
          </div>
          <h1 className="text-lg font-extrabold tracking-tight">XOON</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-slate-900 rounded-xl text-slate-400 active:scale-95 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[70] transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-slate-950 text-white flex flex-col shadow-2xl z-[80] transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-white/5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-indigo-600/20">
              X
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">XOON</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Chapter Lead</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 bg-slate-900 rounded-xl text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide min-h-0 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id 
                  ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative mr-4">
                <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-3 ${activeTab === tab.id ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm tracking-tight">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center px-4 py-3.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 mr-4 text-slate-500 group-hover:text-rose-400 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-sm tracking-tight">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:ml-72 bg-[#F8FAFC]">
        <StatusBanner status={user?.status} />
        <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Core actions */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 glass rounded-3xl border border-white/40 flex justify-around items-center px-4 py-3 z-50 shadow-2xl pb-safe">
        {tabs.filter(t => ['dashboard', 'members', 'meetings'].includes(t.id)).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 ${
              activeTab === tab.id ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-[9px] mt-1 font-extrabold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ChapterLeadLayout;
