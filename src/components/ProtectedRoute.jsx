import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import FeedbackModal from './FeedbackModal';
import { formatDateTime, formatRelativeTime } from '../utils/time';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, logout, refreshUser, login } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showAdminSwitch, setShowAdminSwitch] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [switchingAdmin, setSwitchingAdmin] = useState(false);
  const [adminSwitchError, setAdminSwitchError] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem('ablls_token');
        if (!token) return;

        const res = await fetch('/api/notifications/list', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (e) {
        console.error('Notification fetch failed', e);
      }
    };

    fetchNotifications();
    const poll = setInterval(fetchNotifications, 5000);
    const clock = setInterval(() => setTick((value) => value + 1), 1000);

    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [user?.id]);

  const handleOpenNotification = async (notification) => {
    setSelectedNotification(notification);
    setShowNotifications(false);
    setShowAdminSwitch(false);
    setAdminCredentials({ email: '', password: '' });
    setAdminSwitchError('');

    try {
      const token = sessionStorage.getItem('ablls_token');
      if (token && !notification.read_at) {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationId: notification.id }),
        });
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
          )
        );
      }

      if (notification.type === 'admin_promotion') {
        await refreshUser();
      }
    } catch (e) {
      console.error('Notification read failed', e);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read_at).length;
  let selectedDetails = null;
  if (selectedNotification?.details) {
    try {
      selectedDetails =
        typeof selectedNotification.details === 'string'
          ? JSON.parse(selectedNotification.details)
          : selectedNotification.details;
    } catch {
      selectedDetails = null;
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard', path: '/dashboard' },
    { id: 'caseload', label: 'Caseload', icon: 'group', path: '/dashboard' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', path: '/analytics' },
  ];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const handleSwitchToAdminAccount = async (e) => {
    e.preventDefault();
    setAdminSwitchError('');
    setSwitchingAdmin(true);
    try {
      const authUser = await login(adminCredentials.email, adminCredentials.password);
      if (authUser.role !== 'admin') {
        throw new Error('These credentials are not for an admin account.');
      }
      setSelectedNotification(null);
      setShowAdminSwitch(false);
      navigate('/admin');
    } catch (error) {
      setAdminSwitchError(error.message || 'Unable to switch to the admin account.');
    } finally {
      setSwitchingAdmin(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-body selection:bg-primary-container">
      {/* SideNavBar: Dark Sanctuary Theme */}
      <aside className="fixed left-0 h-full w-64 bg-[#34313a] flex flex-col py-8 gap-2 z-50 transition-all duration-300 shadow-2xl">
        <div className="px-6 mb-12">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
               <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none tracking-tighter">Cognify</h1>
              <p className="text-[#cac4d0] text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-60">Therapist Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button 
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300 group ${active ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95' : 'text-[#cac4d0] hover:bg-[#49454f] hover:text-white'}`}
              >
                <span className={`material-symbols-outlined text-xl ${active ? 'fill-1' : ''}`}>{item.icon}</span>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}

          <button 
             onClick={() => setShowFeedbackModal(true)}
             className="w-full flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300 group text-tertiary-container hover:bg-[#49454f] hover:text-white border border-transparent hover:border-tertiary/20 mt-4"
          >
             <span className="material-symbols-outlined text-xl">rate_review</span>
             <span className="text-sm font-bold tracking-tight">System Feedback</span>
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <div className="pt-6 border-t border-[#49454f]/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300 group text-[#cac4d0] hover:bg-[#49454f] hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="text-sm font-bold tracking-tight">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* TopNavBar: Glassmorphism */}
      <header className="fixed top-0 left-64 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 flex justify-between items-center px-10 border-b border-outline-variant/5">
        <div className="flex items-center gap-8 flex-1">
          <div className="relative w-full max-w-md group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search students, clinical notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border-none rounded-full h-12 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 text-sm font-bold placeholder:text-on-surface-variant/40 transition-all focus:bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setShowNotifications((value) => !value)}
              className="relative w-11 h-11 rounded-2xl bg-surface-container text-on-surface flex items-center justify-center shadow-sm border border-outline-variant/10 hover:border-primary/20 transition-all"
              aria-label="Open notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-error text-white text-[10px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-[360px] rounded-[1.75rem] border border-outline-variant/10 bg-white shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-on-surface">Notifications</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Live updates</p>
                  </div>
                  <p className="text-[10px] font-medium text-on-surface-variant">{new Date().toLocaleTimeString()}</p>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-sm text-center text-on-surface-variant">No notifications yet.</div>
                  ) : notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleOpenNotification(notification)}
                      className={`w-full text-left px-5 py-4 border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors ${notification.read_at ? 'bg-white' : 'bg-primary/5'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-on-surface">{notification.title}</p>
                          <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">{notification.message}</p>
                        </div>
                        {!notification.read_at && <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{formatRelativeTime(notification.created_at)}</span>
                        <span className="text-[10px] text-on-surface-variant">{formatDateTime(notification.created_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-outline-variant/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-on-surface tracking-tight leading-none mb-1">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Session Active</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-black text-xs shadow-sm shadow-primary/10 border border-primary/5">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 pt-20 flex-1 flex flex-col min-h-screen">
        <section className="p-10 max-w-[1600px] mx-auto w-full flex-1">
           <Outlet />
        </section>
      </main>

      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}

      {selectedNotification && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] bg-white border border-outline-variant/10 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/10 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-on-surface">{selectedNotification.title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{selectedNotification.message}</p>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Notification time</p>
                <p className="mt-2 text-sm font-bold text-on-surface">{formatDateTime(selectedNotification.created_at)}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{formatRelativeTime(selectedNotification.created_at)}</p>
              </div>

              {selectedNotification.type === 'admin_promotion' && selectedDetails && (
                <>
                  {(() => {
                    const adminUsername = selectedDetails.adminUsername || selectedDetails.username || '';
                    const adminPassword = selectedDetails.adminPassword || selectedDetails.password || '';
                    return (
                      <>
                  <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">New username</p>
                    <p className="mt-2 text-sm font-black text-on-surface break-all">{adminUsername}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/5 p-4 border border-secondary/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">New password</p>
                    <p className="mt-2 text-sm font-black text-on-surface break-all">{adminPassword}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAdminSwitch((value) => !value);
                      setAdminCredentials({
                        email: adminUsername,
                        password: '',
                      });
                      setAdminSwitchError('');
                    }}
                    className="w-full h-12 rounded-full bg-primary text-on-primary font-black text-xs uppercase tracking-[0.2em]"
                  >
                    Switch To Admin Account
                  </button>
                  {showAdminSwitch && (
                    <form onSubmit={handleSwitchToAdminAccount} className="space-y-4 rounded-2xl border border-outline-variant/10 p-4 bg-surface-container-low">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin Username</label>
                        <input
                          required
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials((prev) => ({ ...prev, email: e.target.value }))}
                          className="mt-2 w-full rounded-full bg-white border border-outline-variant/10 px-5 py-3 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Admin Password</label>
                        <input
                          required
                          type="password"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials((prev) => ({ ...prev, password: e.target.value }))}
                          className="mt-2 w-full rounded-full bg-white border border-outline-variant/10 px-5 py-3 text-sm font-bold"
                        />
                      </div>
                      {adminSwitchError && (
                        <p className="text-xs font-bold text-error">{adminSwitchError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={switchingAdmin}
                        className="w-full h-11 rounded-full bg-primary text-on-primary font-black text-xs uppercase tracking-[0.2em]"
                      >
                        {switchingAdmin ? 'Switching...' : 'Access Admin Page'}
                      </button>
                    </form>
                  )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute;
