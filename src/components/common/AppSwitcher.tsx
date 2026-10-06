import React, { useState, useEffect, useRef } from 'react';
import { 
  Grid, 
  GraduationCap, 
  Activity, 
  UserCheck, 
  ClipboardList, 
  LayoutDashboard, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
  Layers,
  X
} from 'lucide-react';
import { BRANDING_CONFIG } from '../../config/branding';
import { IHDPApplication } from '../../integration/types';

const IHDP_APPLICATIONS: IHDPApplication[] = [
  {
    id: 'coach-education',
    name: 'Courses & Education',
    nameIt: 'Corsi & Formazione',
    description: 'Federation curriculum, modules, assessments and certified coach/referee pathways.',
    iconName: 'GraduationCap',
    path: '#courses',
    active: true,
    isCurrent: true,
    category: 'education'
  },
  {
    id: 'physical-testing',
    name: 'Physical Testing',
    nameIt: 'Test Fisici & Valutazioni',
    description: 'On-ice and off-ice athletic testing, benchmarking standards, and player metrics.',
    iconName: 'Activity',
    path: '#testing',
    active: false,
    isCurrent: false,
    category: 'performance'
  },
  {
    id: 'player-development',
    name: 'Player Development',
    nameIt: 'Sviluppo Atleti',
    description: 'Long-Term Athlete Development (LTAD) tracking, skill matrix, and player evaluation reports.',
    iconName: 'UserCheck',
    path: '#player-dev',
    active: false,
    isCurrent: false,
    category: 'performance'
  },
  {
    id: 'roster-planning',
    name: 'Practice & Roster Planner',
    nameIt: 'Pianificazione Allenamenti',
    description: 'National team rosters, line combinations, session drills, and season calendars.',
    iconName: 'ClipboardList',
    path: '#roster',
    active: false,
    isCurrent: false,
    category: 'operations'
  }
];

export const AppSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [infoModalApp, setInfoModalApp] = useState<IHDPApplication | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setInfoModalApp(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getAppIcon = (id: string) => {
    switch (id) {
      case 'coach-education':
        return <GraduationCap className="w-4 h-4 text-blue-400" />;
      case 'physical-testing':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'player-development':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'roster-planning':
        return <ClipboardList className="w-4 h-4 text-amber-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleAppClick = (app: IHDPApplication) => {
    if (app.isCurrent) {
      setIsOpen(false);
      return;
    }
    // Show placeholder information modal for other IHDP applications
    setIsOpen(false);
    setInfoModalApp(app);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button: Compact 3x3 Grid Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="IHDP Applications Switcher"
        title="IHDP Applications Hub"
        className={`p-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center justify-center border ${
          isOpen
            ? 'bg-slate-800 text-white border-slate-700 shadow-xs ring-2 ring-blue-500/30'
            : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
        }`}
      >
        <Grid className="w-4 h-4" />
      </button>

      {/* Switcher Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-black text-[10px] text-white">
                IHDP
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight">
                  {BRANDING_CONFIG.organization}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Application Hub & Federation Platform
                </div>
              </div>
            </div>
          </div>

          {/* Apps List */}
          <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Federation Modules
            </div>

            {IHDP_APPLICATIONS.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-3 group ${
                  app.isCurrent
                    ? 'bg-blue-950/60 border border-blue-800/80'
                    : 'hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-md shrink-0 ${
                  app.isCurrent ? 'bg-blue-600/30 text-blue-300' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                }`}>
                  {getAppIcon(app.id)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white tracking-tight truncate">
                      {app.name}
                    </span>
                    {app.isCurrent ? (
                      <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white shrink-0">
                        Current
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                        IHDP App
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {app.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer Hub Link */}
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>App ID: <code className="text-blue-400 font-bold">{BRANDING_CONFIG.applicationId}</code></span>
            <span className="text-slate-500">v1.2 Platform Ready</span>
          </div>
        </div>
      )}

      {/* Placeholder Modal for other IHDP Apps */}
      {infoModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  IHDP
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">{infoModalApp.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Application Integration Context</p>
                </div>
              </div>
              <button
                onClick={() => setInfoModalApp(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-mono"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>Standalone Development Workspace:</strong> You are currently working inside the standalone <strong>Courses</strong> engine (`coach-education`). When integrated into the host IHDP platform, switching applications seamlessly routes between Physical Testing, Player Development, and Practice Planning.
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-800">Module Overview:</div>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {infoModalApp.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setInfoModalApp(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Return to Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
