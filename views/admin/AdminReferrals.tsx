
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCcw, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  IndianRupee, 
  Building2, 
  BarChart3, 
  ShieldAlert, 
  Edit2, 
  Eye, 
  Trash2, 
  X, 
  BookOpen, 
  Calendar,
  Clock
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminReferrals: React.FC = () => {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const data = await apiService.getAdminReferrals();
      setReferrals(data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiService.updateAdminReferralStatus(id, status);
      fetchReferrals();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this referral?')) {
      try {
        await apiService.deleteAdminReferral(id);
        fetchReferrals();
      } catch (error) {
        alert('Error deleting referral');
      }
    }
  };


  const filteredReferrals = referrals.filter(ref => {
    const searchMatch = 
      ref.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referrer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referrer?.chapter?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const filterMatch = filter === 'All' || ref.status === filter;
    
    return searchMatch && filterMatch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Closed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Converted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Meeting Scheduled': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Given': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-4 sm:p-6 bg-slate-50/30 min-h-screen">
      <header className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-6 pb-2">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-col md:flex-row items-center gap-2 md:gap-3">
            Deal Flow <span className="text-[10px] md:text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded-md tracking-widest uppercase">Admin</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Monitor deal progression and network integrity</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/admin/referrals/protocol')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            Protocol
          </button>
          <button 
            onClick={() => navigate('/admin/referrals/report')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
          >
            <BarChart3 className="w-4 h-4" />
            Report
          </button>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Volume', val: `₹${(referrals.reduce((sum, r) => sum + (r.value || 0), 0) / 10000000).toFixed(2)}Cr`, icon: IndianRupee, color: 'text-indigo-600' },
          { label: 'Pipeline', val: referrals.filter(r => r.status !== 'Closed').length, icon: RefreshCcw, color: 'text-amber-500' },
          { label: 'Success', val: `${((referrals.filter(r => r.status === 'Closed').length / (referrals.length || 1)) * 100).toFixed(0)}%`, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Average', val: `₹${((referrals.reduce((sum, r) => sum + (r.value || 0), 0) / (referrals.length || 1)) / 1000).toFixed(1)}K`, icon: ArrowUpRight, color: 'text-violet-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 ${stat.color} flex items-center justify-center`}>
                   <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
             </div>
             <p className="text-xl font-black text-slate-950">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Controls: Search and Filters separated */}
      <div className="space-y-4 pt-2">
        {/* Row 1: Search */}
        <div className="relative w-full md:max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text"
            placeholder="Search by member, business, or chapter..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-400 outline-none transition-all font-bold text-slate-600 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Row 2: Filters */}
        <div className="flex items-center gap-1.5 overflow-x-hidden flex-wrap">
          {['All', 'Given', 'Accepted', 'Meeting Scheduled', 'Converted', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full text-[10px] font-black transition-all border ${
                filter === tab 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-200' 
                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Referral Table Container */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-2">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="w-[20%] p-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Business</th>
                <th className="w-[15%] p-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Node Path</th>
                <th className="w-[18%] p-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Origin</th>
                <th className="w-[18%] p-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Destination</th>
                <th className="w-[15%] p-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="w-[14%] p-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReferrals.map((ref) => (
                <tr key={ref._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 px-6">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-950 truncate" title={ref.clientName}>{ref.clientName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">₹{(ref.value || 0).toLocaleString()}</p>
                        </div>
                     </div>
                  </td>
                  <td className="p-4 px-6">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest truncate block overflow-hidden" title={ref.referrer?.chapter || 'Global'}>
                      {ref.referrer?.chapter || 'Global'}
                    </span>
                  </td>
                  <td className="p-4 px-6">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{ref.referrer?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(ref.date).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="p-4 px-6">
                    <p className="text-sm font-bold text-indigo-600 truncate">{ref.recipient?.name || 'Unassigned'}</p>
                  </td>
                  <td className="p-4 px-6">
                     <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-current whitespace-nowrap ${getStatusStyle(ref.status)}`}>
                        {ref.status}
                     </span>
                  </td>
                  <td className="p-4 px-6">
                    <div className="flex items-center justify-center gap-0.5">
                      <button 
                        onClick={() => { setSelectedReferral(ref); setIsViewModalOpen(true); }}
                        title="View"
                        className="p-1.5 text-slate-400 hover:text-slate-900 transition-all rounded-lg hover:bg-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative group/menu">
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-all rounded-lg hover:bg-white" title="Status">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 bottom-full mb-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-2xl invisible group-hover/menu:visible p-1 z-20">
                          {['Given', 'Accepted', 'Meeting Scheduled', 'Converted', 'Closed'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(ref._id, status)}
                              className="w-full text-left px-4 py-2 text-[10px] font-black text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all"
                            >
                              Move to {status}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleStatusChange(ref._id, 'Blocked')}
                        title="Block"
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-all rounded-lg hover:bg-white"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(ref._id)}
                        title="Delete"
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-all rounded-lg hover:bg-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* View Referral Modal */}
      {isViewModalOpen && selectedReferral && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
             <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Referral Details</h2>
                <p className="text-slate-500 font-medium text-[10px] mt-1 uppercase tracking-widest">Ref ID: {selectedReferral._id}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</p>
                    <p className="text-lg font-black text-slate-900">{selectedReferral.clientName}</p>
                 </div>
                 <div className="space-y-1 md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Value</p>
                    <p className="text-lg font-black text-indigo-600">₹{(selectedReferral.value || 0).toLocaleString()}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-slate-700">{selectedReferral.email || 'Not Provided'}</p>
                 </div>
                 <div className="space-y-1 md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-bold text-slate-700">{selectedReferral.clientPhone || 'Not Provided'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-100">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referrer (From)</p>
                    <p className="text-sm font-bold text-slate-700">{selectedReferral.referrer?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedReferral.referrer?.chapter || 'Global'}</p>
                 </div>
                 <div className="space-y-1 md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient (To)</p>
                    <p className="text-sm font-bold text-slate-700">{selectedReferral.recipient?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedReferral.recipient?.chapter || 'Global'}</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement Detail</p>
                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedReferral.requirement || 'No additional details provided.'}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                 <div className="flex-1 space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created On</p>
                     <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{new Date(selectedReferral.date).toLocaleDateString()}</span>
                     </div>
                 </div>
                 <div className="flex-1 text-right space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                     <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedReferral.status)}`}>
                        {selectedReferral.status}
                     </span>
                 </div>
              </div>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReferrals;
