import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './i18n/translations';
import { Navbar, ActiveView } from './components/common/Navbar';
import { CourseCatalog } from './components/learner/CourseCatalog';
import { CourseOverview } from './components/learner/CourseOverview';
import { LessonPlayer } from './components/learner/LessonPlayer';
import { AuthorDashboard } from './components/author/AuthorDashboard';
import { CourseEditor } from './components/author/CourseEditor';
import { EnrollmentManager } from './components/author/EnrollmentManager';
import { EngineDocs } from './components/docs/EngineDocs';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  // Top level active tab: 'catalog' | 'enrollments' | 'author' | 'docs'
  const [activeView, setActiveView] = useState<ActiveView>('catalog');

  // Learner navigation state
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Author navigation state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [previewingCourseId, setPreviewingCourseId] = useState<string | null>(null);
  const [previewingLessonId, setPreviewingLessonId] = useState<string | null>(null);

  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    // Reset drill-down views when switching top-level tabs
    setSelectedCourseId(null);
    setActiveLessonId(null);
    setEditingCourseId(null);
    setPreviewingCourseId(null);
    setPreviewingLessonId(null);
  };

  // Learner Actions
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

  // Author Actions
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar activeView={activeView} onNavigate={handleNavigate} />

      <main className="flex-1 flex flex-col">
        {/* VIEW 1: DOCS & ARCHITECTURE */}
        {activeView === 'docs' && <EngineDocs />}

        {/* VIEW 2: COURSE ENROLLMENTS & LEARNER MANAGEMENT */}
        {activeView === 'enrollments' && <EnrollmentManager />}

        {/* VIEW 3: MY COURSES & LEARNER EXPERIENCE (STRICT ENROLLMENT ACCESS) */}
        {activeView === 'catalog' && (
          <>
            {/* If in Lesson Player */}
            {selectedCourseId && activeLessonId ? (
              <LessonPlayer
                courseId={selectedCourseId}
                initialLessonId={activeLessonId}
                onExit={handleExitLessonPlayer}
              />
            ) : selectedCourseId ? (
              /* If in Course Overview (Syllabus & Progress) */
              <CourseOverview
                courseId={selectedCourseId}
                onBack={handleBackToCatalog}
                onStartLesson={handleStartLesson}
              />
            ) : (
              /* My Courses Learner Dashboard */
              <CourseCatalog onSelectCourse={handleSelectCourse} />
            )}
          </>
        )}

        {/* VIEW 4: COURSE AUTHORING (HEAD OF COACHES / REFEREES) */}
        {activeView === 'author' && (
          <>
            {/* If author launched learner preview */}
            {previewingCourseId ? (
              <div className="flex flex-col flex-1">
                <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-slate-950 text-white px-2 py-0.5 rounded text-[10px] uppercase">
                      Author Preview Mode
                    </span>
                    <span>
                      Viewing course curriculum exactly as a learner would experience it.
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
              /* Course Editor (Modules, Lessons, Content Blocks, Assessment, Access) */
              <CourseEditor
                courseId={editingCourseId}
                onBack={handleBackToAuthorDashboard}
                onPreview={handleAuthorPreview}
              />
            ) : (
              /* Author Dashboard (Assigned courses, stats, create course modal) */
              <AuthorDashboard
                onEditCourse={handleEditCourse}
                onPreviewCourse={(cId) => handleAuthorPreview(cId)}
                onManageEnrollments={(cId) => handleNavigate('enrollments')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
