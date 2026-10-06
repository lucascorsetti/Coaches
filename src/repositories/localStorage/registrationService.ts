import { IRegistrationService } from '../interfaces';
import { CourseRegistration, Enrollment } from '../../types';
import { DEMO_REGISTRATIONS } from '../../data/demoData';
import { courseRepository, enrollmentRepository } from '../index';

const REGISTRATIONS_KEY = 'ihdp_registrations';

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

export class LocalStorageRegistrationService implements IRegistrationService {
  private ensureInitialized(): void {
    if (!localStorage.getItem(REGISTRATIONS_KEY)) {
      setItem(REGISTRATIONS_KEY, DEMO_REGISTRATIONS);
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getAllRegistrations(): Promise<CourseRegistration[]> {
    this.ensureInitialized();
    return getItem<CourseRegistration[]>(REGISTRATIONS_KEY, DEMO_REGISTRATIONS);
  }

  async createRegistration(
    reg: Omit<CourseRegistration, 'id' | 'createdAt'>
  ): Promise<CourseRegistration> {
    this.ensureInitialized();
    const all = await this.getAllRegistrations();
    const newReg: CourseRegistration = {
      ...reg,
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    all.unshift(newReg);
    setItem(REGISTRATIONS_KEY, all);
    return newReg;
  }

  async processRegistration(
    registrationId: string
  ): Promise<{ success: boolean; enrollment?: Enrollment; error?: string }> {
    const all = await this.getAllRegistrations();
    const index = all.findIndex((r) => r.id === registrationId);
    if (index === -1) {
      return { success: false, error: `Registration ${registrationId} not found` };
    }

    const reg = all[index];
    // Resolve course by courseCode
    const course = await courseRepository.getCourseByCode(reg.courseCode);
    if (!course) {
      reg.status = 'failed';
      reg.notes = `Course resolution failed: No course matching product code "${reg.courseCode}"`;
      setItem(REGISTRATIONS_KEY, all);
      return { success: false, error: reg.notes };
    }

    // Create active enrollment for user
    const enrollment = await enrollmentRepository.createEnrollment({
      userId: reg.userId,
      courseId: course.id,
      status: 'active',
      assignedBy: `Registration (${reg.source})`,
      notes: `Auto-enrolled via external course code ${reg.courseCode}`
    });

    reg.status = 'confirmed';
    reg.enrollmentId = enrollment.id;
    reg.processedAt = new Date().toISOString();
    reg.confirmedAt = reg.confirmedAt || new Date().toISOString();
    setItem(REGISTRATIONS_KEY, all);

    return { success: true, enrollment };
  }

  async simulateExternalPurchase(
    userId: string, 
    courseCode: string, 
    source = 'external_registration_portal'
  ): Promise<{ success: boolean; enrollment?: Enrollment; error?: string; registration: CourseRegistration }> {
    this.ensureInitialized();
    const course = await courseRepository.getCourseByCode(courseCode);

    if (!course) {
      const failedReg = await this.createRegistration({
        userId,
        courseCode,
        status: 'failed',
        source,
        notes: `Simulated external purchase failed: Unknown course code "${courseCode}"`
      });
      return {
        success: false,
        error: `No matching course found for code "${courseCode}". No enrollment created.`,
        registration: failedReg
      };
    }

    // Course found -> create confirmed registration
    const reg = await this.createRegistration({
      userId,
      courseCode,
      status: 'confirmed',
      source,
      confirmedAt: new Date().toISOString(),
      notes: `Simulated external registration for "${course.title}"`
    });

    // Create active enrollment
    const enrollment = await enrollmentRepository.createEnrollment({
      userId,
      courseId: course.id,
      status: 'active',
      assignedBy: `Simulated External System (Code ${courseCode})`,
      notes: `Registration Ref: ${reg.id}`
    });

    // Update registration with enrollmentId
    reg.enrollmentId = enrollment.id;
    reg.processedAt = new Date().toISOString();
    const all = await this.getAllRegistrations();
    const idx = all.findIndex((r) => r.id === reg.id);
    if (idx >= 0) {
      all[idx] = reg;
      setItem(REGISTRATIONS_KEY, all);
    }

    return {
      success: true,
      enrollment,
      registration: reg
    };
  }
}
