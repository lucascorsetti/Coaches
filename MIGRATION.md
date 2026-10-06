# IHDP Courses Engine — Migration Guide

This document describes the exact steps to integrate the standalone **Courses Engine** into the main **FISG Italia Hockey Development Program (IHDP)** application with the **Private Enrollment Model**.

---

## 1. Migration Strategy Overview

The standalone project was architected so that:
- **No rewrites of the UI or builder are required.**
- **No secondary authentication system is introduced**; learners and coaches use their existing IHDP account (`auth.users`).
- **Private enrollment access control** is enforced at the database (RLS) and repository level.
- **The persistence layer is completely decoupled**: swapping `src/repositories/localStorage` with `src/repositories/supabase` enables immediate cloud persistence.

---

## 2. Step-by-Step Migration Plan

### Step 1: Database Setup in IHDP Supabase

Run the SQL migration script provided below:

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
  access_policy TEXT NOT NULL DEFAULT 'private' CHECK (access_policy IN ('private', 'restricted', 'open')),
  completion_rules JSONB DEFAULT '{"requireAllLessons": true, "requireAllAssessmentsPassed": true, "minimumPassingScore": 75}'::jsonb,
  authors TEXT[] DEFAULT ARRAY[]::TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Course Enrollments (Core Private Access Control Grant)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'expired')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  start_date DATE DEFAULT CURRENT_DATE,
  completion_date TIMESTAMPTZ,
  assigned_by TEXT NOT NULL,
  expiration_date TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(user_id, course_id)
);

-- 4. Course Modules
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  completion_rules JSONB DEFAULT '{"required": true, "minimumScore": 70}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Learning Items (Lessons)
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

-- 6. Content Blocks
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_item_id UUID REFERENCES learning_items(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Assessments
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

-- 8. Learner Progress (Tied to Enrollment)
CREATE TABLE IF NOT EXISTS learner_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  learning_item_id UUID REFERENCES learning_items(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INT,
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, learning_item_id)
);

-- 9. Assessment Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_number INT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_progress ENABLE ROW LEVEL SECURITY;

-- Learners can only read courses they are actively enrolled in
CREATE POLICY "Learners read enrolled courses" ON courses
  FOR SELECT USING (
    id IN (
      SELECT course_id FROM course_enrollments 
      WHERE user_id = auth.uid() AND status IN ('active', 'completed')
    )
    OR auth.jwt() ->> 'role' IN ('admin', 'head_coach', 'author')
  );

-- Learners manage their own enrollment progress
CREATE POLICY "Learners view own progress" ON learner_progress
  FOR ALL USING (auth.uid() = user_id);

-- Admins and Authors full control over enrollments
CREATE POLICY "Admins and Authors manage enrollments" ON course_enrollments
  FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'head_coach', 'author'));
```

---

### Step 2: Implement Supabase Repositories

In `src/features/courses/repositories/supabase/enrollmentRepository.ts`:

```typescript
import { supabase } from '@/lib/supabaseClient';
import { IEnrollmentRepository } from '../interfaces';
import { Enrollment, EnrollmentStatus } from '../../types';

export class SupabaseEnrollmentRepository implements IEnrollmentRepository {
  async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  async checkUserAccess(userId: string, courseId: string): Promise<boolean> {
    const { data } = await supabase
      .from('course_enrollments')
      .select('status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .single();
    return !!data;
  }
}
```

---

### Step 3: Connect Existing IHDP Navigation & Auth

1. In IHDP's top-level navigation, map the route `/courses` to the `CourseCatalog` component.
2. Learner view automatically resolves the logged-in coach's `user.id`.
3. If user has no enrollments, the empty state displays contact details.
4. If enrolled, the user proceeds with progressive modules and assessments.
