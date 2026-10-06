import { ISubmissionRepository } from '../interfaces';
import { Submission } from '../../types';

const SUBMISSIONS_KEY = 'ihdp_submissions';

export class LocalStorageSubmissionRepository implements ISubmissionRepository {
  private ensureInitialized(): void {
    if (!localStorage.getItem(SUBMISSIONS_KEY)) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([]));
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getSubmissions(userId: string, activityId: string): Promise<Submission[]>{
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(SUBMISSIONS_KEY);
      const list: Submission[] = raw ? JSON.parse(raw) : [];
      return list.filter((s) => s.userId === userId && s.activityId === activityId);
    } catch {
      return [];
    }
  }

  async saveSubmission(submission: Submission): Promise<Submission> {
    this.ensureInitialized();
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    const list: Submission[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((s) => s.id === submission.id);
    if (index >= 0) {
      list[index] = submission;
    } else {
      list.push(submission);
    }
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
    return submission;
  }
}
