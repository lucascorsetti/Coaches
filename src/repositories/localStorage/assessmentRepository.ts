import { IAssessmentRepository } from '../interfaces';
import { Assessment, Attempt } from '../../types';
import { DEMO_ASSESSMENTS } from '../../data/demoData';

const ASSESSMENTS_KEY = 'ihdp_assessments';
const ATTEMPTS_KEY = 'ihdp_assessment_attempts';

export class LocalStorageAssessmentRepository implements IAssessmentRepository {
  private ensureInitialized(): void {
    if (!localStorage.getItem(ASSESSMENTS_KEY)) {
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(DEMO_ASSESSMENTS));
    }
    if (!localStorage.getItem(ATTEMPTS_KEY)) {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([]));
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getAssessmentById(id: string): Promise<Assessment | null> {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(ASSESSMENTS_KEY);
      const list: Assessment[] = raw ? JSON.parse(raw) : DEMO_ASSESSMENTS;
      return list.find((a) => a.id === id) || null;
    } catch {
      return null;
    }
  }

  async getAssessmentByItem(learningItemId: string): Promise<Assessment | null> {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(ASSESSMENTS_KEY);
      const list: Assessment[] = raw ? JSON.parse(raw) : DEMO_ASSESSMENTS;
      return list.find((a) => a.learningItemId === learningItemId) || null;
    } catch {
      return null;
    }
  }

  async getAssessmentsByCourse(courseId: string): Promise<Assessment[]> {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(ASSESSMENTS_KEY);
      const list: Assessment[] = raw ? JSON.parse(raw) : DEMO_ASSESSMENTS;
      return list.filter((a) => a.courseId === courseId);
    } catch {
      return [];
    }
  }

  async saveAssessment(assessment: Assessment): Promise<Assessment> {
    this.ensureInitialized();
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    const list: Assessment[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((a) => a.id === assessment.id);
    if (index >= 0) {
      list[index] = assessment;
    } else {
      list.push(assessment);
    }
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(list));
    return assessment;
  }

  async deleteAssessment(id: string): Promise<boolean> {
    this.ensureInitialized();
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    const list: Assessment[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(filtered));
    return true;
  }

  async getAttempts(userId: string, assessmentId: string, enrollmentId?: string): Promise<Attempt[]> {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(ATTEMPTS_KEY);
      const list: Attempt[] = raw ? JSON.parse(raw) : [];
      return list.filter((at) => {
        const matchUser = at.userId === userId;
        const matchAssess = at.assessmentId === assessmentId;
        if (enrollmentId && at.enrollmentId) {
          return matchUser && matchAssess && at.enrollmentId === enrollmentId;
        }
        return matchUser && matchAssess;
      });
    } catch {
      return [];
    }
  }

  async saveAttempt(attempt: Attempt): Promise<Attempt> {
    this.ensureInitialized();
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const list: Attempt[] = raw ? JSON.parse(raw) : [];
    const newAttempt: Attempt = {
      ...attempt,
      id: attempt.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      submittedAt: attempt.submittedAt || new Date().toISOString()
    };
    list.push(newAttempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list));
    return newAttempt;
  }
}
