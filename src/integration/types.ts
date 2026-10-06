/**
 * IHDP Courses - Platform Integration Types
 * Defines the contract between the host IHDP platform and the Courses engine.
 */

import { UserRole, Course, Category, Enrollment } from '../types';

export interface IHDPUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clubId?: string;
  federationId?: string;
  assignedCategoryIds?: string[];
  assignedCourseIds?: string[];
}

export interface CoursesPermissions {
  /** Can view catalog of assigned/enrolled courses */
  canViewCourses: boolean;
  /** Can manage course authoring workspace */
  canManageCourses: boolean;
  /** Can publish courses to certified status */
  canPublishCourses: boolean;
  /** Can enroll, suspend, or revoke learner access */
  canManageEnrollments: boolean;
  /** Can view learner progress drilldowns and evaluation scores */
  canViewLearnerProgress: boolean;
  /** Can create new courses */
  canCreateCourse: boolean;
  /** Can manage a specific category */
  canManageCategory: (categoryId: string) => boolean;
  /** Can manage a specific course */
  canManageCourse: (course: Course) => boolean;
}

export interface IHDPApplication {
  id: string;
  name: string;
  nameIt?: string;
  description: string;
  iconName: string;
  path: string;
  active: boolean;
  isCurrent: boolean;
  category: 'education' | 'performance' | 'operations';
}

export interface RegistrationResolutionResult {
  success: boolean;
  courseCode: string;
  course?: Course | null;
  enrollment?: Enrollment | null;
  error?: string;
}
