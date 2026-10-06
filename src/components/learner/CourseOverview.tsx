import React, { useState, useEffect } from 'react';
import { Course, Module, LearningItem, Progress, Category, Enrollment } from '../../types';
import { 
  courseRepository, 
  categoryRepository, 
  progressRepository,
  enrollmentRepository 
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
  FileCheck2,
  ShieldAlert,
  UserCheck
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
  const { currentUser, isAdministrator, isCourseAuthor } = useAuth();
  const { t, language } = useTranslation();

  const [course, setCourse] = useState<Course | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleItems, setModuleItems] = useState<Record<string, LearningItem[]>>({});
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Access verification at route level
      const userHasEnrollment = await enrollmentRepository.checkUserAccess(currentUser.id, courseId);
      const enr = await enrollmentRepository.getEnrollment(currentUser.id, courseId);
      setEnrollment(enr);

      const authorized = isAdministrator || isCourseAuthor || userHasEnrollment;
      setHasAccess(authorized);

      if (!authorized) {
        setIsLoading(false);
        return;
      }

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

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Verifying course authorization and loading syllabus...
      </div>
    );
  }

  // --- ACCESS REQUIRED ERROR VIEW ---
  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Access Required
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            You are not currently enrolled in this course. Participation in FISG educational modules requires approved registration.
          </p>

          <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Permission Details:</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              User: {currentUser.name} ({currentUser.email})
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Requested Course ID: {courseId}
            </div>
            <p className="text-slate-600 pt-1 border-t border-slate-200">
              Please contact the course administrator if you believe you should have access to this module.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Courses</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Course not found.
      </div>
    );
  }

  // Calculate progress
  const allItems: LearningItem[] = Object.values(moduleItems).flat();
  const totalItemsCount = allItems.length;
  const completedItemIds = new Set(
    progressList.filter((p) => p.completed).map((p) => p.learningItemId)
  );
  const completedCount = allItems.filter((i) => completedItemIds.has(i.id)).length;
  const progressPercent = totalItemsCount > 0 
    ? Math.round((completedCount / totalItemsCount) * 100) 
    : 0;

  // Next lesson
  const nextLesson = allItems.find((i) => !completedItemIds.has(i.id)) || allItems[0];
  const isCourseFinished = progressPercent === 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Courses</span>
        </button>
      </div>

      {/* Course Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {category?.name || 'Federation'}
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {course.level}
              </span>
              {isCourseFinished && (
                <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{t('courseCompleted')}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {course.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{course.estimatedDuration}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>{modules.length} {t('modulesCount')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>{totalItemsCount} {t('lessonsCount')}</span>
              </span>
              {enrollment && (
                <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Authorized by {enrollment.assignedBy}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Card with Progress Gauge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full md:w-80 shrink-0 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Course Progress</span>
                <span className="font-mono text-slate-900">{progressPercent}%</span>
              </div>
              <ProgressBar percentage={progressPercent} height="h-2.5" />
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                {completedCount} of {totalItemsCount} lessons completed
              </div>
            </div>

            {nextLesson && (
              <button
                onClick={() => onStartLesson(nextLesson.id)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {completedCount === 0 
                    ? t('startCourse') 
                    : isCourseFinished 
                    ? 'Review Course' 
                    : t('continueCourse')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Syllabus / Module Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>{t('courseSyllabus')}</span>
        </h2>

        <div className="space-y-4">
          {modules.map((module, mIdx) => {
            const items = moduleItems[module.id] || [];
            const modCompleted = items.filter((i) => completedItemIds.has(i.id)).length;
            const isModuleDone = items.length > 0 && modCompleted === items.length;

            return (
              <div
                key={module.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Module Header */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isModuleDone 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isModuleDone ? '✓' : mIdx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-500">
                    {modCompleted} / {items.length} completed
                  </div>
                </div>

                {/* Module Items List */}
                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const isDone = completedItemIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => onStartLesson(item.id)}
                        className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-blue-500" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          {item.estimatedDuration && <span>{item.estimatedDuration}</span>}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
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
