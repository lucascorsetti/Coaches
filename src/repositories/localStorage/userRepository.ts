import { IUserRepository } from '../interfaces';
import { User } from '../../types';
import { DEMO_USERS } from '../../data/demoData';

const USERS_KEY = 'ihdp_users';

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage`, err);
    return defaultVal;
  }
}

export class LocalStorageUserRepository implements IUserRepository {
  private ensureInitialized(): void {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getAllUsers(): Promise<User[]> {
    this.ensureInitialized();
    return getItem<User[]>(USERS_KEY, DEMO_USERS);
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  }
}
