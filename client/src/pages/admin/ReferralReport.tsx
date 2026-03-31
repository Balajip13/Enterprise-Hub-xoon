
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  RotateCw, 
  CheckCircle2, 
  IndianRupee, 
  PieChart,
  ArrowUpRight,
  RefreshCcw,
  Zap,
  Activity
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const ReferralReport: React.FC = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.getAdminReferrals();
        setReferrals(data || []);
      } catch (error) {
        console.error('Error fetching referral analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalRevenue = referrals.reduce((sum, r) => sum + (r.value || 0), 0);
  const pipelineCount = referrals.filter(r => r.status !== 'Closed').length;
  const convertedCount = referrals.filter(r => r.status === 'Converted' || r.status === 'Closed').length;
  const closedCount = referrals.filter(r => r.status === 'Closed').length;
  const successRate = referrals.length > 0 ? ((closedCount / referrals.length) * 100).toFixed(1) : 0;

  const stats = [
    { label: 'Total Referrals', val: referrals.length, icon: RotateCw, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pipeline Count', val: pipelineCount, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Converted Deals', val: convertedCount, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Closed Deals', val: closedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Success Rate', val: `${successRate}%`, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Total Volume', val: `₹${(totalRevenue / 10000000).toFixed(2)}Cr`, icon: IndianRupee, color: 'text-slate-900', bg: 'bg-slate-100' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-60 text-slate-300">
        <RefreshCcw className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-[10px]">Processing deal graph data...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1300px] mx-auto p-6 md:p-12 space-y-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Referral Analytics</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">Quantitative overview of performance, throughput, and success velocity.</p>
        </div>
        <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
        </div>
      </header>

      {referrals.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="bg-white/50 rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200 max-w-[900px] w-full flex flex-col items-center justify-center shadow-sm">
             <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-8">
                <PieChart className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4 italic tracking-tight">No referral data available yet</h3>
             <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">Analytics will automatically populate once referrals start moving through the network.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[16px] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
               <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-6 mb-10">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                       <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{stat.label}</p>
                 </div>
                 <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-slate-950 tracking-tighter">{stat.val}</p>
                    <ArrowUpRight className="w-6 h-6 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 font-black italic border border-slate-100">X</div>
              <div>
                <h4 className="font-black text-slate-900 italic text-xl">Platform Intelligence Report</h4>
                <p className="text-slate-400 font-medium text-sm">Automated data aggregation based on real-time node interactions.</p>
              </div>
           </div>
           <div className="flex gap-3">
              <button 
                onClick={() => window.print()} 
                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
              >
                Print Summary
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralReport;
