import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import FeedbackModal from './FeedbackModal';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard', path: '/dashboard' },
    { id: 'caseload', label: 'Caseload', icon: 'group', path: '/dashboard' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', path: '/analytics' },
  ];

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
            <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-4 rounded-full text-[#cac4d0] hover:bg-error/10 hover:text-error transition-all duration-300">
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
    </div>
  );
};

export default ProtectedRoute;
