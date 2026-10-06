import React, { useState } from 'react';
import { 
  GraduationCap, 
  PenTool, 
  Users, 
  FileText, 
  Globe, 
  ChevronDown, 
  Award, 
  Shield, 
  ShieldCheck,
  Menu,
  X,
  Calendar,
  Layers,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, Language } from '../../i18n/translations';
import { User } from '../../types';
import { BRANDING_CONFIG } from '../../config/branding';
import { formatHeaderDate } from '../../utils/dateFormat';
import { BrandLogo } from './BrandLogo';
import { AppSwitcher } from './AppSwitcher';

export type ActiveCoursesView = 'catalog' | 'enrollments' | 'author' | 'docs';

interface IHDPHeaderProps {
  activeView: ActiveCoursesView;
  onNavigate: (view: ActiveCoursesView) => void;
}

export const IHDPHeader: React.FC<IHDPHeaderProps> = ({
  activeView,
  onNavigate
}) => {
  const { currentUser, allUsers, switchUser, isAdministrator, isCourseAuthor, isLearner } = useAuth();
  const { language, setLanguage, t } = useTranslation();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentDateString = formatHeaderDate(new Date(), language);

  const getPersonaIcon = (user: User) => {
    if (user.role === 'admin') return ShieldCheck;
    if (user.role === 'author') {
      return user.assignedCategoryIds?.includes('cat-coaching') ? Award : Shield;
    }
    return GraduationCap;
  };

  const CurrentIcon = getPersonaIcon(currentUser);

  const handleNavClick = (view: ActiveCoursesView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: IHDP Brand Logo & Main Nav */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => handleNavClick('catalog')}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <BrandLogo size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 border-l border-slate-800 pl-6">
              {/* My Courses */}
              <button
                onClick={() => handleNavClick('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeView === 'catalog'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('navMyLearning')}</span>
              </button>

              {/* Course Enrollments (Admin & Authors) */}
              {(isAdministrator || isCourseAuthor) && (
                <button
                  onClick={() => handleNavClick('enrollments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeView === 'enrollments'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Course Enrollments</span>
                </button>
              )}

              {/* Course Authoring (Admin & Authors) */}
              {(isAdministrator || isCourseAuthor) && (
                <button
                  onClick={() => handleNavClick('author')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeView === 'author'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('navAuthorDashboard')}</span>
                </button>
              )}

              {/* Engine Specs & Migration */}
              <button
                onClick={() => handleNavClick('docs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeView === 'docs'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('navDocumentation')}</span>
              </button>
            </nav>
          </div>

          {/* RIGHT: Context Header (Date, Language, User Identity, App Switcher) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Current Date Indicator (Hidden on small mobile) */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 font-mono pr-2 border-r border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentDateString}</span>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => { setShowLangMenu(!showLangMenu); setShowRoleMenu(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono uppercase font-bold text-[11px]">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <button
                    onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      language === 'en' ? 'bg-blue-600/30 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>English (EN)</span>
                    {language === 'en' && <span className="text-blue-400 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLanguage('it'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      language === 'it' ? 'bg-blue-600/30 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Italiano (IT)</span>
                    {language === 'it' && <span className="text-blue-400 text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Identity & Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => { setShowRoleMenu(!showRoleMenu); setShowLangMenu(false); }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-left transition-colors"
                title="Current IHDP User & Role"
              >
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>

                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-white truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono capitalize">
                    {currentUser.role}
                  </div>
                </div>

                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Persona Switcher Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 divide-y divide-slate-800">
                  <div className="px-4 py-3 bg-slate-950/70">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                      Current IHDP Identity
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {currentUser.email} • <span className="capitalize font-bold text-blue-400">{currentUser.role}</span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400">
                      Switch Test Persona
                    </div>
                    {allUsers.map((u) => {
                      const Icon = getPersonaIcon(u);
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-600 text-white font-bold' 
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <div>
                              <div className="font-semibold">{u.name}</div>
                              <div className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                          {isSelected && <span className="font-bold text-xs">Active</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Official IHDP Application Switcher */}
            <AppSwitcher />

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800 border border-slate-700"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top duration-150">
          <div className="text-[10px] font-mono text-slate-400 uppercase px-3 py-1 font-bold">
            Navigation Menu
          </div>

          <button
            onClick={() => handleNavClick('catalog')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeView === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{t('navMyLearning')}</span>
          </button>

          {(isAdministrator || isCourseAuthor) && (
            <button
              onClick={() => handleNavClick('enrollments')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeView === 'enrollments' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Course Enrollments & Access</span>
            </button>
          )}

          {(isAdministrator || isCourseAuthor) && (
            <button
              onClick={() => handleNavClick('author')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeView === 'author' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>{t('navAuthorDashboard')}</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('docs')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeView === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('navDocumentation')}</span>
          </button>
        </div>
      )}
    </header>
  );
};
