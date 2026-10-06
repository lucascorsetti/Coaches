import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  canManageCourses: boolean;
  canPublishCourses: boolean;
  canEnroll: boolean;
}

const MOCK_USERS: Record<UserRole, User> = {
  learner: {
    id: 'user-demo-1',
    name: 'Andrea Bernard (Coach Trainee)',
    email: 'andrea.bernard@fisg.it',
    role: 'learner'
  },
  author: {
    id: 'user-author-1',
    name: 'Lucas Corsetti (Head of Coaches)',
    email: 'lucas.corsetti@fisg.it',
    role: 'author'
  },
  admin: {
    id: 'user-admin-1',
    name: 'Federation Admin',
    email: 'admin@fisg.it',
    role: 'admin'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('ihdp_mock_role') as UserRole;
    return (saved && MOCK_USERS[saved]) ? MOCK_USERS[saved] : MOCK_USERS.author;
  });

  const switchRole = (role: UserRole) => {
    const user = MOCK_USERS[role];
    setCurrentUser(user);
    localStorage.setItem('ihdp_mock_role', role);
  };

  const canManageCourses = currentUser.role === 'admin' || currentUser.role === 'author';
  const canPublishCourses = currentUser.role === 'admin' || currentUser.role === 'author';
  const canEnroll = true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        canManageCourses,
        canPublishCourses,
        canEnroll
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
