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
  progressRepository 
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
  BookOpen
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
  const { currentUser } = useAuth();
  const { t } = useTranslation();

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
    }
    loadCourseStructure();
  }, [courseId, currentUser.id]);

  // Load current lesson blocks
  useEffect(() => {
    async function loadLessonContent() {
      setIsLoading(true);
      setActiveAssessmentId(null);
      const item = await courseRepository.getItemById(currentLessonId);
      setCurrentLesson(item);

      if (item) {
        const blks = await courseRepository.getBlocksByItemId(item.id);
        setBlocks(blks);

        // If the item itself is an assessment, check if there's an embedded assessment block
        if (item.type === 'assessment') {
          const assessBlock = blks.find((b) => b.type === 'assessment');
          if (assessBlock) {
            setActiveAssessmentId((assessBlock.data as { assessmentId: string }).assessmentId);
          }
        }
      }
      setIsLoading(false);
    }
    loadLessonContent();
  }, [currentLessonId]);

  // All ordered lessons across all modules
  const allOrderedLessons: LearningItem[] = modules.flatMap((m) => moduleItems[m.id] || []);
  const currentIndex = allOrderedLessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allOrderedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allOrderedLessons.length - 1 
    ? allOrderedLessons[currentIndex + 1] 
    : null;

  // Completion check
  const completedIds = new Set(
    progressList.filter((p) => p.status === 'completed').map((p) => p.learningItemId)
  );
  const isCurrentCompleted = completedIds.has(currentLessonId);

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    const currentModule = modules.find((m) => m.id === currentLesson.moduleId);
    if (!currentModule) return;

    const newStatus = isCurrentCompleted ? 'in-progress' : 'completed';
    const updated: Progress = {
      userId: currentUser.id,
      courseId,
      moduleId: currentModule.id,
      learningItemId: currentLesson.id,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
    };

    await progressRepository.setItemProgress(updated);
    const refreshed = await progressRepository.getUserProgress(currentUser.id, courseId);
    setProgressList(refreshed);

    // If marked as completed and there's a next lesson, prompt advance
    if (newStatus === 'completed' && nextLesson) {
      // Allow user to click next or proceed
    }
  };

  const handleAssessmentPassed = async (score: number) => {
    if (!currentLesson) return;
    const currentModule = modules.find((m) => m.id === currentLesson.moduleId);
    if (!currentModule) return;

    const updated: Progress = {
      userId: currentUser.id,
      courseId,
      moduleId: currentModule.id,
      learningItemId: currentLesson.id,
      status: 'completed',
      completedAt: new Date().toISOString(),
      score
    };

    await progressRepository.setItemProgress(updated);
    const refreshed = await progressRepository.getUserProgress(currentUser.id, courseId);
    setProgressList(refreshed);
  };

  // Find module for current lesson
  const currentModule = modules.find((m) => m.id === currentLesson?.moduleId);

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
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 lg:hidden"
            title="Toggle Syllabus"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left Lesson Syllabus Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 lg:static lg:z-0 w-80 bg-white border-r border-slate-200 p-4 overflow-y-auto transform transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 lg:hidden">
            <span className="font-bold text-xs uppercase tracking-wide text-slate-700">Course Syllabus</span>
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400">✕</button>
          </div>

          <div className="space-y-4 pt-2">
            {modules.map((m, mIdx) => {
              const items = moduleItems[m.id] || [];

              return (
                <div key={m.id} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Module {mIdx + 1}: {m.title}
                  </div>

                  <div className="space-y-1">
                    {items.map((item) => {
                      const isSelected = item.id === currentLessonId;
                      const isComplete = completedIds.has(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentLessonId(item.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isComplete ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{item.title}</span>
                          </div>

                          {item.type === 'assessment' && (
                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Main Reading / Learning Stage */}
        <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading lesson content...
            </div>
          ) : activeAssessmentId ? (
            <InteractiveQuiz
              assessmentId={activeAssessmentId}
              onAssessmentPassed={handleAssessmentPassed}
              onClose={() => {
                if (nextLesson) setCurrentLessonId(nextLesson.id);
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-4">
              {/* Ordered Content Blocks Stream */}
              {blocks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs italic">
                  No content blocks added to this lesson yet.
                </div>
              ) : (
                blocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    onLaunchAssessment={(id) => setActiveAssessmentId(id)}
                    onVideoComplete={handleToggleComplete}
                  />
                ))
              )}

              {/* Bottom Step-through Footer */}
              <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  {prevLesson ? (
                    <button
                      onClick={() => setCurrentLessonId(prevLesson.id)}
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{t('previousLesson')}: {prevLesson.title}</span>
                    </button>
                  ) : (
                    <span />
                  )}
                </div>

                <div>
                  {nextLesson ? (
                    <button
                      onClick={() => {
                        if (!isCurrentCompleted) {
                          handleToggleComplete();
                        }
                        setCurrentLessonId(nextLesson.id);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <span>{t('nextLesson')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onExit}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('courseCompleted')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
