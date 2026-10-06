/**
 * IHDP Centralized Branding Configuration
 * Single source of truth for application identity, branding assets, and design tokens.
 * Matches the official FISG Italia Hockey - IHDP platform standards.
 */

export interface AppBrandingConfig {
  /** Internal application identifier in IHDP catalog */
  applicationId: string;
  /** Primary display name of this module */
  displayName: string;
  /** Primary display name in Italian */
  displayNameIt: string;
  /** Subtitle / Tagline */
  subtitle: string;
  subtitleIt: string;
  /** Organization branding */
  organization: string;
  organizationSubtitle: string;
  organizationShort: string;
  federation: string;
  /** Catalog description */
  description: string;
  /** Asset paths (with built-in vector fallbacks) */
  assets: {
    primaryLogo: string;
    ihdpLogo: string;
    fisgLogo: string;
    favicon: string;
  };
  /** Design Tokens matching IHDP Shell */
  tokens: {
    navBg: string;
    pageBg: string;
    surfaceBg: string;
    borderDefault: string;
    primaryAccent: string;
    primaryAccentHover: string;
    fontUi: string;
    fontMono: string;
  };
  /** External/Hub links */
  links: {
    hubHomeUrl: string;
    federationPortalUrl: string;
    supportEmail: string;
  };
}

export const BRANDING_CONFIG: AppBrandingConfig = {
  applicationId: 'coach-education',
  displayName: 'Courses',
  displayNameIt: 'Corsi',
  subtitle: 'Federation Learning & Accreditation Engine',
  subtitleIt: 'Formazione e Accreditamento Federale',
  organization: 'FISG Italia Hockey - IHDP',
  organizationSubtitle: 'Italia Hockey Development Program',
  organizationShort: 'IHDP',
  federation: 'Federazione Italiana Sport del Ghiaccio',
  description: 'Courses, learning modules, assessments and certifications for Italian ice hockey coaches and referees.',
  assets: {
    primaryLogo: '/branding/ihdp-logo.svg',
    ihdpLogo: '/branding/ihdp-logo.svg',
    fisgLogo: '/branding/fisg-logo.svg',
    favicon: '/branding/favicon.svg'
  },
  tokens: {
    navBg: '#0f172a',        // slate-900
    pageBg: '#f1f5f9',       // slate-100
    surfaceBg: '#ffffff',    // white
    borderDefault: '#e2e8f0',// slate-200
    primaryAccent: '#2563eb',// blue-600
    primaryAccentHover: '#1d4ed8', // blue-700
    fontUi: 'Inter, system-ui, -apple-system, sans-serif',
    fontMono: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace'
  },
  links: {
    hubHomeUrl: '#hub',
    federationPortalUrl: 'https://fisg.it',
    supportEmail: 'corsi@fisg.it'
  }
};

/**
 * Generates the standardized browser document title
 */
export function getAppDocumentTitle(pageSubtitle?: string): string {
  if (!pageSubtitle) {
    return `${BRANDING_CONFIG.displayName} | ${BRANDING_CONFIG.organization}`;
  }
  return `${pageSubtitle} | ${BRANDING_CONFIG.displayName} | ${BRANDING_CONFIG.organization}`;
}
