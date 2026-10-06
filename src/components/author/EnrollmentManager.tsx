import React, { useState, useEffect } from 'react';
import { 
  Course, 
  Category, 
  Enrollment, 
  EnrollmentStatus, 
  User, 
  CourseProgressSummary 
} from '../../types';
import { 
  courseRepository, 
  categoryRepository, 
  enrollmentRepository, 
  progressRepository, 
  userRepository 
} from '../../repositories';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/translations';
import { ProgressBar } from '../common/ProgressBar';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Lock, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  ChevronRight, 
  Award, 
  BookOpen, 
  AlertTriangle,
  X,
  FileCheck2,
  Calendar,
  Layers,
  ShieldCheck,
  UserCheck,
  Hash
} from 'lucide-react';
import { RegistrationSimulator } from './RegistrationSimulator';

interface EnrollmentManagerProps {
  onNavigateToCatalog?: () => void;
}

export const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({
  onNavigateToCatalog
}) => {
  const { currentUser, canManageCourse, isAdministrator } = useAuth();
  const { t, language } = useTranslation();

  const [activeSubTab, setActiveSubTab] = useState<'learners' | 'simulator'>('learners');

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Enrollments & summaries
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [summaries, setSummaries] = useState<Record<string, CourseProgressSummary>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserIdToEnroll, setSelectedUserIdToEnroll] = useState('');
  const [enrollmentNotes, setEnrollmentNotes] = useState('');

  // Drilldown modal
  const [drilldownUser, setDrilldownUser] = useState<User | null>(null);
  const [drilldownSummary, setDrilldownSummary] = useState<CourseProgressSummary | null>(null);

  // Load initial courses and categories
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      const [allCourses, allCats, users] = await Promise.all([
        courseRepository.getAllCourses(),
        categoryRepository.getAllCategories(),
        userRepository.getAllUsers()
      ]);

      // Filter courses this author/admin has permission to manage
      const manageable = allCourses.filter((c) => canManageCourse(c));
      setAvailableCourses(manageable);
      setCategories(allCats);
      setAllUsers(users);

      if (manageable.length > 0) {
        setSelectedCourseId(manageable[0].id);
      }
      setIsLoading(false);
    }
    loadInitial();
  }, [currentUser.id]);

  // Load enrollments for selected course
  const loadCourseEnrollments = async (courseId: string) => {
    if (!courseId) return;
    const courseEnrollments = await enrollmentRepository.getEnrollmentsByCourse(courseId);
    setEnrollments(courseEnrollments);

    const sumMap: Record<string, CourseProgressSummary> = {};
    for (const enr of courseEnrollments) {
      const summary = await progressRepository.getCourseSummary(enr.userId, courseId);
      if (summary) {
        sumMap[enr.userId] = summary;
      }
    }
    setSummaries(sumMap);
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseEnrollments(selectedCourseId);
    }
  }, [selectedCourseId]);

  const selectedCourse = availableCourses.find((c) => c.id === selectedCourseId);
  const selectedCategory = categories.find((c) => c.id === selectedCourse?.categoryId);

  // Available learners who are NOT yet enrolled in this course
  const enrolledUserIds = new Set(enrollments.map((e) => e.userId));
  const candidateUsers = allUsers.filter(
    (u) => !enrolledUserIds.has(u.id) && u.role === 'learner'
  );

  const handleEnrollUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserIdToEnroll || !selectedCourseId) return;

    await enrollmentRepository.createEnrollment({
      userId: selectedUserIdToEnroll,
      courseId: selectedCourseId,
      status: 'active',
      assignedBy: currentUser.name,
      notes: enrollmentNotes.trim() || 'Federation official enrollment'
    });

    setShowAddModal(false);
    setSelectedUserIdToEnroll('');
    setEnrollmentNotes('');
    await loadCourseEnrollments(selectedCourseId);
  };

  const handleToggleStatus = async (enrollment: Enrollment) => {
    const nextStatus: EnrollmentStatus = 
      enrollment.status === 'suspended' ? 'active' : 'suspended';
    await enrollmentRepository.updateEnrollmentStatus(enrollment.id, nextStatus);
    await loadCourseEnrollments(selectedCourseId);
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (window.confirm('Are you sure you want to revoke this learner enrollment and access?')) {
      await enrollmentRepository.deleteEnrollment(enrollmentId);
      await loadCourseEnrollments(selectedCourseId);
    }
  };

  const handleOpenDrilldown = async (user: User) => {
    setDrilldownUser(user);
    const summary = await progressRepository.getCourseSummary(user.id, selectedCourseId);
    setDrilldownSummary(summary);
  };

  // Filtered enrolled learners
  const filteredEnrollments = enrollments.filter((enr) => {
    const user = allUsers.find((u) => u.id === enr.userId);
    const matchesStatus = statusFilter === 'all' || enr.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      (user && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const activeCount = enrollments.filter((e) => e.status === 'active').length;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const suspendedCount = enrollments.filter((e) => e.status === 'suspended').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Course Enrollments & Learner Management
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              Access Control
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Authorize coaches and referees, monitor lesson completion, and review assessment scores.
          </p>
        </div>

        {/* Course Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Select Course:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.level}) — Code {c.courseCode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Navigation: Enrolled Learners vs. External Registration Simulator */}
      <div className="flex items-center space-x-2 border-b border-slate-200 bg-white px-3 py-1.5 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveSubTab('learners')}
          className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'learners'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Enrolled Learners & Progress ({enrollments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'simulator'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-amber-400" />
          <span>Product Code Matching Simulator</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
            Demo Test
          </span>
        </button>
      </div>

      {/* TAB CONTENT: REGISTRATION SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <RegistrationSimulator
          onNavigateToCatalog={onNavigateToCatalog}
          onEnrollmentChanged={() => {
            if (selectedCourseId) {
              loadCourseEnrollments(selectedCourseId);
            }
          }}
        />
      )}

      {/* TAB CONTENT: LEARNERS TABLE & PROGRESS */}
      {activeSubTab === 'learners' && (
        <>
          {/* Selected Course Overview Bar */}
          {selectedCourse && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    {selectedCategory?.name || 'Federation'}
                  </span>
                  <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedCourse.level}
                  </span>
                  <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Access: Private (Enrollment Required)
                  </span>
                  <span 
                    className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                    title="Internal Course Product Code used for registration/payment matching"
                  >
                    Product Code: {selectedCourse.courseCode}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedCourse.title}
                </h2>
                <div className="text-xs text-slate-500">
                  Responsible Author: <span className="font-medium text-slate-700">{selectedCourse.authors.join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-center font-mono">
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Enrolled</div>
                <div className="text-sm font-bold text-slate-800">{enrollments.length}</div>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-emerald-600 uppercase">Completed</div>
                <div className="text-sm font-bold text-emerald-700">{completedCount}</div>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-blue-600 uppercase">Active</div>
                <div className="text-sm font-bold text-blue-700">{activeCount}</div>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Learner</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search enrolled learners by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All ({enrollments.length})</option>
            <option value="active">Active ({activeCount})</option>
            <option value="completed">Completed ({completedCount})</option>
            <option value="suspended">Suspended ({suspendedCount})</option>
          </select>
        </div>
      </div>

      {/* Enrolled Learners Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No learners match this criteria</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Enroll Learner" above to grant course access to registered members.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4 w-48">Course Progress</th>
                  <th className="py-3 px-4">Assigned By</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.map((enr) => {
                  const user = allUsers.find((u) => u.id === enr.userId);
                  const summary = summaries[enr.userId];
                  const percentage = summary?.percentage || 0;
                  const isDone = summary?.status === 'completed' || enr.status === 'completed';

                  return (
                    <tr 
                      key={enr.id} 
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Learner Info */}
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => user && handleOpenDrilldown(user)}
                          className="cursor-pointer group"
                        >
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {user?.name || enr.userId}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {user?.email}
                          </div>
                          {enr.notes && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5">
                              {enr.notes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          enr.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : enr.status === 'active'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {enr.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {enr.status === 'suspended' && <PauseCircle className="w-3 h-3" />}
                          <span>{enr.status}</span>
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => user && handleOpenDrilldown(user)}
                          className="cursor-pointer group"
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono font-semibold text-slate-800">
                              {percentage}%
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {summary ? `${summary.completedLessons}/${summary.totalLessons}` : '0/0'}
                            </span>
                          </div>
                          <ProgressBar percentage={percentage} height="h-2" />
                        </div>
                      </td>

                      {/* Assigned By */}
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <div>{enr.assignedBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {enr.enrolledAt ? enr.enrolledAt.split('T')[0] : ''}
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {summary?.lastActivityAt 
                          ? new Date(summary.lastActivityAt).toLocaleDateString() 
                          : 'Not started yet'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => user && handleOpenDrilldown(user)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                            title="Drill down into module & quiz results"
                          >
                            Progress
                          </button>

                          <button
                            onClick={() => handleToggleStatus(enr)}
                            className={`p-1 rounded text-slate-400 hover:text-slate-800 transition-colors ${
                              enr.status === 'suspended' ? 'text-amber-600' : ''
                            }`}
                            title={enr.status === 'suspended' ? 'Reactivate access' : 'Suspend access'}
                          >
                            {enr.status === 'suspended' ? (
                              <PlayCircle className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <PauseCircle className="w-4 h-4 text-amber-500" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteEnrollment(enr.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Revoke enrollment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / ENROLL LEARNER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-tight">Enroll Learner into Course</h3>
                <p className="text-xs text-slate-400">{selectedCourse?.title}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEnrollUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Registered Member / Learner *
                </label>
                {candidateUsers.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    All candidate learners in the system are already enrolled in this course.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedUserIdToEnroll}
                    onChange={(e) => setSelectedUserIdToEnroll(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {candidateUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrollment Notes / Cohort Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026 Spring National Accreditation Cohort"
                  value={enrollmentNotes}
                  onChange={(e) => setEnrollmentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUserIdToEnroll}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Grant Access & Enroll</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LEARNER PROGRESS DRILLDOWN */}
      {drilldownUser && drilldownSummary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base tracking-tight">{drilldownUser.name}</h3>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 bg-blue-600 text-white rounded">
                    Learner Progress
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCourse?.title}</p>
              </div>
              <button
                onClick={() => setDrilldownUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Overall Summary KPI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Overall Course Completion</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                    {drilldownSummary.percentage}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {drilldownSummary.completedLessons} of {drilldownSummary.totalLessons} lessons completed
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase px-2.5 py-1 rounded ${
                    drilldownSummary.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {drilldownSummary.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{drilldownSummary.status}</span>
                  </span>
                </div>
              </div>

              {/* Module-by-Module Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Module Progression
                </h4>

                <div className="space-y-2">
                  {drilldownSummary.moduleProgress.map((mod, idx) => (
                    <div
                      key={mod.moduleId}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                          mod.isCompleted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {mod.isCompleted ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{mod.moduleTitle}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {mod.completedItems} / {mod.totalItems} items completed ({mod.percentage}%)
                          </div>
                        </div>
                      </div>

                      <div className="w-28">
                        <ProgressBar percentage={mod.percentage} height="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessments Results */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Assessment Evaluations & Scores
                </h4>

                {drilldownSummary.assessmentResults.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                    No formal graded evaluations in this course.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {drilldownSummary.assessmentResults.map((assess) => (
                      <div
                        key={assess.assessmentId}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{assess.assessmentTitle}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Attempts taken: {assess.attemptsCount}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-slate-800">
                            {assess.bestScore > 0 ? `${assess.bestScore}%` : 'Not attempted'}
                          </span>
                          <span className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            assess.passed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {assess.passed ? 'Passed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setDrilldownUser(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
