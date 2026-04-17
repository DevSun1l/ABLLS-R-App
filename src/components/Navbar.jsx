import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Library, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <ClipboardList className="h-6 w-6 text-white" />
              ABLLS-R Portal
            </Link>
            
            <div className="hidden md:flex space-x-4 ml-8">
              <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10">Dashboard</Link>
              {user?.role === 'admin' && (
                <Link to="/admin/goals" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 flex items-center gap-1">
                  <Library className="w-4 h-4" /> Goal Library
                </Link>
              )}
              <Link to="/survey" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10">Feedback Survey</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 text-sm bg-black/10 px-3 py-1.5 rounded-full">
              <User className="h-4 w-4 opacity-75" />
              <span className="font-medium">{user?.first_name} {user?.last_name} <span className="opacity-75 relative -top-[1px]">|</span> {user?.role}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
