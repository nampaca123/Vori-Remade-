'use client';
import { createContext, useContext, useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  joinDate: string;
  github: string;
}

interface UserContextType {
  userProfile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  signOut: () => void;
}

const defaultProfile = {
  name: 'KyoungIn Nam',
  email: 'namast123@kookmin.ac.kr',
  phone: '9497387650',
  location: 'San Francisco, CA',
  role: 'Senior Developer',
  joinDate: 'March 2023',
  github: 'nampaca123'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (data: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const signOut = () => {
    // Add your sign out logic here
    console.log('User signed out');
    // Redirect to login page or handle sign out as needed
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider value={{ userProfile, updateProfile, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 