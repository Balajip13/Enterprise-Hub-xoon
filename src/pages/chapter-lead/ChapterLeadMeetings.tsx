
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin, 
  Clock, 
  Users, 
  X, 
  Loader2, 
  CalendarDays, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Download,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ChapterLeadMeetingsProps {
  user: any;
}

const ChapterLeadMeetings: React.FC<ChapterLeadMeetingsProps> = ({ user }) => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [chapterMembers, setChapterMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Weekly Meeting',
    date: '',
    time: '',
    location: '',
    description: '',
    maxAttendees: ''
  });


  const fetchMeetings = async () => {
    if (!user?.chapter) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMeetings(user.chapter);
      setMeetings(data || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!user?.chapter) return;
    try {
      setLoading(true);
      const data = await apiService.getChapterMembers(user.chapter);
      setChapterMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchMembers();
  }, [user?.chapter]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedMeeting(null);
    setFormData({
      title: '',
      type: 'Weekly Meeting',
      date: '',
      time: '',
      location: '',
      description: '',
      maxAttendees: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meeting: any) => {
    setModalMode('edit');
    setSelectedMeeting(meeting);
    const mDate = new Date(meeting.date);
    setFormData({
      title: meeting.title,
      type: meeting.type || 'Weekly Meeting',
      date: mDate.toISOString().split('T')[0],
      time: mDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      location: meeting.location,
      description: meeting.description || '',
      maxAttendees: meeting.maxAttendees?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenAttendance = (meeting: any) => {
    setSelectedMeeting(meeting);
    setIsAttendanceOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const meetingDateTime = new Date(`${formData.date}T${formData.time}`);
      const payload = {
        ...formData,
        date: meetingDateTime,
        chapter: user.chapter,
        maxAttendees: Number(formData.maxAttendees) || undefined
      };

      if (modalMode === 'create') {
        await apiService.createMeeting(payload);
      } else {
        await apiService.updateMeeting(selectedMeeting._id, payload);
      }
      
      setIsModalOpen(false);
      await fetchMeetings();
    } catch (err) {
      console.error('Error saving meeting:', err);
      alert('Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (userId: string, currentStatus: 'Present' | 'Absent') => {
    if (!selectedMeeting) return;
    try {
      const currentAttendance = selectedMeeting.attendance || [];
      const userRecordIndex = currentAttendance.findIndex((a: any) => a.userId === userId || a.userId?._id === userId);
      
      let newAttendance = [...currentAttendance];
      const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';

      if (userRecordIndex > -1) {
        newAttendance[userRecordIndex] = { ...newAttendance[userRecordIndex], status: newStatus };
      } else {
        newAttendance.push({ userId, status: 'Present' }); // Default to present if not found and toggled
      }

      const updatedMeeting = await apiService.updateAttendance(selectedMeeting._id, newAttendance);
      setSelectedMeeting(updatedMeeting);
      // Update local meetings state
      setMeetings(meetings.map(m => m._id === updatedMeeting._id ? updatedMeeting : m));
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  const exportAttendance = () => {
    if (!selectedMeeting) return;
    const records = chapterMembers.map(member => {
      const record = selectedMeeting.attendance?.find((a: any) => (a.userId?._id || a.userId) === member._id);
      return {
        Name: member.name,
        Business: member.business,
        Status: record?.status || 'Not Marked'
      };
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Business,Status"].concat(records.map(r => `${r.Name},${r.Business},${r.Status}`)).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance-${selectedMeeting.title}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chapter Meetings</h1>
          <p className="text-slate-500 font-medium">Schedule and manage weekly networking sessions and special events.</p>
        </div>
      </header>

      {loading && meetings.length === 0 ? (
         <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading meetings...</p>
         </div>
      ) : meetings.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 relative group hover:shadow-md transition-all">
              <div className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </div>
              <div className={`w-14 h-14 ${meeting.type === 'Special Event' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'} rounded-2xl flex items-center justify-center mb-6`}>
                <CalendarDays className="w-7 h-7" />
              </div>
              <div className="mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${meeting.type === 'Special Event' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {meeting.type || 'Weekly Meeting'}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-1">{meeting.title}</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold truncate">
                    {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold truncate">{meeting.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold truncate">
                    {meeting.attendance?.filter((a: any) => a.status === 'Present').length || 0} Members Confirmed
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleOpenAttendance(meeting)}
                  className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-100 transition-colors"
                >
                  View Attendance
                </button>
                <button 
                  onClick={() => handleOpenEdit(meeting)}
                  className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs hover:bg-indigo-100 transition-colors"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
          
          <div 
            onClick={handleOpenCreate}
            className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-300 transition-all min-h-[300px]"
          >
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 shadow-sm transition-colors mb-4">
                <Plus className="w-6 h-6" />
             </div>
             <p className="text-sm font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-[0.1em]">Schedule New Session</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-2xl border-2 border-slate-100 border-dashed text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No meetings scheduled yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm mb-8">Start organizing your chapter events by scheduling your first meeting.</p>
            <button 
              onClick={handleOpenCreate}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Meeting
            </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{modalMode === 'create' ? 'Create Meeting' : 'Edit Meeting'}</h2>
                  <p className="text-sm font-medium text-slate-500">Fill in the details for your session.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Meeting Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="E.g. Weekly Accountability Sync"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Meeting Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    >
                      <option value="Weekly Meeting">Weekly Meeting</option>
                      <option value="Special Event">Special Event</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Max Attendees</label>
                    <input 
                      type="number" 
                      placeholder="50"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({...formData, maxAttendees: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Time</label>
                    <input 
                      required
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Location</label>
                  <input 
                    required
                    type="text" 
                    placeholder="E.g. Royal Orchid Hotel, Lobby"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Share the agenda or special instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : modalMode === 'create' ? 'Create Meeting' : 'Save Changes'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceOpen && selectedMeeting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col h-[80vh]">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                <div>
                  <h2 className="text-2xl font-black">{selectedMeeting.title}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-100 opacity-80">Roster Attendance Control</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={exportAttendance}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
                    title="Export CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsAttendanceOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="space-y-3">
                  {chapterMembers.map((member) => {
                    const record = selectedMeeting.attendance?.find((a: any) => (a.userId?._id || a.userId) === member._id);
                    const isPresent = record?.status === 'Present';

                    return (
                      <div key={member._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 font-black">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{member.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.business}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => toggleAttendance(member._id, 'Absent')} // Toggle to Present
                             className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                               isPresent 
                               ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                               : 'bg-white text-slate-400 border border-slate-200 hover:border-emerald-200 hover:text-emerald-500'
                             }`}
                           >
                             PRESENT
                           </button>
                           <button 
                             onClick={() => toggleAttendance(member._id, 'Present')} // Toggle to Absent
                             className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                               record?.status === 'Absent' 
                               ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                               : 'bg-white text-slate-400 border border-slate-200 hover:border-rose-200 hover:text-rose-500'
                             }`}
                           >
                             ABSENT
                           </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {chapterMembers.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                       <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                       <p className="text-sm font-black text-slate-400 uppercase">No members found in this chapter</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                  <button 
                    onClick={() => setIsAttendanceOpen(false)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
                  >
                    Done
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChapterLeadMeetings;
