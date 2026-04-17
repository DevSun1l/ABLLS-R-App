import React from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="bg-background text-on-surface min-h-screen flex font-body">
      <aside className="h-screen w-72 flex-col fixed left-0 top-0 border-r border-primary/10 bg-[#f8f1fa] z-40 hidden md:flex py-8 space-y-2">
        <div className="px-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary">clinical_notes</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#34313a] font-headline">Cognify</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Therapist Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-grow">
          <button onClick={() => navigate('/dashboard')} className={`${location.pathname === '/dashboard' || location.pathname === '/' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#34313a]/70 hover:bg-white/50'} w-[calc(100%-1rem)] text-left rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label">Overview</span>
          </button>
          <button onClick={() => navigate('/student/new')} className={`${location.pathname.includes('/student/') ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#34313a]/70 hover:bg-white/50'} w-[calc(100%-1rem)] text-left rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all`}>
            <span className="material-symbols-outlined">person_add</span>
            <span className="font-label">Add Student</span>
          </button>
          <button onClick={() => navigate('/survey')} className={`${location.pathname.includes('/survey') ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#34313a]/70 hover:bg-white/50'} w-[calc(100%-1rem)] text-left rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all`}>
            <span className="material-symbols-outlined">assignment</span>
            <span className="font-label">Feedback Survey</span>
          </button>
        </nav>
        <div className="mt-auto px-2 space-y-1">
          <button onClick={logout} className="w-full text-left font-bold text-[#34313a]/70 px-4 py-3 my-1 flex items-center gap-3 hover:bg-white/50 rounded-full transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-[#fdf7fe]/80 backdrop-blur-lg fixed top-0 right-0 left-0 md:left-72 z-50 shadow-sm shadow-purple-500/5 px-6 py-3 flex justify-between items-center h-[68px]">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
             {/* Search or utility bar could go here */}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-on-surface-variant capitalize">{user?.role} Access</p>
              </div>
              <div className="w-10 h-10 rounded-full object-cover border-2 border-primary-container bg-primary text-white flex items-center justify-center font-bold">
                 {user?.first_name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        <section className="pt-24 pb-12 px-6 md:px-10 max-w-7xl mx-auto w-full flex-1">
           <Outlet />
        </section>
      </main>
    </div>
  );
};

export default ProtectedRoute;
