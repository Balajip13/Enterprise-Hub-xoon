import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Calendar,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  Loader2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ChapterLeadDashboardProps {
  user: any;
  onTabChange: (tab: string) => void;
}

const ChapterLeadDashboard: React.FC<ChapterLeadDashboardProps> = ({ user, onTabChange }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [upcomingMeeting, setUpcomingMeeting] = useState<any>(null);
  const [allMeetings, setAllMeetings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.chapter) {
          const [chapterStats, upcoming, meetings, chapterMembers] = await Promise.all([
            apiService.getChapterStats(user.chapter).catch(() => null),
            apiService.getUpcomingMeeting().catch(() => null),
            apiService.getChapterMeetings(user.chapter).catch(() => []),
            apiService.getChapterMembers(user.chapter).catch(() => [])
          ]);
          
          setStats(chapterStats);
          setRecentReferrals(chapterStats?.recentReferrals || []); // Assuming recentReferrals come from chapterStats
          setUpcomingMeeting(upcoming);
          setAllMeetings(meetings || []);
          setMembers(chapterMembers || []);
        } else {
          setError("User or chapter information is missing.");
        }
      } catch (err: any) {
        console.error('Error fetching chapter data:', err);
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) { // Only fetch if user prop is available
      fetchDashboardData();
    } else {
      setLoading(false);
      setError("User data not provided.");
    }
  }, [user]); // Depend on user prop

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-600">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p className="text-lg font-semibold">{error}</p>
        <p className="text-sm text-slate-500">Please try again later or contact support.</p>
      </div>
    );
  }

  const safeStats = stats || {
    totalMembers: 0,
    totalReferrals: 0,
    closedDeals: 0,
    pendingApprovals: 0,
    recentReferrals: [],
    performance: { memberGrowthRate: 0, dealConversionRate: 0 }
  };

  const metricCards = [
    { label: 'Total Members', val: safeStats.totalMembers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Referrals Driven', val: safeStats.totalReferrals, icon: Share2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Deals Closed', val: safeStats.closedDeals, icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Pending Approvals', val: safeStats.pendingApprovals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center md:text-left">
          {user?.chapter || 'Network'} Overview
        </h1>
        <p className="text-slate-500 font-medium text-center md:text-left">Operational metrics and activity feed for your chapter node.</p>
      </header>

      {/* Top Row: Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mb-4`}>
              <m.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">{m.label}</p>
            {m.val > 0 ? (
              <p className="text-2xl sm:text-3xl font-black text-slate-950">{m.val}</p>
            ) : (
              <p className="text-sm font-bold text-slate-300 italic pt-1">No data yet</p>
            )}
          </div>
        ))}
      </div>

      {/* Second Row: Meeting & Performance */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Next Chapter Meeting */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-black">Next Chapter Meeting</h3>
            </div>
            
            {upcomingMeeting ? (
              <div className="space-y-6 mb-8 flex-1">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Date & Time</p>
                  <p className="text-2xl font-black">
                    {new Date(upcomingMeeting.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {upcomingMeeting.time || '8:00 AM'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Location</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    {upcomingMeeting.location || 'Chapter Headquarters'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <Calendar className="w-8 h-8 text-slate-500 mb-3" />
                <p className="font-bold text-slate-300">No upcoming meetings scheduled.</p>
              </div>
            )}

            <button 
              onClick={() => {
                if (user?.status !== 'Approved') return;
                onTabChange?.('meetings');
              }}
              disabled={user?.status !== 'Approved'}
              className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                user?.status === 'Approved' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Manage Meetings <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter Performance Tool */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden flex-1">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 relative">
               <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Chapter Performance</h3>
            
            {safeStats.totalReferrals > 0 ? (
              <>
                <p className="text-slate-500 font-medium mb-8">
                  Your chapter is operating at a <span className="font-bold text-indigo-600">{safeStats.performance.dealConversionRate}% conversion rate</span>. Keep up the momentum!
                </p>
                <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal Conversion</span>
                      <span className="text-indigo-600 font-black">{safeStats.performance.dealConversionRate}%</span>
                   </div>
                   <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-1000"
                        style={{ width: `${Math.max(5, safeStats.performance.dealConversionRate)}%` }}
                      ></div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-slate-400 font-medium italic">Performance stats will generate once referrals begin converting.</p>
              </div>
            )}
        </div>
      </div>

      {/* Third Row: Recent Referrals & Activity Feed */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Recent Referrals */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600" />
              Recent Referrals
            </h3>
          </div>
          
          <div className="space-y-4">
            {safeStats.recentReferrals.length > 0 ? (
              safeStats.recentReferrals.map((ref: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {ref.referrer?.name || 'Unknown'} → <span className="text-indigo-600">{ref.recipient?.name || 'Unknown'}</span>
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">For: {ref.clientName || 'Private Client'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Value</p>
                    <p className="text-sm font-black text-emerald-600">₹{ref.value?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center text-center">
                <Share2 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-bold text-slate-500">No referrals submitted yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Member Activity Feed */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Member Activity Feed
            </h3>
          </div>
          
          <div className="space-y-4 flex-1">
            {safeStats.recentReferrals.length > 0 ? (
              safeStats.recentReferrals.slice(0, 3).map((ref: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">
                      <span className="text-slate-700">{ref.referrer?.name}</span> submitted a referral
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      For <span className="text-indigo-600 font-semibold">{ref.recipient?.name}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    {new Date(ref.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center text-center h-full justify-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-bold text-slate-500">No member activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fourth Row: Pending Actions & Performance Tracking */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Pending Actions */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Actions
            </h3>
          </div>
          
          <div className="space-y-4">
            {safeStats.pendingApprovals > 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">New Applications</p>
                    <p className="text-xs text-slate-500">{safeStats.pendingApprovals} pending verification</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (user?.status !== 'Approved') return;
                    onTabChange?.('approvals');
                  }}
                  disabled={user?.status !== 'Approved'}
                  className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                    user?.status === 'Approved'
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10'
                    : 'bg-amber-100 text-amber-400 cursor-not-allowed shadow-none font-bold'
                  }`}
                >
                  Audit Approvals
                </button>
              </div>
            ) : (
              <div className="py-10 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center text-center">
                <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-bold text-slate-500">All members caught up.</p>
              </div>
            )}
          </div>
        </div>

        {/* Member Performance Leaderboard (Double Width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Member Performance Tracking
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time attendance & referral metrics</p>
            </div>
            <button 
              onClick={() => onTabChange?.('members')}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
            >
              Audit All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attendance</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Referrals</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Deals</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {members.length > 0 ? (
                  members.sort((a, b) => (b.referralsGiven + b.dealsClosed) - (a.referralsGiven + a.dealsClosed)).slice(0, 5).map((member, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 overflow-hidden">
                            {member.profileImage ? <img src={member.profileImage} className="w-full h-full object-cover" /> : (member.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{member.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{member.businessCategory || 'Executive'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-black ${member.attendanceRate >= 90 ? 'text-emerald-600' : member.attendanceRate >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {member.attendanceRate}%
                          </span>
                          <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                             <div className={`h-full rounded-full ${member.attendanceRate >= 90 ? 'bg-emerald-500' : member.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${member.attendanceRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center text-sm font-black text-slate-700">{member.referralsGiven}</td>
                      <td className="py-4 text-center text-sm font-black text-slate-700">{member.dealsClosed}</td>
                      <td className="py-4 text-right">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          {((member.dealsClosed / (member.referralsGiven || 1)) * 100).toFixed(0)}% CR
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic text-sm">No member data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fifth Row: Master Schedule & Insights */}
      <div className="grid lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                Chapter Master Schedule
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Timeline of Upcoming chapters events</p>
            </div>
            <button 
              onClick={() => onTabChange?.('meetings')}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
            >
              Full Calendar
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
             {allMeetings && allMeetings.length > 0 ? (
               allMeetings.slice(0, 4).map((mtg, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-white transition-colors border border-slate-100 group">
                    <div className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-indigo-100 shadow-sm group-hover:border-indigo-600 transition-colors">
                      <span className="text-[9px] font-black uppercase tracking-widest">{new Date(mtg.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-sm font-black">{new Date(mtg.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{mtg.title || 'Chapter Assembly'}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tight">{mtg.time || '8:00 AM'} • {mtg.location || 'HQ'}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${mtg.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {mtg.status || 'Active'}
                    </div>
                 </div>
               ))
             ) : (
               <div className="col-span-2 py-12 text-center flex flex-col items-center justify-center h-full">
                 <Calendar className="w-10 h-10 text-slate-200 mb-4" />
                 <p className="text-slate-400 font-bold italic">No upcoming meetings scheduled.</p>
               </div>
             )}
          </div>
        </div>

        {/* Success Quote / Tip */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-4">Chapter Tip</p>
          <h4 className="text-lg font-bold mb-4 italic leading-relaxed">
            "High attendance is the strongest predictor of referral volume. Encourage members to mark their calendars early."
          </h4>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">- Chapter Success Team</p>
        </div>
      </div>
    </div>
  );
};

export default ChapterLeadDashboard;
