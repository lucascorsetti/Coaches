/**
 * User & Permission Adapter
 * Translates host user identity and roles into domain capability permissions.
 */

import { User, Course } from '../types';
import { CoursesPermissions, IHDPUser } from './types';

export class UserAdapter {
  /**
   * Derives fine-grained Courses capability permissions from any IHDP User object
   */
  static getPermissions(user: User | IHDPUser | null): CoursesPermissions {
    if (!user) {
      return {
        canViewCourses: false,
        canManageCourses: false,
        canPublishCourses: false,
        canManageEnrollments: false,
        canViewLearnerProgress: false,
        canCreateCourse: false,
        canManageCategory: () => false,
        canManageCourse: () => false
      };
    }

    const isAdmin = user.role === 'admin';
    const isAuthor = user.role === 'author';
    const isLearner = user.role === 'learner';

    const assignedCats = new Set(user.assignedCategoryIds || []);
    const assignedCourses = new Set(user.assignedCourseIds || []);

    const canManageCategory = (categoryId: string): boolean => {
      if (isAdmin) return true;
      if (!isAuthor) return false;
      return assignedCats.size === 0 || assignedCats.has(categoryId);
    };

    const canManageCourse = (course: Course): boolean => {
      if (isAdmin) return true;
      if (!isAuthor) return false;

      // Check author ID association
      if (course.authorUserIds && course.authorUserIds.includes(user.id)) {
        return true;
      }
      // Check assigned course explicit permission
      if (assignedCourses.has(course.id)) {
        return true;
      }
      // Check category jurisdiction
      if (assignedCats.size > 0 && assignedCats.has(course.categoryId)) {
        return true;
      }
      // If author has no category filter, they can author within general courses
      if (assignedCats.size === 0 && assignedCourses.size === 0) {
        return true;
      }

      return false;
    };

    return {
      canViewCourses: true, // Everyone can view their permitted/enrolled courses
      canManageCourses: isAdmin || isAuthor,
      canPublishCourses: isAdmin || isAuthor,
      canManageEnrollments: isAdmin || isAuthor,
      canViewLearnerProgress: isAdmin || isAuthor,
      canCreateCourse: isAdmin || isAuthor,
      canManageCategory,
      canManageCourse
    };
  }
}
