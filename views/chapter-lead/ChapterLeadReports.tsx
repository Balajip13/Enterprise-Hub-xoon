import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Share2, 
  Target, 
  Calendar,
  FileDown,
  Loader2,
  AlertCircle,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { apiService } from '../../services/apiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ChapterLeadReportsProps {
  user: any;
}

const ChapterLeadReports: React.FC<ChapterLeadReportsProps> = ({ user }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!user?.chapter) return;
    try {
      setLoading(true);
      const data = await apiService.getChapterAnalytics(user.chapter);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Insufficient data to generate full analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.chapter]);

  const generatePDF = () => {
    if (!analytics || !user?.chapter) return;

    const doc = new jsPDF();
    const chapterName = user.chapter;
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Chapter Performance Report', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Chapter: ${chapterName}`, 14, 30);
    doc.text(`Generated: ${date}`, 14, 36);

    // Summary Section
    const summary = analytics.summary;
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Members', summary.totalMembers.toString()],
        ['Active Members', summary.activeMembers.toString()],
        ['Member Retention', `${summary.retentionRate}%`],
        ['Total Referrals', summary.totalReferrals.toString()],
        ['Converted Deals', summary.convertedReferrals.toString()],
        ['Deal Conversion Rate', `${summary.dealConversionRate}%`],
        ['Referral Velocity', `${summary.referralVelocity > 0 ? '+' : ''}${summary.referralVelocity}%`],
        ['Projected Q4 Membership', summary.projectedMembership.toString()]
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }
    });

    // Trend Section Header
    doc.setFontSize(16);
    doc.text('Monthly Growth Trends', 14, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Month', 'Members', 'Referrals', 'Converted Deals']],
      body: analytics.trend.map((m: any) => [m.month, m.members, m.referrals, m.deals]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] } // indigo-600
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`XOON Enterprise Hub - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`chapter-report-${chapterName.toLowerCase()}-${date.replace(/\//g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Aggregating Chapter Data...</p>
      </div>
    );
  }

  if (error || !analytics || analytics.trend.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chapter Performance</h1>
        </header>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-sm">
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
              <BarChart3 className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black text-slate-900 mb-2">Not enough data to generate analytics yet.</h3>
           <p className="text-slate-500 text-sm font-medium mb-8">Analytics will appear after referrals and meetings are recorded across your chapter roster.</p>
           <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
           >
             Refresh Data
           </button>
        </div>
      </div>
    );
  }

  const summary = analytics.summary;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chapter Performance</h1>
          <p className="text-slate-500 font-medium">In-depth analytics on referral velocity and member engagement.</p>
        </div>
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md hover:border-slate-900 transition-all group"
        >
          <FileDown className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> 
          Generate PDF
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            label: 'Referral Velocity', 
            val: `${summary.referralVelocity > 0 ? '+' : ''}${summary.referralVelocity}%`, 
            sub: 'vs last month', 
            icon: Share2, 
            color: 'text-indigo-600', 
            trend: summary.referralVelocity >= 0 ? TrendingUp : TrendingDown, 
            trendCol: summary.referralVelocity >= 0 ? 'text-emerald-500' : 'text-rose-500' 
          },
          { 
            label: 'Member Retention', 
            val: `${summary.retentionRate}%`, 
            sub: 'Approved vs Pending', 
            icon: Users, 
            color: 'text-violet-600', 
            trend: TrendingUp, 
            trendCol: 'text-emerald-500' 
          },
          { 
            label: 'Deal Conversion', 
            val: `${summary.dealConversionRate}%`, 
            sub: 'Converted Referrals', 
            icon: Target, 
            color: 'text-emerald-600', 
            trend: summary.dealConversionRate > 50 ? TrendingUp : TrendingDown, 
            trendCol: summary.dealConversionRate > 50 ? 'text-emerald-500' : 'text-rose-500' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
             <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 bg-slate-50 ${stat.color} rounded-2xl flex items-center justify-center group-hover:bg-slate-100 transition-colors`}>
                   <stat.icon className="w-7 h-7" />
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${stat.trendCol}`}>
                   <stat.trend className="w-4 h-4" /> {stat.val}
                </div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <p className="text-3xl font-black text-slate-950 mb-2">{stat.val}</p>
             <p className="text-[11px] text-slate-400 font-bold">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Referral Growth Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900">Referral Traffic</h3>
                <p className="text-xs text-slate-500 font-medium">Monthly referrals created vs deals closed</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Referrals</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Deals</span>
                 </div>
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={analytics.trend}>
                    <defs>
                       <linearGradient id="colorRef" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="month" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                       dy={10}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    />
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="referrals" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRef)" />
                    <Area type="monotone" dataKey="deals" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDeals)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Membership Growth Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900">Member Expansion</h3>
                <p className="text-xs text-slate-500 font-medium">Cumulative growth of chapter node</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Users className="w-3 h-3" /> Total Nodes
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="month" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                       dy={10}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    />
                    <Tooltip 
                       cursor={{ fill: '#f8fafc' }}
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="members" radius={[8, 8, 0, 0]} barSize={32}>
                       {analytics.trend.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index === analytics.trend.length - 1 ? '#4f46e5' : '#e2e8f0'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
         <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full -mr-40 -mt-40 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col items-center text-center py-10">
            <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-indigo-400 mb-8 border border-white/10 ring-1 ring-white/20">
               <TrendingUp className="w-10 h-10" />
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tight">Growth Projection</h3>
            <p className="text-slate-400 font-medium max-w-xl mb-12 leading-relaxed text-lg">
               Based on current expansion velocity, your chapter node is projected to scale to <span className="text-white font-black italic underline decoration-indigo-500 underline-offset-4">{summary.projectedMembership} members</span> by the end of next quarter.
            </p>
            <div className="flex flex-col md:flex-row gap-6">
               <div className="px-8 py-5 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Base</span>
                  <span className="text-2xl font-black">{summary.totalMembers}</span>
               </div>
               <div className="hidden md:flex items-center text-indigo-500">
                  <ArrowUpRight className="w-8 h-8" />
               </div>
               <div className="px-8 py-5 bg-indigo-600/20 backdrop-blur-sm rounded-3xl border border-indigo-600/30 ring-1 ring-indigo-500/20 flex flex-col items-center">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Q4 Projection</span>
                  <span className="text-2xl font-black text-indigo-400">{summary.projectedMembership}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChapterLeadReports;
