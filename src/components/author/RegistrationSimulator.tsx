import React, { useState, useEffect } from 'react';
import { 
  User, 
  Course, 
  CourseRegistration, 
  Enrollment 
} from '../../types';
import { 
  courseRepository, 
  userRepository, 
  registrationService, 
  enrollmentRepository 
} from '../../repositories';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  ArrowRight, 
  Layers, 
  Database, 
  RotateCcw, 
  UserCheck, 
  Hash, 
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface RegistrationSimulatorProps {
  onNavigateToCatalog?: () => void;
  onEnrollmentChanged?: () => void;
}

export const RegistrationSimulator: React.FC<RegistrationSimulatorProps> = ({
  onNavigateToCatalog,
  onEnrollmentChanged
}) => {
  const { allUsers, switchUser } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [userEnrollmentsCount, setUserEnrollmentsCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedUserId, setSelectedUserId] = useState<string>('user-learner-c'); // Default: Davide Conti (0 initial courses)
  const [courseCodeInput, setCourseCodeInput] = useState<string>('10001');
  const [sourceInput, setSourceInput] = useState<string>('external_registration_portal');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulation Feedback
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    courseCode: string;
    resolvedCourse?: Course | null;
    enrollment?: Enrollment;
    registration: CourseRegistration;
    message: string;
    targetUser?: User | null;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [allCourses, allRegs] = await Promise.all([
      courseRepository.getAllCourses(),
      registrationService.getAllRegistrations()
    ]);
    setCourses(allCourses);
    setRegistrations(allRegs);

    // Compute enrollment counts per user
    const counts: Record<string, number> = {};
    for (const u of allUsers) {
      const enrs = await enrollmentRepository.getEnrollmentsByUser(u.id);
      counts[u.id] = enrs.filter((e) => e.status === 'active' || e.status === 'completed').length;
    }
    setUserEnrollmentsCount(counts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [allUsers]);

  const runSimulation = async (codeToUse: string, userToUse?: string) => {
    const code = codeToUse.trim();
    const userId = userToUse || selectedUserId;
    if (!code || !userId) return;

    setIsProcessing(true);
    setSimulationResult(null);

    const targetUser = allUsers.find((u) => u.id === userId) || null;
    const resolvedCourse = await courseRepository.getCourseByCode(code);

    const res = await registrationService.simulateExternalPurchase(
      userId,
      code,
      sourceInput
    );

    if (res.success && res.enrollment) {
      setSimulationResult({
        success: true,
        courseCode: code,
        resolvedCourse,
        enrollment: res.enrollment,
        registration: res.registration,
        message: `Successfully resolved course code "${code}" to "${resolvedCourse?.title}". Active enrollment created.`,
        targetUser
      });
      if (onEnrollmentChanged) {
        onEnrollmentChanged();
      }
    } else {
      setSimulationResult({
        success: false,
        courseCode: code,
        resolvedCourse: null,
        registration: res.registration,
        message: res.error || `No matching course found for code "${code}". No enrollment created.`,
        targetUser
      });
    }

    await loadData();
    setIsProcessing(false);
  };

  const handlePreset = (code: string) => {
    setCourseCodeInput(code);
    runSimulation(code);
  };

  const handleSwitchToSimulatedUser = (user: User) => {
    switchUser(user);
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
            <Hash className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Course Product Code & Registration Matching Architecture
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Integration Architecture Test
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulate external registrations resolving internal course codes into authorized private enrollments.
            </p>
          </div>
        </div>

        {/* 3-Step Integration Flow Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>External System</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              User registers/pays externally. System produces confirmed receipt with Course Product Code (e.g. <code className="font-mono font-bold text-slate-700">10001</code>).
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Internal Resolution</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Courses Engine matches <code className="font-mono font-bold text-slate-700">courseCode</code> → Course ID. Course code is a silent matching key, not a user password.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Active Enrollment Grant</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Creates active <code className="font-mono text-slate-700">Enrollment</code>. Learner immediately sees course in <span className="font-semibold text-slate-700">My Courses</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Test Scenarios Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Run Validation Test Scenarios
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute the specification validation scenarios: valid code <code className="font-mono">10001</code> vs. unknown code <code className="font-mono">99999</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset A: 10001 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Code: 10001
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold font-mono">Valid Match</span>
              </div>
              <div className="font-semibold text-xs text-slate-900">
                Demo Coaching Course (Maestro di Base)
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Expected: Matches Maestro di Base → Creates active enrollment → Learner sees course in My Courses.
              </p>
            </div>
            <button
              onClick={() => handlePreset('10001')}
              disabled={isProcessing}
              className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Purchase 10001</span>
            </button>
          </div>

          {/* Preset B: 20001 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Code: 20001
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold font-mono">Valid Match</span>
              </div>
              <div className="font-semibold text-xs text-slate-900">
                Demo Refereeing: Basic Protocols
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Expected: Matches Refereeing course → Creates active enrollment for official officiating candidate.
              </p>
            </div>
            <button
              onClick={() => handlePreset('20001')}
              disabled={isProcessing}
              className="w-full mt-2 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Purchase 20001</span>
            </button>
          </div>

          {/* Preset C: 99999 (Negative Test) */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-all space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Code: 99999
                </span>
                <span className="text-[10px] text-rose-600 font-semibold font-mono">Unknown Code</span>
              </div>
              <div className="font-semibold text-xs text-rose-950">
                Negative / Unknown Code Test
              </div>
              <p className="text-[11px] text-rose-800/80 leading-relaxed">
                Expected: No matching course found. Registration marked failed. No enrollment created. Never bypasses security.
              </p>
            </div>
            <button
              onClick={() => handlePreset('99999')}
              disabled={isProcessing}
              className="w-full mt-2 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Test Rejection 99999</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Simulator Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 tracking-tight">
          Custom Purchase Simulator Console
        </h3>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            runSimulation(courseCodeInput);
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Select Learner */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Simulated Learner / Member *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allUsers.map((u) => {
                const count = userEnrollmentsCount[u.id] || 0;
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) — {count} courses
                  </option>
                );
              })}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Tip: Davide Conti starts with 0 enrolled courses.
            </span>
          </div>

          {/* Course Code Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              External Product Code *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={courseCodeInput}
                onChange={(e) => setCourseCodeInput(e.target.value)}
                placeholder="e.g. 10001, 20001, 99999"
                className="w-full pl-8 pr-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Internal matching code produced by external store.
            </span>
          </div>

          {/* Source Selection & Action */}
          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source System
              </label>
              <select
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="external_registration_portal">External Registration Portal</option>
                <option value="federation_desk">Federation Membership Desk</option>
                <option value="payment_webhook_stripe">Simulated Payment Webhook</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="mt-3 w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span>{isProcessing ? 'Processing...' : 'Process Registration'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Simulation Feedback Banner */}
      {simulationResult && (
        <div 
          className={`p-5 rounded-xl border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            simulationResult.success 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {simulationResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="font-bold text-sm">
                  {simulationResult.success 
                    ? 'Registration Confirmed & Enrollment Granted' 
                    : 'Registration Failed — Rejection as Expected'}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/80 font-bold border border-slate-200">
                  Code: {simulationResult.courseCode}
                </span>
              </div>

              <p className="text-xs leading-relaxed">
                {simulationResult.message}
              </p>

              {simulationResult.enrollment && (
                <div className="text-[11px] font-mono text-emerald-800 pt-1 flex items-center gap-3">
                  <span>Enrollment ID: <strong>{simulationResult.enrollment.id}</strong></span>
                  <span>•</span>
                  <span>Assigned To: <strong>{simulationResult.targetUser?.name}</strong></span>
                  <span>•</span>
                  <span>Status: <strong>Active</strong></span>
                </div>
              )}
            </div>

            {/* Quick Action: Log in as Learner & Open My Courses */}
            {simulationResult.success && simulationResult.targetUser && (
              <button
                onClick={() => handleSwitchToSimulatedUser(simulationResult.targetUser!)}
                className="shrink-0 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-98"
              >
                <UserCheck className="w-4 h-4" />
                <span>Log in as {simulationResult.targetUser.name.split(' ')[0]} & View in My Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Registration Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">
              External Registration Audit Records
            </h3>
            <p className="text-xs text-slate-500">
              Historical ledger of registration events and their resolved course enrollments.
            </p>
          </div>
          <span className="font-mono text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {registrations.length} record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">Product Code</th>
                <th className="py-3 px-4">Matched Course</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Enrollment Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {registrations.map((r) => {
                const user = allUsers.find((u) => u.id === r.userId);
                const matchedCourse = courses.find((c) => c.courseCode === r.courseCode);

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {r.id}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      {user?.name || r.userId}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700">
                      {r.courseCode}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">
                      {matchedCourse ? matchedCourse.title : (
                        <span className="text-slate-400 italic">None (Unknown code)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        r.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {r.source}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[10px]">
                      {r.createdAt ? r.createdAt.split('T')[0] : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {r.enrollmentId ? (
                        <span className="text-emerald-700 font-semibold">{r.enrollmentId}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
