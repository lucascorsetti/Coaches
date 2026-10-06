import { IEnrollmentRepository } from '../interfaces';
import { Enrollment, EnrollmentStatus } from '../../types';
import { DEMO_ENROLLMENTS } from '../../data/demoData';

const ENROLLMENTS_KEY = 'ihdp_enrollments';

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

export class LocalStorageEnrollmentRepository implements IEnrollmentRepository {
  private ensureInitialized(): void {
    if (!localStorage.getItem(ENROLLMENTS_KEY)) {
      setItem(ENROLLMENTS_KEY, DEMO_ENROLLMENTS);
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    this.ensureInitialized();
    return getItem<Enrollment[]>(ENROLLMENTS_KEY, DEMO_ENROLLMENTS);
  }

  async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    const all = await this.getAllEnrollments();
    return all.filter((e) => e.userId === userId);
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    const all = await this.getAllEnrollments();
    return all.find((e) => e.userId === userId && e.courseId === courseId) || null;
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    const all = await this.getAllEnrollments();
    return all.filter((e) => e.courseId === courseId);
  }

  async createEnrollment(
    data: Omit<Enrollment, 'id' | 'enrolledAt'> & Partial<Pick<Enrollment, 'id' | 'enrolledAt'>>
  ): Promise<Enrollment> {
    const all = await this.getAllEnrollments();
    
    // Check if enrollment already exists for this user and course
    const existingIndex = all.findIndex(
      (e) => e.userId === data.userId && e.courseId === data.courseId
    );

    const newEnrollment: Enrollment = {
      id: data.id || `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: data.userId,
      courseId: data.courseId,
      status: data.status || 'active',
      enrolledAt: data.enrolledAt || new Date().toISOString(),
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      assignedBy: data.assignedBy || 'Administrator',
      expirationDate: data.expirationDate,
      notes: data.notes
    };

    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...newEnrollment };
    } else {
      all.push(newEnrollment);
    }

    setItem(ENROLLMENTS_KEY, all);
    return newEnrollment;
  }

  async updateEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<Enrollment> {
    const all = await this.getAllEnrollments();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Enrollment ${id} not found`);
    }

    const updated: Enrollment = {
      ...all[index],
      status,
      completionDate: status === 'completed' ? (all[index].completionDate || new Date().toISOString()) : all[index].completionDate
    };

    all[index] = updated;
    setItem(ENROLLMENTS_KEY, all);
    return updated;
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    const all = await this.getAllEnrollments();
    const filtered = all.filter((e) => e.id !== id);
    setItem(ENROLLMENTS_KEY, filtered);
    return true;
  }

  async checkUserAccess(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.getEnrollment(userId, courseId);
    if (!enrollment) return false;
    return enrollment.status === 'active' || enrollment.status === 'completed';
  }
}
