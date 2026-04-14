import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Mock state since no API layout yet
  const [user, setUser] = useState(null); 
  // Example user object: { id: 1, name: 'Alice', role: 'admin' }

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
