import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Course } from '../types';
import { DEMO_USERS } from '../data/demoData';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  canManageCourses: boolean;
  canPublishCourses: boolean;
  canManageCourse: (course: Course) => boolean;
  canEnrollLearners: boolean;
  isAdministrator: boolean;
  isCourseAuthor: boolean;
  isLearner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem('ihdp_mock_user_id');
    const found = DEMO_USERS.find((u) => u.id === savedUserId);
    // Default to Learner A so we clearly see My Courses experience first, or author if desired
    return found || DEMO_USERS[3]; // Default to Demo Learner A (Marco Zanetti)
  });

  const switchUser = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('ihdp_mock_user_id', user.id);
      localStorage.setItem('ihdp_mock_role', user.role);
    }
  };

  const switchRole = (role: UserRole) => {
    const user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      switchUser(user.id);
    }
  };

  const isAdministrator = currentUser.role === 'admin';
  const isCourseAuthor = currentUser.role === 'author';
  const isLearner = currentUser.role === 'learner';

  const canManageCourses = isAdministrator || isCourseAuthor;
  const canPublishCourses = isAdministrator || isCourseAuthor;
  const canEnrollLearners = isAdministrator || isCourseAuthor;

  const canManageCourse = (course: Course): boolean => {
    if (isAdministrator) return true;
    if (!isCourseAuthor) return false;

    // 1. Explicit course assignment by ID
    if (currentUser.assignedCourseIds && currentUser.assignedCourseIds.includes(course.id)) {
      return true;
    }
    // 2. Explicit category assignment by Category ID
    if (currentUser.assignedCategoryIds && currentUser.assignedCategoryIds.includes(course.categoryId)) {
      return true;
    }
    // 3. Explicit author assignment by User ID in course.authorUserIds
    if (course.authorUserIds && course.authorUserIds.includes(currentUser.id)) {
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: DEMO_USERS,
        switchUser,
        switchRole,
        canManageCourses,
        canPublishCourses,
        canManageCourse,
        canEnrollLearners,
        isAdministrator,
        isCourseAuthor,
        isLearner
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
