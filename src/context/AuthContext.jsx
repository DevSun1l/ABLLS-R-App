import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('ablls_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            sessionStorage.removeItem('ablls_token');
          }
        } catch(e) {
          console.error("Auth verification failed", e);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
         sessionStorage.setItem('ablls_token', data.token);
         setUser(data.user);
         return data.user;
      }
      throw new Error(data.error || 'Login failed');
    } catch(e) {
      throw e;
    }
  };

  const signup = async (formData) => {
     try {
       const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
       });
       const data = await res.json();
       if (res.ok) {
          sessionStorage.setItem('ablls_token', data.token);
          setUser(data.user);
          return data.user;
       }
       throw new Error(data.error || 'Signup failed');
     } catch(e) {
       throw e;
     }
  }

  const logout = () => {
    sessionStorage.removeItem('ablls_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
