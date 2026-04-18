import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: 'dashboard', tab: 'overview', path: '/admin' },
    { title: 'User Access', icon: 'groups', tab: 'users', path: '/admin' },
    { title: 'Goal Library', icon: 'library_books', tab: 'goals', path: '/admin/goals' },
    { title: 'Recent Activity', icon: 'history', tab: 'activity', path: '/admin' },
    { title: 'Feedback Portal', icon: 'forum', tab: 'feedback', path: '/admin' },
    { title: 'Data & Backups', icon: 'analytics', tab: 'data', path: '/admin' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const handleNav = (item) => {
    if (item.path === location.pathname && setActiveTab) {
      setActiveTab(item.tab);
    } else {
      navigate(item.path, { state: { tab: item.tab } });
    }
  };

  const isItemActive = (item) => {
    if (item.path === '/admin/goals' && location.pathname === '/admin/goals') return true;
    if (item.path === '/admin' && location.pathname === '/admin') {
      return activeTab === item.tab || (!activeTab && item.tab === 'overview');
    }
    return false;
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-container font-body">
      {/* TopNavBar - full width, no sidebar offset */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fdf7fe]/80 backdrop-blur-md flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-6">
          <span 
            className="text-2xl font-black text-primary tracking-tighter font-headline cursor-pointer"
            onClick={() => { if (setActiveTab) setActiveTab('overview'); navigate('/admin'); }}
          >
            Cognify
          </span>
          
          <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
          
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-black ring-2 ring-primary-container shadow-sm">
                {user?.first_name?.[0]}
             </div>
             <div className="hidden sm:block leading-none">
                <p className="text-sm font-bold text-on-surface">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black opacity-60">{user?.role} Access</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">
            Internal Access Node 01
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-16 bg-[#f8f1fa] flex flex-col py-6 z-40 border-r border-outline-variant/10">
        <div className="px-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">clinical_notes</span>
            </div>
            <div>
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">Node v2.1</h2>
              <p className="text-lg font-black text-on-surface leading-none font-headline">ADMIN PORTAL</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pt-8">
          {menuItems.map((item) => {
            const active = isItemActive(item);
            return (
              <button
                key={item.title}
                onClick={() => handleNav(item)}
                className={`w-[calc(100%-2rem)] mx-4 py-3 px-6 rounded-full flex items-center gap-4 group transition-all text-left ${
                  active 
                    ? 'bg-white text-primary shadow-sm border border-primary/5' 
                    : 'text-on-surface-variant hover:bg-white/50'
                }`}
              >
                <span className={`material-symbols-outlined ${active ? 'text-primary' : 'group-hover:text-primary'} transition-colors`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.title}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="px-4 pb-14 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all duration-300 font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-full transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content - offset by sidebar width and header height */}
      <main className="ml-64 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
