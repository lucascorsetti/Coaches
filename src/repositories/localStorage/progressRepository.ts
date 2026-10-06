import { IProgressRepository } from '../interfaces';
import { Progress } from '../../types';

const PROGRESS_KEY = 'ihdp_progress';

export class LocalStorageProgressRepository implements IProgressRepository {
  private ensureInitialized(): void {
    if (!localStorage.getItem(PROGRESS_KEY)) {
      // Seed with sample initial completed item for demo user
      const initial: Progress[] = [
        {
          userId: 'user-demo-1',
          courseId: 'course-demo-101',
          moduleId: 'mod-1',
          learningItemId: 'item-101',
          status: 'completed',
          completedAt: '2026-10-06T10:00:00Z'
        }
      ];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(initial));
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getUserProgress(userId: string, courseId: string): Promise<Progress[]> {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      const list: Progress[] = raw ? JSON.parse(raw) : [];
      return list.filter((p) => p.userId === userId && p.courseId === courseId);
    } catch {
      return [];
    }
  }

  async setItemProgress(progress: Progress): Promise<Progress> {
    this.ensureInitialized();
    const raw = localStorage.getItem(PROGRESS_KEY);
    const list: Progress[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex(
      (p) => p.userId === progress.userId && p.learningItemId === progress.learningItemId
    );
    if (index >= 0) {
      list[index] = progress;
    } else {
      list.push(progress);
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
    return progress;
  }

  async resetCourseProgress(userId: string, courseId: string): Promise<void> {
    this.ensureInitialized();
    const raw = localStorage.getItem(PROGRESS_KEY);
    const list: Progress[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((p) => !(p.userId === userId && p.courseId === courseId));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(filtered));
  }
}
