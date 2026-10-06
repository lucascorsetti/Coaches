import React, { useState, useEffect } from 'react';
import { Course, Category, CourseStatus } from '../../types';
import { courseRepository, categoryRepository } from '../../repositories';
import { useTranslation } from '../../i18n/translations';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Layers, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Globe,
  Archive,
  GraduationCap
} from 'lucide-react';

interface AuthorDashboardProps {
  onEditCourse: (courseId: string) => void;
  onPreviewCourse: (courseId: string) => void;
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  onEditCourse,
  onPreviewCourse
}) => {
  const { t, language } = useTranslation();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modulesCountMap, setModulesCountMap] = useState<Record<string, number>>({});
  const [lessonsCountMap, setLessonsCountMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New Course Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newShortTitle, setNewShortTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newLevel, setNewLevel] = useState('Level 1');
  const [newDuration, setNewDuration] = useState('4 hours');
  const [newDescription, setNewDescription] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    const [allCourses, allCategories] = await Promise.all([
      courseRepository.getAllCourses(),
      categoryRepository.getAllCategories()
    ]);

    setCourses(allCourses);
    setCategories(allCategories);
    if (allCategories.length > 0 && !newCategoryId) {
      setNewCategoryId(allCategories[0].id);
    }

    // Counts
    const mCounts: Record<string, number> = {};
    const lCounts: Record<string, number> = {};
    for (const c of allCourses) {
      const mods = await courseRepository.getModulesByCourseId(c.id);
      mCounts[c.id] = mods.length;
      let totalLessons = 0;
      for (const m of mods) {
        const items = await courseRepository.getItemsByModuleId(m.id);
        totalLessons += items.length;
      }
      lCounts[c.id] = totalLessons;
    }
    setModulesCountMap(mCounts);
    setLessonsCountMap(lCounts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCategoryId) return;

    const courseId = `course-${Date.now()}`;
    const newCourse: Course = {
      id: courseId,
      title: newTitle.trim(),
      shortTitle: newShortTitle.trim() || newTitle.trim().slice(0, 8).toUpperCase(),
      categoryId: newCategoryId,
      level: newLevel,
      description: newDescription.trim() || 'Federation educational curriculum module.',
      estimatedDuration: newDuration || '4 hours',
      status: 'draft',
      authors: ['Head of Coaches'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await courseRepository.saveCourse(newCourse);

    // Create an initial starter module and lesson so authoring starts right away
    const starterModule = {
      id: `mod-${Date.now()}-1`,
      courseId: courseId,
      title: 'Module 1: Introduction & Fundamentals',
      description: 'Foundational concepts and principles.',
      order: 0,
      completionRules: { required: true, minimumScore: 70 }
    };
    await courseRepository.saveModule(starterModule);

    const starterLesson = {
      id: `item-${Date.now()}-1`,
      moduleId: starterModule.id,
      title: 'Lesson 1.1: Core Overview',
      description: 'Welcome and overview of key objectives.',
      type: 'lesson' as const,
      order: 0,
      estimatedDuration: '15 min'
    };
    await courseRepository.saveItem(starterLesson);

    const starterBlock = {
      id: `block-${Date.now()}-1`,
      learningItemId: starterLesson.id,
      type: 'heading' as const,
      order: 0,
      data: {
        text: 'Welcome to this Course',
        subtitle: 'Created with the IHDP Courses Engine'
      }
    };
    await courseRepository.saveBlock(starterBlock);

    setShowCreateModal(false);
    setNewTitle('');
    setNewShortTitle('');
    setNewDescription('');

    // Open directly in editor
    onEditCourse(courseId);
  };

  const handleToggleStatus = async (course: Course) => {
    const nextStatus: CourseStatus = course.status === 'published' ? 'draft' : 'published';
    const updated: Course = {
      ...course,
      status: nextStatus,
      publishedAt: nextStatus === 'published' ? (course.publishedAt || new Date().toISOString()) : undefined,
      updatedAt: new Date().toISOString()
    };
    await courseRepository.saveCourse(updated);
    setCourses((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course and all its modules?')) {
      await courseRepository.deleteCourse(courseId);
      await loadData();
    }
  };

  const handleDuplicateCourse = async (course: Course) => {
    const newCourseId = `course-${Date.now()}`;
    const duplicatedCourse: Course = {
      ...course,
      id: newCourseId,
      title: `${course.title} (Copy)`,
      shortTitle: `${course.shortTitle || 'CPY'}-2`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined
    };
    await courseRepository.saveCourse(duplicatedCourse);

    // Duplicate modules
    const mods = await courseRepository.getModulesByCourseId(course.id);
    for (const m of mods) {
      const newModId = `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await courseRepository.saveModule({
        ...m,
        id: newModId,
        courseId: newCourseId
      });
      const items = await courseRepository.getItemsByModuleId(m.id);
      for (const item of items) {
        const newItemId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await courseRepository.saveItem({
          ...item,
          id: newItemId,
          moduleId: newModId
        });
        const blocks = await courseRepository.getBlocksByItemId(item.id);
        for (const b of blocks) {
          await courseRepository.saveBlock({
            ...b,
            id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            learningItemId: newItemId
          });
        }
      }
    }
    await loadData();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all course repository data to initial demo state? Any custom created courses will be replaced with demo courses.')) {
      localStorage.removeItem('ihdp_courses');
      localStorage.removeItem('ihdp_modules');
      localStorage.removeItem('ihdp_items');
      localStorage.removeItem('ihdp_blocks');
      localStorage.removeItem('ihdp_categories');
      localStorage.removeItem('ihdp_assessments');
      localStorage.removeItem('ihdp_progress');
      window.location.reload();
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.shortTitle && c.shortTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const draftCount = courses.filter((c) => c.status === 'draft').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('navAuthorDashboard')}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Head of Coaches Suite
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Build, structure, and manage federation educational programs across Coaching and Refereeing categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            title="Reset repository to initial demo curriculum"
            className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createCourse')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
            Total Courses
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {courses.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {categories.length} federation categories
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider font-mono">
            Published
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {publishedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Live in Learner Catalog
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-600 uppercase tracking-wider font-mono">
            In Authoring (Drafts)
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-mono">
            {draftCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Editing structure & blocks
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wider font-mono">
            Active Categories
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
            {categories.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Category-agnostic engine
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchCoursesPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {language === 'it' && cat.nameIt ? cat.nameIt : cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">{t('statusPublished')}</option>
            <option value="draft">{t('statusDraft')}</option>
            <option value="archived">{t('statusArchived')}</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            {t('noCoursesFound')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, or create a new course using the button above.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('createCourse')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const category = categories.find((c) => c.id === course.categoryId);
            const categoryName = category 
              ? (language === 'it' && category.nameIt ? category.nameIt : category.name)
              : 'Federation';
            const modCount = modulesCountMap[course.id] || 0;
            const lessonCount = lessonsCountMap[course.id] || 0;

            return (
              <div 
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col overflow-hidden"
              >
                {/* Header card banner */}
                <div className="p-5 border-b border-slate-100 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {categoryName}
                    </span>
                    <StatusBadge status={course.status} />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                        {course.title}
                      </h3>
                      {course.shortTitle && (
                        <span className="font-mono text-xs text-blue-600 font-medium">
                          {course.shortTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center font-mono">
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400 uppercase">Level</div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{course.level}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400 uppercase">Modules</div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">{modCount}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400 uppercase">Lessons</div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">{lessonCount}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPreviewCourse(course.id)}
                      title="Preview course as learner"
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateCourse(course)}
                      title="Duplicate course"
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(course)}
                      title={course.status === 'published' ? 'Unpublish to Draft' : 'Publish Course'}
                      className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                        course.status === 'published'
                          ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {course.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Delete course"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onEditCourse(course.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('editCourse')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base tracking-tight">{t('createCourse')}</h3>
                <p className="text-xs text-slate-400">Step 1: Set high-level course metadata</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('courseTitle')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maestro di Base - Modulo Didattico"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('courseShortTitle')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MDB-2026"
                    value={newShortTitle}
                    onChange={(e) => setNewShortTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('category')} *
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'it' && c.nameIt ? c.nameIt : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('targetLevel')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maestro di Base / Level 1"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('estimatedDuration')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 hours / 3 sessions"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('courseDescription')}
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain who this course is for and the key learning outcomes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Launch Builder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
