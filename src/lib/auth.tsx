import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { mockUsers, MockProfile } from '@/data/mockData';

interface MockUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: MockUser | null;
  profile: MockProfile | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const loading = false;

  const signUp = useCallback(async (email: string, _password: string, fullName: string) => {
    // Simulate signup — just log them in as user-1
    const mockProfile = { ...mockUsers[0], email, full_name: fullName };
    setUser({ id: mockProfile.id, email });
    setProfile(mockProfile);
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Find user by email or default to user-1
    const found = mockUsers.find(u => u.email === email) || mockUsers[0];
    setUser({ id: found.id, email: found.email });
    setProfile(found);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, signUp, signIn, signOut, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
