import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface Profile {
  user_id: string;
  role: 'student' | 'faculty' | 'staff' | 'admin';
  student_id?: string;
  faculty_id?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Placeholder state - will be replaced with real Supabase auth in Phase 2
  const [user] = useState<User | null>({
    id: 'demo-user-123',
    email: 'demo@ewu.edu'
  });
  
  const [profile] = useState<Profile | null>({
    user_id: 'demo-user-123',
    role: 'student',
    student_id: '12345'
  });

  const signOut = async () => {
    // TODO(Supabase): Implement real sign out
    console.log('Sign out called - will be implemented with Supabase');
  };

  return (
    <AuthContext.Provider value={{ user, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};