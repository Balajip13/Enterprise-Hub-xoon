import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, Eye, Edit2, 
  Trash2, X, Mail, Phone, Calendar, Building2, 
  UserX, UserCheck, FileText, IndianRupee, Loader2, AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'members' | 'leads' | 'admins' | 'active' | 'pending'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    chapter: '',
    role: 'MEMBER',
    status: 'Pending Approval',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }

      if (editingId) {
        await apiService.updateAdminUser(editingId, payload);
      } else {
        await apiService.createAdminUser(payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert('Error processing request');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      chapter: '',
      role: 'MEMBER',
      status: 'Pending Approval',
      password: ''
    });
  };

  const handleEditUser = (user: any) => {
    setEditingId(user._id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      chapter: user.chapter || '',
      role: user.role || 'MEMBER',
      status: user.status || 'Pending Approval',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = async (id: string) => {
    try {
      const data = await apiService.getAdminUserById(id);
      setSelectedUser(data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleViewReport = async (id: string) => {
    try {
      const data = await apiService.getUserReport(id);
      setSelectedReport(data);
      setIsReportModalOpen(true);
    } catch (error) {
      console.error('Error fetching user report:', error);
      alert('Failed to load user activity report. Please try again.');
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === 'Approved' ? 'Suspended' : 'Approved';
      await apiService.updateAdminUser(user._id, { status: newStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user: ${name}?`)) {
      try {
        await apiService.deleteAdminUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'active') return user.status === 'Approved';
    if (filter === 'pending') return user.status === 'Pending Approval' || user.status === 'Pending';
    if (filter === 'admins') return user.role === 'ADMIN';
    if (filter === 'leads') return user.role === 'CHAPTER_LEAD';
    if (filter === 'members') return user.role === 'MEMBER';
    
    return true;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Suspended': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 w-full mx-auto min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-col md:flex-row items-center gap-2 md:gap-3">
              User Management
              <span className="text-[10px] md:text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded-md tracking-widest uppercase">Admin</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Configure platform access and roles</p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-3">
            <button 
              onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-medium text-slate-600 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Users', icon: Users },
              { id: 'members', label: 'Members', icon: null },
              { id: 'leads', label: 'Chapter Leads', icon: null },
              { id: 'admins', label: 'Admins', icon: null },
              { id: 'active', label: 'Active', icon: null },
              { id: 'pending', label: 'Pending', icon: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                  filter === tab.id 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving user records...</p>
          </div>
        ) : error ? (
           <div className="p-10 text-center flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="text-sm font-bold text-slate-900 mb-4">{error}</p>
            <button onClick={fetchUsers} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">Retry</button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <Users className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-sm font-bold text-slate-500">No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px] table-fixed">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="w-[18%] min-w-[200px] p-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-[0.4px]">User</th>
                  <th className="w-[20%] min-w-[220px] p-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-[0.4px]">Contact</th>
                  <th className="w-[12%] min-w-[140px] p-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-[0.4px]">Chapter</th>
                  <th className="w-[15%] min-w-[160px] p-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-[0.4px]">Membership</th>
                  <th className="w-[12%] min-w-[120px] p-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-[0.4px]">Status</th>
                  <th className="w-[13%] min-w-[140px] p-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-[0.4px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 px-6 py-[18px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 flex-shrink-0 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm font-black uppercase shadow-sm">
                          {user.name?.[0] || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-slate-900 truncate tracking-tight">{user.name || 'Anonymous'}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-[14px]">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 text-slate-600 truncate">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 truncate">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{user.mobile || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-[14px]">
                      <p className="font-medium text-slate-700 truncate">{user.chapter || 'Global'}</p>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight border w-fit ${
                          user.paymentStatus === 'paid' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {user.paymentStatus === 'paid' ? 'Paid Member' : 'Unpaid'}
                        </span>
                        {user.paymentDate && (
                          <p className="text-[9px] text-slate-400 font-bold truncate">Paid {new Date(user.paymentDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap items-center w-auto ${getStatusStyle(user.status)}`}>
                         <span className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${user.status === 'Approved' ? 'bg-emerald-500' : user.status === 'Suspended' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                         {user.status === 'Pending Approval' ? 'Pending' : (user.status || 'Pending')}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleViewDetails(user._id)}
                          title="View Details" 
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleViewReport(user._id)}
                          title="Activity Report" 
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          title="Edit User" 
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'Approved' ? 'Suspend Account' : 'Activate Account'}
                          className={`p-2.5 rounded-lg transition-all ${user.status === 'Approved' ? 'text-slate-400 hover:text-amber-600 hover:bg-white' : 'text-slate-400 hover:text-emerald-600 hover:bg-white'}`}
                        >
                          {user.status === 'Approved' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          title="Delete Permanently" 
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
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
        )}
      </div>

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black uppercase shadow-lg shadow-slate-200">
                  {selectedUser.name?.[0] || '?'}
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedUser.name}</h2>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    selectedUser.role === 'ADMIN' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    {selectedUser.role}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(selectedUser.status)}`}>
                    {selectedUser.status === 'Pending Approval' ? 'Pending' : (selectedUser.status || 'Pending')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-[14px] font-semibold text-slate-700">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-[14px] font-semibold text-slate-700">{selectedUser.mobile || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Chapter Assignment</p>
                    <p className="text-[14px] font-semibold text-slate-700 font-bold">{selectedUser.chapter || 'Global'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Registration Date</p>
                    <p className="text-[14px] font-semibold text-slate-700">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4 group">
                    <div className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all ${
                      selectedUser.paymentStatus === 'paid' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Membership Status</p>
                      <p className={`text-[14px] font-black ${selectedUser.paymentStatus === 'paid' ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {selectedUser.paymentStatus === 'paid' ? 'PAID / ACTIVE' : 'UNPAID / INACTIVE'}
                      </p>
                    </div>
                  </div>
                  {selectedUser.razorpayPaymentId && (
                    <div className="mt-4 ml-14">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Transaction ID</p>
                      <p className="text-[12px] font-mono text-slate-600 font-bold break-all">{selectedUser.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingId ? 'Update User Registry' : 'New User Enrollment'}</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{editingId ? 'Modify existing credentials and access level' : 'Grant platform access to a new user'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-10 py-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700"
                    placeholder="e.g. Manikandan"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                  <input 
                    type="tel"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700"
                    placeholder="+91 00000 00000"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  />
                </div>
                {!editingId && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                    <input 
                      type="password" 
                      required={!editingId}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Regional Chapter</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700 appearance-none"
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                  >
                    <option value="">Global / Select Chapter</option>
                    <option value="Bangalore Central">Bangalore Central</option>
                    <option value="Mumbai West">Mumbai West</option>
                    <option value="Delhi North">Delhi North</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Access Role</label>
                  <div className="flex bg-slate-100 p-1.5 rounded-[1.25rem] gap-1">
                    {['MEMBER', 'CHAPTER_LEAD', 'ADMIN'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({...formData, role})}
                        className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${
                          formData.role === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {role.split('_').join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Account Status</label>
                  <div className="flex gap-4">
                    {['Approved', 'Pending Approval'].map((status) => (
                      <label key={status} className="flex-1 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="status" 
                          className="hidden" 
                          checked={formData.status === status}
                          onChange={() => setFormData({...formData, status})}
                        />
                        <div className={`p-4 border-2 rounded-2xl transition-all ${
                          formData.status === status 
                          ? 'bg-indigo-50/50 border-indigo-600 text-indigo-900' 
                          : 'bg-white border-slate-100 text-slate-400 group-hover:border-slate-200'
                        }`}>
                          <p className="text-center font-bold text-xs uppercase tracking-widest">{status}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
            </form>

            <div className="px-10 py-8 border-t border-slate-100 flex gap-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Discard
              </button>
              <button 
                onClick={handleFormSubmit}
                className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                {editingId ? 'Update Record' : 'Create Access Account'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* User Activity Report Modal */}
      {isReportModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black uppercase shadow-lg shadow-slate-200">
                  <FileText className="w-8 h-8" />
                </div>
                <button onClick={() => setIsReportModalOpen(false)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Activity Report</h2>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-white border-slate-200 text-slate-600">
                    {selectedReport.name}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap items-center w-auto ${selectedReport.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : selectedReport.status === 'Suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                    {selectedReport.status === 'Pending Approval' ? 'Pending' : (selectedReport.status || 'Pending')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {(selectedReport.referralsCount === 0 && selectedReport.meetingsAttended === 0) ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No activity data available for this user.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Referrals</p>
                    <p className="text-2xl font-black text-indigo-900">{selectedReport.referralsCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-1">Meetings Attended</p>
                    <p className="text-2xl font-black text-emerald-900">{selectedReport.meetingsAttended}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
                  <span className="text-[13px] font-semibold text-slate-700">{selectedReport.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Role</span>
                  <span className="text-[13px] font-semibold text-slate-700">{(selectedReport.role || 'MEMBER').split('_').join(' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Chapter</span>
                  <span className="text-[13px] font-semibold text-slate-700">{selectedReport.chapter || 'Global'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Join Date</span>
                  <span className="text-[13px] font-semibold text-slate-700">{selectedReport.joinDate ? new Date(selectedReport.joinDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
