import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Download, 
  Upload, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Blocks,
  Workflow
} from 'lucide-react';
import { courseRepository } from '../../repositories';

export const EngineDocs: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [jsonExport, setJsonExport] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExportAll = async () => {
    const courses = await courseRepository.getAllCourses();
    const exportPackage: any = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      federation: 'FISG Italia Hockey',
      courses: []
    };

    for (const c of courses) {
      const mods = await courseRepository.getModulesByCourseId(c.id);
      const modsWithItems = [];
      for (const m of mods) {
        const items = await courseRepository.getItemsByModuleId(m.id);
        const itemsWithBlocks = [];
        for (const it of items) {
          const blocks = await courseRepository.getBlocksByItemId(it.id);
          itemsWithBlocks.push({ ...it, blocks });
        }
        modsWithItems.push({ ...m, items: itemsWithBlocks });
      }
      exportPackage.courses.push({ ...c, modules: modsWithItems });
    }

    setJsonExport(JSON.stringify(exportPackage, null, 2));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              IHDP Courses Engine — Technical Architecture & Migration Spec
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              FISG Italia Hockey Development Program • Standalone Curriculum & LMS Engine
            </p>
          </div>
        </div>
      </div>

      {/* Migration Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
        <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <strong className="font-semibold block mb-1">
            Standalone First, Seamless IHDP Migration Second
          </strong>
          This application is completely isolated from the existing IHDP Supabase database, auth, and backend during this phase. 
          All storage operations pass through strongly typed interfaces (<code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded text-blue-800">ICourseRepository</code>, <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded text-blue-800">IProgressRepository</code>).
          When ready, swapping out the local storage classes for Supabase SDK calls requires zero changes to the authoring UI or learner experience.
        </div>
      </div>

      {/* Grid of Core Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
            <Workflow className="w-4 h-4 text-blue-600" />
            <h3>1. Content- & Category-Agnostic</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Categories (<code className="font-mono">Coaching</code>, <code className="font-mono">Refereeing</code>, <code className="font-mono">Off-Ice</code>) are dynamic records. The engine has no hard-coded checks for sport or level.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
            <Blocks className="w-4 h-4 text-emerald-600" />
            <h3>2. Block-Based Lesson Engine</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Lessons are composed of ordered blocks (Heading, Text, Image, Video, PDF, Callout, Scenario, Assessment). Authors can reorder and combine any sequence.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h3>3. Authoring Simplicity</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Heads of Coaches see zero database IDs, raw JSON, or schemas. They build intuitively: Course → Add Module → Add Lesson → Add Blocks → Live Preview.
          </p>
        </div>
      </div>

      {/* Supabase Schema Spec */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Target Supabase / PostgreSQL Database Schema
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(SQL_SCHEMA, 'sql')}
            className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied === 'sql' ? 'Copied SQL' : 'Copy SQL Script'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Execute this migration in the main IHDP Supabase instance when merging the Courses section.
        </p>
        <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-lg overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
          {SQL_SCHEMA}
        </pre>
      </div>

      {/* JSON Course Packaging & Export */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Curriculum Data Packaging (Export JSON)
            </h2>
          </div>
          <button
            onClick={handleExportAll}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Courses to JSON</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Heads of Coaches and administrators can backup courses or transfer them between staging and production environments.
        </p>

        {jsonExport ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>courses_backup.json</span>
              <button
                onClick={() => copyToClipboard(jsonExport, 'json')}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied === 'json' ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={jsonExport}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none"
            />
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Click "Export All Courses to JSON" to generate a portable curriculum package.
          </div>
        )}
      </div>
    </div>
  );
};

const SQL_SCHEMA = `-- IHDP Courses Engine - Target Supabase / PostgreSQL Schema

-- 1. Course Categories (Coaching, Refereeing, Off-Ice, etc.)
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

-- 3. Course Enrollments (Private Authorization Grant)
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

-- 4. Learning Items / Lessons
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

-- 5. Content Blocks (Ordered block engine)
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_item_id UUID REFERENCES learning_items(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assessments & Quizzes
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

-- 7. Learner Progress
CREATE TABLE IF NOT EXISTS learner_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- points to auth.users in IHDP
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

-- 8. Assessment Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_number INT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_progress ENABLE ROW LEVEL SECURITY;

-- Learners can read published courses
CREATE POLICY "Public read published courses" ON courses
  FOR SELECT USING (status = 'published' OR auth.jwt() ->> 'role' IN ('admin', 'author'));

-- Authors and Admins have full access
CREATE POLICY "Admins and Authors full access to courses" ON courses
  FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'author'));

-- Learners own their progress records
CREATE POLICY "Learners manage their own progress" ON learner_progress
  FOR ALL USING (auth.uid() = user_id);
`;
