// IHDP Courses Engine - Complete Domain Types & Access Control Models

export type UserRole = 'admin' | 'author' | 'learner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  // Category & course permissions for Authors (clean IDs, no loose string matching)
  assignedCategoryIds?: string[]; // e.g. ['cat-coaching']
  assignedCourseIds?: string[];   // e.g. ['course-demo-101']
}

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseAccessPolicy = 'private' | 'restricted' | 'open';

export interface CourseCompletionRules {
  requireAllLessons: boolean;
  requireAllAssessmentsPassed: boolean;
  minimumPassingScore?: number;
  requiredItemIds?: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameIt?: string;
  description: string;
  order: number;
  icon?: string;
  color?: string;
}

export interface Course {
  id: string;
  /** Unique internal course/product code for future external registration/payment matching (e.g. '10001') */
  courseCode: string;
  title: string;
  shortTitle?: string;
  categoryId: string;
  level: string; // e.g. 'Maestro di Base', 'Level 1', 'Beginner'
  description: string;
  thumbnail?: string;
  estimatedDuration: string;
  status: CourseStatus;
  accessPolicy?: CourseAccessPolicy; // default 'private' (enrollment required)
  completionRules?: CourseCompletionRules;
  authors: string[];
  authorUserIds?: string[]; // Stable user IDs of authorized authors
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ModuleCompletionRules {
  required: boolean;
  minimumScore?: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  completionRules?: ModuleCompletionRules;
}

export type LearningItemType = 'lesson' | 'video' | 'reading' | 'assessment' | 'assignment';

export interface LearningItem {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: LearningItemType;
  order: number;
  estimatedDuration?: string;
  completionRules?: {
    required: boolean;
  };
}

export type ContentBlockType = 
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'document'
  | 'callout'
  | 'question'
  | 'scenario'
  | 'assessment'
  | 'assignment';

// Discriminated Unions for Content Block Data
export interface HeadingBlockData {
  text: string;
  subtitle?: string;
  level?: number;
}

export interface TextBlockData {
  content: string;
}

export interface ImageBlockData {
  url: string;
  caption?: string;
  alt?: string;
}

export interface VideoBlockData {
  title: string;
  sourceUrl: string;
  durationMinutes?: number;
  thumbnail?: string;
}

export interface DocumentBlockData {
  title: string;
  fileUrl: string;
  fileSize?: string;
  format?: string;
}

export interface CalloutBlockData {
  style: 'info' | 'warning' | 'tip' | 'rule' | 'success';
  title: string;
  text: string;
}

export interface QuestionBlockData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ScenarioChoice {
  id: string;
  text: string;
  feedback: string;
  isCorrect: boolean;
}

export interface ScenarioBlockData {
  title: string;
  situation: string;
  choices: ScenarioChoice[];
}

export interface AssessmentBlockData {
  assessmentId: string;
  title?: string;
}

export interface AssignmentBlockData {
  prompt: string;
  rubric?: string;
}

export type ContentBlockData =
  | HeadingBlockData
  | TextBlockData
  | ImageBlockData
  | VideoBlockData
  | DocumentBlockData
  | CalloutBlockData
  | QuestionBlockData
  | ScenarioBlockData
  | AssessmentBlockData
  | AssignmentBlockData
  | Record<string, unknown>;

export interface ContentBlock {
  id: string;
  learningItemId: string;
  type: ContentBlockType;
  order: number;
  data: ContentBlockData;
}

export type QuestionType = 'multiple-choice' | 'multiple-select' | 'true-false' | 'ordering' | 'scenario';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: QuestionOption[];
  correctAnswers: string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  moduleId?: string;
  learningItemId?: string;
  title: string;
  description?: string;
  passingScore: number;
  maxAttempts: number;
  revealAnswers: boolean;
  questions: Question[];
}

export interface Attempt {
  id: string;
  userId: string;
  enrollmentId?: string;
  assessmentId: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
  answers: Record<string, unknown>;
  submittedAt: string;
}

// ENROLLMENT DOMAIN MODEL (Private Education System)
export type EnrollmentStatus = 'active' | 'completed' | 'suspended' | 'expired';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  startDate?: string;
  completionDate?: string;
  assignedBy: string;
  expirationDate?: string;
  notes?: string;
}

// FUTURE REGISTRATION / PURCHASE MODEL
export type RegistrationStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';

export interface CourseRegistration {
  id: string;
  userId: string;
  courseCode: string;
  status: RegistrationStatus;
  source: string; // e.g. 'external_registration_portal', 'federation_desk', 'simulation'
  createdAt: string;
  confirmedAt?: string;
  processedAt?: string;
  enrollmentId?: string;
  notes?: string;
}

// LEARNER PROGRESS (Conceptually bound to Enrollment)
export interface Progress {
  id: string;
  enrollmentId?: string;
  userId: string;
  courseId: string;
  moduleId: string;
  learningItemId: string;
  completed: boolean;
  score?: number;
  timeSpentSeconds?: number;
  completedAt?: string;
  lastActivityAt?: string;
}

export interface ModuleProgressSummary {
  moduleId: string;
  moduleTitle: string;
  totalItems: number;
  completedItems: number;
  percentage: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface AssessmentResultSummary {
  assessmentId: string;
  assessmentTitle: string;
  passed: boolean;
  bestScore: number;
  attemptsCount: number;
}

export interface CourseProgressSummary {
  enrollment: Enrollment;
  course: Course;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  status: 'not-started' | 'in-progress' | 'completed';
  lastActivityAt?: string;
  moduleProgress: ModuleProgressSummary[];
  assessmentResults: AssessmentResultSummary[];
}

export interface Submission {
  id: string;
  enrollmentId?: string;
  userId: string;
  activityId: string;
  response: string;
  status: 'submitted' | 'reviewed' | 'graded';
  feedback?: string;
  grade?: number;
  submittedAt: string;
}
