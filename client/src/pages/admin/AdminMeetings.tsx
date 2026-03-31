
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin, 
  Clock, 
  X, 
  RefreshCcw, 
  ChevronRight, 
  Users, 
  History,
  Building2,
  User as UserIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminMeetings: React.FC = () => {
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [historyMeetings, setHistoryMeetings] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    chapter: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    host: '',
    description: '',
    type: 'Weekly Meeting'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [upcoming, chapRes, userRes] = await Promise.all([
        apiService.getUpcomingMeetings(),
        apiService.getAdminChapters(),
        apiService.getAdminUsers()
      ]);
      setUpcomingMeetings(upcoming);
      setChapters(chapRes.data || []);
      setUsers(userRes);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const history = await apiService.getMeetingHistory();
      setHistoryMeetings(history);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSync = async () => {
    try {
      await apiService.syncMeetings();
      fetchInitialData();
    } catch (error) {
      alert('Sync failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateAdminMeeting(editingId, formData);
      } else {
        await apiService.createAdminMeeting(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        chapter: '',
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        host: '',
        description: '',
        type: 'Weekly Meeting'
      });
      fetchInitialData();
    } catch (error) {
      alert(editingId ? 'Error updating meeting' : 'Error scheduling meeting');
    }
  };

  const handleEdit = (mtg: any) => {
    setEditingId(mtg._id);
    setFormData({
      chapter: mtg.chapter,
      title: mtg.title,
      date: mtg.date ? new Date(mtg.date).toISOString().split('T')[0] : '',
      startTime: mtg.startTime,
      endTime: mtg.endTime,
      location: mtg.location,
      host: mtg.host?._id || mtg.host || '',
      description: mtg.description || '',
      type: mtg.type || 'Weekly Meeting'
    });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await apiService.deleteAdminMeeting(id);
        fetchInitialData();
      } catch (error) {
        alert('Error deleting meeting');
      }
    }
    setActiveDropdown(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-32 w-full mx-auto min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Network Meetings
              </h1>
              <span className="text-[10px] md:text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded-md tracking-widest uppercase">Admin</span>
            </div>
            <p className="text-slate-500 font-medium text-sm">Schedule and moderate hub interactions</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-xs uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              Schedule Event
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary (Mini) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Upcoming', val: upcomingMeetings.length, icon: Calendar, color: 'text-indigo-600' },
           { label: 'Avg Attendance', val: '84%', icon: Users, color: 'text-emerald-600' },
           { label: 'Active Chapters', val: chapters.filter((c: any) => c.status === 'active').length, icon: Building2, color: 'text-amber-500' },
           { label: 'Last Sync', val: 'Just Now', icon: RefreshCcw, color: 'text-slate-400' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 bg-slate-50 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                 <stat.icon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-lg font-black text-slate-900">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
           <RefreshCcw className="w-10 h-10 animate-spin mb-4" />
           <p className="font-bold text-slate-400">Loading summits...</p>
        </div>
      ) : upcomingMeetings.length > 0 ? (
        <div className="mt-10 space-y-8">
           <div className="flex flex-col gap-3">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-indigo-600" />
                 Upcoming Summits
              </h2>
              <div className="flex items-center gap-4 w-full">
                 <button onClick={fetchHistory} className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                   <History className="w-3.5 h-3.5" />
                   History
                 </button>
                 <span className="text-slate-200">|</span>
                 <button onClick={handleSync} className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                   <RefreshCcw className="w-3.5 h-3.5" />
                   Refresh Sync
                 </button>
              </div>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMeetings.map((mtg) => (
                <div key={mtg._id} className="bg-white p-4 sm:p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors"></div>
                   
                   {/* Actions Dropdown */}
                   <div className="absolute top-6 right-6 z-20">
                      <div className="relative">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setActiveDropdown(activeDropdown === mtg._id ? null : mtg._id);
                           }}
                           className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-transparent hover:border-slate-100 bg-white/50 backdrop-blur-sm"
                         >
                            <MoreVertical className="w-5 h-5" />
                         </button>

                         {activeDropdown === mtg._id && (
                           <>
                             <div 
                               className="fixed inset-0 z-20" 
                               onClick={() => setActiveDropdown(null)}
                             ></div>
                             <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 py-2 animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                  onClick={() => handleEdit(mtg)}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                >
                                   <Filter className="w-4 h-4 text-indigo-500" />
                                   Edit Event
                                </button>
                                <button 
                                  onClick={() => handleDelete(mtg._id)}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                   <X className="w-4 h-4 text-red-500" />
                                   Delete Event
                                </button>
                             </div>
                           </>
                         )}
                      </div>
                   </div>

                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                         <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            {mtg.chapter}
                         </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{mtg.title}</h3>
                      
                       <div className="space-y-4">
                          <div className="flex items-start gap-3 text-slate-500">
                             <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                             <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date:</p>
                                <span className="text-sm font-black text-slate-900">{new Date(mtg.date).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <div className="flex items-start gap-3 text-slate-500">
                             <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                             <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Time:</p>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{mtg.startTime} - {mtg.endTime}</span>
                             </div>
                          </div>
                          <div className="flex items-start gap-3 text-slate-500">
                             <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                             <div className="flex flex-col min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Location:</p>
                                <span className="text-xs font-bold break-words leading-relaxed text-slate-700">{mtg.location}</span>
                             </div>
                          </div>
                          <div className="flex items-start gap-3 text-slate-500 border-t border-slate-50 pt-5 mt-5">
                             <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 shadow-lg shadow-slate-900/10">
                                {mtg.host?.name?.charAt(0) || 'H'}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Host Lead</p>
                                <p className="text-xs font-black text-slate-900 truncate">{mtg.host?.name || 'Assigned Lead'}</p>
                             </div>
                          </div>
                       </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Upcoming Summits</h3>
          <p className="text-slate-500 max-w-sm font-medium mb-8">No meetings are scheduled for the next 7 days. Start by creating a new chapter summit.</p>
          <div className="flex flex-col sm:flex-row gap-4">
             <button onClick={fetchHistory} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">View History</button>
             <button onClick={handleSync} className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Refresh Sync</button>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingId ? 'Edit Event Details' : 'Schedule New Summit'}
                </h2>
                <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-widest">
                  {editingId ? 'Modify Chapter Gathering' : 'Authorize Chapter Gathering'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({
                    chapter: '',
                    title: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                    host: '',
                    description: '',
                    type: 'Weekly Meeting'
                  });
                }} 
                className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Chapter</label>
                  <select 
                    required
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700 cursor-pointer appearance-none text-left"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1.25rem center',
                      backgroundSize: '1.25rem'
                    }}
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Meeting Type</label>
                  <select 
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700 cursor-pointer appearance-none text-left"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1.25rem center',
                      backgroundSize: '1.25rem'
                    }}
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Weekly Meeting">Weekly Meeting</option>
                    <option value="Special Event">Special Event</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Meeting Title</label>
                <input 
                  type="text" required
                  placeholder="e.g. Weekly Strategic Exchange"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                 <div className="space-y-2 text-left">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date</label>
                   <input 
                     type="date" required
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                     value={formData.date}
                     onChange={(e) => setFormData({...formData, date: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2 text-left">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Time</label>
                   <input 
                     type="time" required
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                     value={formData.startTime}
                     onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2 text-left">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Time</label>
                   <input 
                     type="time" required
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                     value={formData.endTime}
                     onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                   />
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Location / Venue</label>
                  <input 
                    type="text" required
                    placeholder="Physical address or link"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign Host (Lead)</label>
                  <select 
                    required
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700 cursor-pointer appearance-none text-left"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1.25rem center',
                      backgroundSize: '1.25rem'
                    }}
                    value={formData.host}
                    onChange={(e) => setFormData({...formData, host: e.target.value})}
                  >
                    <option value="">Select Host</option>
                    {users.filter(u => u.role !== 'MEMBER').map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {editingId ? 'Save Changes' : 'Confirm Summit Launch'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                   <History className="w-6 h-6 text-slate-400" />
                   Meeting Archives
                </h2>
                <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-widest">Historical Chapter Engagements</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Summit Title</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chapter</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {historyMeetings.map((mtg) => (
                    <tr key={mtg._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 font-bold text-slate-900">{mtg.title}</td>
                      <td className="p-6">
                         <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-widest">{mtg.chapter}</span>
                      </td>
                      <td className="p-6 text-sm font-medium text-slate-500">{new Date(mtg.date).toLocaleDateString()}</td>
                      <td className="p-6">
                         <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-slate-300" />
                            <span className="text-sm font-black text-slate-900">{mtg.attendance?.length || 0}</span>
                         </div>
                      </td>
                      <td className="p-6">
                         <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            Completed
                         </span>
                      </td>
                    </tr>
                  ))}
                  {historyMeetings.length === 0 && (
                    <tr>
                       <td colSpan={5} className="p-20 text-center">
                          <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold">No historical data available.</p>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMeetings;
