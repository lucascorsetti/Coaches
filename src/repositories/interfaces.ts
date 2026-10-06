import { 
  Course, 
  Module, 
  LearningItem, 
  ContentBlock, 
  Category, 
  Assessment, 
  Attempt, 
  Progress, 
  Submission,
  Enrollment,
  EnrollmentStatus,
  CourseProgressSummary,
  User
} from '../types';

export interface ICourseRepository {
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | null>;
  saveCourse(course: Course): Promise<Course>;
  deleteCourse(id: string): Promise<boolean>;

  getModulesByCourseId(courseId: string): Promise<Module[]>;
  saveModule(module: Module): Promise<Module>;
  deleteModule(id: string): Promise<boolean>;
  reorderModules(courseId: string, orderedModuleIds: string[]): Promise<void>;

  getItemsByModuleId(moduleId: string): Promise<LearningItem[]>;
  getItemById(id: string): Promise<LearningItem | null>;
  saveItem(item: LearningItem): Promise<LearningItem>;
  deleteItem(id: string): Promise<boolean>;
  reorderItems(moduleId: string, orderedItemIds: string[]): Promise<void>;

  getBlocksByItemId(learningItemId: string): Promise<ContentBlock[]>;
  saveBlock(block: ContentBlock): Promise<ContentBlock>;
  deleteBlock(id: string): Promise<boolean>;
  reorderBlocks(learningItemId: string, orderedBlockIds: string[]): Promise<void>;
}

export interface ICategoryRepository {
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  saveCategory(category: Category): Promise<Category>;
}

export interface IEnrollmentRepository {
  getEnrollmentsByUser(userId: string): Promise<Enrollment[]>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | null>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  getAllEnrollments(): Promise<Enrollment[]>;
  createEnrollment(enrollment: Omit<Enrollment, 'id' | 'enrolledAt'> & Partial<Pick<Enrollment, 'id' | 'enrolledAt'>>): Promise<Enrollment>;
  updateEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<Enrollment>;
  deleteEnrollment(id: string): Promise<boolean>;
  checkUserAccess(userId: string, courseId: string): Promise<boolean>;
}

export interface IAssessmentRepository {
  getAssessmentById(id: string): Promise<Assessment | null>;
  saveAssessment(assessment: Assessment): Promise<Assessment>;
  getAttempts(userId: string, assessmentId: string): Promise<Attempt[]>;
  saveAttempt(attempt: Attempt): Promise<Attempt>;
}

export interface IProgressRepository {
  getUserProgress(userId: string, courseId: string, enrollmentId?: string): Promise<Progress[]>;
  setItemProgress(progress: Progress): Promise<Progress>;
  resetCourseProgress(userId: string, courseId: string): Promise<void>;
  getCourseSummary(userId: string, courseId: string): Promise<CourseProgressSummary | null>;
}

export interface ISubmissionRepository {
  getSubmissions(userId: string, activityId: string): Promise<Submission[]>;
  saveSubmission(submission: Submission): Promise<Submission>;
}

export interface IUserRepository {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
}
