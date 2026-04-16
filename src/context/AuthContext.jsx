import React, { createContext, useState, useEffect, useContext } from 'react';
import { USERS } from '../data/users';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('ablls_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const foundUser = USERS.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const userData = { email: foundUser.email, role: foundUser.role, name: foundUser.name };
      sessionStorage.setItem('ablls_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('ablls_user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
