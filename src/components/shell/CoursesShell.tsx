import React, { useState, useEffect } from 'react';
import { IHDPHeader, ActiveCoursesView } from '../common/IHDPHeader';
import { CoursesContent } from './CoursesContent';
import { BRANDING_CONFIG, getAppDocumentTitle } from '../../config/branding';

export const CoursesShell: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveCoursesView>('catalog');

  // Synchronize browser document title based on view
  useEffect(() => {
    const viewNames: Record<ActiveCoursesView, string> = {
      catalog: 'My Courses',
      enrollments: 'Course Enrollments',
      author: 'Course Authoring',
      docs: 'Engine Specs'
    };
    document.title = getAppDocumentTitle(viewNames[activeView]);
  }, [activeView]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Official IHDP Common Header & App Switcher */}
      <IHDPHeader
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
      />

      {/* Main Courses Engine Workspace */}
      <main className="flex-1 flex flex-col">
        <CoursesContent
          activeView={activeView}
          onNavigateView={(view) => setActiveView(view)}
        />
      </main>
    </div>
  );
};
