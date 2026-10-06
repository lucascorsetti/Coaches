import React from 'react';
import { 
  ClipboardList, 
  Users, 
  Timer, 
  Trophy, 
  BarChart3, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export type TabType = 'playbook' | 'roster' | 'sessions' | 'matches' | 'analytics';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  athleteCount: number;
  upcomingMatchesCount: number;
  drillCount: number;
  injuredCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  athleteCount,
  upcomingMatchesCount,
  drillCount,
  injuredCount
}) => {
  const navItems = [
    {
      id: 'playbook' as TabType,
      label: 'Tactical Playbook',
      description: 'Drills & Whiteboard',
      icon: ClipboardList,
      badge: `${drillCount} drills`
    },
    {
      id: 'roster' as TabType,
      label: 'Roster & Athletes',
      description: 'Squad & Health Scores',
      icon: Users,
      badge: `${athleteCount} players`,
      alert: injuredCount > 0 ? `${injuredCount} inj` : undefined
    },
    {
      id: 'sessions' as TabType,
      label: 'Training Sessions',
      description: 'Planner & Live Whistle',
      icon: Timer,
      badge: 'Live Timer'
    },
    {
      id: 'matches' as TabType,
      label: 'Match Center',
      description: 'Game Day & Lineups',
      icon: Trophy,
      badge: `${upcomingMatchesCount} sched`
    },
    {
      id: 'analytics' as TabType,
      label: 'Performance & Load',
      description: 'ACWR & Readiness',
      icon: BarChart3
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-3 lg:p-4 space-y-1.5 flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 group shrink-0 lg:shrink ${
                isActive
                  ? 'bg-blue-600/15 border border-blue-500/40 text-blue-400 shadow-sm'
                  : 'hover:bg-slate-800/60 border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate hidden sm:block lg:block">
                  <div className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                {item.alert && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    {item.alert}
                  </span>
                )}
                {item.badge && !item.alert && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="hidden lg:block mt-auto p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Coaching Tip</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Keep Acute:Chronic Workload Ratio (ACWR) between 0.8 and 1.3 to avoid soft-tissue injuries while boosting fitness.
          </p>
        </div>
      </div>
    </aside>
  );
};
