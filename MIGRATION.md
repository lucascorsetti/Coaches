# IHDP Courses Engine — Migration Guide

This document describes the exact steps to integrate the standalone **Courses Engine** into the main **FISG Italia Hockey Development Program (IHDP)** application.

---

## 1. Migration Strategy Overview

The standalone project was architected so that:
- **No rewrites of the UI or builder are required.**
- **No secondary authentication system is introduced**; learners and coaches use their existing IHDP account.
- **The persistence layer is completely decoupled**: swapping `src/repositories/localStorage` with `src/repositories/supabase` enables immediate cloud persistence.

---

## 2. Step-by-Step Migration Plan

### Step 1: Database Setup in IHDP Supabase

Run the SQL migration script provided below (also viewable in the **Engine Specs** tab in the app):

```sql
-- 1. Course Categories (Coaching, Refereeing, etc.)
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_it TEXT,
  description TEXT,
  color TEXT DEFAULT '#1d4ed8',
  icon TEXT DEFAULT 'BookOpen',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_title TEXT,
  category_id UUID REFERENCES course_categories(id) ON DELETE RESTRICT,
  level TEXT NOT NULL DEFAULT 'Level 1',
  description TEXT,
  thumbnail_url TEXT,
  estimated_duration TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  authors TEXT[] DEFAULT ARRAY[]::TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Course Modules
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  completion_rules JSONB DEFAULT '{"required": true, "minimumScore": 70}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Learning Items (Lessons)
CREATE TABLE IF NOT EXISTS learning_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'lesson' CHECK (item_type IN ('lesson', 'video', 'reading', 'assessment', 'assignment')),
  display_order INT NOT NULL DEFAULT 0,
  estimated_duration TEXT,
  completion_rules JSONB DEFAULT '{"required": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Content Blocks
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_item_id UUID REFERENCES learning_items(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INT NOT NULL DEFAULT 70,
  max_attempts INT NOT NULL DEFAULT 3,
  reveal_answers BOOLEAN NOT NULL DEFAULT true,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Learner Progress (Tied to IHDP auth.users)
CREATE TABLE IF NOT EXISTS learner_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  learning_item_id UUID REFERENCES learning_items(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INT,
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, learning_item_id)
);
```

---

### Step 2: Code File Transfer

Copy the following directories from this repository into the main IHDP project:

1. **Types**:
   - `src/types/index.ts` → `src/features/courses/types/index.ts`
2. **Components**:
   - `src/components/author/*` → `src/features/courses/components/author/*`
   - `src/components/learner/*` → `src/features/courses/components/learner/*`
   - `src/components/common/*` → `src/features/courses/components/common/*`
3. **Repository Interfaces**:
   - `src/repositories/interfaces.ts` → `src/features/courses/repositories/interfaces.ts`
4. **Translations**:
   - Merge `src/i18n/translations.ts` keys into IHDP's internationalization catalog.

---

### Step 3: Implement Supabase Repositories

In `src/features/courses/repositories/supabase/`:

```typescript
import { supabase } from '@/lib/supabaseClient';
import { ICourseRepository } from '../interfaces';
import { Course, Module, LearningItem, ContentBlock } from '../../types';

export class SupabaseCourseRepository implements ICourseRepository {
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapDbToCourse);
  }

  async getCourseById(id: string): Promise<Course | null> {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbToCourse(data);
  }

  async saveCourse(course: Course): Promise<Course> {
    const payload = mapCourseToDb(course);
    const { data, error } = await supabase.from('courses').upsert(payload).select().single();
    if (error) throw error;
    return mapDbToCourse(data);
  }

  // Same pattern for modules, items, blocks...
}
```

Then in `src/features/courses/repositories/index.ts`:

```typescript
import { SupabaseCourseRepository } from './supabase/courseRepository';
import { SupabaseCategoryRepository } from './supabase/categoryRepository';
import { SupabaseProgressRepository } from './supabase/progressRepository';
import { SupabaseAssessmentRepository } from './supabase/assessmentRepository';

export const courseRepository = new SupabaseCourseRepository();
export const categoryRepository = new SupabaseCategoryRepository();
export const progressRepository = new SupabaseProgressRepository();
export const assessmentRepository = new SupabaseAssessmentRepository();
```

---

### Step 4: Hook into Existing IHDP Navigation & Auth

1. In the main IHDP Sidebar/Navigation, add a top-level link:
   - Icon: `GraduationCap` or `BookOpen`
   - Label: `Courses` (or `Corsi` in Italian)
   - Route: `/courses/*`
2. Replace `AuthContext` from this standalone app with the existing IHDP `useAuth()` hook:
   - Trainees map to `currentUser.role === 'coach'` / `'learner'`
   - Head of Coaches maps to `currentUser.role === 'head_coach'` / `'admin'`
3. Mount the course view:
   - Coaches see `CourseCatalog` & `CourseOverview`
   - Head of Coaches sees `AuthorDashboard` & `CourseEditor`

---

## 3. Verification Checklist

- [ ] Categories table seeded with `Coaching` and `Refereeing`.
- [ ] Head of Coaches can create a new course and add modules.
- [ ] Ordered content blocks (rich text, video URL, diagrams, quizzes) save to Supabase.
- [ ] Coach trainees can enroll, track percentage progress, and submit assessments.
- [ ] Responsive navigation and bilingual translations (EN/IT) verify cleanly on mobile and desktop viewports.
