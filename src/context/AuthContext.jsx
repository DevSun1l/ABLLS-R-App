import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { USERS as LEGACY_USERS } from '../data/users';
import { AuthContext } from './AuthContextValue';

const LEGACY_SESSION_KEY = 'cognify_legacy_user_id';
const DEBUG_ENDPOINT = 'http://127.0.0.1:7745/ingest/2093a418-4f5e-4810-841e-d97f9aa410f6';

const isInvalidCredentialsError = (error) => {
  const message = (error?.message || '').toLowerCase();
  return error?.code === 'invalid_credentials' || message.includes('invalid login credentials');
};

const isUsersPolicyRecursionError = (error) => error?.code === '42P17';

const normalizeRole = (role) => {
  if (role === 'specialist') return 'therapist';
  return ['admin', 'therapist', 'teacher'].includes(role) ? role : 'therapist';
};

const buildProfileFromSessionUser = (sessionUser) => {
  const email = (sessionUser?.email || '').toLowerCase();
  const mappedLegacyUser = LEGACY_USERS.find((entry) => entry.email.toLowerCase() === email);
  const metadata = sessionUser?.user_metadata || {};
  const inferredFullName = metadata.full_name || metadata.name || '';
  const [firstNameFromMeta = '', ...lastNameFromMetaParts] = inferredFullName.split(' ');
  const fallbackFirstName = firstNameFromMeta || email.split('@')[0] || 'Cognify';
  const fallbackLastName = lastNameFromMetaParts.join(' ') || 'User';
  const mappedRole = normalizeRole(mappedLegacyUser?.role || metadata.role);
  const orgId = metadata.org_id || (mappedRole === 'admin' ? 'org_admin' : 'org_demo');

  return {
    id: sessionUser?.id,
    email,
    first_name: metadata.first_name || fallbackFirstName,
    last_name: metadata.last_name || fallbackLastName,
    role: mappedRole,
    org_id: orgId,
    status: 'active',
    is_session_fallback: true,
  };
};

const buildProfileFromLegacyUser = (legacyUser) => {
  const [firstName = 'Cognify', ...lastNameParts] = (legacyUser.name || legacyUser.email).split(' ');
  return {
    id: `legacy_${legacyUser.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    email: legacyUser.email,
    first_name: firstName,
    last_name: lastNameParts.join(' ') || 'User',
    role: normalizeRole(legacyUser.role),
    org_id: 'org_admin',
    status: 'active',
    is_legacy_fallback: true,
  };
};

const resolveActivityLogUserId = (profile) => {
  const candidateId = (profile?.id || '').trim();
  if (candidateId && !candidateId.startsWith('legacy_') && !profile?.is_session_fallback) {
    return candidateId;
  }
  const email = (profile?.email || '').toLowerCase();
  if (email === 'admin@cognifycareteam.com') return 'usr_admin';
  if (email === 'mnm@cognifycareteam.com') return 'usr_specialist';
  if (profile?.role === 'admin') return 'usr_admin';
  return 'usr_specialist';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipUsersTableQueriesRef = React.useRef(false);
  const usersRecursionLoggedRef = React.useRef(false);

  const fetchUserProfile = async (userId) => {
    if (skipUsersTableQueriesRef.current) {
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (isUsersPolicyRecursionError(error)) {
          skipUsersTableQueriesRef.current = true;
          if (!usersRecursionLoggedRef.current) {
            console.error('Users policy recursion detected during profile fetch by ID. Disabling users-table profile queries for this session.');
            usersRecursionLoggedRef.current = true;
          }
          return null;
        }
        if (error.code === 'PGRST116') {
          console.warn('User profile not found in public.users table for ID:', userId);
          return null;
        }
        console.error('AuthContext: fetchUserProfile Supabase error -', error);
        throw error;
      }
      return data;
    } catch (e) {
      console.error('CRITICAL: Error fetching user profile:', e);
      return null;
    }
  };

  const fetchUserProfileByEmail = async (email) => {
    if (skipUsersTableQueriesRef.current) {
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      if (isUsersPolicyRecursionError(e)) {
        skipUsersTableQueriesRef.current = true;
        if (!usersRecursionLoggedRef.current) {
          console.error('Users policy recursion detected during email fallback. Disabling users-table profile queries for this session.');
          usersRecursionLoggedRef.current = true;
        }
        return null;
      }
      console.error('Error fetching user profile by email:', e);
      return null;
    }
  };

  const persistUser = (profile, isLegacy = false) => {
    setUser(profile);
    // Never auto-restore legacy sessions on app launch.
    // This guarantees startup opens at login/signup unless Supabase has an active auth session.
    localStorage.removeItem(LEGACY_SESSION_KEY);
  };

  const refreshUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // #region agent log
      fetch(DEBUG_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'016185'},body:JSON.stringify({sessionId:'016185',runId:'pre-fix',hypothesisId:'H1',location:'src/context/AuthContext.jsx:91',message:'refreshUser session state',data:{hasSession:Boolean(session?.user),hasLegacyKey:Boolean(localStorage.getItem(LEGACY_SESSION_KEY))},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id) || buildProfileFromSessionUser(session.user);
        persistUser(profile);
        return profile;
      }

      persistUser(null);
      return null;
    } catch (e) {
      console.error('Session refresh failed:', e);
      persistUser(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    const handleAuth = async (session) => {
      if (initialized) return;
      initialized = true;

      try {
        if (session?.user) {
          console.log('AuthContext: Initializing with Supabase session');
          const profile = await fetchUserProfile(session.user.id) || buildProfileFromSessionUser(session.user);
          if (mounted) persistUser(profile);
        } else {
          console.log('AuthContext: No session found');
          if (mounted) setUser(null);
        }
      } catch (e) {
        console.error('AuthContext: Initialization error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: onAuthStateChange event -', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        handleAuth(session);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    // Fallback in case onAuthStateChange doesn't fire INITIAL_SESSION (depends on Supabase version)
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuth(session);
    });

    // Absolute fallback
    const timer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('AuthContext: Initialization timed out');
        setLoading(false);
      }
    }, 4000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const legacyUser = LEGACY_USERS.find(
      (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password
    );

    // #region agent log
    fetch(DEBUG_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'016185'},body:JSON.stringify({sessionId:'016185',runId:'pre-fix',hypothesisId:'H2',location:'src/context/AuthContext.jsx:193',message:'login attempt routing',data:{hasLegacyMatch:Boolean(legacyUser),emailDomain:normalizedEmail.split('@')[1]||'none'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (legacyUser) {
      const profile = buildProfileFromLegacyUser(legacyUser);
      if (profile.status === 'blocked') {
        throw new Error('Your account has been blocked. Please contact helpdesk@cognifycareteam.com for more info.');
      }

      persistUser(profile, true);
      try {
        await supabase.from('activity_logs').insert({
          user_id: resolveActivityLogUserId(profile),
          action: 'login',
          details: { authProvider: 'legacy-bridge' },
        });
      } catch {
        // Non-blocking telemetry insert.
      }
      return profile;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // #region agent log
    fetch(DEBUG_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'016185'},body:JSON.stringify({sessionId:'016185',runId:'pre-fix',hypothesisId:'H3',location:'src/context/AuthContext.jsx:219',message:'supabase signIn result',data:{success:Boolean(data?.user),errorCode:error?.code||null,errorMessage:error?.message||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (error) {
      if (isInvalidCredentialsError(error)) {
        throw new Error('Invalid credentials. Check your email and password, then try again.');
      }
      throw error;
    }

    // Fetch by auth user id only to avoid recursive RLS email fallback loops.
    const profile = await fetchUserProfile(data.user.id) || buildProfileFromSessionUser(data.user);

    if (!profile) {
      await supabase.auth.signOut();
      throw new Error('Your account exists but your profile is missing from the database. Please contact an admin or try signing up again.');
    }
    if (profile.status === 'blocked') {
      await supabase.auth.signOut();
      throw new Error('Your account has been blocked. Please contact helpdesk@cognifycareteam.com for more info.');
    }

    persistUser(profile);
    try {
      await supabase.from('activity_logs').insert({
        user_id: resolveActivityLogUserId(profile),
        action: 'login',
        details: { authProvider: 'supabase' },
      });
    } catch {
      // Non-blocking telemetry insert.
    }
    return profile;
  };

  const signup = async (formData) => {
    const { firstName, lastName, email, password, role, organization } = formData;
    const normalizedEmail = email.trim().toLowerCase();
    const cleanRole = ['therapist', 'teacher'].includes(role) ? role : 'therapist';

    if (!firstName?.trim() || !lastName?.trim() || !normalizedEmail || !password || !organization?.trim()) {
      throw new Error('Please complete all required fields.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Signup failed: Connection interrupted.');

    const orgId = `org_${Math.random().toString(36).substring(2, 10)}`;
    const { error: orgError } = await supabase
      .from('organizations')
      .insert({ id: orgId, name: organization.trim() });

    if (orgError) {
      console.error('Signup Error (Org):', orgError);
      throw new Error('Permission Denied: Could not create organization. Ensure RLS policies are applied.');
    }

    const profilePayload = {
      id: authData.user.id,
      email: normalizedEmail,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: cleanRole,
      org_id: orgId,
      status: 'active',
    };

    const { error: profileError } = await supabase
      .from('users')
      .insert(profilePayload);

    if (profileError) {
      console.error('Signup Error (Profile):', profileError);
      throw new Error(`Permission Denied: Could not create user profile. ${profileError.message}`);
    }

    const profile = profilePayload;

    persistUser(profile);
    try {
      await supabase.from('activity_logs').insert({
        user_id: resolveActivityLogUserId(profile),
        action: 'login',
        details: { authProvider: 'supabase-signup' },
      });
    } catch {
      // Non-blocking telemetry insert.
    }
    return profile;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    persistUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
