import React, { useState } from 'react';
import { 
  BookOpen, 
  PenTool, 
  FileText, 
  UserCheck, 
  Globe, 
  ChevronDown,
  Layers,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, Language } from '../../i18n/translations';
import { UserRole } from '../../types';

export type ActiveView = 'catalog' | 'author' | 'docs';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate }) => {
  const { currentUser, switchRole } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const roleLabels: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    learner: { label: t('roleLearner'), icon: GraduationCap },
    author: { label: t('roleAuthor'), icon: PenTool },
    admin: { label: t('roleAdmin'), icon: ShieldCheck }
  };

  const CurrentRoleIcon = roleLabels[currentUser.role].icon;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand: FISG Italia Hockey - IHDP */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* FISG Crest placeholder badge */}
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm tracking-wider shadow-sm group-hover:bg-blue-500 transition-colors">
                IHDP
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">
                    {t('federationTitle')}
                  </span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                    Courses Engine
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {t('brandSub')}
                </div>
              </div>
            </div>

            {/* Main Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-1 ml-6 border-l border-slate-800 pl-6">
              <button
                onClick={() => onNavigate('catalog')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                  activeView === 'catalog'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('navCatalog')}</span>
              </button>

              <button
                onClick={() => onNavigate('author')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                  activeView === 'author'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('navAuthorDashboard')}</span>
              </button>

              <button
                onClick={() => onNavigate('docs')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                  activeView === 'docs'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('navDocumentation')}</span>
              </button>
            </nav>
          </div>

          {/* Right Controls: Role Switcher & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => { setShowLangMenu(!showLangMenu); setShowRoleMenu(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 text-xs z-50">
                  <button
                    onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-700 transition-colors ${
                      language === 'en' ? 'text-blue-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="font-mono text-[10px]">EN</span>}
                  </button>
                  <button
                    onClick={() => { setLanguage('it'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-700 transition-colors ${
                      language === 'it' ? 'text-blue-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>Italiano</span>
                    {language === 'it' && <span className="font-mono text-[10px]">IT</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Role Simulation Switcher (Learner vs Author vs Admin) */}
            <div className="relative">
              <button
                onClick={() => { setShowRoleMenu(!showRoleMenu); setShowLangMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs transition-colors"
                title="Switch Role for Engine Testing"
              >
                <CurrentRoleIcon className="w-3.5 h-3.5 text-blue-400" />
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-slate-200 leading-tight">
                    {roleLabels[currentUser.role].label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser.name.split(' ')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1.5 text-xs z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-700">
                    Switch Test Persona
                  </div>
                  {(['author', 'learner', 'admin'] as UserRole[]).map((role) => {
                    const RoleIcon = roleLabels[role].icon;
                    const isSelected = currentUser.role === role;

                    return (
                      <button
                        key={role}
                        onClick={() => {
                          switchRole(role);
                          setShowRoleMenu(false);
                          if (role === 'author') onNavigate('author');
                          if (role === 'learner') onNavigate('catalog');
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-700 transition-colors ${
                          isSelected ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <RoleIcon className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div>{roleLabels[role].label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {role === 'author' ? 'Head of Coaches (Create & Publish)' :
                             role === 'learner' ? 'Coach Trainee (Take Courses)' : 'System Administrator'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center space-x-2 py-2 border-t border-slate-800">
          <button
            onClick={() => onNavigate('catalog')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
              activeView === 'catalog' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            {t('navCatalog')}
          </button>
          <button
            onClick={() => onNavigate('author')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
              activeView === 'author' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            {t('navAuthorDashboard')}
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
              activeView === 'docs' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            {t('navDocumentation')}
          </button>
        </div>
      </div>
    </header>
  );
};
