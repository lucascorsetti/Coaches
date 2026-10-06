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
