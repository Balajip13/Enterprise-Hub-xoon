
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Phone, Mail, MessageCircle, X, ShieldCheck, Crown, Star, Users } from 'lucide-react';
import { apiService } from '../services/apiService';

interface MembersProps {
  initialSearch?: string;
  onClearSearch?: () => void;
}

const Members: React.FC<MembersProps> = ({ initialSearch = '', onClearSearch }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useMemo(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }, []);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.chapter) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await apiService.getChapterMembers(user.chapter);
        setMembers(data);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load member directory');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user?.chapter]);

  const getAvatarGradient = (name: string) => {
    const firstChar = name.charAt(0).toUpperCase();
    const charCode = firstChar.charCodeAt(0);
    
    // Using 135deg gradients as requested
    if (charCode % 2 === 0) return 'linear-gradient(135deg, #3B82F6, #6366F1)';
    return 'linear-gradient(135deg, #14B8A6, #06B6D4)';
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter(member => 
        (member.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.businessCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.subCategories || []).some((k: string) => k.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (a.membershipType === 'PRO' && b.membershipType !== 'PRO') return -1;
        if (a.membershipType !== 'PRO' && b.membershipType === 'PRO') return 1;
        return (a.businessName || '').localeCompare(b.businessName || '');
      });
  }, [members, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#F8FAFC] min-h-screen -m-6 p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Member Directory</h1>
          <p className="text-slate-500 text-sm font-bold italic leading-tight">Discover and connect with trusted chapter professionals.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#FEF3C7] border border-amber-200 px-4 py-2 rounded-2xl shadow-sm self-start sm:self-center">
          <Crown className="w-4 h-4 text-amber-600" />
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest whitespace-nowrap">PRO Priority</span>
        </div>
      </header>

      <div className="relative group max-w-2xl mx-auto md:mx-0 mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text"
          placeholder="Search by business, category or keywords..."
          className="w-full pl-12 pr-12 py-3 bg-white rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => { setSearchTerm(''); onClearSearch?.(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid gap-5">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member, index) => (
            <div 
              key={member._id} 
              className={`group bg-white p-5 md:p-6 rounded-[1.25rem] border border-[#E2E8F0] flex flex-col sm:flex-row items-center sm:items-start gap-5 animate-in fade-in slide-in-from-top-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 min-h-[160px] ${
                member.membershipType === 'PRO' ? 'ring-1 ring-amber-200/20' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar section */}
              <div 
                className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-bold text-white shadow-sm relative transition-transform duration-300 group-hover:scale-105"
                style={{ background: getAvatarGradient(member.businessName || member.name) }}
              >
                {(member.businessName || member.name).charAt(0)}
                {member.membershipType === 'PRO' && (
                  <div className="absolute -top-1.5 -right-1.5 bg-amber-500 p-1 rounded-full border-2 border-white shadow-md">
                    <Crown className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
                <div>
                  {/* Row 1: Business Name + Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <h3 className="font-black text-xl text-slate-900 truncate group-hover:text-indigo-600 transition-colors tracking-tight">
                      {member.businessName || 'Business Name Pending'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {member.rating || '5.0'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        {member.trustScore || 99}
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 2: Member Name and Category */}
                  <div className="flex items-center gap-2 mb-2.5 py-0.5 border-l-2 border-blue-50 pl-3">
                    <p className="text-sm font-bold text-slate-700">{member.name}</p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <p className="text-xs text-slate-500 font-semibold italic">{member.businessCategory || 'Business category not provided'}</p>
                  </div>
                  
                  {/* Row 3: Service Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(member.subCategories && member.subCategories.length > 0) ? (
                      member.subCategories.slice(0, 4).map((k: string) => (
                        <span key={k} className="text-[10px] px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#334155] font-bold tracking-tight border border-slate-50">
                          {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 font-medium italic">
                        No service tags provided
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 4: Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                  <a 
                    href={`tel:${member.mobile}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Member
                  </a>
                  <a 
                    href={`https://wa.me/${member.whatsappNumber || member.mobile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] hover:bg-[#D1FAE5] rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-16 rounded-[1.5rem] border-2 border-[#E2E8F0] border-dashed text-center">
            <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No matching members</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">We couldn't find any professionals matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
