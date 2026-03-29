
import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  MapPin, 
  Users, 
  Plus, 
  Settings2, 
  Power,
  ChevronRight,
  ShieldCheck,
  Search,
  X,
  Building2,
  Code
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminChapters: React.FC = () => {
  const [chapters, setChapters] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    location: '',
    code: '',
    lead: '',
    status: 'active'
  });

  useEffect(() => {
    fetchChapters();
    fetchUsers(); // For lead assignment
  }, []);

  const fetchChapters = async () => {
    try {
      const response = await apiService.getAdminChapters();
      setChapters(response.data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiService.getAdminUsers();
      // Filter for potential leads (Chapter Leads or Admins)
      setUsers(data.filter((u: any) => u.role === 'CHAPTER_LEAD' || u.role === 'ADMIN'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateAdminChapter(editingId, formData);
      } else {
        await apiService.createAdminChapter(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
      fetchChapters();
    } catch (error) {
      alert('Error processing request');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      location: '',
      code: '',
      lead: '',
      status: 'active'
    });
  };

  const handleEdit = (chapter: any) => {
    setEditingId(chapter._id);
    setFormData({
      name: chapter.name || '',
      city: chapter.city || '',
      location: chapter.location || '',
      code: chapter.code || '',
      lead: chapter.lead?._id || chapter.lead || '',
      status: chapter.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (window.confirm(`Deactivate Chapter: ${name}?\n\nThis will disable referrals and meetings for this chapter.`)) {
      try {
        await apiService.deactivateAdminChapter(id);
        fetchChapters();
      } catch (error) {
        console.error('Error deactivating chapter:', error);
      }
    }
  };

  const filteredChapters = chapters.filter(chapter => {
    const leadName = chapter.lead?.name || '';
    return (
      chapter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leadName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full mx-auto min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-col md:flex-row items-center gap-2 md:gap-3">
              Chapters
              <span className="text-[10px] md:text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded-md tracking-widest uppercase">Network</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Organize and manage regional hubs</p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-3">
            <button 
              onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Build Chapter
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Search Summary Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex gap-8 px-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Nodes</p>
            <p className="text-2xl font-black text-slate-900">{chapters.filter(c => c.status === 'active').length}</p>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Members</p>
            <p className="text-2xl font-black text-slate-900">{chapters.reduce((sum, c) => sum + (c.memberCount || 0), 0)}</p>
          </div>
        </div>
        
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text"
            placeholder="Search by name, city, or lead..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chapter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filteredChapters.map((chapter) => (
          <div key={chapter._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 -z-0 opacity-50 group-hover:bg-slate-100 transition-colors"></div>
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-slate-900 transition-all">
                  <Layers className="w-7 h-7" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  chapter.status === 'active' 
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                  : 'text-rose-600 bg-rose-50 border-rose-100'
                }`}>
                  {chapter.status}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-950 mb-1 group-hover:text-slate-700 transition-colors">{chapter.name}</h3>
              <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest">{chapter.location}, {chapter.city}</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Members</span>
                  </div>
                  <span className="text-lg font-black text-slate-950">{chapter.memberCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Node Lead</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{chapter.lead?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => handleEdit(chapter)}
                  className="py-3.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Settings2 className="w-3.5 h-3.5" /> Edit Node
                </button>
                <button 
                  onClick={() => handleDeactivate(chapter._id, chapter.name)}
                  className={`py-3.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    chapter.status === 'active' ? 'text-rose-500 hover:bg-rose-50 hover:border-rose-100' : 'text-slate-400 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={chapter.status !== 'active'}
                >
                  <Power className="w-3.5 h-3.5" /> Deactivate
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Action-Oriented Placeholder */}
        {!searchTerm && (
          <div 
            onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }}
            className="bg-slate-50/50 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-slate-400 hover:bg-slate-100/30 transition-all"
          >
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm text-slate-300 group-hover:text-slate-900 group-hover:scale-110 transition-all">
              <Plus className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest whitespace-nowrap">Expand Network</p>
          </div>
        )}
      </div>

      {/* Launch/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingId ? 'Configure Chapter' : 'Launch New Node'}</h2>
                <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-widest">Network expansion protocol</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm active:scale-90">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="px-10 py-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Chapter Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                      placeholder="e.g. Bangalore Central"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Node Code</label>
                  <div className="relative">
                    <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                      placeholder="e.g. BLR_CEN"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                    placeholder="e.g. Bangalore"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Area Location</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                    placeholder="e.g. Koramangala"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign Node Lead</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  value={formData.lead}
                  onChange={(e) => setFormData({...formData, lead: e.target.value})}
                >
                  <option value="">Select a member to lead this node...</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Status</label>
                <div className="flex gap-4">
                  {['Active', 'Inactive'].map((status) => (
                    <label key={status} className="flex-1 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="status" 
                        className="hidden" 
                        checked={formData.status === status.toLowerCase()}
                        onChange={() => setFormData({...formData, status: status.toLowerCase()})}
                      />
                      <div className={`p-4 border-2 rounded-2xl transition-all text-center ${
                        formData.status === status.toLowerCase() 
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-black' 
                        : 'bg-white border-slate-100 text-slate-400 group-hover:border-slate-200 font-bold'
                      }`}>
                        <p className="text-xs uppercase tracking-widest">{status}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {editingId ? 'Update Node Configuration' : 'Authorize Node Launch'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChapters;
