import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';
import { clearAllResumes } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const email = localStorage.getItem('adminEmail');
    const token = localStorage.getItem('adminToken');
    return token && email ? { email, token } : null;
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName') || '';
    const id = localStorage.getItem('userId') || '';
    return token && email ? { id, email, name, token } : null;
  });

  const adminLogin = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminEmail', data.email);
    setAdmin({ email: data.email, token: data.token });
    return data;
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    setAdmin(null);
  }, []);

  const sendOtp = useCallback(async (email) => {
    const { data } = await api.post('/auth/user/send-otp', { email });
    return data;
  }, []);

  const signup = useCallback(async ({ email, otp, password, name }) => {
    const { data } = await api.post('/auth/user/signup', { email, otp, password, name });
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('userName', data.user.name || '');
    localStorage.setItem('userId', data.user.id || '');
    setUser({ id: data.user.id, email: data.user.email, name: data.user.name || '', token: data.token });
    return data;
  }, []);

  const userLogin = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/user/login', { email, password });
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('userName', data.user.name || '');
    localStorage.setItem('userId', data.user.id || '');
    setUser({ id: data.user.id, email: data.user.email, name: data.user.name || '', token: data.token });
    return data;
  }, []);

  const userLogout = useCallback(async () => {
    try {
      await api.post('/auth/user/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    // Clear any session-level cached data so a new user never sees a prior user's state
    sessionStorage.clear();
    // Wipe all saved resumes from IndexedDB to enforce absolute privacy
    clearAllResumes();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        user,
        isAdmin: Boolean(admin),
        isLoggedIn: Boolean(user),
        login: adminLogin,
        logout: adminLogout,
        sendOtp,
        signup,
        userLogin,
        userLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
