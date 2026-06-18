import React, { createContext, useState, useEffect, useContext } from 'react';

export interface UserSession {
  token: string;
  email: string;
  name: string;
  role: string;
  userId: number;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (sessionData: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('uems_session');
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('uems_session');
      }
    }
  }, []);

  const login = (sessionData: UserSession) => {
    localStorage.setItem('uems_session', JSON.stringify(sessionData));
    setUser(sessionData);
  };

  const logout = () => {
    localStorage.removeItem('uems_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
