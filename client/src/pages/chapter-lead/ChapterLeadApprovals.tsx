import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Building2, 
  Tag,
  Calendar,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  Mail,
  MoreVertical
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ChapterLeadApprovalsProps {
  user: any;
}

const ChapterLeadApprovals: React.FC<ChapterLeadApprovalsProps> = ({ user }) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('Pending'); // Default showing pending
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Action Modals
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activeApplicant, setActiveApplicant] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplicants = async () => {
    if (!user?.chapter) return;
    try {
      setLoading(true);
      const data = await apiService.getChapterApprovals(user.chapter);
      setApplicants(data);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      setError('Failed to load application requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [user?.chapter]);

  const handleApprove = async (applicant: any) => {
    try {
      setProcessingId(applicant._id);
      await apiService.updateUserStatus(applicant._id, 'Approved');
      setApplicants(prev => prev.filter(a => a._id !== applicant._id));
      // In a real app we'd show a specialized toast
      alert(`Member ${applicant.name} approved and added to chapter.`);
    } catch (err) {
      console.error('Approval error:', err);
      alert('Failed to approve member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!activeApplicant) return;
    try {
      setProcessingId(activeApplicant._id);
      await apiService.updateUserStatus(activeApplicant._id, 'Rejected');
      setApplicants(prev => prev.filter(a => a._id !== activeApplicant._id));
      setIsRejectModalOpen(false);
      setActiveApplicant(null);
    } catch (err) {
      console.error('Rejection error:', err);
      alert('Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch = 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.businessCategory?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All Categories' || app.businessCategory === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [applicants, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(applicants.map(a => a.businessCategory).filter(Boolean));
    return ['All Categories', ...Array.from(cats)];
  }, [applicants]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Member Approvals</h1>
        <p className="text-slate-500 font-medium">Review and verify businesses requesting to join your chapter node.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, business, or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
               <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border ${
                  categoryFilter !== 'All Categories' 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
               >
                 <Filter className="w-4 h-4" /> 
                 {categoryFilter === 'All Categories' ? 'Filters' : categoryFilter}
                 <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
               </button>

               {showFilters && (
                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in zoom-in-95 duration-150">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by category</p>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategoryFilter(cat);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          categoryFilter === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Detail</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Applied</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan={4} className="p-20 text-center">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Pulling Roster requests...</p>
                   </td>
                </tr>
              ) : filteredApplicants.length > 0 ? filteredApplicants.map((applicant) => (
                <tr key={applicant._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm font-black text-lg border border-indigo-100">
                        {applicant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{applicant.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold lowercase tracking-tight">
                          <Mail className="w-3 h-3" />
                          {applicant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-slate-700">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-black">{applicant.businessName || 'Business Name TBD'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{applicant.businessCategory || 'General'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Clock className="w-4 h-4 text-indigo-400" />
                       <span className="text-sm font-bold">{timeSince(applicant.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-4">
                      <button 
                         disabled={processingId === applicant._id}
                         onClick={() => handleApprove(applicant)}
                         className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                         title="Approve Member"
                      >
                        {processingId === applicant._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Approve
                      </button>
                      <button 
                         disabled={processingId === applicant._id}
                         onClick={() => {
                           setActiveApplicant(applicant);
                           setIsRejectModalOpen(true);
                         }}
                         className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                         title="Reject Request"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                       <User className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">No pending requests</h3>
                    <p className="text-slate-500 text-sm font-medium">When users apply to join your chapter, they will appear here for review.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && activeApplicant && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
               <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                     <AlertCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Reject Application?</h2>
                  <p className="text-slate-500 font-medium px-4">
                    Are you sure you want to reject the membership request from <span className="font-black text-slate-900">"{activeApplicant.name}"</span>? 
                    This action cannot be undone.
                  </p>
               </div>
               
               <div className="p-8 bg-slate-50 flex gap-4">
                  <button 
                    onClick={() => {
                      setIsRejectModalOpen(false);
                      setActiveApplicant(null);
                    }}
                    className="flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!!processingId}
                    onClick={handleReject}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all flex items-center justify-center"
                  >
                    {processingId ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reject'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// Relative Time Helper
const Clock = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default ChapterLeadApprovals;
