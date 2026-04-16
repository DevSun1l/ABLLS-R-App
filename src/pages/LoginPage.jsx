import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardList } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Incorrect email or password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-border bg-white rounded-2xl">
        <div className="bg-gradient-to-br from-primary to-[#635BCE] px-8 py-10 flex flex-col items-center text-white">
           <ClipboardList className="w-12 h-12 mb-4 text-white" />
           <h1 className="text-2xl font-bold tracking-tight mb-2 text-center text-white">ABLLS-R Assessment Portal</h1>
           <p className="text-white/80 font-medium text-sm">Specialist & Admin Access</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6 bg-white">
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          
          {error && <p className="text-danger text-sm font-medium">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg transition-all hover:shadow-lg active:scale-[0.98] mt-2"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
