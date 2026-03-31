import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  RefreshCcw,
  User as UserIcon
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPaymentLogs();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && p.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-300">
        <RefreshCcw className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-[10px]">Filtering Transaction Nodes...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full mx-auto min-h-screen bg-slate-50/50 uppercase tracking-tight">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Payment Ledger</h1>
          <p className="text-slate-500 font-medium text-sm">Monitoring capital flow and node subscription health.</p>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto">
           <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                 <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Volume</p>
                 <p className="text-lg font-black text-slate-950">
                    ₹{(payments.reduce((acc, p) => p.status === 'captured' ? acc + p.amount : acc, 0)).toLocaleString()}
                 </p>
              </div>
           </div>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by user, payment id, or order id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-3xl font-black text-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-4">
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="px-8 py-5 bg-white border border-slate-100 rounded-3xl font-black text-slate-900 outline-none shadow-sm cursor-pointer appearance-none min-w-[180px]"
           >
              <option value="all">All Status</option>
              <option value="captured">Captured</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
           </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initiator</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capital</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Internal ID</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                           <UserIcon className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="font-black text-slate-900">{p.userId?.name || 'Unknown Node'}</p>
                           <p className="text-xs text-slate-400 font-medium">{p.userId?.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-8">
                     <p className="font-black text-slate-950 text-lg">₹{p.amount.toLocaleString()}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.feature}</p>
                  </td>
                  <td className="px-6 py-8">
                     <code className="text-[10px] font-black bg-slate-50 px-3 py-1.5 rounded-lg text-slate-500">ORD: {p.orderId}</code>
                     {p.paymentId && <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">PAY: {p.paymentId}</p>}
                  </td>
                  <td className="px-6 py-8">
                     <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${
                        p.status === 'captured' ? 'bg-emerald-50 text-emerald-600' :
                        p.status === 'failed' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'
                     }`}>
                        {p.status === 'captured' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                         p.status === 'failed' ? <XCircle className="w-3.5 h-3.5" /> : 
                         <Clock className="w-3.5 h-3.5" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{p.status}</span>
                     </div>
                  </td>
                  <td className="px-6 py-8">
                     <p className="font-black text-slate-900 text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
                     <p className="text-[10px] text-slate-400 font-medium">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-10 py-8">
                     <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
                        <ExternalLink className="w-5 h-5" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300">
             <CreditCard className="w-16 h-16 opacity-20 mb-4" />
             <p className="font-black uppercase tracking-widest text-[11px]">No transaction history recorded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
