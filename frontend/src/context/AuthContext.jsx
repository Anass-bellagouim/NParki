import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nparki_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nparki_token'));
  const [booting, setBooting] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        const currentUser = data.data || data.user || data;
        setUser(currentUser);
        localStorage.setItem('nparki_user', JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem('nparki_token');
        localStorage.removeItem('nparki_user');
        setToken(null);
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, [token]);

  const persistSession = (payload) => {
    localStorage.setItem('nparki_token', payload.token);
    localStorage.setItem('nparki_user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    persistSession(data);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persistSession(data);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('nparki_token');
      localStorage.removeItem('nparki_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem('nparki_user', JSON.stringify(nextUser));
  };

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, booting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
