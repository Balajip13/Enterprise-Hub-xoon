import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Layout from './src/components/Layout';
import AdminLayout from './src/components/AdminLayout';

// User Views
import Dashboard from './src/pages/Dashboard';
import Members from './src/pages/Members';
import Referrals from './src/pages/Referrals';
import Meetings from './src/pages/Meetings';
import Profile from './src/pages/Profile';
import NewReferral from './src/pages/NewReferral';
import ReferralStatus from './src/pages/ReferralStatus';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import ChapterSelection from './src/pages/ChapterSelection';
import { apiService } from './src/services/apiService';
import LandingPage from './src/pages/LandingPage';
import ContactPage from './src/pages/ContactPage';
import PrivacyPolicyPage from './src/pages/PrivacyPolicyPage';
import TermsPage from './src/pages/TermsPage';
import AboutPage from './src/pages/AboutPage';
import FAQPage from './src/pages/FAQPage';
import Leaderboard from './src/pages/Leaderboard';
import Notifications from './src/pages/Notifications';
import PaymentPage from './src/pages/PaymentPage';

// Admin Views
import AdminDashboard from './src/pages/admin/AdminDashboard';
import AdminUsers from './src/pages/admin/AdminUsers';
import AdminChapters from './src/pages/admin/AdminChapters';
import AdminReferrals from './src/pages/admin/AdminReferrals';
import AdminMeetings from './src/pages/admin/AdminMeetings';
import AdminReports from './src/pages/admin/AdminReports';
import AdminNotifications from './src/pages/admin/AdminNotifications';
import AdminSettings from './src/pages/admin/AdminSettings';
import AdminSupport from './src/pages/admin/AdminSupport';
import AdminPayments from './src/pages/admin/AdminPayments';
import ReferralProtocol from './src/pages/admin/ReferralProtocol';
import ReferralReport from './src/pages/admin/ReferralReport';

// Chapter Lead Views
import ChapterLeadLayout from './src/components/ChapterLeadLayout';
import ChapterLeadDashboard from './src/pages/chapter-lead/ChapterLeadDashboard';
import ChapterLeadApprovals from './src/pages/chapter-lead/ChapterLeadApprovals';
import ChapterLeadMembers from './src/pages/chapter-lead/ChapterLeadMembers';
import ChapterLeadMeetings from './src/pages/chapter-lead/ChapterLeadMeetings';
import ChapterLeadReports from './src/pages/chapter-lead/ChapterLeadReports';

import { useActiveTab } from './src/hooks/useActiveTab';
import { getLocalStorage, setLocalStorage, clearLocalStorage } from './src/utils/storageHelper';

// ── Admin Application (Isolated API) ──────────────────────────────────────
interface AdminAppProps {
  user: any;
  onSignOut: () => void;
}

const AdminApp: React.FC<AdminAppProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useActiveTab('admin', 'dashboard');

  if (!user || user.role !== 'ADMIN') return null;

  const adminViews: Record<string, React.ReactNode> = {
    'dashboard': <AdminDashboard />,
    'users': <AdminUsers />,
    'chapters': <AdminChapters />,
    'referrals': <AdminReferrals />,
    'referrals/protocol': <ReferralProtocol />,
    'referrals/report': <ReferralReport />,
    'meetings': <AdminMeetings />,
    'reports': <AdminReports />,
    'payments': <AdminPayments />,
    'notifications': <AdminNotifications />,
    'settings': <AdminSettings />,
    'support': <AdminSupport />,
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        navigate(`/admin/${tab}`);
      }}
      onSignOut={onSignOut}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {adminViews[activeTab] || <AdminDashboard />}
      </div>
    </AdminLayout>
  );
};

interface ChapterLeadAppProps {
  user: any;
  onSignOut: () => void;
}

const ChapterLeadApp: React.FC<ChapterLeadAppProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useActiveTab('chapter-lead', 'dashboard');

  if (!user || user.role !== 'CHAPTER_LEAD') return null;

  const clViews: Record<string, React.ReactNode> = {
    'dashboard': <ChapterLeadDashboard user={user} onTabChange={(tab) => { setActiveTab(tab); navigate(`/chapter-lead/${tab}`); }} />,
    'approvals': <ChapterLeadApprovals user={user} />,
    'members': <ChapterLeadMembers user={user} />,
    'meetings': <ChapterLeadMeetings user={user} />,
    'reports': <ChapterLeadReports user={user} />,
    'referrals': <Referrals user={user} onNavigateToMember={() => {}} onAddNew={() => {}} />,
    'notifications': <Notifications user={user} />,
    'profile': <Profile user={user} onSignOut={onSignOut} />,
  };

  return (
    <ChapterLeadLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        navigate(`/chapter-lead/${tab}`);
      }}
      onSignOut={onSignOut}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {clViews[activeTab] || <ChapterLeadDashboard user={user} onTabChange={(tab) => { setActiveTab(tab); navigate(`/chapter-lead/${tab}`); }} />}
      </div>
    </ChapterLeadLayout>
  );
};

interface AuthenticatedAppProps {
  user: any;
  onSignOut: () => void;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useActiveTab('dashboard', 'dashboard');
  const [initialMemberSearch, setInitialMemberSearch] = useState('');

  useEffect(() => {
    if (user && user.role === 'MEMBER' && user.paymentStatus === 'unpaid') {
      const allowedPaths = ['payment', 'profile'];
      const currentPath = location.pathname.split('/').pop() || 'dashboard';
      if (!allowedPaths.includes(currentPath)) {
        setActiveTab('payment');
        navigate('/dashboard/payment');
      }
    }
  }, [user, navigate, location.pathname]);

  if (!user || user.role !== 'MEMBER' || !user.sessionOnboarded) return null;

  const handleNavigateToMember = (searchTerm: string) => {
    if (user.paymentStatus === 'unpaid') return;
    setInitialMemberSearch(searchTerm);
    setActiveTab('members');
    navigate('/dashboard/members');
  };

  const memberViews: Record<string, React.ReactNode> = {
    'dashboard': <Dashboard user={user} onNavigateToReferrals={() => setActiveTab('referrals')} />,
    'referrals': <Referrals user={user} onNavigateToMember={(search) => { setInitialMemberSearch(search); setActiveTab('members'); }} onAddNew={() => setActiveTab('new-referral')} />,
    'referral-status': <ReferralStatus user={user} />,
    'members': <Members user={user} initialSearch={initialMemberSearch} onClearSearch={() => setInitialMemberSearch('')} />,
    'new-referral': <NewReferral user={user} onSuccess={() => setActiveTab('referrals')} />,
    'meetings': <Meetings user={user} />,
    'leaderboard': <Leaderboard user={user} />,
    'notifications': <Notifications user={user} />,
    'payment': <PaymentPage user={user} onPaymentSuccess={() => setActiveTab('dashboard')} />,
    'profile': <Profile user={user} onSignOut={onSignOut} />,
  };

  return (
    <Layout
      userRole={user?.role}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== 'members') setInitialMemberSearch('');
      }}
      onSignOut={onSignOut}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {memberViews[activeTab] || <Dashboard onTabChange={(tab) => { setActiveTab(tab); navigate(`/dashboard/${tab}`); }} />}
      </div>
    </Layout>
  );
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<any>(() => {
    const savedUser = getLocalStorage('user');
    if (savedUser && savedUser.email) {
      // Normalize id/role
      const isAdmin = savedUser.role === 'ADMIN';
      const hasChapter = !!savedUser.chapter;
      const hasRole = !!savedUser.role && savedUser.role !== 'PENDING';
      
      // Ensure id exists if _id does
      const id = savedUser.id || savedUser._id;
      
      return {
        ...savedUser,
        id,
        sessionOnboarded: savedUser.sessionOnboarded ?? (isAdmin || (hasChapter && hasRole))
      };
    }
    return null;
  });

  // Polling for status updates if user is not approved
  useEffect(() => {
    if (!user || user.role === 'ADMIN' || user.status === 'Approved') return;

    const pollStatus = async () => {
      try {
        const data = await apiService.getUserStatus();
        if (data.success && data.status !== user.status) {
          const updatedUser = { ...user, status: data.status, role: data.role, chapter: data.chapter };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error('[AppRoutes] Status poll failed:', err);
      }
    };

    const interval = setInterval(pollStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  // Centralized Redirection Controller
  useEffect(() => {
    const publicPaths = ['/', '/login', '/register', '/contact', '/privacy', '/terms', '/about', '/faq'];
    const currentPath = location.pathname;
    const isPublicPath = publicPaths.includes(currentPath);

    if (!user) {
      if (!isPublicPath && !currentPath.startsWith('/register')) {
        navigate('/login');
      }
      return;
    }

    // Role Normalization (just in case)
    const role = user.role?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const isChapterLead = role === 'CHAPTER_LEAD';
    const isMember = role === 'MEMBER';
    const isOnboarded = !!user.sessionOnboarded && !!user.chapter && !!user.role;

    // 1. If at login/register but already logged in, redirect to home/dashboard
    if (currentPath === '/login' || currentPath === '/register') {
      if (isAdmin) navigate('/admin');
      else if (!isOnboarded) navigate('/chapter-selection');
      else navigate(isChapterLead ? '/chapter-lead' : '/dashboard');
      return;
    }

    // 2. Global Role-Based Routing
    if (isAdmin) {
      if (!currentPath.startsWith('/admin') && !isPublicPath) {
        navigate('/admin');
      }
    } else if (!isOnboarded) {
      if (currentPath !== '/chapter-selection' && !isPublicPath) {
        navigate('/chapter-selection');
      }
    } else if (isChapterLead) {
      if (!currentPath.startsWith('/chapter-lead') && !isPublicPath) {
        navigate('/chapter-lead');
      }
    } else if (isMember) {
      if (!currentPath.startsWith('/dashboard') && !isPublicPath) {
        navigate('/dashboard');
      }
    }
  }, [user, location.pathname, navigate]);

  const handleAuthSuccess = (userData: any) => {
    const isAdmin = userData.role === 'ADMIN';
    const hasChapter = !!userData.chapter;
    const hasRole = !!userData.role && userData.role !== 'PENDING';
    
    const newUser = { 
      ...userData, 
      sessionOnboarded: isAdmin || (hasChapter && hasRole) 
    };
    
    setUser(newUser);
    setLocalStorage('user', newUser);
  };

  const handleOnboardingComplete = (updatedUser: any) => {
    const confirmedUser = { ...updatedUser, sessionOnboarded: true };
    setUser(confirmedUser);
    setLocalStorage('user', confirmedUser);
  };

  const handleSignOut = () => {
    setUser(null);
    clearLocalStorage();
    localStorage.removeItem('token'); // Keep token separate if needed or just clear all
    navigate('/');
  };

  const getHomeRedirect = () => {
    if (!user || !user.role) return "/login";
    if (user.role === 'ADMIN') return "/admin";
    if (!user.sessionOnboarded) return "/chapter-selection";
    return user.role === 'CHAPTER_LEAD' ? "/chapter-lead" : "/dashboard";
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<Login onLoginSuccess={handleAuthSuccess} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chapter-selection" element={
        user ? (
          user.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <ChapterSelection user={user} onOnboardingComplete={handleOnboardingComplete} onSignOut={handleSignOut} />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FAQPage />} />
      
      {/* Route Splitting */}
      <Route path="/dashboard/*" element={<AuthenticatedApp user={user} onSignOut={handleSignOut} />} />
      <Route path="/admin/*" element={<AdminApp user={user} onSignOut={handleSignOut} />} />
      <Route path="/chapter-lead/*" element={<ChapterLeadApp user={user} onSignOut={handleSignOut} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
