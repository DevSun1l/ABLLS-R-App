import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('therapist');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError("Validation Error: Passwords do not match");
    }

    setLoading(true);
    try {
      const authUser = await signup({ firstName, lastName, email, password, role, organization });
      if (authUser.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary-container">
      <main className="min-h-screen flex flex-col lg:flex-row">
        
        {/* Left Side: Atmospheric Clinical Branding */}
        <section className="hidden lg:flex lg:w-1/2 bg-surface-container relative overflow-hidden items-center justify-center p-16">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-gradient-to-br from-primary/15 via-surface-container to-tertiary-container/20"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-tertiary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <div className="mb-12 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
              </div>
              <span className="font-headline text-3xl font-black tracking-tighter text-on-surface">Cognify</span>
            </div>
            
            <h1 className="font-headline text-6xl font-black tracking-tight text-on-surface leading-tight mb-8">
              Empower Every <br />
              <span className="text-primary italic transition-all duration-700 hover:tracking-normal">Milestone.</span>
            </h1>
            
            <p className="text-xl text-on-surface-variant font-medium leading-relaxed mb-12 opacity-80">
              The intelligent sanctuary for precision assessment and behavioral growth. Aligned with clinical rigor, designed for care teams.
            </p>

            <div className="space-y-6">
               <div className="bg-surface-container-lowest/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <span className="material-symbols-outlined text-6xl">format_quote</span>
                  </div>
                  <p className="text-lg font-medium text-on-surface leading-relaxed italic relative z-10">
                    "Every child deserves a roadmap built on real data, not assumptions. When we measure growth accurately, we unlock the potential to change lives."
                  </p>
               </div>

               <div className="flex items-center gap-8 px-4 opacity-40">
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">shield_person</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">Secure Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">verified_user</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">Clinical Protocol</span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Right Side: Authentication Forms */}
        <section className="flex-1 flex flex-col justify-center items-center px-8 py-16 bg-white relative">
          <div className="w-full max-w-md space-y-10">
            
            {/* Mobile Branding */}
            <div className="lg:hidden flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
              </div>
              <h2 className="font-headline text-3xl font-black text-on-surface tracking-tighter">Cognify</h2>
            </div>

            <div className="space-y-3">
              <h2 className="font-headline text-4xl font-black tracking-tight text-on-surface">
                {isSignup ? 'Create Account' : 'Welcome Portal'}
              </h2>
              <p className="text-on-surface-variant font-medium opacity-70">
                {isSignup ? 'Join the clinical sanctuary for progress tracking.' : 'Securely access your specialist dashboard.'}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-error/5 border border-error/10 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                <span className="material-symbols-outlined text-error text-xl">warning</span>
                <p className="text-sm font-bold text-error leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
              {isSignup && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">First Name</label>
                    <input 
                      required
                      className="w-full bg-surface-container-low/50 border-none rounded-full h-14 px-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                      value={firstName} onChange={e => setFirstName(e.target.value)}
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Last Name</label>
                    <input 
                      required
                      className="w-full bg-surface-container-low/50 border-none rounded-full h-14 px-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                      value={lastName} onChange={e => setLastName(e.target.value)}
                      placeholder="Specialist"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 animate-in fade-in duration-500 delay-100">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Professional Email</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-6 text-primary/40">mail</span>
                  <input 
                    required type="email"
                    className="w-full bg-surface-container-low/50 border-none rounded-full h-14 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="specialist@cognify.care"
                  />
                </div>
              </div>

              {isSignup && (
                <div className="space-y-1.5 animate-in fade-in duration-500 delay-150">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Organization</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-6 text-primary/40">corporate_fare</span>
                    <input 
                      required
                      className="w-full bg-surface-container-low/50 border-none rounded-full h-14 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                      value={organization} onChange={e => setOrganization(e.target.value)}
                      placeholder="e.g. Hope Academy"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 animate-in fade-in duration-500 delay-200">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Security Protocol (Password)</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-6 text-primary/40">lock</span>
                  <input 
                    required type={showPassword ? 'text' : 'password'}
                    className="w-full bg-surface-container-low/50 border-none rounded-full h-14 pl-14 pr-14 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 text-primary/40 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {isSignup && (
                <div className="space-y-1.5 animate-in fade-in duration-500 delay-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Confirm Identity</label>
                  <input 
                    required type="password"
                    className="w-full bg-surface-container-low/50 border-none rounded-full h-14 px-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Verify password"
                  />
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full h-16 bg-primary text-on-primary rounded-full font-headline font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary-dim active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <>
                    {isSignup ? 'Establish Account' : 'Authenticate Identity'}
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-8 text-center">
              <p className="text-sm font-medium text-on-surface-variant opacity-60">
                {isSignup ? 'Already have credentials?' : 'Need to establish node access?'}
                <button 
                  onClick={() => setIsSignup(!isSignup)}
                  className="ml-2 text-primary font-black hover:underline underline-offset-4"
                >
                  {isSignup ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center gap-4 opacity-30 pb-8">
             <div className="flex gap-8">
                <span className="material-symbols-outlined text-4xl">shield</span>
                <span className="material-symbols-outlined text-4xl">verified</span>
                <span className="material-symbols-outlined text-4xl">lock</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center">Secure Clinical Environment • Cognify Node v2.0</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
