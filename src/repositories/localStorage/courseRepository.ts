import { ICourseRepository } from '../interfaces';
import { Course, Module, LearningItem, ContentBlock } from '../../types';
import { DEMO_COURSES, DEMO_MODULES, DEMO_ITEMS, DEMO_BLOCKS } from '../../data/demoData';

const COURSES_KEY = 'ihdp_courses';
const MODULES_KEY = 'ihdp_modules';
const ITEMS_KEY = 'ihdp_learning_items';
const BLOCKS_KEY = 'ihdp_content_blocks';

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

export class LocalStorageCourseRepository implements ICourseRepository {
  private ensureInitialized(): void {
    if (!localStorage.getItem(COURSES_KEY)) {
      setItem(COURSES_KEY, DEMO_COURSES);
    }
    if (!localStorage.getItem(MODULES_KEY)) {
      setItem(MODULES_KEY, DEMO_MODULES);
    }
    if (!localStorage.getItem(ITEMS_KEY)) {
      setItem(ITEMS_KEY, DEMO_ITEMS);
    }
    if (!localStorage.getItem(BLOCKS_KEY)) {
      setItem(BLOCKS_KEY, DEMO_BLOCKS);
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  // --- Courses ---
  async getAllCourses(): Promise<Course[]> {
    this.ensureInitialized();
    return getItem<Course[]>(COURSES_KEY, DEMO_COURSES);
  }

  async getCourseById(id: string): Promise<Course | null> {
    const courses = await this.getAllCourses();
    return courses.find((c) => c.id === id) || null;
  }

  async getCourseByCode(courseCode: string): Promise<Course | null> {
    if (!courseCode) return null;
    const courses = await this.getAllCourses();
    const normalized = courseCode.trim().toLowerCase();
    return courses.find((c) => c.courseCode && c.courseCode.trim().toLowerCase() === normalized) || null;
  }

  async validateCourseCode(courseCode: string, excludeCourseId?: string): Promise<{ valid: boolean; error?: string }> {
    const normalized = (courseCode || '').trim().toLowerCase();
    if (!normalized) {
      return { valid: false, error: 'Course product code is required' };
    }
    const courses = await this.getAllCourses();
    const existing = courses.find(
      (c) => c.courseCode && c.courseCode.trim().toLowerCase() === normalized && c.id !== excludeCourseId
    );
    if (existing) {
      return { 
        valid: false, 
        error: `Course code "${courseCode}" is already in use by course "${existing.title}". Course codes must be unique.` 
      };
    }
    return { valid: true };
  }

  async saveCourse(course: Course): Promise<Course> {
    const courses = await this.getAllCourses();
    
    // Validate uniqueness of courseCode
    const validation = await this.validateCourseCode(course.courseCode, course.id);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid course code');
    }

    const index = courses.findIndex((c) => c.id === course.id);
    const updated = { 
      ...course, 
      courseCode: course.courseCode.trim(),
      updatedAt: new Date().toISOString() 
    };
    if (index >= 0) {
      courses[index] = updated;
    } else {
      courses.push(updated);
    }
    setItem(COURSES_KEY, courses);
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const courses = await this.getAllCourses();
    const filtered = courses.filter((c) => c.id !== id);
    setItem(COURSES_KEY, filtered);

    // Cascade delete modules
    const modules = await this.getModulesByCourseId(id);
    for (const mod of modules) {
      await this.deleteModule(mod.id);
    }
    return true;
  }

  // --- Modules ---
  async getModulesByCourseId(courseId: string): Promise<Module[]> {
    this.ensureInitialized();
    const modules = getItem<Module[]>(MODULES_KEY, DEMO_MODULES);
    return modules
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async saveModule(module: Module): Promise<Module> {
    this.ensureInitialized();
    const modules = getItem<Module[]>(MODULES_KEY, DEMO_MODULES);
    const index = modules.findIndex((m) => m.id === module.id);
    if (index >= 0) {
      modules[index] = module;
    } else {
      modules.push(module);
    }
    setItem(MODULES_KEY, modules);
    return module;
  }

  async deleteModule(id: string): Promise<boolean> {
    this.ensureInitialized();
    const modules = getItem<Module[]>(MODULES_KEY, DEMO_MODULES);
    const filtered = modules.filter((m) => m.id !== id);
    setItem(MODULES_KEY, filtered);

    // Cascade items
    const items = await this.getItemsByModuleId(id);
    for (const item of items) {
      await this.deleteItem(item.id);
    }
    return true;
  }

  async reorderModules(courseId: string, orderedModuleIds: string[]): Promise<void> {
    this.ensureInitialized();
    const modules = getItem<Module[]>(MODULES_KEY, DEMO_MODULES);
    const updated = modules.map((m) => {
      if (m.courseId === courseId) {
        const newOrder = orderedModuleIds.indexOf(m.id);
        return newOrder >= 0 ? { ...m, order: newOrder + 1 } : m;
      }
      return m;
    });
    setItem(MODULES_KEY, updated);
  }

  // --- Learning Items ---
  async getItemsByModuleId(moduleId: string): Promise<LearningItem[]> {
    this.ensureInitialized();
    const items = getItem<LearningItem[]>(ITEMS_KEY, DEMO_ITEMS);
    return items
      .filter((item) => item.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  async getItemById(id: string): Promise<LearningItem | null> {
    this.ensureInitialized();
    const items = getItem<LearningItem[]>(ITEMS_KEY, DEMO_ITEMS);
    return items.find((item) => item.id === id) || null;
  }

  async saveItem(item: LearningItem): Promise<LearningItem> {
    this.ensureInitialized();
    const items = getItem<LearningItem[]>(ITEMS_KEY, DEMO_ITEMS);
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    setItem(ITEMS_KEY, items);
    return item;
  }

  async deleteItem(id: string): Promise<boolean> {
    this.ensureInitialized();
    const items = getItem<LearningItem[]>(ITEMS_KEY, DEMO_ITEMS);
    const filtered = items.filter((i) => i.id !== id);
    setItem(ITEMS_KEY, filtered);

    // Cascade delete blocks
    const blocks = getItem<ContentBlock[]>(BLOCKS_KEY, DEMO_BLOCKS);
    const remainingBlocks = blocks.filter((b) => b.learningItemId !== id);
    setItem(BLOCKS_KEY, remainingBlocks);

    return true;
  }

  async reorderItems(moduleId: string, orderedItemIds: string[]): Promise<void> {
    this.ensureInitialized();
    const items = getItem<LearningItem[]>(ITEMS_KEY, DEMO_ITEMS);
    const updated = items.map((item) => {
      if (item.moduleId === moduleId) {
        const newOrder = orderedItemIds.indexOf(item.id);
        return newOrder >= 0 ? { ...item, order: newOrder + 1 } : item;
      }
      return item;
    });
    setItem(ITEMS_KEY, updated);
  }

  // --- Content Blocks ---
  async getBlocksByItemId(learningItemId: string): Promise<ContentBlock[]> {
    this.ensureInitialized();
    const blocks = getItem<ContentBlock[]>(BLOCKS_KEY, DEMO_BLOCKS);
    return blocks
      .filter((b) => b.learningItemId === learningItemId)
      .sort((a, b) => a.order - b.order);
  }

  async saveBlock(block: ContentBlock): Promise<ContentBlock> {
    this.ensureInitialized();
    const blocks = getItem<ContentBlock[]>(BLOCKS_KEY, DEMO_BLOCKS);
    const index = blocks.findIndex((b) => b.id === block.id);
    if (index >= 0) {
      blocks[index] = block;
    } else {
      blocks.push(block);
    }
    setItem(BLOCKS_KEY, blocks);
    return block;
  }

  async deleteBlock(id: string): Promise<boolean> {
    this.ensureInitialized();
    const blocks = getItem<ContentBlock[]>(BLOCKS_KEY, DEMO_BLOCKS);
    const filtered = blocks.filter((b) => b.id !== id);
    setItem(BLOCKS_KEY, filtered);
    return true;
  }

  async reorderBlocks(learningItemId: string, orderedBlockIds: string[]): Promise<void> {
    this.ensureInitialized();
    const blocks = getItem<ContentBlock[]>(BLOCKS_KEY, DEMO_BLOCKS);
    const updated = blocks.map((b) => {
      if (b.learningItemId === learningItemId) {
        const newOrder = orderedBlockIds.indexOf(b.id);
        return newOrder >= 0 ? { ...b, order: newOrder + 1 } : b;
      }
      return b;
    });
    setItem(BLOCKS_KEY, updated);
  }
}
