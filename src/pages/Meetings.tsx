
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Timer, 
  CheckCircle, 
  Play, 
  RotateCcw, 
  UserPlus, 
  X, 
  Phone, 
  MessageCircle,
  Building2,
  ChevronRight,
  TrendingUp,
  Zap,
  Mail,
  Target,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface Visitor {
  _id: string;
  name: string;
  businessName: string;
  mobile: string;
  category: string;
  invitedBy: { _id: string; name: string } | string;
  meetingId: string;
  createdAt: string;
}

interface MeetingsProps {
  user: any;
}

const Meetings: React.FC<MeetingsProps> = ({ user }) => {
  const [meeting, setMeeting] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);

  // Visitor Form State
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    businessName: '',
    mobile: '',
    category: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const chapterName = user?.chapter;
      
      if (chapterName) {
        // Fetch ALL meetings for this user's chapter
        const allMeetings = await apiService.getMeetings(chapterName);
        const sortedMeetings = (allMeetings || []).sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setMeetings(sortedMeetings);

        // Find the most relevant meeting:
        // 1. First meeting that is TODAY or in the FUTURE
        // 2. If none, the most recent PAST meeting (so the page isn't empty)
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today
        
        const upcoming = sortedMeetings.find((m: any) => new Date(m.date) >= now);
        const activeMeeting = upcoming || sortedMeetings[sortedMeetings.length - 1] || null;
        
        setMeeting(activeMeeting);

        if (activeMeeting?._id) {
          try {
            const guestList = await apiService.getMeetingGuests(activeMeeting._id);
            setVisitors(guestList || []);

            // Check if current user has marked attendance
            const isMarked = activeMeeting.attendance?.some((a: any) => 
              (a.userId?._id || a.userId)?.toString() === user?.id?.toString()
            );
            setAttendanceMarked(!!isMarked);
          } catch {
            setVisitors([]);
          }
        }
      } else {
        // Fallback: single upcoming global meeting
        const upcomingMeeting = await apiService.getUpcomingMeeting();
        setMeeting(upcomingMeeting);
        setMeetings(upcomingMeeting ? [upcomingMeeting] : []);
        if (upcomingMeeting?._id) {
          try {
            const guestList = await apiService.getMeetingGuests(upcomingMeeting._id);
            setVisitors(guestList || []);

            // Check if current user has marked attendance
            const isMarked = upcomingMeeting.attendance?.some((a: any) => 
              (a.userId?._id || a.userId)?.toString() === user?.id?.toString()
            );
            setAttendanceMarked(!!isMarked);
          } catch {
            setVisitors([]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching meeting data:', err);
      setError('Failed to sync summit data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const resetTimer = () => {
    setTimeLeft(60);
    setIsActive(false);
  };

  const handleMarkAttendance = async () => {
    if (!meeting || !user?.id || attendanceMarked) return;
    try {
      await apiService.markAttendance(meeting._id);
      setAttendanceMarked(true);
      fetchData(); // Refresh to ensure backend sync
    } catch (err) {
      console.error('Attendance error:', err);
    }
  };

  const handleInviteGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting || !user?.id) return;
    try {
      setFormSubmitting(true);
      await apiService.inviteGuest(meeting._id, {
        ...visitorForm,
        invitedBy: user.id
      });
      setIsVisitorModalOpen(false);
      setVisitorForm({ name: '', businessName: '', mobile: '', category: '' });
      fetchData(); // Refresh guest list
    } catch (err) {
      console.error('Guest invite error:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Syncing Summit Channel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 w-full mx-auto px-4 sm:px-6 md:px-8 bg-slate-50/50 min-h-screen">
      <header className="text-center md:text-left pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Chapter Summit</h1>
        <p className="text-slate-500 font-medium text-sm">Coordinate, pitch, and grow your network live.</p>
      </header>

      {/* Next Meeting Hero Card */}
      {meeting ? (
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-indigo-900/5 border border-slate-100 overflow-hidden mx-auto max-w-5xl">
          <div className="bg-slate-950 p-6 sm:p-8 md:p-12 text-white relative">
            <div className="absolute top-0 right-0 w-[20rem] sm:w-[25rem] h-[20rem] sm:h-[25rem] bg-indigo-600/20 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 blur-[80px] sm:blur-[100px]"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-10 relative z-10">
              <div className="max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-6 border border-indigo-500/20">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                  Next Scheduled Event
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tighter italic leading-tight sm:leading-none">{meeting.title}</h2>
                <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
                  Focus: <span className="text-white font-black">{meeting.description || 'General Networking & Growth'}</span>
                </p>
              </div>
              
              <div className="flex flex-col gap-3 min-w-full sm:min-w-[280px]">
                <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm font-bold bg-white/5 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                  <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-400 shrink-0" />
                  {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm font-bold bg-white/5 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                  <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-400 shrink-0" />
                  {meeting.startTime || new Date(meeting.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm font-bold bg-white/5 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                  <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-400 shrink-0" />
                  {meeting.location}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
            <button 
              onClick={handleMarkAttendance}
              className={`w-full sm:flex-1 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-sm flex items-center justify-center gap-3 transition-all ${
                attendanceMarked 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500'
              }`}
            >
              {attendanceMarked ? <CheckCircle className="w-5 h-5 shrink-0" /> : <Users className="w-5 h-5 shrink-0" />}
              <span className="truncate">{attendanceMarked ? 'Attendance Confirmed' : 'Mark Presence'}</span>
            </button>
            <button 
              onClick={() => setIsVisitorModalOpen(true)}
              className="w-full sm:flex-1 bg-white border border-slate-200 text-slate-950 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
            >
              <UserPlus className="w-5 h-5 shrink-0" />
              Invite a Visitor
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 border-dashed text-center mx-auto max-w-5xl">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Scheduled Summits</h3>
            <p className="text-slate-500 font-medium">Summits are coordinated by chapter leads. Check back soon.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Guest List + Summit Flow */}
        <div className="lg:col-span-2 space-y-8">
          {/* Meeting Details Section */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Meeting Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 group">
                <div className="flex items-center gap-3 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                </div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 group">
                <div className="flex items-center gap-3 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                </div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {meeting.startTime || new Date(meeting.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 group">
                <div className="flex items-center gap-3 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                </div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {meeting.location}
                </p>
              </div>
            </div>
          </div>

          {/* Visitors Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-600" />
                Guest List {visitors.length > 0 && `(${visitors.length})`}
              </h3>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                View History
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {visitors.length > 0 ? (
                visitors.map((visitor) => (
                  <div 
                    key={visitor._id} 
                    className="bg-white p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5" 
                    onClick={() => setSelectedVisitor(visitor)}
                  >
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-xl sm:rounded-[1.25rem] flex items-center justify-center text-2xl font-black shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-slate-950/10">
                      {visitor.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className="text-base font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{visitor.name}</h4>
                        <div className="flex justify-center sm:justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                            </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{visitor.businessName}</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="text-[8px] px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg font-black uppercase tracking-widest border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                          {visitor.category}
                        </span>
                        <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                        <span className="text-[8px] font-bold text-slate-400">Via {typeof visitor.invitedBy === 'object' ? visitor.invitedBy.name : visitor.invitedBy}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 border border-slate-100 group">
                    <Users className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">No Active Guests</h4>
                  <p className="text-slate-500 text-sm font-medium max-w-[280px] mb-8">
                    Invite industry leaders and potential partners to participate in this Chapter Summit.
                  </p>
                  <button 
                    onClick={() => setIsVisitorModalOpen(true)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all flex items-center gap-3"
                  >
                    <UserPlus className="w-5 h-5" />
                    Invite First Guest
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Live Pitch */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-950 p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full -ml-16 -mt-16 blur-2xl"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-white font-black flex items-center gap-2 text-sm uppercase tracking-wider">
                <Timer className="w-5 h-5 text-indigo-400" />
                Live Pitch
              </h3>
              <div className="px-3 py-1 bg-white/10 text-white rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-inner">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                Live Stage
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center relative z-10">
              <div className={`text-6xl sm:text-7xl font-black mb-8 sm:mb-10 tabular-nums tracking-tighter drop-shadow-2xl ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                {timeLeft}<span className="text-xl sm:text-2xl font-bold text-slate-600 ml-1">s</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`py-4 sm:py-5 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                    isActive 
                      ? 'bg-amber-100 text-amber-600 shadow-amber-500/10' 
                      : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500'
                  }`}
                >
                  {isActive ? <Clock className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <button 
                  onClick={resetTimer}
                  className="py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-white/5 text-slate-500 flex items-center justify-center border border-white/5 hover:text-white transition-all active:scale-95"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mt-8 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5 text-center w-full">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Indication</p>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                    "Request a <span className="text-white font-black underline decoration-indigo-400/50">Specific Person</span> or <span className="text-white font-black underline decoration-indigo-400/50">Niche</span> to grow."
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Invite Modal */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <form onSubmit={handleInviteGuest} className="flex flex-col h-full overflow-hidden">
              <div className="p-6 sm:p-10 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Invite Visitor</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Growth for your network</p>
                </div>
                <button type="button" onClick={() => setIsVisitorModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 sm:p-10 space-y-6 overflow-y-auto shrink pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Full Name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all outline-none"
                      value={visitorForm.name}
                      onChange={(e) => setVisitorForm({...visitorForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="WhatsApp No."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all outline-none"
                      value={visitorForm.mobile}
                      onChange={(e) => setVisitorForm({...visitorForm, mobile: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter Company Name"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all outline-none"
                    value={visitorForm.businessName}
                    onChange={(e) => setVisitorForm({...visitorForm, businessName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Category</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all outline-none appearance-none"
                    value={visitorForm.category}
                    onChange={(e) => setVisitorForm({...visitorForm, category: e.target.value})}
                  >
                    <option value="">Select Domain</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Education">Education</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                <button 
                  disabled={formSubmitting}
                  className="w-full bg-slate-900 border-indigo-600/20 border text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-3"
                >
                  {formSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />}
                  Confirm Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Detail View */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 md:p-12 relative">
              <div className="absolute top-0 right-0 p-8">
                 <button 
                  onClick={() => setSelectedVisitor(null)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-12">
                <div className="w-24 h-24 bg-slate-950 text-white rounded-[1.75rem] flex items-center justify-center text-4xl font-black shadow-2xl">
                  {selectedVisitor.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-3xl font-black text-slate-950 leading-none truncate uppercase tracking-tighter">{selectedVisitor.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="w-4 h-4 text-slate-300" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{selectedVisitor.businessName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={`tel:${selectedVisitor.mobile}`}
                    className="flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:scale-[1.02]"
                  >
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                  <button className="flex items-center justify-center gap-3 py-4 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-[1.02]">
                    <Mail className="w-4 h-4" /> Message
                  </button>
                </div>

                <div className="space-y-1">
                   <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Professional Niche</h4>
                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                      <p className="text-base text-slate-800 font-bold leading-relaxed italic">
                        "Exploring synergies within the {selectedVisitor.category} domain to create high-value network bridges."
                      </p>
                   </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest pt-6 border-t border-slate-100">
                   <div className="flex items-center gap-2 text-indigo-600">
                      <Users className="w-4 h-4" />
                      Guest of {typeof selectedVisitor.invitedBy === 'object' ? selectedVisitor.invitedBy.name : selectedVisitor.invitedBy}
                   </div>
                   <div className="text-slate-300">
                       {user?.chapter || 'Network'} Hub
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
