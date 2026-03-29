
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  RefreshCcw, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  IndianRupee,
  Zap,
  Loader2,
  AlertCircle,
  Database,
  Activity,
  Globe,
  Bell,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { apiService } from '../../services/apiService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdminSystemStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load system analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing platform data...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-black text-slate-900 mb-2">Failed to load analytics</h3>
        <p className="text-slate-500 mb-8 max-w-sm">We couldn't reach the analytics engine. This usually happens if the server is offline or the database is initialising.</p>
        <button onClick={fetchStats} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

  const { summary, revenueTrend } = stats;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium text-sm">Platform-wide statistics and performance metrics.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          { label: 'Total Members', val: summary.totalMembers.toString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Chapters', val: summary.activeChapters.toString(), icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Monthly Referrals', val: summary.monthlyReferrals.toString(), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Closed Deals', val: summary.closedDeals.toString(), icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Pending Approvals', val: summary.pendingApprovals.toString(), icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Total Revenue', val: formatCurrency(summary.totalRevenue), icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-950 tracking-tight">{card.val}</p>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Success Rate', val: `${summary.successRate}%`, icon: ShieldCheck, color: 'text-indigo-600', detail: 'Referral vs Conversion', trend: '+2.4%' },
          { label: 'Avg Deal Value', val: formatCurrency(summary.avgDealValue), icon: Coins, color: 'text-emerald-600', detail: 'Per closed business', trend: '+12%' },
          { label: 'Pipeline Deals', val: summary.pipelineCount.toString(), icon: Database, color: 'text-amber-500', detail: 'Active opportunities', trend: 'Growing' },
          { label: 'System Health', val: summary.systemHealth || 'Stable', icon: Activity, color: 'text-rose-500', detail: 'Real-time performance', trend: '99.9%' },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{metric.label}</p>
                <p className="text-3xl font-black text-slate-950 mb-1">{metric.val}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-slate-500">{metric.detail}</span>
                   <span className={`text-[10px] font-black ${metric.color} bg-slate-50 px-2 py-0.5 rounded-full`}>{metric.trend}</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-3xl ${metric.color} bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <metric.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-slate-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-white font-black flex items-center gap-3 text-lg">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              Platform Revenue Growth
            </h3>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 px-3 py-1 rounded-full bg-emerald-400/10">Live Ingest</span>
          </div>
          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                   dataKey="month" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} 
                   dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                  contentStyle={{borderRadius: '24px', backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'}}
                  itemStyle={{color: '#6366f1', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase'}}
                  labelStyle={{color: '#94a3b8', fontWeight: 700, marginBottom: '4px'}}
                  formatter={(value: any) => [formatCurrency(value), 'REVENUE']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevAdmin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-black text-slate-950 mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            System Health
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Database', status: 'Operational', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'API Cluster', status: 'Healthy', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'Notification Sync', status: 'Active', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Image Processing', status: 'Ready', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all group">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                      <item.icon className="w-5 h-5" />
                   </div>
                   <span className="text-sm font-black text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${item.color} animate-pulse`}></div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-8 border-t border-slate-50">
             <div className="p-6 bg-slate-900 rounded-3xl text-white">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Platform Version</p>
                <div className="flex items-center justify-between">
                   <span className="text-lg font-black">v1.2.4-stable</span>
                   <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">Enterprise</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

