import React, { useState, useEffect } from 'react';
import { Course, Category, Progress } from '../../types';
import { courseRepository, categoryRepository, progressRepository } from '../../repositories';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/translations';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { 
  Search, 
  Clock, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Award,
  Filter,
  CheckCircle2,
  Play
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse }) => {
  const { currentUser } = useAuth();
  const { t, language } = useTranslation();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [progressList, setProgressList] = useState<Record<string, Progress[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [allCourses, allCategories] = await Promise.all([
        courseRepository.getAllCourses(),
        categoryRepository.getAllCategories()
      ]);

      // Only published courses for learners (or all courses for authors/admins)
      const visibleCourses = currentUser.role === 'learner' 
        ? allCourses.filter((c) => c.status === 'published')
        : allCourses;

      setCourses(visibleCourses);
      setCategories(allCategories);

      // Load progress for each course
      const progMap: Record<string, Progress[]> = {};
      for (const c of visibleCourses) {
        const p = await progressRepository.getUserProgress(currentUser.id, c.id);
        progMap[c.id] = p;
      }
      setProgressList(progMap);
      setIsLoading(false);
    }
    loadData();
  }, [currentUser.id, currentUser.role]);

  // Unique levels
  const levels = ['all', ...Array.from(new Set(courses.map((c) => c.level)))];

  // Filtering
  const filteredCourses = courses.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.categoryId === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.level.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              FISG Academy
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Federation Course Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Accreditation & Coaching Pathways
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Federation education curriculum across coaching, refereeing, and athletic preparation. Select a course to review syllabus, study lessons, and complete evaluation tests.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {language === 'it' && cat.nameIt ? cat.nameIt : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Level Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder={t('searchCoursesPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-mono">Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 text-xs focus:outline-none focus:border-blue-500"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === 'all' ? t('allLevels') : lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => {
          const category = categories.find((cat) => cat.id === course.categoryId);
          const progress = progressList[course.id] || [];
          const completedCount = progress.filter((p) => p.status === 'completed').length;
          // Approximate completion percentage
          const percent = completedCount > 0 ? Math.min(100, Math.round((completedCount / 4) * 100)) : 0;

          return (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Course Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={course.status} size="sm" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{category ? (language === 'it' && category.nameIt ? category.nameIt : category.name) : 'General'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.estimatedDuration}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Progress & Action */}
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                {percent > 0 ? (
                  <ProgressBar
                    percentage={percent}
                    label="Progress"
                    size="sm"
                    showPercentText={true}
                  />
                ) : (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Not enrolled yet</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {course.authors[0] || 'FISG Committee'}
                  </span>
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>{percent > 0 ? t('continueCourse') : t('startCourse')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm text-slate-600 font-medium">{t('noCoursesFound')}</p>
        </div>
      )}
    </div>
  );
};
