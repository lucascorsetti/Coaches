import { ICategoryRepository } from '../interfaces';
import { Category } from '../../types';
import { DEMO_CATEGORIES } from '../../data/demoData';

const CATEGORIES_KEY = 'ihdp_categories';

export class LocalStorageCategoryRepository implements ICategoryRepository {
  private ensureInitialized(): void {
    if (!localStorage.getItem(CATEGORIES_KEY)) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEMO_CATEGORIES));
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  async getAllCategories(): Promise<Category[]> {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY);
      const list = raw ? JSON.parse(raw) : DEMO_CATEGORIES;
      return list.sort((a: Category, b: Category) => a.order - b.order);
    } catch {
      return DEMO_CATEGORIES;
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const all = await this.getAllCategories();
    return all.find((c) => c.id === id) || null;
  }

  async saveCategory(category: Category): Promise<Category> {
    const all = await this.getAllCategories();
    const index = all.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      all[index] = category;
    } else {
      all.push(category);
    }
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(all));
    return category;
  }
}
