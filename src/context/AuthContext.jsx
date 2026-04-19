import { createContext, useEffect, useState } from 'react';

const AuthContext = createContext();

function readStoredAuth() {
  const emptyAuth = { user: null, token: null };

  if (typeof window === 'undefined') {
    return emptyAuth;
  }

  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!storedToken || !storedUser) {
    return emptyAuth;
  }

  try {
    return {
      user: JSON.parse(storedUser),
      token: storedToken,
    };
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return emptyAuth;
  }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setAuthState] = useState(readStoredAuth);

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState(readStoredAuth());
    };

    window.addEventListener('auth:changed', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('auth:changed', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const login = (userData, userToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setAuthState({ user: userData, token: userToken });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthState({ user: null, token: null });
  };

  const isAuthenticated = !!token;
  const isAdmin =
    (typeof user?.role === 'string' && user.role.toLowerCase() === 'admin') ||
    user?.is_admin === true ||
    user?.is_admin === 1 ||
    user?.role_id === 1 ||
    (Array.isArray(user?.roles) && user.roles.some(r =>
      (typeof r === 'string' && r.toLowerCase() === 'admin') ||
      (r?.name && r.name.toLowerCase() === 'admin')
    ));

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
