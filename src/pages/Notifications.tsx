import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Info,
  Filter,
  Check,
  UserPlus,
  Share2,
  Trash2,
  CheckCheck,
  Loader2
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface Notification {
  _id: string;
  type: 'REFERRAL' | 'MEETING' | 'SYSTEM' | 'LEADERBOARD' | 'MEMBER';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MEMBER' | 'REFERRAL' | 'MEETING' | 'SYSTEM'>('ALL');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await apiService.markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await apiService.markAllNotificationsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'ALL' || n.type === activeTab
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'REFERRAL': return <Share2 className="w-5 h-5" />;
      case 'MEETING': return <Calendar className="w-5 h-5" />;
      case 'MEMBER': return <UserPlus className="w-5 h-5" />;
      case 'SYSTEM': return <Bell className="w-5 h-5" />;
      case 'LEADERBOARD': return <Trophy className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REFERRAL': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'MEETING': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'MEMBER': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'SYSTEM': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Activity Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 pb-32 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
              <Bell className="w-3 h-3" />
              Real-time Notifications
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Activity Center</h1>
           <p className="text-slate-500 font-medium mt-1">Manage Chapter highlights, referrals, and member updates.</p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-900 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {(['ALL', 'MEMBER', 'REFERRAL', 'MEETING', 'SYSTEM'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeTab === tab 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' 
                : 'bg-white text-slate-400 hover:text-slate-600 border-slate-100 hover:border-slate-200 shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification._id}
              onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
              className={`group relative bg-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 border transition-all cursor-pointer ${
                !notification.isRead 
                  ? 'border-indigo-100 bg-indigo-50/10 ring-1 ring-indigo-50 shadow-md' 
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300 shadow-slate-200/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-3xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                  !notification.isRead ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300'
                }`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center gap-3">
                       <h3 className={`text-sm font-black uppercase tracking-tight break-words ${
                         !notification.isRead ? 'text-slate-900' : 'text-slate-500'
                       }`}>
                         {notification.title}
                       </h3>
                       {!notification.isRead && (
                         <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse shrink-0"></span>
                       )}
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-lg w-fit">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(notification.createdAt)}
                    </div>
                  </div>
                  
                  <p className={`text-sm font-medium leading-relaxed mb-6 break-words whitespace-pre-wrap ${
                    !notification.isRead ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${getTypeColor(notification.type)}`}>
                       {notification.type}
                     </span>
                     
                     {!notification.isRead && (
                       <button className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest group/btn">
                         Mark read <Check className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] p-16 md:p-24 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Bell className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Notifications Yet</h3>
             <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed mb-8">
               You will see important updates, meeting alerts, and referral activity here.
             </p>
             <button 
               onClick={fetchNotifications}
               className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 mx-auto"
             >
               Refresh Notifications
             </button>
             {activeTab !== 'ALL' && (
               <button 
                 onClick={() => setActiveTab('ALL')}
                 className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline block mx-auto"
               >
                 View All Activity
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
