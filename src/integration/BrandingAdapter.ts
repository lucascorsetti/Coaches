/**
 * Branding Adapter
 * Exposes centralized IHDP visual assets, application metadata, and color tokens.
 */

import { BRANDING_CONFIG, AppBrandingConfig, getAppDocumentTitle } from '../config/branding';

export class BrandingAdapter {
  static getConfig(): AppBrandingConfig {
    return BRANDING_CONFIG;
  }

  static getApplicationId(): string {
    return BRANDING_CONFIG.applicationId;
  }

  static getDisplayName(language: string = 'en'): string {
    return language === 'it' ? BRANDING_CONFIG.displayNameIt : BRANDING_CONFIG.displayName;
  }

  static getOrganizationTitle(): string {
    return BRANDING_CONFIG.organization;
  }

  static getPageTitle(pageSubtitle?: string): string {
    return getAppDocumentTitle(pageSubtitle);
  }
}
