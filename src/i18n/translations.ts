import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'it';

export const translations = {
  en: {
    // Navigation & Brand
    federationTitle: 'FISG Italia Hockey',
    brandSub: 'Italia Hockey Development Program',
    navCourses: 'Courses',
    navCatalog: 'Course Catalog',
    navMyLearning: 'My Courses',
    navAuthorDashboard: 'Course Authoring',
    navDocumentation: 'Engine Specs',
    roleLearner: 'Learner View',
    roleAuthor: 'Course Author (Head of Coaches)',
    roleAdmin: 'Global Admin',

    // Catalog & Filter
    allCategories: 'All Categories',
    allLevels: 'All Levels',
    searchCoursesPlaceholder: 'Search courses by title, keywords or level...',
    enrolledCourses: 'Enrolled Courses',
    availableCourses: 'Available Courses',
    noCoursesFound: 'No courses match the selected filters.',
    statusDraft: 'Draft',
    statusPublished: 'Published',
    statusArchived: 'Archived',

    // Course Overview
    courseSyllabus: 'Course Syllabus',
    estimatedDuration: 'Duration',
    modulesCount: 'Modules',
    lessonsCount: 'Lessons',
    levelLabel: 'Level',
    startCourse: 'Start Course',
    continueCourse: 'Continue Learning',
    resumeAt: 'Resume at',
    courseCompleted: 'Course Completed',
    prerequisites: 'Prerequisites',
    completionRate: 'Completed',

    // Lesson Player
    previousLesson: 'Previous',
    nextLesson: 'Next Lesson',
    markComplete: 'Mark as Completed',
    completedLesson: 'Completed',
    moduleOverview: 'Module Overview',
    exitPlayer: 'Back to Course',
    upNext: 'Up Next',
    whereAmI: 'Current Location',
    whatNext: 'Next Action',

    // Assessment
    startAssessment: 'Start Knowledge Evaluation',
    passingScoreRequired: 'Passing Score',
    maxAttemptsAllowed: 'Attempts Allowed',
    scoreResult: 'Your Score',
    passedAssessment: 'Assessment Passed',
    failedAssessment: 'Passing Threshold Not Met',
    submitAnswers: 'Submit Evaluation',
    retakeAssessment: 'Retake Evaluation',
    explanation: 'Federation Explanation',

    // Authoring
    createCourse: 'Create Course',
    editCourse: 'Edit Course',
    courseTitle: 'Course Title',
    courseShortTitle: 'Short Title / Code',
    category: 'Category',
    targetLevel: 'Target Level',
    courseDescription: 'Course Description',
    saveDraft: 'Save as Draft',
    publishCourse: 'Publish Course',
    previewCourse: 'Preview as Learner',
    backToDashboard: 'Back to Authoring',
    modulesAndLessons: 'Modules & Structure',
    addModule: 'Add Module',
    addLesson: 'Add Lesson',
    addContentBlock: 'Add Content Block',
    blockTypeHeading: 'Heading & Subtitle',
    blockTypeText: 'Text / Description',
    blockTypeImage: 'Image Placeholder',
    blockTypeVideo: 'Video Lesson',
    blockTypeDocument: 'Document / PDF',
    blockTypeCallout: 'Notice / Tip Callout',
    blockTypeQuestion: 'Quick Knowledge Check',
    blockTypeScenario: 'On-Ice Scenario Decision',
    blockTypeAssessment: 'Final Assessment Quiz',
    blockTypeAssignment: 'Practical Assignment',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    deleteConfirm: 'Are you sure you want to delete this item?'
  },
  it: {
    // Navigation & Brand
    federationTitle: 'FISG Italia Hockey',
    brandSub: 'Programma di Sviluppo Hockey Italia',
    navCourses: 'Corsi',
    navCatalog: 'Catalogo Corsi',
    navMyLearning: 'I Miei Corsi',
    navAuthorDashboard: 'Gestione Corsi',
    navDocumentation: 'Specifiche Motore',
    roleLearner: 'Vista Corsista',
    roleAuthor: 'Autore Corso (Resp. Allenatori)',
    roleAdmin: 'Amministratore Globale',

    // Catalog & Filter
    allCategories: 'Tutte le Categorie',
    allLevels: 'Tutti i Livelli',
    searchCoursesPlaceholder: 'Cerca corsi per titolo, parole chiave o livello...',
    enrolledCourses: 'Corsi Iscritti',
    availableCourses: 'Corsi Disponibili',
    noCoursesFound: 'Nessun corso corrisponde ai filtri selezionati.',
    statusDraft: 'Bozza',
    statusPublished: 'Pubblicato',
    statusArchived: 'Archiviato',

    // Course Overview
    courseSyllabus: 'Programma del Corso',
    estimatedDuration: 'Durata',
    modulesCount: 'Moduli',
    lessonsCount: 'Lezioni',
    levelLabel: 'Livello',
    startCourse: 'Inizia Corso',
    continueCourse: 'Continua Corso',
    resumeAt: 'Riprendi da',
    courseCompleted: 'Corso Completato',
    prerequisites: 'Prerequisiti',
    completionRate: 'Completato',

    // Lesson Player
    previousLesson: 'Precedente',
    nextLesson: 'Prossima Lezione',
    markComplete: 'Segna come Completato',
    completedLesson: 'Completato',
    moduleOverview: 'Panoramica Modulo',
    exitPlayer: 'Torna al Corso',
    upNext: 'Prossimo',
    whereAmI: 'Posizione Attuale',
    whatNext: 'Prossimo Passo',

    // Assessment
    startAssessment: 'Inizia Valutazione',
    passingScoreRequired: 'Punteggio Minimo',
    maxAttemptsAllowed: 'Tentativi Consentiti',
    scoreResult: 'Il Tuo Punteggio',
    passedAssessment: 'Valutazione Superata',
    failedAssessment: 'Soglia Non Raggiunta',
    submitAnswers: 'Invia Valutazione',
    retakeAssessment: 'Ripeti Valutazione',
    explanation: 'Spiegazione Federale',

    // Authoring
    createCourse: 'Crea Corso',
    editCourse: 'Modifica Corso',
    courseTitle: 'Titolo del Corso',
    courseShortTitle: 'Titolo Breve / Sigla',
    category: 'Categoria',
    targetLevel: 'Livello Target',
    courseDescription: 'Descrizione Corso',
    saveDraft: 'Salva come Bozza',
    publishCourse: 'Pubblica Corso',
    previewCourse: 'Anteprima Corsista',
    backToDashboard: 'Torna alla Gestione',
    modulesAndLessons: 'Moduli e Struttura',
    addModule: 'Aggiungi Modulo',
    addLesson: 'Aggiungi Lezione',
    addContentBlock: 'Aggiungi Blocco Contenuto',
    blockTypeHeading: 'Intestazione & Sottotitolo',
    blockTypeText: 'Testo / Descrizione',
    blockTypeImage: 'Segnaposto Immagine',
    blockTypeVideo: 'Video Lezione',
    blockTypeDocument: 'Documento / PDF',
    blockTypeCallout: 'Avviso / Regola',
    blockTypeQuestion: 'Verifica Rapida',
    blockTypeScenario: 'Scenario Decisionale',
    blockTypeAssessment: 'Test Finale di Modulo',
    blockTypeAssignment: 'Compito Pratico',
    moveUp: 'Sposta Su',
    moveDown: 'Sposta Giù',
    deleteConfirm: 'Sei sicuro di voler eliminare questo elemento?'
  }
};

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ihdp_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ihdp_lang', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
