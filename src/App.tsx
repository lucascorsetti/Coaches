import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/translations';
import { CoursesShell } from './components/shell/CoursesShell';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CoursesShell />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
