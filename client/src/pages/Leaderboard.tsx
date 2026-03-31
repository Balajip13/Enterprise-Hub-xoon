import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Award, 
  Target, 
  Star,
  ChevronUp,
  Search,
  Building2,
  DollarSign
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface LeaderboardMember {
  _id: string;
  name: string;
  email: string;
  chapter: string;
  businessCategory?: string;
  referralsGiven: number;
  dealsClosed: number;
  revenue: number;
  trustScore: number;
}

interface LeaderboardProps {
  user: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLeaderboard();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.businessCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = members.slice(0, 3);
  const others = filteredMembers.slice(topThree.length);

  // Reorder for spotlight: 2nd, 1st, 3rd
  const spotlightOrdering = () => {
    if (topThree.length === 0) return [];
    if (topThree.length === 1) return [topThree[0]];
    if (topThree.length === 2) return [topThree[1], topThree[0]];
    return [topThree[1], topThree[0], topThree[2]];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
            <Trophy className="w-3 h-3" />
            Performance Rankings
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">Leaderboard</h1>
          <p className="text-slate-500 text-sm font-medium max-w-2xl leading-relaxed">
            Celebrating our top contributors who drive chapter growth through referrals and successful business conversions.
          </p>
        </div>

        {members.length > 0 ? (
          <>
            {/* Top 3 Spotlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-end">
              {spotlightOrdering().map((member, idx) => {
                const rank = member === topThree[0] ? 1 : (member === topThree[1] ? 2 : 3);
                const isFirst = rank === 1;
                
                return (
                  <div 
                    key={member._id} 
                    className={`relative w-full max-w-[260px] mx-auto ${isFirst ? 'md:order-2 z-10' : idx === 0 ? 'md:order-1' : 'md:order-3'}`}
                  >
                    <div className={`bg-white rounded-[2rem] p-6 text-center transition-all hover:shadow-2xl border ${isFirst ? 'scale-110 shadow-xl border-indigo-100' : 'border-slate-100 shadow-sm'}`}>
                      {/* Rank Badge */}
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-white font-black shadow-lg text-xs ${
                        rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-slate-300' : 'bg-orange-400'
                      }`}>
                        {rank}
                      </div>

                      {/* Avatar */}
                      <div className={`w-20 h-20 rounded-[1.75rem] mx-auto mb-5 flex items-center justify-center text-2xl font-black text-white shadow-inner ${
                         rank === 1 ? 'bg-indigo-600' : 'bg-slate-900'
                      }`}>
                        {member.name.charAt(0)}
                      </div>

                      <h3 className="text-base font-black text-slate-900 mb-1 uppercase truncate tracking-tight">{member.name}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center justify-center gap-1.5">
                        <Building2 className="w-3 h-3" />
                        {member.businessCategory || 'Industry Leader'}
                      </p>

                      <div className="grid grid-cols-3 gap-1 py-4 border-y border-slate-50">
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Refs</p>
                          <p className="text-xs font-black text-slate-900">{member.referralsGiven}</p>
                        </div>
                        <div className="text-center border-x border-slate-50 px-1">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Deals</p>
                          <p className="text-xs font-black text-slate-900">{member.dealsClosed}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Trust</p>
                          <p className="text-xs font-black text-indigo-600">{member.trustScore}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Revenue</p>
                        <p className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">₹{member.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  Detailed Rankings
                </h2>
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search by name or niche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                      <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Refs Given</th>
                      <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Deals Closed</th>
                      <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Score</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-8">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMembers.map((member, index) => (
                      <tr key={member._id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-black text-white">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{member.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{member.chapter}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center text-sm font-black text-slate-700">{member.referralsGiven}</td>
                        <td className="px-8 py-6 text-center text-sm font-black text-slate-700">{member.dealsClosed}</td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full" 
                                  style={{ width: `${member.trustScore}%` }}
                                ></div>
                             </div>
                             <span className="text-xs font-black text-indigo-600">{member.trustScore}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right text-sm font-black text-slate-900 tabular-nums px-8">
                          ₹{member.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredMembers.length === 0 && (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Search className="w-8 h-8 text-slate-200" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-1 uppercase">No results found</h4>
                  <p className="text-slate-400 text-sm font-medium">Try searching for a different name or niche.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-100 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                < Award className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">Leaderboard is empty</h3>
             <p className="text-slate-500 font-medium max-w-sm mx-auto">
               Rankings will appear once members start submitting referrals and closing business deals.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
