import React, { useState } from 'react';
import { ActiveCoursesView } from '../common/IHDPHeader';
import { CourseCatalog } from '../learner/CourseCatalog';
import { CourseOverview } from '../learner/CourseOverview';
import { LessonPlayer } from '../learner/LessonPlayer';
import { AuthorDashboard } from '../author/AuthorDashboard';
import { CourseEditor } from '../author/CourseEditor';
import { EnrollmentManager } from '../author/EnrollmentManager';
import { EngineDocs } from '../docs/EngineDocs';

interface CoursesContentProps {
  activeView: ActiveCoursesView;
  onNavigateView: (view: ActiveCoursesView) => void;
}

export const CoursesContent: React.FC<CoursesContentProps> = ({
  activeView,
  onNavigateView
}) => {
  // Learner navigation state
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Author navigation state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [previewingCourseId, setPreviewingCourseId] = useState<string | null>(null);
  const [previewingLessonId, setPreviewingLessonId] = useState<string | null>(null);

  // Learner Handlers
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveLessonId(null);
  };

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  const handleExitLessonPlayer = () => {
    setActiveLessonId(null);
  };

  const handleBackToCatalog = () => {
    setSelectedCourseId(null);
    setActiveLessonId(null);
  };

  // Author Handlers
  const handleEditCourse = (courseId: string) => {
    setEditingCourseId(courseId);
  };

  const handleBackToAuthorDashboard = () => {
    setEditingCourseId(null);
    setPreviewingCourseId(null);
  };

  const handleAuthorPreview = (courseId: string, lessonId?: string) => {
    setPreviewingCourseId(courseId);
    setPreviewingLessonId(lessonId || null);
  };

  const handleExitPreview = () => {
    setPreviewingCourseId(null);
    setPreviewingLessonId(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* VIEW 1: DOCS & ARCHITECTURE SPEC */}
      {activeView === 'docs' && <EngineDocs />}

      {/* VIEW 2: COURSE ENROLLMENTS & ACCESS MANAGEMENT */}
      {activeView === 'enrollments' && (
        <EnrollmentManager onNavigateToCatalog={() => onNavigateView('catalog')} />
      )}

      {/* VIEW 3: MY COURSES (LEARNER EXPERIENCE - STRICT ENROLLMENT ACCESS) */}
      {activeView === 'catalog' && (
        <>
          {selectedCourseId && activeLessonId ? (
            <LessonPlayer
              courseId={selectedCourseId}
              initialLessonId={activeLessonId}
              onExit={handleExitLessonPlayer}
            />
          ) : selectedCourseId ? (
            <CourseOverview
              courseId={selectedCourseId}
              onBack={handleBackToCatalog}
              onStartLesson={handleStartLesson}
            />
          ) : (
            <CourseCatalog onSelectCourse={handleSelectCourse} />
          )}
        </>
      )}

      {/* VIEW 4: COURSE AUTHORING (HEADS OF COACHES & REFEREES) */}
      {activeView === 'author' && (
        <>
          {previewingCourseId ? (
            <div className="flex flex-col flex-1">
              <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-950 text-white px-2 py-0.5 rounded text-[10px] uppercase">
                    Author Preview Mode
                  </span>
                  <span>
                    Viewing course curriculum exactly as an enrolled learner experiences it.
                  </span>
                </div>
                <button
                  onClick={handleExitPreview}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white text-xs rounded font-medium transition-colors"
                >
                  Exit Preview & Return to Builder
                </button>
              </div>
              <div className="flex-1">
                <LessonPlayer
                  courseId={previewingCourseId}
                  initialLessonId={previewingLessonId || ''}
                  onExit={handleExitPreview}
                />
              </div>
            </div>
          ) : editingCourseId ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <CourseEditor
                courseId={editingCourseId}
                onBack={handleBackToAuthorDashboard}
                onPreview={handleAuthorPreview}
              />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <AuthorDashboard
                onEditCourse={handleEditCourse}
                onPreviewCourse={handleAuthorPreview}
                onManageEnrollments={() => onNavigateView('enrollments')}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
