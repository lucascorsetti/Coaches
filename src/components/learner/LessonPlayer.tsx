import React, { useState, useEffect } from 'react';
import { 
  Course, 
  Module, 
  LearningItem, 
  ContentBlock, 
  Progress 
} from '../../types';
import { 
  courseRepository, 
  progressRepository,
  enrollmentRepository 
} from '../../repositories';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/translations';
import { BlockRenderer } from './BlockRenderer';
import { InteractiveQuiz } from './InteractiveQuiz';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Layers, 
  Menu, 
  X, 
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Lock,
  ShieldAlert,
  Trophy
} from 'lucide-react';

interface LessonPlayerProps {
  courseId: string;
  initialLessonId: string;
  onExit: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  courseId,
  initialLessonId,
  onExit
}) => {
  const { currentUser, isAdministrator, isCourseAuthor } = useAuth();
  const { t } = useTranslation();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleItems, setModuleItems] = useState<Record<string, LearningItem[]>>({});
  const [currentLessonId, setCurrentLessonId] = useState<string>(initialLessonId);
  const [currentLesson, setCurrentLesson] = useState<LearningItem | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load course and modules
  useEffect(() => {
    async function loadCourseStructure() {
      setIsLoading(true);

      // Access verification
      const userHasEnrollment = await enrollmentRepository.checkUserAccess(currentUser.id, courseId);
      const authorized = isAdministrator || isCourseAuthor || userHasEnrollment;
      setHasAccess(authorized);

      if (!authorized) {
        setIsLoading(false);
        return;
      }

      const [c, mods, prog] = await Promise.all([
        courseRepository.getCourseById(courseId),
        courseRepository.getModulesByCourseId(courseId),
        progressRepository.getUserProgress(currentUser.id, courseId)
      ]);
      setCourse(c);
      setModules(mods);
      setProgressList(prog);

      const itemsMap: Record<string, LearningItem[]> = {};
      for (const m of mods) {
        itemsMap[m.id] = await courseRepository.getItemsByModuleId(m.id);
      }
      setModuleItems(itemsMap);

      // If no initialLessonId provided or invalid, pick the first lesson
      if (!initialLessonId && mods.length > 0) {
        const firstItems = itemsMap[mods[0].id] || [];
        if (firstItems.length > 0) {
          setCurrentLessonId(firstItems[0].id);
        }
      }
      setIsLoading(false);
    }
    loadCourseStructure();
  }, [courseId, currentUser.id]);

  // Load current lesson blocks
  useEffect(() => {
    async function loadLessonContent() {
      if (!currentLessonId) return;
      setActiveAssessmentId(null);
      const item = await courseRepository.getItemById(currentLessonId);
      setCurrentLesson(item);

      if (item) {
        const blks = await courseRepository.getBlocksByItemId(item.id);
        setBlocks(blks);

        if (item.type === 'assessment') {
          const assessBlock = blks.find((b) => b.type === 'assessment');
          if (assessBlock) {
            setActiveAssessmentId((assessBlock.data as { assessmentId: string }).assessmentId);
          }
        }
      }
    }
    loadLessonContent();
  }, [currentLessonId]);

  if (hasAccess === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Required</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            You do not have an active enrollment to access this lesson or course content.
          </p>
          <div className="mt-6">
            <button
              onClick={onExit}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Courses</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All ordered lessons across all modules
  const allOrderedLessons: LearningItem[] = modules.flatMap((m) => moduleItems[m.id] || []);
  const currentIndex = allOrderedLessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allOrderedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allOrderedLessons.length - 1 
    ? allOrderedLessons[currentIndex + 1] 
    : null;

  // Completion check
  const completedIds = new Set(
    progressList.filter((p) => p.completed).map((p) => p.learningItemId)
  );
  const isCurrentCompleted = completedIds.has(currentLessonId);

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    const currentModule = modules.find((m) => m.id === currentLesson.moduleId);
    if (!currentModule) return;

    const newCompleted = !isCurrentCompleted;
    const updated: Progress = {
      id: `prog-${currentUser.id}-${currentLesson.id}`,
      userId: currentUser.id,
      courseId,
      moduleId: currentModule.id,
      learningItemId: currentLesson.id,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
      lastActivityAt: new Date().toISOString()
    };

    await progressRepository.setItemProgress(updated);
    const refreshed = await progressRepository.getUserProgress(currentUser.id, courseId);
    setProgressList(refreshed);
  };

  const handleAssessmentPassed = async (score: number) => {
    if (!currentLesson) return;
    const currentModule = modules.find((m) => m.id === currentLesson.moduleId);
    if (!currentModule) return;

    const updated: Progress = {
      id: `prog-${currentUser.id}-${currentLesson.id}`,
      userId: currentUser.id,
      courseId,
      moduleId: currentModule.id,
      learningItemId: currentLesson.id,
      completed: true,
      completedAt: new Date().toISOString(),
      score,
      lastActivityAt: new Date().toISOString()
    };

    await progressRepository.setItemProgress(updated);
    const refreshed = await progressRepository.getUserProgress(currentUser.id, courseId);
    setProgressList(refreshed);
  };

  // Find module for current lesson
  const currentModule = modules.find((m) => m.id === currentLesson?.moduleId);

  // Overall course completion
  const totalCount = allOrderedLessons.length;
  const doneCount = allOrderedLessons.filter((l) => completedIds.has(l.id)).length;
  const isAllComplete = totalCount > 0 && doneCount === totalCount;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-100">
      {/* Top Player Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title={t('exitPlayer')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono truncate">
              <span>{course?.shortTitle || course?.title}</span>
              <span>›</span>
              <span>{currentModule?.title}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {currentLesson?.title || 'Loading lesson...'}
            </h2>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleComplete}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isCurrentCompleted
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isCurrentCompleted ? t('completedLesson') : t('markComplete')}
            </span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="Toggle module syllabus"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Completion Banner if all items completed */}
      {isAllComplete && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 shadow-xs">
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>
            Congratulations! You have completed all lessons and requirements for {course?.title}.
          </span>
        </div>
      )}

      {/* Main Body: Lesson content + Drawer sidebar */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Lesson Content Area */}
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading lesson content...</div>
          ) : (
            <div className="space-y-6">
              {/* If this is an assessment lesson with active quiz */}
              {activeAssessmentId ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <InteractiveQuiz
                    assessmentId={activeAssessmentId}
                    onComplete={(score) => handleAssessmentPassed(score)}
                  />
                </div>
              ) : (
                /* Ordered Content Blocks */
                <div className="space-y-6">
                  {blocks.map((block) => (
                    <BlockRenderer 
                      key={block.id} 
                      block={block} 
                      onAction={() => handleToggleComplete()}
                    />
                  ))}
                </div>
              )}

              {/* Bottom Lesson Navigation */}
              <div className="pt-8 border-t border-slate-200 flex items-center justify-between gap-4">
                {prevLesson ? (
                  <button
                    onClick={() => setCurrentLessonId(prevLesson.id)}
                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous: {prevLesson.title}</span>
                  </button>
                ) : <div />}

                {nextLesson ? (
                  <button
                    onClick={() => setCurrentLessonId(nextLesson.id)}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Next: {nextLesson.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onExit}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish Course & View Summary</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Syllabus Navigation (Desktop & Mobile Drawer) */}
        <aside
          className={`
            fixed md:static inset-y-0 right-0 z-40 w-80 bg-white border-l border-slate-200 flex flex-col transition-transform duration-200
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-slate-700 font-mono">
                {t('courseSyllabus')}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {doneCount} of {totalCount} completed ({totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%)
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {modules.map((mod, idx) => {
              const items = moduleItems[mod.id] || [];
              const modCompleted = items.filter((i) => completedIds.has(i.id)).length;
              const isModDone = items.length > 0 && modCompleted === items.length;

              return (
                <div key={mod.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-2 py-1">
                    <span className="truncate">
                      {idx + 1}. {mod.title}
                    </span>
                    {isModDone && (
                      <span className="text-[10px] font-mono font-semibold text-emerald-600">
                        ✓ Done
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {items.map((it) => {
                      const isCurrent = it.id === currentLessonId;
                      const isDone = completedIds.has(it.id);

                      return (
                        <button
                          key={it.id}
                          onClick={() => {
                            setCurrentLessonId(it.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{it.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
