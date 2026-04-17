import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('therapist');
  const [organization, setOrganization] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGN IN VIEW ───
  if (!isSignup) {
    return (
      <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary-container">
        <main className="min-h-screen flex flex-col md:flex-row">
          {/* Left Side: Atmospheric Branding */}
          <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-container relative overflow-hidden items-center justify-center p-12">
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-surface-container to-tertiary-container/30"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent"></div>
            </div>
            <div className="relative z-10 max-w-xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
                </div>
                <span className="font-headline text-2xl font-extrabold tracking-tighter text-on-surface">Cognify</span>
              </div>
              <h1 className="font-headline text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.1] mb-6">
                Precision Assessment, <br />
                <span className="text-primary italic">Empowering Growth.</span>
              </h1>
              <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-10 max-w-md">
                Access the intelligent platform for tracking language and functional skills in children with autism. Clinically rigorous and designed for care teams.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-surface-container-lowest/80 backdrop-blur-md rounded-DEFAULT border-none">
                  <span className="material-symbols-outlined text-primary mb-2">psychology</span>
                  <p className="text-sm font-bold text-on-surface">AI-Powered Goals</p>
                  <p className="text-xs text-on-surface-variant">Intelligent intervention planning</p>
                </div>
                <div className="p-6 bg-surface-container-lowest/80 backdrop-blur-md rounded-DEFAULT border-none">
                  <span className="material-symbols-outlined text-primary mb-2">assessment</span>
                  <p className="text-sm font-bold text-on-surface">ABLLS-R Aligned</p>
                  <p className="text-xs text-on-surface-variant">Complete domain coverage</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Side: Login Form */}
          <section className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-surface">
            <div className="w-full max-w-md space-y-8">
              {/* Mobile Branding */}
              <div className="md:hidden flex flex-col items-center mb-12">
                <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">Cognify</h2>
              </div>

              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Secure Sign In</h2>
                <p className="text-on-surface-variant text-sm font-medium">Welcome back. Enter your credentials below.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6 mt-8">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-semibold text-on-surface-variant ml-4 uppercase tracking-wider" htmlFor="login-email">Professional Email</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-5 text-on-surface-variant text-lg">mail</span>
                    <input
                      className="w-full h-14 pl-14 pr-6 bg-surface-container-highest/50 border-none rounded-full focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant font-medium text-on-surface"
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@cognifycare.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-semibold text-on-surface-variant ml-4 uppercase tracking-wider" htmlFor="login-password">Password</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-5 text-on-surface-variant text-lg">lock</span>
                    <input
                      className="w-full h-14 pl-14 pr-14 bg-surface-container-highest/50 border-none rounded-full focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant font-medium text-on-surface"
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                    />
                    <button
                      className="absolute right-5 text-on-surface-variant hover:text-primary transition-colors"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-error-container/20 border border-error/20 rounded-2xl p-4">
                    <span className="material-symbols-outlined text-error text-lg">error</span>
                    <p className="text-sm font-medium text-on-error-container">{error}</p>
                  </div>
                )}

                {/* Primary Action */}
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full h-14 bg-primary text-on-primary rounded-full font-headline font-bold text-base hover:bg-primary-dim hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Secure Sign In
                      <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Signup */}
              <div className="pt-8 text-center border-t border-surface-container-high">
                <p className="text-sm text-on-surface-variant font-medium">
                  Don't have an account?
                  <button onClick={() => { setIsSignup(true); setError(''); }} className="text-primary font-bold hover:underline underline-offset-4 ml-2 transition-all">
                    Create Account
                  </button>
                </p>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="mt-auto pt-12 flex flex-col items-center gap-4 opacity-60">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">shield_person</span>
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">security</span>
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">policy</span>
              </div>
              <p className="text-[10px] font-label tracking-widest text-on-surface-variant uppercase text-center px-4">
                All sessions are encrypted and securely logged. Your data is always protected.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-surface-container-low w-full rounded-t-lg">
          <div className="flex items-center justify-center px-12 py-10 w-full">
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-bold text-on-background font-headline tracking-tighter">Cognify</span>
              <p className="text-xs font-medium tracking-wide text-on-surface-variant">© 2026 Cognify Care. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ─── SIGN UP VIEW ───
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary-container">
      {/* Top Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-full items-center justify-between px-8 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
              </div>
              <span className="text-xl font-bold tracking-tighter text-on-surface font-headline">Cognify</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setIsSignup(false); setError(''); }} className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-semibold tracking-tight active:scale-95 transition-all duration-200 hover:bg-primary-dim">Log In</button>
          </div>
        </div>
        <div className="bg-surface-container-low h-[1px] w-full"></div>
      </nav>

      <main className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Features & Quote */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h1 className="font-headline text-5xl font-extrabold text-on-surface leading-[1.1] tracking-tighter">
                Empower Every <span className="text-primary italic">Milestone.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-md">
                Join the platform designed for therapists and educators setting new standards in behavioral assessment and progress tracking.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-surface-container-low p-6 rounded-DEFAULT border border-outline-variant/15 flex items-start gap-4">
                <div className="bg-primary-container text-on-primary-container p-3 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">clinical_notes</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface">ABLLS-R Assessment Engine</h3>
                  <p className="text-sm text-on-surface-variant">Complete domain-by-domain skill tracking with gateway logic built in.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-DEFAULT border border-outline-variant/15 flex items-start gap-4">
                <div className="bg-tertiary-container text-on-tertiary-container p-3 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface">Collaborative Portals</h3>
                  <p className="text-sm text-on-surface-variant">Secure multi-role access for therapists, teachers, and administrators.</p>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="relative bg-primary text-on-primary p-8 rounded-lg overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <span className="material-symbols-outlined text-[120px]">format_quote</span>
              </div>
              <p className="text-lg font-medium relative z-10 italic leading-relaxed">
                "Every child deserves a roadmap built on real data, not assumptions. When we measure growth accurately, we unlock the potential to change lives."
              </p>
            </div>
          </div>

          {/* Right Side: Sign Up Form */}
          <div className="lg:col-span-7 bg-surface-container-low p-8 md:p-12 rounded-lg shadow-sm border border-outline-variant/10">
            <div className="max-w-md mx-auto">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Create your account</h2>
              <p className="text-on-surface-variant mb-10">Start assessing and tracking progress today.</p>

              <form onSubmit={handleSignup} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-on-surface ml-4">Select your primary role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <input type="radio" name="role" value="therapist" checked={role === 'therapist'} onChange={() => setRole('therapist')} className="hidden peer" />
                      <div className="flex items-center justify-center p-4 rounded-full border border-outline-variant bg-surface-container-lowest peer-checked:bg-primary-container peer-checked:border-primary peer-checked:text-on-primary-container transition-all font-medium">
                        Therapist
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} className="hidden peer" />
                      <div className="flex items-center justify-center p-4 rounded-full border border-outline-variant bg-surface-container-lowest peer-checked:bg-primary-container peer-checked:border-primary peer-checked:text-on-primary-container transition-all font-medium">
                        Teacher
                      </div>
                    </label>
                  </div>
                </div>

                {/* Name Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface ml-4">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 text-on-surface"
                      placeholder="Sarah"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface ml-4">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 text-on-surface"
                      placeholder="Jenkins"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface ml-4">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 text-on-surface"
                    placeholder="sarah@clinic-org.com"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface ml-4">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      minLength="8"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 text-on-surface"
                      placeholder="••••••••"
                    />
                    <button
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      <span className="material-symbols-outlined">{showSignupPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface ml-4">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength="8"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 text-on-surface"
                    placeholder="••••••••"
                  />
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface ml-4">Organization</label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 text-on-surface"
                    placeholder="e.g. Cognify Care Center"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-error-container/20 border border-error/20 rounded-2xl p-4">
                    <span className="material-symbols-outlined text-error text-lg">error</span>
                    <p className="text-sm font-medium text-on-error-container">{error}</p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-primary text-on-primary py-5 rounded-full font-headline font-bold text-lg hover:bg-primary-dim shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-on-surface-variant px-4">
                  By creating an account, you agree to our data handling and usage protocols.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full rounded-t-DEFAULT mt-12">
        <div className="flex items-center justify-center px-12 py-10 w-full mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-bold text-on-background font-headline">Cognify</span>
            <p className="text-xs font-medium tracking-wide text-on-surface-variant">
              © 2026 Cognify Care. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
