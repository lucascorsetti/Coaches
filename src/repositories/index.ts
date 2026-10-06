import { LocalStorageCourseRepository } from './localStorage/courseRepository';
import { LocalStorageCategoryRepository } from './localStorage/categoryRepository';
import { LocalStorageAssessmentRepository } from './localStorage/assessmentRepository';
import { LocalStorageProgressRepository } from './localStorage/progressRepository';
import { LocalStorageSubmissionRepository } from './localStorage/submissionRepository';
import {
  ICourseRepository,
  ICategoryRepository,
  IAssessmentRepository,
  IProgressRepository,
  ISubmissionRepository
} from './interfaces';

// Export instantiated repositories.
// When migrating to the existing IHDP Supabase backend, swap these exports
// with SupabaseCourseRepository, SupabaseProgressRepository, etc.
export const courseRepository: ICourseRepository = new LocalStorageCourseRepository();
export const categoryRepository: ICategoryRepository = new LocalStorageCategoryRepository();
export const assessmentRepository: IAssessmentRepository = new LocalStorageAssessmentRepository();
export const progressRepository: IProgressRepository = new LocalStorageProgressRepository();
export const submissionRepository: ISubmissionRepository = new LocalStorageSubmissionRepository();

export * from './interfaces';
