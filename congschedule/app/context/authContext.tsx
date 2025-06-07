// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  first_name: string;
  last_name: string;
  access_token:string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loadUserFromStorage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('access_token');
  };

  const loadUserFromStorage = async () => {
    const stored = await AsyncStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loadUserFromStorage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
export default AuthContext;