# IHDP Courses Engine — Technical Architecture

This document outlines the software architecture of the **standalone IHDP Courses engine** developed in the repository `lucascorsetti/Coaches` for the **FISG Italia Hockey Development Program**.

---

## 1. Core Principles

1. **Standalone Development First**: 
   The application is completely self-contained. It avoids all hard-coded connections to external backend endpoints (Supabase, Firebase, or existing IHDP production APIs) during engine development.

2. **Decoupled Data Access**:
   All state management and persistence rely on repository interfaces (`ICourseRepository`, `ICategoryRepository`, `IAssessmentRepository`, `IProgressRepository`, `ISubmissionRepository`). Swapping storage from browser `localStorage` to Supabase requires touching only the repository layer—UI components never make direct database queries.

3. **Content- and Category-Agnostic**:
   Categories are pure data records (e.g. `Coaching`, `Refereeing`, `Off-Ice Training`, `Equipment & Safety`). The engine never executes branch logic based on category names (no `if (category === 'coaching')`).

4. **Block-Based Lesson Engine**:
   Lessons are dynamic collections of ordered content blocks. Authors compose headings, rich text, images, videos, PDF documents, callouts, knowledge check questions, interactive on-ice scenarios, and module assessments in any sequence.

5. **Head of Coaches Authoring Experience**:
   No code, JSON, raw database IDs, or schema editing is exposed to instructors. Content creators use an intuitive visual builder:
   `Create Course` → `Add Module` → `Add Lesson` → `Add Content Blocks` → `Preview` → `Publish`.

---

## 2. Domain Model Hierarchy

```
Category (e.g., Coaching, Refereeing)
  └── Course (e.g., Maestro di Base, Level 1, Referee Level 1)
        └── Module (Ordered unit, completion rules)
              └── LearningItem / Lesson (Ordered lesson, duration, type)
                    ├── ContentBlock (Ordered: text, video, scenario, quiz, pdf)
                    └── Assessment / Quiz (Passing score, questions, attempts)
```

### Entity Specifications

- **Category**: Dynamic taxonomy classification (`id`, `slug`, `name`, `nameIt`, `color`, `icon`).
- **Course**: Educational curriculum container (`id`, `title`, `shortTitle`, `categoryId`, `level`, `status`, `authors`, `estimatedDuration`).
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
- **Progress**: Granular learner tracking per user, course, module, and lesson (`completed`, `score`, `completedAt`).
- **Attempt**: History of learner quiz evaluations (`userId`, `assessmentId`, `score`, `passed`, `answers`).

---

## 3. Directory Layout

```
/src
├── components
│   ├── author               # Head of Coaches builder UI
│   │   ├── AuthorDashboard.tsx  # Course manager, KPIs, status controls
│   │   ├── CourseEditor.tsx     # Module, lesson & block visual builder
│   │   └── BlockEditor.tsx      # Block-specific form inputs
│   ├── learner              # Coach trainee learning UI
│   │   ├── CourseCatalog.tsx    # Filterable courses directory
│   │   ├── CourseOverview.tsx   # Syllabus, progress radar & resume action
│   │   ├── LessonPlayer.tsx     # Player layout with module drawer
│   │   ├── BlockRenderer.tsx    # Polymorphic content block renderer
│   │   └── InteractiveQuiz.tsx  # Quiz submission & scoring engine
│   ├── common               # Reusable IHDP components
│   │   ├── Navbar.tsx           # FISG header with role & language toggles
│   │   ├── ProgressBar.tsx      # Consistent federation progress bars
│   │   └── StatusBadge.tsx      # Draft, Published, Archived badges
│   └── docs
│       └── EngineDocs.tsx       # In-app architecture and SQL schema viewer
├── context
│   └── AuthContext.tsx      # Role simulation (Learner, Head of Coaches, Admin)
├── data
│   └── demoData.ts          # Default multi-category coaching & refereeing curriculum
├── i18n
│   └── translations.ts      # Full English (EN) and Italian (IT) dictionaries
├── repositories
│   ├── interfaces.ts        # Pure domain interfaces (ICourseRepository, etc.)
│   ├── index.ts             # Service locator exporting active repository instance
│   └── localStorage         # Browser-local implementation for standalone mode
│       ├── courseRepository.ts
│       ├── categoryRepository.ts
│       ├── assessmentRepository.ts
│       ├── progressRepository.ts
│       └── submissionRepository.ts
├── types
│   └── index.ts             # Strict TypeScript domain types
├── App.tsx                  # Root state coordinator
├── main.tsx                 # Vite mounting entry
└── index.css                # Tailwind CSS v4 design tokens
```

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
