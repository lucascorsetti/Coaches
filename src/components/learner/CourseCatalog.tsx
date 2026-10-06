import React, { useState, useEffect } from 'react';
import { Course, Category, Enrollment, CourseProgressSummary } from '../../types';
import { 
  courseRepository, 
  categoryRepository, 
  enrollmentRepository, 
  progressRepository 
} from '../../repositories';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/translations';
import { ProgressBar } from '../common/ProgressBar';
import { 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Lock,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Calendar,
  UserCheck
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse }) => {
  const { currentUser, isAdministrator, isCourseAuthor } = useAuth();
  const { t, language } = useTranslation();

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [summaries, setSummaries] = useState<Record<string, CourseProgressSummary>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Admin override to inspect all courses if needed
  const [adminViewAll, setAdminViewAll] = useState(false);
  const [allSystemCourses, setAllSystemCourses] = useState<Course[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    const [allCats, userEnrollments, allCourses] = await Promise.all([
      categoryRepository.getAllCategories(),
      enrollmentRepository.getEnrollmentsByUser(currentUser.id),
      courseRepository.getAllCourses()
    ]);

    setCategories(allCats);
    setEnrollments(userEnrollments);
    setAllSystemCourses(allCourses);

    // Filter to ONLY courses this user has access to
    const accessibleCourseIds = new Set(
      userEnrollments
        .filter((e) => e.status === 'active' || e.status === 'completed')
        .map((e) => e.courseId)
    );

    const activeCourses = allCourses.filter((c) => accessibleCourseIds.has(c.id));
    setEnrolledCourses(activeCourses);

    // Calculate progress summary for each accessible course
    const summaryMap: Record<string, CourseProgressSummary> = {};
    for (const c of activeCourses) {
      const summary = await progressRepository.getCourseSummary(currentUser.id, c.id);
      if (summary) {
        summaryMap[c.id] = summary;
      }
    }
    setSummaries(summaryMap);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const displayedCourses = adminViewAll ? allSystemCourses : enrolledCourses;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('navMyLearning')}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Private Education Portal
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Access to federation education courses is granted upon enrollment confirmation.
          </p>
        </div>

        {/* Admin/Author shortcut to toggle view or view all courses */}
        {(isAdministrator || isCourseAuthor) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminViewAll(!adminViewAll)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span>{adminViewAll ? 'Switch to My Assigned Courses' : 'Admin: View All Courses'}</span>
            </button>
          </div>
        )}
      </div>

      {/* User Persona Context Banner */}
      <div className="my-6 p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">{currentUser.name}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200">
                {currentUser.role}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {currentUser.email} • {enrolledCourses.length} active enrollment(s)
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Access Mode: <span className="text-slate-800 font-semibold">Strict Enrollment Only</span>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-medium">
          Loading assigned courses...
        </div>
      ) : displayedCourses.length === 0 ? (
        /* ZERO ENROLLMENTS EMPTY STATE (e.g. Learner C) */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-xs my-8">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            No courses assigned yet.
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            You are not currently enrolled in any courses in the FISG Italia Hockey Development Program.
            Course enrollment is managed privately by federation administrators and heads of coaching.
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>How do I get course access?</span>
            </div>
            <p>
              1. Register for an official FISG coach or referee clinic.
            </p>
            <p>
              2. Your federation course administrator will approve your enrollment.
            </p>
            <p>
              3. Upon authorization, your course will appear immediately on this page.
            </p>
          </div>

          <div className="mt-6 text-xs text-slate-400 font-mono">
            Contact: <span className="text-slate-600">corsi@fisg.it</span>
          </div>
        </div>
      ) : (
        /* ENROLLED COURSES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((course) => {
            const category = categories.find((c) => c.id === course.categoryId);
            const categoryName = category
              ? (language === 'it' && category.nameIt ? category.nameIt : category.name)
              : 'Federation';
            const summary = summaries[course.id];
            const enrollment = enrollments.find((e) => e.courseId === course.id);

            const percentage = summary?.percentage || 0;
            const isCompleted = summary?.status === 'completed' || enrollment?.status === 'completed';

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col overflow-hidden group"
              >
                {/* Course Image & Banner */}
                {course.thumbnail && (
                  <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs border border-white/20">
                        {categoryName}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('courseCompleted')}</span>
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-white text-xs font-semibold drop-shadow-xs line-clamp-1">
                        {course.level}
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {!course.thumbnail && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {categoryName}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('courseCompleted')}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed flex-1">
                    {course.description}
                  </p>

                  {/* Progress Gauge */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600">
                        {isCompleted ? t('courseCompleted') : `${percentage}% ${t('completionRate')}`}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {summary ? `${summary.completedLessons} / ${summary.totalLessons} lessons` : ''}
                      </span>
                    </div>
                    <ProgressBar percentage={percentage} height="h-2" />
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{course.estimatedDuration}</span>
                    </span>
                    {enrollment?.enrolledAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Enrolled {enrollment.enrolledAt.split('T')[0]}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    {isCompleted ? 'Review Syllabus & Materials' : percentage > 0 ? 'Continue where you left off' : 'Start Course'}
                  </span>
                  
                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{isCompleted ? 'Review' : percentage > 0 ? t('continueCourse') : t('startCourse')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
