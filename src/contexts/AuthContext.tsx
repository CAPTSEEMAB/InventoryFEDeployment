import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      let token = api.getToken();

      if (!token) {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          api.setToken(storedToken);
          token = storedToken;
        }
      }
      
      if (token) {
        try {
          const response = await api.getProfile();
          setUser({ id: response.data.id, email: response.data.email });
        } catch (error) {
          api.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.data.user);
    localStorage.setItem('auth_token', response.data.token);
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await api.signup(email, password, name);
    
    // Type guard to check if response.data has token property
    const hasToken = (data: any): data is { token: string; user: any } => {
      return data && typeof data === 'object' && 'token' in data;
    };
    
    if (hasToken(response.data)) {
      api.setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('auth_token', response.data.token);
      return { success: true, message: 'Signup successful and logged in' };
    }
    
    return { success: true, message: 'Signup successful' };
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
