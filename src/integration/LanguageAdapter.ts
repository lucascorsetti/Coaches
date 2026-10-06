/**
 * Language Adapter
 * Bridge between host IHDP localization and the Courses translation dictionary.
 */

import { useTranslation, Language, translations } from '../i18n/translations';

export { type Language, translations };

export function useCoursesTranslation() {
  const { language, setLanguage, t } = useTranslation();
  return {
    language,
    setLanguage,
    t,
    isItalian: language === 'it',
    isEnglish: language === 'en'
  };
}
