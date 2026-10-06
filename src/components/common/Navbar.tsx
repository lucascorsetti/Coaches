import React, { useState } from 'react';
import { 
  BookOpen, 
  PenTool, 
  FileText, 
  Users, 
  Globe, 
  ChevronDown,
  Layers,
  ShieldCheck,
  GraduationCap,
  Award,
  Shield,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, Language } from '../../i18n/translations';
import { User, UserRole } from '../../types';

export type ActiveView = 'catalog' | 'enrollments' | 'author' | 'docs';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate }) => {
  const { currentUser, allUsers, switchUser, isAdministrator, isCourseAuthor, isLearner } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getPersonaIcon = (user: User) => {
    if (user.role === 'admin') return ShieldCheck;
    if (user.role === 'author') {
      return user.assignedCategoryIds?.includes('cat-coaching') ? Award : Shield;
    }
    return GraduationCap;
  };

  const CurrentIcon = getPersonaIcon(currentUser);

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
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm tracking-wider shadow-sm group-hover:bg-blue-500 transition-colors">
                IHDP
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">
                    {t('federationTitle')}
                  </span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                    Courses
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {t('brandSub')}
                </div>
              </div>
            </div>

            {/* Main Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-1 ml-6 border-l border-slate-800 pl-6">
              {/* My Courses (The only learner portal view - strictly private & enrollment based) */}
              <button
                onClick={() => onNavigate('catalog')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                  activeView === 'catalog'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('navMyLearning')}</span>
              </button>

              {/* Admin & Author: Enrollment & Learner Management */}
              {(isAdministrator || isCourseAuthor) && (
                <button
                  onClick={() => onNavigate('enrollments')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                    activeView === 'enrollments'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Course Enrollments</span>
                </button>
              )}

              {/* Admin & Author: Course Authoring */}
              {(isAdministrator || isCourseAuthor) && (
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
              )}

              {/* Technical Engine Specs & Migration */}
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

          {/* Right Controls: Persona Switcher & Language Switcher */}
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

            {/* Persona Switcher (Testing Permissions & Access Control) */}
            <div className="relative">
              <button
                onClick={() => { setShowRoleMenu(!showRoleMenu); setShowLangMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs transition-colors"
                title="Switch test user to verify access rules"
              >
                <CurrentIcon className="w-3.5 h-3.5 text-blue-400" />
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-slate-200 leading-tight flex items-center gap-1.5">
                    <span>{currentUser.name.split(' (')[0]}</span>
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-700 text-slate-300 uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 text-xs z-50">
                  <div className="px-3 py-2 border-b border-slate-700">
                    <div className="font-semibold text-white">Switch Test Persona</div>
                    <div className="text-[10px] text-slate-400">
                      Verify private enrollment permissions & access checks
                    </div>
                  </div>

                  <div className="py-1 max-h-96 overflow-y-auto">
                    {allUsers.map((user) => {
                      const UserIcon = getPersonaIcon(user);
                      const isSelected = currentUser.id === user.id;

                      let personaNote = '';
                      if (user.id === 'user-admin') personaNote = '👑 Full admin: enroll learners & manage all';
                      else if (user.id === 'user-author-coaching') personaNote = '🏒 Coaching head: manages coaching courses';
                      else if (user.id === 'user-author-refereeing') personaNote = '🏁 Officiating head: manages referee courses';
                      else if (user.id === 'user-learner-a') personaNote = '🎓 Learner A: enrolled in Coaching Foundation';
                      else if (user.id === 'user-learner-b') personaNote = '🎓 Learner B: enrolled in Refereeing Level 1';
                      else if (user.id === 'user-learner-c') personaNote = '👤 Learner C: NO enrollments (tests blocked state)';

                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user.id);
                            setShowRoleMenu(false);
                            if (user.role === 'learner') {
                              onNavigate('catalog');
                            }
                          }}
                          className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-700/80 transition-colors ${
                            isSelected ? 'bg-blue-600/20 border-l-2 border-blue-500 text-blue-200' : 'text-slate-300'
                          }`}
                        >
                          <UserIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200 truncate">{user.name}</span>
                              <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 uppercase">
                                {user.role}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                            <div className="text-[10px] text-slate-300 font-medium mt-0.5">{personaNote}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
            {t('navMyLearning')}
          </button>
          {(isAdministrator || isCourseAuthor) && (
            <button
              onClick={() => onNavigate('enrollments')}
              className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
                activeView === 'enrollments' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Enrollments
            </button>
          )}
          {(isAdministrator || isCourseAuthor) && (
            <button
              onClick={() => onNavigate('author')}
              className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
                activeView === 'author' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              {t('navAuthorDashboard')}
            </button>
          )}
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
