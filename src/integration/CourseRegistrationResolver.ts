/**
 * Course Registration Resolver Service
 * Integration boundary that resolves external registration/payment transactions
 * against internal course product codes (e.g. '10001') and coordinates enrollment.
 */

import { courseRepository, enrollmentRepository, registrationService } from '../repositories';
import { RegistrationResolutionResult } from './types';

export class CourseRegistrationResolver {
  /**
   * Resolves a course product code and provisions an active enrollment for the user
   */
  static async resolveAndEnroll(
    userId: string,
    courseCode: string,
    source: string = 'external_registration_portal',
    notes?: string
  ): Promise<RegistrationResolutionResult> {
    const trimmed = courseCode.trim();
    const course = await courseRepository.getCourseByCode(trimmed);

    if (!course) {
      // Record failed resolution attempt for audit
      await registrationService.createRegistration({
        userId,
        courseCode: trimmed,
        status: 'failed',
        source,
        notes: notes || `Failed resolution: No course matching product code "${trimmed}"`
      });

      return {
        success: false,
        courseCode: trimmed,
        course: null,
        enrollment: null,
        error: `No matching course found for code "${trimmed}". No enrollment created.`
      };
    }

    // Course found -> execute transaction
    const res = await registrationService.simulateExternalPurchase(
      userId,
      trimmed,
      source
    );

    return {
      success: res.success,
      courseCode: trimmed,
      course,
      enrollment: res.enrollment || null,
      error: res.error
    };
  }
}
