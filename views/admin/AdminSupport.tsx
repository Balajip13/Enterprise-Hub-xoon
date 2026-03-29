
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { apiService, apiFetch } from '../../services/apiService';

interface SupportMessage {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Pending' | 'Solved';
  createdAt: string;
}

const AdminSupport: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdminSupportMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'Pending' | 'Solved') => {
    try {
      const response = await apiService.updateAdminSupportStatus(id, status);
      if (response) {
        fetchMessages();
        if (selectedMessage?._id === id) {
          setSelectedMessage(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await apiService.deleteAdminSupportMessage(id);
      fetchMessages();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || msg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Solved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={14} />;
      case 'Solved': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full mx-auto min-h-screen bg-slate-50/50">
      {/* Header Area */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Support Messages</h1>
            <p className="text-slate-500 font-medium text-sm">Manage inquiries from the public contact form.</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or subject..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400 ml-2" />
          <div className="relative flex items-center group">
            <select 
              className="bg-slate-50 appearance-none rounded-2xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer min-w-[140px] transition-all hover:bg-slate-100/80"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Solved">Solved</option>
            </select>
            <ChevronDown 
              size={16} 
              className="absolute right-3.5 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors" 
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Sender</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">Loading messages...</td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">No messages found.</td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                          {msg.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{msg.fullName}</div>
                          <div className="text-xs text-slate-500 font-medium">{msg.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-800 line-clamp-1">{msg.subject}</div>
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{msg.message}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-700 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${getStatusColor(msg.status)}`}>
                        {getStatusIcon(msg.status)}
                        {msg.status}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedMessage(msg); setIsModalOpen(true); }}
                          className="p-2 rounded-xl bg-white border border-slate-100 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(msg._id, 'Solved')}
                          className="p-2 rounded-xl bg-white border border-slate-100 text-slate-600 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all"
                          title="Mark Solved"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteMessage(msg._id)}
                          className="p-2 rounded-xl bg-white border border-slate-100 text-slate-600 hover:text-rose-600 hover:border-rose-100 shadow-sm transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Details Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(selectedMessage.status)} border`}>
                  {getStatusIcon(selectedMessage.status)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{selectedMessage.subject}</h3>
                  <p className="text-sm font-medium text-slate-500">Inquiry ID: #{selectedMessage._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] scrollbar-hide">
              {/* Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</div>
                    <div className="font-bold text-slate-900">{selectedMessage.fullName}</div>
                  </div>
                </div>
                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</div>
                    <div className="font-bold text-slate-900">{selectedMessage.email}</div>
                  </div>
                </div>
                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone</div>
                    <div className="font-bold text-slate-900">{selectedMessage.phone}</div>
                  </div>
                </div>
                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Submitted</div>
                    <div className="font-bold text-slate-900">{new Date(selectedMessage.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={16} className="text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Message Content</h4>
                </div>
                <div className="p-6 rounded-[24px] bg-indigo-50/30 border border-indigo-100/50 text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStatus(selectedMessage._id, 'Pending')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedMessage.status === 'Pending' ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => updateStatus(selectedMessage._id, 'Solved')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedMessage.status === 'Solved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                >
                  Mark Solved
                </button>
              </div>
              <button 
                onClick={() => deleteMessage(selectedMessage._id)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all ml-auto"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
