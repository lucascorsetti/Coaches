/**
 * IHDP Standardized Date & Time Formatting Utilities
 * Adheres to Italian & European federation conventions with locale support.
 */

export function formatHeaderDate(
  dateInput?: Date | string | number,
  language: string = 'en'
): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return '';

  const locale = language === 'it' ? 'it-IT' : 'en-GB';

  // Format: "Tuesday, 6 October 2026" or "Martedì 6 Ottobre 2026"
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);

  return formatted;
}

export function formatDisplayDate(
  dateInput?: Date | string | number,
  language: string = 'en'
): string {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  const locale = language === 'it' ? 'it-IT' : 'en-GB';

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(
  dateInput?: Date | string | number,
  language: string = 'en'
): string {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  const locale = language === 'it' ? 'it-IT' : 'en-GB';

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatRelativeTime(
  dateInput?: Date | string | number,
  language: string = 'en'
): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return language === 'it' ? 'Poco fa' : 'Just now';
  }
  if (diffHours < 24) {
    return language === 'it' ? `${diffHours} ore fa` : `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return language === 'it' ? `${diffDays} giorni fa` : `${diffDays}d ago`;
  }

  return formatDisplayDate(date, language);
}
