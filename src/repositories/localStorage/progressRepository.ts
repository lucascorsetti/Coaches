import { IProgressRepository } from '../interfaces';
import { Progress, CourseProgressSummary, ModuleProgressSummary, AssessmentResultSummary } from '../../types';
import { DEMO_PROGRESS } from '../../data/demoData';
import { courseRepository, assessmentRepository } from '../index';
import { LocalStorageEnrollmentRepository } from './enrollmentRepository';

const PROGRESS_KEY = 'ihdp_progress';

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage`, err);
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

export class LocalStorageProgressRepository implements IProgressRepository {
  private enrollmentRepo = new LocalStorageEnrollmentRepository();

  private ensureInitialized(): void {
    if (!localStorage.getItem(PROGRESS_KEY)) {
      setItem(PROGRESS_KEY, DEMO_PROGRESS);
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getUserProgress(userId: string, courseId: string, enrollmentId?: string): Promise<Progress[]> {
    this.ensureInitialized();
    const list = getItem<Progress[]>(PROGRESS_KEY, DEMO_PROGRESS);
    return list.filter((p) => {
      const matchCourse = p.courseId === courseId;
      const matchUser = p.userId === userId;
      if (enrollmentId && p.enrollmentId) {
        return matchCourse && p.enrollmentId === enrollmentId;
      }
      return matchCourse && matchUser;
    });
  }

  async setItemProgress(progress: Progress): Promise<Progress> {
    this.ensureInitialized();
    const list = getItem<Progress[]>(PROGRESS_KEY, DEMO_PROGRESS);

    // If progress doesn't have an enrollmentId, try to attach current active enrollment
    let enrollmentId = progress.enrollmentId;
    if (!enrollmentId) {
      const enrollment = await this.enrollmentRepo.getEnrollment(progress.userId, progress.courseId);
      if (enrollment) {
        enrollmentId = enrollment.id;
      }
    }

    const payload: Progress = {
      ...progress,
      id: progress.id || `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      enrollmentId,
      lastActivityAt: new Date().toISOString()
    };

    const index = list.findIndex(
      (p) => p.userId === payload.userId && p.learningItemId === payload.learningItemId
    );

    if (index >= 0) {
      list[index] = { ...list[index], ...payload };
    } else {
      list.push(payload);
    }

    setItem(PROGRESS_KEY, list);

    // Automatically check if course completion requirements are satisfied
    await this.checkAndUpdateCourseCompletion(payload.userId, payload.courseId);

    return payload;
  }

  async resetCourseProgress(userId: string, courseId: string): Promise<void> {
    this.ensureInitialized();
    const list = getItem<Progress[]>(PROGRESS_KEY, DEMO_PROGRESS);
    const filtered = list.filter((p) => !(p.userId === userId && p.courseId === courseId));
    setItem(PROGRESS_KEY, filtered);

    // Reset enrollment status to active
    const enrollment = await this.enrollmentRepo.getEnrollment(userId, courseId);
    if (enrollment && enrollment.status === 'completed') {
      await this.enrollmentRepo.updateEnrollmentStatus(enrollment.id, 'active');
    }
  }

  async getCourseSummary(userId: string, courseId: string): Promise<CourseProgressSummary | null> {
    this.ensureInitialized();
    const course = await courseRepository.getCourseById(courseId);
    if (!course) return null;

    let enrollment = await this.enrollmentRepo.getEnrollment(userId, courseId);
    if (!enrollment) {
      // If user is admin, allow virtual preview enrollment
      enrollment = {
        id: `virtual-admin-${userId}`,
        userId,
        courseId,
        status: 'active',
        enrolledAt: new Date().toISOString(),
        assignedBy: 'System Administrator'
      };
    }

    const modules = await courseRepository.getModulesByCourseId(courseId);
    const progressRecords = await this.getUserProgress(userId, courseId, enrollment.id);

    let totalLessons = 0;
    let completedLessons = 0;
    let lastActivityAt: string | undefined = undefined;

    const moduleSummaries: ModuleProgressSummary[] = [];
    let previousModuleCompleted = true; // For lock sequencing if linear

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      const items = await courseRepository.getItemsByModuleId(mod.id);
      totalLessons += items.length;

      let modCompleted = 0;
      for (const item of items) {
        const itemProg = progressRecords.find((p) => p.learningItemId === item.id);
        if (itemProg?.completed) {
          modCompleted++;
        }
        if (itemProg?.lastActivityAt) {
          if (!lastActivityAt || new Date(itemProg.lastActivityAt) > new Date(lastActivityAt)) {
            lastActivityAt = itemProg.lastActivityAt;
          }
        }
      }

      completedLessons += modCompleted;
      const modPct = items.length > 0 ? Math.round((modCompleted / items.length) * 100) : 0;
      const isModDone = items.length > 0 && modCompleted === items.length;

      moduleSummaries.push({
        moduleId: mod.id,
        moduleTitle: mod.title,
        totalItems: items.length,
        completedItems: modCompleted,
        percentage: modPct,
        isCompleted: isModDone,
        isLocked: i > 0 && !previousModuleCompleted // sequential lock
      });

      previousModuleCompleted = isModDone;
    }

    // Assessments evaluation
    const assessmentResults: AssessmentResultSummary[] = [];
    let allAssessmentsPassed = true;

    // Check assessments linked to course
    for (const mod of modules) {
      const items = await courseRepository.getItemsByModuleId(mod.id);
      for (const item of items) {
        if (item.type === 'assessment') {
          // Look up assessment
          const blocks = await courseRepository.getBlocksByItemId(item.id);
          const assessBlock = blocks.find((b) => b.type === 'assessment');
          const assessId = assessBlock?.data?.assessmentId || 'assess-demo-1';
          const assess = await assessmentRepository.getAssessmentById(assessId);

          if (assess) {
            const attempts = await assessmentRepository.getAttempts(userId, assess.id);
            const passed = attempts.some((a) => a.passed);
            const bestScore = attempts.reduce((max, a) => Math.max(max, a.score), 0);

            if (!passed) {
              allAssessmentsPassed = false;
            }

            assessmentResults.push({
              assessmentId: assess.id,
              assessmentTitle: assess.title,
              passed,
              bestScore,
              attemptsCount: attempts.length
            });
          }
        }
      }
    }

    const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Check completion rules
    const rules = course.completionRules || {
      requireAllLessons: true,
      requireAllAssessmentsPassed: true
    };

    const isAllLessonsDone = totalLessons > 0 && completedLessons >= totalLessons;
    const isAssessmentsDone = !rules.requireAllAssessmentsPassed || allAssessmentsPassed;
    const isCompleted = isAllLessonsDone && isAssessmentsDone;

    const status = isCompleted
      ? 'completed'
      : completedLessons > 0
      ? 'in-progress'
      : 'not-started';

    return {
      enrollment,
      course,
      totalLessons,
      completedLessons,
      percentage: overallPct,
      status,
      lastActivityAt,
      moduleProgress: moduleSummaries,
      assessmentResults
    };
  }

  private async checkAndUpdateCourseCompletion(userId: string, courseId: string): Promise<void> {
    const summary = await this.getCourseSummary(userId, courseId);
    if (!summary) return;

    if (summary.status === 'completed' && summary.enrollment.status !== 'completed') {
      await this.enrollmentRepo.updateEnrollmentStatus(summary.enrollment.id, 'completed');
    }
  }
}
