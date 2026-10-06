# IHDP Courses Engine — Technical Architecture

This document outlines the software architecture of the **standalone IHDP Courses engine** developed in the repository `lucascorsetti/Coaches` for the **FISG Italia Hockey Development Program**.

---

## 1. Core Principles

1. **Private, Enrollment-Based Education System**:
   Courses are strictly private and not open to the public. Learners do not see a global course marketplace; they access only courses for which an active enrollment has been granted by a federation administrator or head of coaches.

2. **Decoupled Data Access**:
   All state management and persistence rely on repository interfaces (`ICourseRepository`, `ICategoryRepository`, `IEnrollmentRepository`, `IAssessmentRepository`, `IProgressRepository`, `ISubmissionRepository`, `IUserRepository`). Swapping storage from browser `localStorage` to Supabase requires touching only the repository layer—UI components never make direct database queries.

3. **Content- and Category-Agnostic**:
   Categories are pure data records (e.g. `Coaching`, `Refereeing`, `Off-Ice Training`, `Equipment & Safety`). The engine never executes branch logic based on category names (no `if (category === 'coaching')`).

4. **Enrollment as Access Guard**:
   Every protected course route/component executes an authorization check (`enrollmentRepository.checkUserAccess(userId, courseId)`). Unauthorized requests are intercepted at the route/page level, returning an explicit "Access Required" state.

5. **Progress Tied Conceptually to Enrollment**:
   Rather than flat `userId + courseId` tracking, learner progress records link to `enrollmentId`. This allows multiple enrollment lifecycles over time (e.g., initial accreditation, annual renewals, re-taking courses, or historical archiving).

6. **Block-Based Lesson Engine**:
   Lessons are dynamic collections of ordered content blocks. Authors compose headings, rich text, images, videos, PDF documents, callouts, knowledge check questions, interactive on-ice scenarios, and module assessments in any sequence.

7. **Head of Coaches Authoring Experience**:
   No code, JSON, raw database IDs, or schema editing is exposed to instructors. Content creators use an intuitive visual builder:
   `Create Course` → `Add Module` → `Add Lesson` → `Add Content Blocks` → `Configure Access & Passing Rules` → `Preview` → `Publish`.

---

## 2. Domain Model Hierarchy

```
Category (e.g., Coaching, Refereeing)
  └── Course (e.g., Maestro di Base, Level 1, Referee Level 1)
        ├── Enrollment (Authorization grant: userId, courseId, status, dates)
        │     └── Progress (Granular completion per enrollment, module, item)
        │     └── Attempts (Assessment submissions per enrollment)
        └── Module (Ordered unit, completion rules)
              └── LearningItem / Lesson (Ordered lesson, duration, type)
                    ├── ContentBlock (Ordered: text, video, scenario, quiz, pdf)
                    └── Assessment / Quiz (Passing score, questions, attempts)
```

### Entity Specifications

- **Category**: Dynamic taxonomy classification (`id`, `slug`, `name`, `nameIt`, `color`, `icon`).
- **Course**: Educational curriculum container (`id`, `title`, `shortTitle`, `categoryId`, `level`, `status`, `accessPolicy`, `completionRules`, `authors`, `estimatedDuration`).
  - `accessPolicy`: `'private'` (default), `'restricted'`, or `'open'`.
  - `completionRules`: `{ requireAllLessons: boolean, requireAllAssessmentsPassed: boolean, minimumPassingScore: number }`.
- **Enrollment**: Access grant and authorization record (`id`, `userId`, `courseId`, `status`, `enrolledAt`, `startDate`, `completionDate`, `assignedBy`, `expirationDate`, `notes`).
  - `status`: `'active' | 'completed' | 'suspended' | 'expired'`.
- **Module**: Thematic grouping of lessons (`id`, `courseId`, `title`, `order`, `completionRules`).
- **LearningItem (Lesson)**: Discrete pedagogical unit (`id`, `moduleId`, `title`, `type`, `order`, `estimatedDuration`).
- **ContentBlock**: Reusable building block (`id`, `learningItemId`, `type`, `order`, `data`). Supported block types:
  - `heading`: Section title and subtitle.
  - `text`: Rich informational text / markdown.
  - `image`: Technical diagrams, rink schemes, equipment graphics.
  - `video`: Tactical video drills with progress tracking.
  - `document`: PDF guides, federation rulebooks, official sheets.
  - `callout`: Key takeaways, safety notices, coach rules.
  - `question`: Inline single- or multi-select knowledge check.
  - `scenario`: On-ice coaching dilemma with decision branches.
  - `assessment`: Graded module evaluations.
- **Assessment**: Quiz engine (`id`, `courseId`, `passingScore`, `maxAttempts`, `revealAnswers`, `questions`).
- **Progress**: Granular learner tracking tied to enrollment (`id`, `enrollmentId`, `userId`, `courseId`, `moduleId`, `learningItemId`, `completed`, `score`, `completedAt`, `lastActivityAt`).
- **Attempt**: History of learner quiz evaluations (`userId`, `enrollmentId`, `assessmentId`, `score`, `passed`, `answers`).

---

## 3. Roles and Permission Architecture

The engine implements a generic permissions model designed for direct mapping into IHDP RBAC:

1. **Administrator (`admin`)**:
   - Manages all courses across all categories.
   - Enrolls and revokes learner access across any course.
   - Accesses global analytics, learner progress drilldowns, and completion certificates.

2. **Course Author (`author`)**:
   - Manages only courses matching `assignedCategoryIds` (e.g. Coaching Head manages Coaching; Officiating Head manages Refereeing) or `assignedCourseIds`.
   - Views enrolled learners and progress for their assigned courses.
   - Restrained from modifying courses outside their jurisdiction.

3. **Learner (`learner`)**:
   - Sees strictly **My Courses** containing their active/completed enrollments.
   - Unauthorized courses are blocked at the page/data layer.
   - Progress and assessment attempts persist under their enrollment.

---

## 4. Visual Design System

The visual language follows the **FISG Italia Hockey - IHDP** design standard:
- **Navigation**: Dark navy/slate (`bg-slate-900`, `border-slate-800`).
- **Canvas**: Clean light slate background (`bg-slate-100`).
- **Surfaces**: Crisp white cards (`bg-white`, `border-slate-200`, subtle borders, no oversized gradients).
- **Primary Accent**: Federation Blue (`#1d4ed8` / `text-blue-600` / `bg-blue-600`).
- **Typography**: 
  - `Inter` for standard UI copy.
  - `JetBrains Mono` for course codes, levels, durations, and metrics.
- **Bilingual**: Complete English (`en`) and Italian (`it`) support out of the box.

---

## 5. Course Product Code & Registration Matching Architecture

### 5.1 Purpose & Role of `courseCode`
Every course possesses a required, unique internal **course product code** (`courseCode: string`):
- **Coaching → Maestro di Base**: `10001`
- **Coaching → Level 1**: `10002`
- **Refereeing → Beginner / Level 1**: `20001`

**Critical Design Boundaries**:
- The code is a **silent internal matching key**, NOT a password, user access code, or authentication token.
- It is visible to federation administrators and course authors, but **not prominently displayed to learners**.
- Internal relational integrity is strictly maintained by UUIDs (`Enrollment.courseId → Course.id`); the code is solely an external integration matching identifier.
- Unique across all courses: enforced via `courseRepository.validateCourseCode(courseCode, excludeCourseId)`. Duplicate codes are rejected when creating or updating courses.

### 5.2 External Registration & Payment Matching Pipeline
When an external federation ticketing or registration platform completes a payment, it emits a confirmed transaction:
```
External Confirmation: { user: "Mario Rossi", courseCode: "10001", status: "confirmed" }
                                 │
                                 ▼
                     Internal Resolution:
                 CourseRepository.getCourseByCode("10001")
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
            Found (Valid)                  Not Found (Invalid)
                 │                               │
        Creates Active Enrollment:         Logs Failed Registration:
   Enrollment {                                CourseRegistration {
     userId: "mario-rossi",                      userId: "mario-rossi",
     courseId: "course-demo-101",                courseCode: "99999",
     status: 'active'                            status: 'failed',
   }                                             notes: 'Unknown code'
                 │                             }
                 ▼                               │
      Mario Rossi logs in:                       ▼
   Sees course in "My Courses"            Access Remains Restricted
```

### 5.3 Registration Domain Model
```typescript
export interface CourseRegistration {
  id: string;
  userId: string;
  courseCode: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  source: string; // e.g. 'external_registration_portal', 'federation_desk'
  createdAt: string;
  confirmedAt?: string;
  processedAt?: string;
  enrollmentId?: string;
  notes?: string;
}
```

### 5.4 Course Codes Never Bypass Security
Course codes never bypass normal enrollment. Knowing or typing a code does not grant learner access directly; instead, confirmed external transactions create an authorized `Enrollment` record, which remains the single source of truth for authorization checks.

---

## 6. Platform Integration Architecture & Adapter Layer

To ensure seamless integration with the host **FISG Italia Hockey – IHDP** platform without code rewrites, the engine encapsulates platform interactions behind clean integration adapters in `src/integration/`:

```
Host IHDP Shell (Header, RBAC, App Switcher)
                        │
                        ▼
            ┌───────────────────────┐
            │   Integration Layer   │
            │   (src/integration/)  │
            └───────────┬───────────┘
                        │
        ┌───────────────┼───────────────┬────────────────┐
        ▼               ▼               ▼                ▼
   UserAdapter   BrandingAdapter LanguageAdapter CourseRegistrationResolver
   (RBAC & Maps)   (Tokens/Logo)   (Translation)   (Code -> Enrollment)
        │               │               │                │
        └───────────────┴───────┬───────┴────────────────┘
                                ▼
                       Courses Engine
                   (src/components/shell/CoursesContent)
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
 Learner Experience    Authoring Workbench       Enrollment Manager
(CourseCatalog/Player) (Editor/AssessmentBuilder) (Access & Progress Drilldowns)
```

### 6.1 Application Identity Mapping
- **Host Application ID**: `coach-education`
- **Display Name**: `Courses` / `Corsi`
- **Configuration Hub**: `src/config/branding.ts` provides a single source of truth for organization labels, logo assets, design tokens, and document titles.

### 6.2 Application Switcher & Shell Isolation
- `CoursesShell`: Mounts the official IHDP compact header, application switcher (`coach-education` active), and user persona controls.
- `CoursesContent`: Self-contained feature component that can be moved directly into the real IHDP router without bringing along the standalone wrapper.


