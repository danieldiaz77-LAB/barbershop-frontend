import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('elpipe_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('elpipe_user', JSON.stringify(user));
    else localStorage.removeItem('elpipe_user');
  }, [user]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('elpipe_token', data.token);
    setUser({
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      emailVerified: data.emailVerified,
    });
    return data;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    localStorage.setItem('elpipe_token', data.token);
    setUser({
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      emailVerified: data.emailVerified,
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('elpipe_token');
    localStorage.removeItem('elpipe_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
