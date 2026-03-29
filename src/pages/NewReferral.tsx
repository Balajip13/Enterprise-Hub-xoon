import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  Search, 
  User, 
  Phone, 
  IndianRupee, 
  FileText, 
  Zap, 
  CheckCircle,
  Loader2,
  ArrowRight,
  Coins,
  X,
  Mail
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { getSmartMatching } from '../services/geminiService';

interface NewReferralProps {
  onSuccess: () => void;
}

const NewReferral: React.FC<NewReferralProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMatching, setAiMatching] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{matchedId: string, reason: string} | null>(null);
  
  const [members, setMembers] = useState<any[]>([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  const user = useMemo(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }, []);

  const [formData, setFormData] = useState({
    toMemberId: '',
    clientName: '',
    email: '',
    clientPhone: '',
    requirement: '',
    value: '',
    notes: ''
  });
  const [emailError, setEmailError] = useState('');

  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  // Fetch real members from the user's chapter
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.chapter) return;
      try {
        setFetchingMembers(true);
        const data = await apiService.getChapterMembers(user.chapter);
        // Exclude self from referral recipient list
        setMembers(data.filter((m: any) => m._id !== user.id));
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setFetchingMembers(false);
      }
    };
    fetchMembers();
  }, [user?.chapter, user?.id]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(memberSearch.toLowerCase()))
    );
  }, [members, memberSearch]);

  const estimatedValue = parseFloat(formData.value) || 0;
  const potentialCommission = estimatedValue * 0.05;

  // AI Matching Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.requirement.length > 15 && !formData.toMemberId && members.length > 0) {
        setAiMatching(true);
        try {
          const match = await getSmartMatching(formData.requirement, members.map(m => ({
            id: m._id,
            name: m.name,
            category: m.category || 'General'
          })));
          if (match) {
            setAiSuggestion(match);
          }
        } catch (err) {
          console.error('AI Matching failed:', err);
        } finally {
          setAiMatching(false);
        }
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.requirement, formData.toMemberId, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.toMemberId) return;

    try {
      setLoading(true);
      setError(null);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        setEmailError('Enter a valid email address');
        return;
      }

      const referralData = {
        referrer: user.id,
        recipient: formData.toMemberId,
        clientName: formData.clientName,
        email: formData.email.toLowerCase().trim(),
        clientPhone: formData.clientPhone,
        requirement: formData.requirement,
        value: estimatedValue,
        notes: formData.notes
      };

      await apiService.createReferral(referralData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to send referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = members.find(m => m._id === formData.toMemberId);

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-[2rem] flex items-center justify-center text-green-600 mb-6 shadow-xl shadow-green-100 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Referral Sent!</h2>
        <div className="max-w-xs mx-auto space-y-4">
          <p className="text-sm text-slate-500 font-medium">
            Your connection with <span className="text-blue-600 font-bold">{selectedMember?.name}</span> has been successfully logged.
          </p>
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Potential Payoff</p>
            <p className="text-xl font-black text-amber-600">₹{potentialCommission.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Referral Submission</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Submit high-quality leads and track your revenue share automatically.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
          <X className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Professional Partner */}
        <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
             <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4" />
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Professional Partner</h3>
          </div>
          
          <div className="space-y-3">
            {formData.toMemberId ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl animate-in slide-in-from-left-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-blue-200 text-sm">
                    {selectedMember?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{selectedMember?.name}</p>
                    <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">{selectedMember?.category || 'General Partner'}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({...prev, toMemberId: ''}));
                    setAiSuggestion(null);
                  }}
                  className="p-1.5 hover:bg-white rounded-lg transition-all text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  {fetchingMembers ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : (
                    <Search className="text-slate-400 w-4 h-4" />
                  )}
                </div>
                <input 
                  type="text"
                  placeholder="Search partner by name or category..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm font-medium placeholder:text-slate-400"
                  value={memberSearch}
                  onFocus={() => setShowMemberPicker(true)}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
                {showMemberPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-4">
                    {filteredMembers.length > 0 ? filteredMembers.map(m => (
                      <button
                        key={m._id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({...prev, toMemberId: m._id}));
                          setShowMemberPicker(false);
                        }}
                        className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{m.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{m.category || 'Member'}</p>
                        </div>
                      </button>
                    )) : (
                      <div className="p-6 text-center text-slate-400 text-[10px] font-bold uppercase">No matching members found</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {aiSuggestion && !formData.toMemberId && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl animate-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">AI Matching Suggestion</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mb-3">
                  Recommended: <span className="font-bold text-slate-900">{members.find(m => m._id === aiSuggestion.matchedId)?.name}</span>
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({...prev, toMemberId: aiSuggestion.matchedId}));
                    setAiSuggestion(null);
                  }}
                  className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  Select Connection
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Client Requirement */}
        <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
             <div className="flex items-center gap-2">
               <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4" />
               </div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Client Requirement</h3>
             </div>
             {aiMatching && (
               <span className="text-[9px] font-black text-blue-500 flex items-center gap-1.5">
                 <Loader2 className="w-3 h-3 animate-spin" />
                 AI ANALYZING...
               </span>
             )}
          </div>
          
          <div className="relative">
            <textarea 
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none min-h-[110px] resize-none text-sm font-medium leading-relaxed"
              placeholder="What specifically does the client need? (e.g. 5BHK interior for a villa in OMR)"
              value={formData.requirement}
              onChange={(e) => setFormData(prev => ({...prev, requirement: e.target.value}))}
            />
          </div>
        </section>

        {/* Section 3: Client Information */}
        <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
             <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4" />
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Client Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                  required
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm font-black text-slate-800"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({...prev, clientName: e.target.value}))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${emailError ? 'text-rose-500' : 'text-slate-300'} w-4 h-4`} />
                <input 
                  required
                  type="email"
                  name="email"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 ${emailError ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-50'} rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm font-black text-slate-800`}
                  placeholder="Enter client email"
                  value={formData.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({...prev, email: val}));
                    if (emailError) {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (emailRegex.test(val)) setEmailError('');
                    }
                  }}
                />
              </div>
              {emailError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-tight pl-1">Enter a valid email address</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                  required
                  type="tel"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm font-black text-slate-800"
                  placeholder="+91 98765 43210"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({...prev, clientPhone: e.target.value}))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Deal Information */}
        <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
             <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <Coins className="w-4 h-4" />
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Deal Economics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Estimated Value</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                  type="number"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none font-black text-base text-slate-900"
                  placeholder="0.00"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({...prev, value: e.target.value}))}
                />
              </div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-center justify-between h-[50px]">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">5% Share</span>
                  <p className="text-sm font-black text-amber-900">₹{potentialCommission.toLocaleString('en-IN')}</p>
               </div>
               <Coins className="w-4 h-4 text-amber-400 opacity-50" />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading || !formData.toMemberId || !formData.requirement}
          className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 mt-2"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-4.5 h-4.5" />
              Submit Referral
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewReferral;
