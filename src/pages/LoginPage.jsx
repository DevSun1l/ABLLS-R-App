import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardList } from 'lucide-react';

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('therapist');
  const [organization, setOrganization] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const authUser = await login(email, password);
      if (authUser.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch(err) {
      setError(err.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
       return setError("Passwords do not match");
    }
    
    setLoading(true);
    try {
      const authUser = await signup({ firstName, lastName, email, password, role, organization });
      if (authUser.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch(err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-border bg-white rounded-2xl">
        <div className="bg-gradient-to-br from-primary to-[#635BCE] px-8 py-10 flex flex-col items-center text-white relative">
           <ClipboardList className="w-12 h-12 mb-4 text-white" />
           <h1 className="text-3xl font-bold tracking-tight mb-2 text-center text-white">Cognify Assessment</h1>
           <p className="text-white/80 font-medium text-md">Intelligent ABLLS-R Portal</p>
        </div>
        
        <div className="p-8 bg-white">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
             <button onClick={() => { setIsSignup(false); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isSignup ? 'bg-white shadow-sm text-primary' : 'text-textSecondary hover:text-textPrimary'}`}>Sign In</button>
             <button onClick={() => { setIsSignup(true); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isSignup ? 'bg-white shadow-sm text-primary' : 'text-textSecondary hover:text-textPrimary'}`}>Create Account</button>
          </div>

          {!isSignup ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-1.5">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-1.5">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
              {error && <p className="text-danger text-sm font-medium bg-danger/10 p-3 rounded-md">{error}</p>}
              <button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary/90 disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-md mt-4">
                {loading ? 'Authenticating...' : 'Sign in to Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-textSecondary mb-1.5">First Name</label>
                   <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-textSecondary mb-1.5">Last Name</label>
                   <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-1.5">Professional Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-textSecondary mb-1.5">Password</label>
                   <input type="password" minLength="8" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-textSecondary mb-1.5">Confirm Password</label>
                   <input type="password" minLength="8" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1.5">Institution / Organization Name</label>
                 <input type="text" placeholder="e.g. Cognify Care Center" required value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-1.5">My Role</label>
                <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white cursor-pointer">
                   <option value="therapist">BCBA / Speech Therapist</option>
                   <option value="teacher">Special Education Teacher</option>
                </select>
              </div>
              {error && <p className="text-danger text-sm font-medium bg-danger/10 p-3 rounded-md">{error}</p>}
              <button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary/90 disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-md mt-4">
                {loading ? 'Registering...' : 'Create Professional Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
