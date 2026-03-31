
import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  Building2, 
  MoreVertical,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  Mail,
  Phone,
  IndianRupee,
  Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { MOCK_MEMBERS } from '../constants';

const chapterStats = [
  { month: 'Jan', revenue: 420000 },
  { month: 'Feb', revenue: 510000 },
  { month: 'Mar', revenue: 480000 },
  { month: 'Apr', revenue: 620000 },
  { month: 'May', revenue: 590000 },
  { month: 'Jun', revenue: 750000 },
];

const categoryDistribution = [
  { name: 'Tech', value: 12, color: '#6366f1' },
  { name: 'Real Estate', value: 8, color: '#10b981' },
  { name: 'Finance', value: 5, color: '#f59e0b' },
  { name: 'Legal', value: 4, color: '#ef4444' },
];

const PENDING_MEMBERS = [
  { 
    id: 'p1', 
    name: 'Vikram Seth', 
    businessName: 'Seth & Sons Legal', 
    category: 'Corporate Law', 
    location: 'Koramangala',
    appliedDate: '2 hours ago'
  },
  { 
    id: 'p2', 
    name: 'Anjali Menon', 
    businessName: 'Pixel Perfect', 
    category: 'Brand Identity', 
    location: 'HSR Layout',
    appliedDate: '1 day ago'
  }
];

const Admin: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'MEMBERS' | 'FINANCES'>('OVERVIEW');
  const [pendingList, setPendingList] = useState(PENDING_MEMBERS);

  const handleApprove = (id: string) => {
    setPendingList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Hub</h1>
          <p className="text-slate-500 font-medium">Chapter Control: Bangalore Alpha</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {(['OVERVIEW', 'MEMBERS', 'FINANCES'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeSubTab === tab 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeSubTab === 'OVERVIEW' && (
        <>
          {/* Top Level KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Chapter Rev', val: '₹1.2Cr', sub: '+12% vs last mo', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Active Members', val: '48', sub: '3 Pending Approval', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Referral Velocity', val: '142', sub: 'Last 30 Days', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Avg Trust Score', val: '82', sub: 'Top 5% Chapters', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-950 mb-1">{kpi.val}</p>
                <p className={`text-[10px] font-bold ${kpi.sub.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Economic Growth Chart */}
            <div className="lg:col-span-2 bg-slate-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-white font-black flex items-center gap-3 text-lg">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                  Economic Growth
                </h3>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-400/20 px-3 py-1 rounded-full bg-indigo-400/5">Chapter Performance</span>
              </div>
              <div className="h-72 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chapterStats}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{borderRadius: '20px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '15px'}}
                      labelStyle={{fontWeight: 800, marginBottom: '5px', color: '#fff'}}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Approval Queue */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-950 flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                  Vetting Queue
                </h3>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-2 py-0.5 bg-amber-50 rounded-lg">{pendingList.length} New</span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {pendingList.length > 0 ? pendingList.map(member => (
                  <div key={member.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group transition-all hover:border-indigo-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-indigo-600 border border-slate-100">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{member.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{member.businessName}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{member.appliedDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(member.id)}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-500 transition-all"
                      >
                        Approve
                      </button>
                      <button className="px-3 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-500 hover:border-rose-100 transition-all">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
                    <CheckCircle2 className="w-12 h-12 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest">Queue Clear</p>
                  </div>
                )}
              </div>
              
              <button className="mt-6 w-full py-4 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                Review All Applications
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meeting Summary Widget */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-indigo-900/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 -z-0"></div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                    <Clock className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Last Session Report</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">June 14, 2024</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-950">Summit Efficiency: 94%</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {[
                    { label: 'Attendance', val: '45/48', color: 'text-indigo-600' },
                    { label: 'Referrals Swapped', val: '28', color: 'text-emerald-600' },
                    { label: 'Revenue Logged', val: '₹14.2L', color: 'text-amber-600' },
                    { label: 'Guests', val: '5', color: 'text-indigo-600' },
                  ].map((stat, i) => (
                    <div key={i} className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={`text-sm font-black ${stat.color}`}>{stat.val}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </>
      )}

      {activeSubTab === 'MEMBERS' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter chapter member list..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-900 shadow-sm"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                 <button className="flex-1 sm:flex-none px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4" /> Filter
                 </button>
                 <button className="flex-1 sm:flex-none px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" /> Add Member
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Identity</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Node</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Index</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_MEMBERS.map((member) => (
                    <tr key={member.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-950 text-white rounded-[1.25rem] flex items-center justify-center text-lg font-black shadow-lg shadow-slate-950/20">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-950">{member.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{member.ownerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          {member.category}
                        </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                             <div 
                              className={`h-full rounded-full ${member.trustScore > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${member.trustScore}%` }}
                             ></div>
                           </div>
                           <span className="text-xs font-black text-slate-950">{member.trustScore}</span>
                         </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-bold text-slate-600">Today, 09:30 AM</p>
                        <p className="text-[10px] text-slate-400">Marked Attendance</p>
                      </td>
                      <td className="p-6 text-center">
                        <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeSubTab === 'FINANCES' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
           <div className="grid md:grid-cols-2 gap-10">
              {/* Category Profitability */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  Category Contribution
                </h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: '#f8fafc', radius: 10}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px'}} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Outstanding Invoices */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                    <IndianRupee className="w-6 h-6 text-emerald-600" />
                    Chapter Receivables
                  </h3>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest underline cursor-pointer">Export Ledger</span>
                </div>
                
                <div className="space-y-4 flex-1">
                  {[
                    { name: 'Finance First', amount: '₹999', due: 'Overdue 2d', type: 'Membership' },
                    { name: 'Green Flora', amount: '₹4,500', due: 'Due in 5d', type: 'Referral Share' }
                  ].map((inv, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{inv.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{inv.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-950">{inv.amount}</p>
                        <p className={`text-[10px] font-bold ${inv.due.includes('Overdue') ? 'text-rose-500' : 'text-slate-400'}`}>{inv.due}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-slate-950 rounded-[2rem] text-center shadow-xl">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Total Outstanding</p>
                   <p className="text-3xl font-black text-white mb-4 tracking-tighter">₹5,499</p>
                   <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
                     Broadcast Reminders
                   </button>
                </div>
              </div>
           </div>

           <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-200 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="w-16 h-16 bg-amber-400 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-amber-400/20 flex-shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-black text-amber-900 mb-1">Membership Compliance Review</h4>
                <p className="text-sm text-amber-800 font-medium">4 members haven't reached their referral quota for the quarter. System suggests "Vetting Required" status update.</p>
              </div>
              <button className="px-8 py-4 bg-amber-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-950 transition-all shadow-xl shadow-amber-900/10">
                Initiate Audit
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
