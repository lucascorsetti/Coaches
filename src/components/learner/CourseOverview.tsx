import React, { useState, useEffect } from 'react';
import { Course, Module, LearningItem, Progress, Category } from '../../types';
import { 
  courseRepository, 
  categoryRepository, 
  progressRepository 
} from '../../repositories';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/translations';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Clock, 
  Layers, 
  ChevronRight, 
  Award,
  BookOpen,
  Compass,
  FileCheck2
} from 'lucide-react';

interface CourseOverviewProps {
  courseId: string;
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({
  courseId,
  onBack,
  onStartLesson
}) => {
  const { currentUser } = useAuth();
  const { t, language } = useTranslation();

  const [course, setCourse] = useState<Course | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleItems, setModuleItems] = useState<Record<string, LearningItem[]>>({});
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const c = await courseRepository.getCourseById(courseId);
      setCourse(c);

      if (c) {
        const [cat, mods, prog] = await Promise.all([
          categoryRepository.getCategoryById(c.categoryId),
          courseRepository.getModulesByCourseId(c.id),
          progressRepository.getUserProgress(currentUser.id, c.id)
        ]);
        setCategory(cat);
        setModules(mods);
        setProgressList(prog);

        const itemsMap: Record<string, LearningItem[]> = {};
        for (const mod of mods) {
          const items = await courseRepository.getItemsByModuleId(mod.id);
          itemsMap[mod.id] = items;
        }
        setModuleItems(itemsMap);
      }
      setIsLoading(false);
    }
    loadData();
  }, [courseId, currentUser.id]);

  if (isLoading || !course) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        Loading course overview...
      </div>
    );
  }

  // Calculate total lessons and completed lessons
  const allItems: LearningItem[] = Object.values(moduleItems).flat();
  const totalItemsCount = allItems.length;
  const completedItemIds = new Set(
    progressList.filter((p) => p.status === 'completed').map((p) => p.learningItemId)
  );
  const completedCount = allItems.filter((i) => completedItemIds.has(i.id)).length;
  const progressPercent = totalItemsCount > 0 
    ? Math.round((completedCount / totalItemsCount) * 100) 
    : 0;

  // Find the next uncompleted lesson
  const nextLesson = allItems.find((i) => !completedItemIds.has(i.id)) || allItems[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('allCategories')}</span>
        </button>
      </div>

      {/* Main Course Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {course.level}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {category ? (language === 'it' && category.nameIt ? category.nameIt : category.name) : 'Coaching'}
              </span>
            </div>
            <StatusBadge status={course.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {course.title}
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Duration: <strong className="text-slate-800">{course.estimatedDuration}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Structure: <strong className="text-slate-800">{modules.length} modules, {totalItemsCount} lessons</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Curriculum: <strong className="text-slate-800">{course.authors.join(', ')}</strong>
            </span>
          </div>
        </div>

        {/* Clear Learner Guidance Hero Banner: "Where am I? What do I do next?" */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-[260px]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Your Learning Path
              </span>
            </div>

            <div className="max-w-md">
              <ProgressBar
                percentage={progressPercent}
                label={`${completedCount} of ${totalItemsCount} items completed`}
                size="md"
                showPercentText={true}
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {progressPercent === 100 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All modules completed! Ready for accreditation review.
                </span>
              ) : nextLesson ? (
                <span>
                  Next Action: <strong className="text-slate-900">{nextLesson.title}</strong>
                </span>
              ) : null}
            </div>
          </div>

          {nextLesson && (
            <button
              onClick={() => onStartLesson(nextLesson.id)}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-2 active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{completedCount > 0 ? t('continueCourse') : t('startCourse')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Course Syllabus / Modules Accordion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span>{t('courseSyllabus')}</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {modules.length} Modules Total
          </span>
        </div>

        <div className="space-y-4">
          {modules.map((mod, modIdx) => {
            const items = moduleItems[mod.id] || [];
            const modCompletedCount = items.filter((i) => completedItemIds.has(i.id)).length;
            const isModComplete = items.length > 0 && modCompletedCount === items.length;

            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                {/* Module Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-700">
                        Module {modIdx + 1}
                      </span>
                      {isModComplete && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-slate-500">{mod.description}</p>
                    )}
                  </div>

                  <div className="text-xs font-mono text-slate-500">
                    {modCompletedCount}/{items.length} Completed
                  </div>
                </div>

                {/* Module Lessons List */}
                <div className="divide-y divide-slate-100">
                  {items.map((item, itemIdx) => {
                    const isCompleted = completedItemIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => onStartLesson(item.id)}
                        className="p-4 sm:px-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-blue-500 transition-colors" />
                          )}

                          <div className="truncate">
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              {item.type.toUpperCase()} • {item.estimatedDuration}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.type === 'assessment' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Evaluation
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
