
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  ShieldAlert, 
  Globe, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  RefreshCcw,
  UserCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminNotifications: React.FC = () => {
  const [mode, setMode] = useState<'GLOBAL' | 'CHAPTER'>('GLOBAL');
  const [message, setMessage] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [chapterData, alertsData] = await Promise.all([
        apiService.getAdminChapters(),
        apiService.getSystemAlerts()
      ]);
      setChapters(chapterData.data || []);
      setSystemAlerts(alertsData);
    } catch (error) {
       console.error('Error fetching broadcast data:', error);
    } finally {
       setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!message.trim()) return;
    if (mode === 'CHAPTER' && !chapterId) {
      alert('Please select a target chapter');
      return;
    }

    setDispatching(true);
    try {
      // For now using a placeholder adminId, ideally from auth state
      const adminId = '660d1a2b3c4d5e6f7a8b9c0d'; 
      await apiService.broadcastNotification({
        message,
        recipientType: mode,
        chapterId: mode === 'CHAPTER' ? chapterId : undefined,
        adminId
      });
      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Dispatch error:', error);
      alert('Failed to dispatch notification');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-32 w-full mx-auto min-h-screen bg-slate-50/50">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Notifications Broadcast</h1>
          <p className="text-slate-500 font-medium text-sm">Send global alerts or targeted updates to specific chapters.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
           
           <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
             <Send className="w-6 h-6 text-slate-900" /> New Broadcast
           </h3>
           
           <div className="space-y-8 relative z-10">
             <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Recipients Strategy</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setMode('GLOBAL')}
                    className={`flex-1 py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${
                      mode === 'GLOBAL' 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <Globe className="w-4 h-4" /> Global (All Users)
                  </button>
                  <button 
                    onClick={() => setMode('CHAPTER')}
                    className={`flex-1 py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${
                      mode === 'CHAPTER' 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <Layers className="w-4 h-4" /> Specific Chapter
                  </button>
                </div>
             </div>

             {mode === 'CHAPTER' && (
               <div className="animate-in slide-in-from-top-2 duration-300">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Chapter</label>
                 <select 
                   value={chapterId}
                   onChange={(e) => setChapterId(e.target.value)}
                   className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-bold text-sm text-slate-900 appearance-none"
                 >
                   <option value="">Select a node...</option>
                   {chapters.map((chap: any) => (
                     <option key={chap._id} value={chap._id}>{chap.name} ({chap.city})</option>
                   ))}
                 </select>
               </div>
             )}

             <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Alert Payload</label>
               <textarea 
                 rows={5}
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder="Type your announcement here..."
                 className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-medium text-slate-700 leading-relaxed"
               ></textarea>
             </div>

             <button 
               onClick={handleDispatch}
               disabled={dispatching || !message.trim()}
               className={`w-full py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${
                 success ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-900 shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100'
               }`}
             >
               {dispatching ? (
                 <RefreshCcw className="w-5 h-5 animate-spin" />
               ) : success ? (
                 <>
                   <CheckCircle2 className="w-5 h-5" /> Dispatched Successfully
                 </>
               ) : (
                 <>
                   <Zap className="w-5 h-5" /> Dispatch Notification
                 </>
               )}
             </button>
           </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            <h3 className="text-white font-black mb-10 flex items-center gap-3 relative z-10 text-xl">
              <ShieldAlert className="w-6 h-6 text-rose-500" /> System Alerts
            </h3>
            
            <div className="space-y-4 relative z-10">
               {loading ? (
                 <div className="py-12 flex flex-col items-center justify-center text-slate-600 gap-3">
                   <RefreshCcw className="w-8 h-8 animate-spin" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Scanning network...</p>
                 </div>
               ) : systemAlerts.length > 0 ? (
                 systemAlerts.map((alert: any, idx: number) => (
                   <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group/alert">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-black text-white">{alert.title}</p>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover/alert:text-white transition-colors" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{alert.message}</p>
                      <div className="mt-4 flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           alert.type === 'WARNING' ? 'bg-rose-500' :
                           alert.type === 'MAINTENANCE' ? 'bg-amber-500' :
                           alert.type === 'UPDATE' ? 'bg-indigo-500' : 'bg-emerald-500'
                         }`}></div>
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{alert.type}</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="py-12 flex flex-col items-center justify-center text-slate-600">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">All systems operational</p>
                 </div>
               )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                   <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-black text-slate-900 text-sm italic">Audit Trail</h4>
             </div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
               Every broadcast is logged with an administrative timestamp and recipient manifest for auditing purposes.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
