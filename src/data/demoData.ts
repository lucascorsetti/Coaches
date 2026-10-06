import { 
  Category, 
  Course, 
  Module, 
  LearningItem, 
  ContentBlock, 
  Assessment 
} from '../types';

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat-coaching',
    slug: 'coaching',
    name: 'Coaching',
    nameIt: 'Allenatori',
    description: 'Accreditation and continuous education pathways for hockey coaches.',
    order: 1,
    icon: 'Award'
  },
  {
    id: 'cat-refereeing',
    slug: 'refereeing',
    name: 'Refereeing',
    nameIt: 'Arbitri',
    description: 'Officiating rules, game control, and federation technical standards.',
    order: 2,
    icon: 'Shield'
  },
  {
    id: 'cat-off-ice',
    slug: 'off-ice',
    name: 'Off-Ice & Physical Training',
    nameIt: 'Preparazione Atletica',
    description: 'Athletic development, recovery protocols, and safe sports environments.',
    order: 3,
    icon: 'Activity'
  }
];

export const DEMO_COURSES: Course[] = [
  {
    id: 'course-demo-101',
    title: 'Demo Coaching Foundation',
    shortTitle: 'Coaching Foundation',
    categoryId: 'cat-coaching',
    level: 'Maestro di Base',
    description: 'Sample demonstration course for the IHDP Courses engine. Illustrates module hierarchy, content block sequencing, scenario testing, and end-of-module assessment.',
    thumbnail: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=80',
    estimatedDuration: '45 mins',
    status: 'published',
    authors: ['Head of Coaching (Demo Author)'],
    createdAt: '2026-10-01',
    updatedAt: '2026-10-05',
    publishedAt: '2026-10-05'
  },
  {
    id: 'course-demo-ref-101',
    title: 'Demo Refereeing: Basic Game Protocols',
    shortTitle: 'Ref Protocols',
    categoryId: 'cat-refereeing',
    level: 'Beginner',
    description: 'Prototype refereeing module to test category-agnostic engine support for officiating signals and whistle procedures.',
    thumbnail: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=800&q=80',
    estimatedDuration: '30 mins',
    status: 'draft',
    authors: ['Head of Officiating (Demo Author)'],
    createdAt: '2026-10-02',
    updatedAt: '2026-10-02'
  }
];

export const DEMO_MODULES: Module[] = [
  {
    id: 'mod-1',
    courseId: 'course-demo-101',
    title: 'Module 1: Principles & Safe Environment',
    description: 'Orientation to athlete safety, communication culture, and practice structure.',
    order: 1,
    completionRules: { requireAllLessons: true }
  },
  {
    id: 'mod-2',
    courseId: 'course-demo-101',
    title: 'Module 2: Practical Drills & Decision Scenarios',
    description: 'Design of age-appropriate skill stations and on-ice coaching interventions.',
    order: 2,
    completionRules: { requireAllLessons: true, minPassingScore: 75 }
  }
];

export const DEMO_ITEMS: LearningItem[] = [
  // Module 1 items
  {
    id: 'item-101',
    moduleId: 'mod-1',
    title: '1.1 Introduction to Coaching Culture',
    description: 'Fundamental mindsets for youth athlete development.',
    type: 'lesson',
    order: 1,
    estimatedDuration: '10 mins',
    completionRules: { autoCompleteOnView: true }
  },
  {
    id: 'item-102',
    moduleId: 'mod-1',
    title: '1.2 Safety Briefing & Rink Checks',
    description: 'Equipment inspection protocols and emergency action plan essentials.',
    type: 'lesson',
    order: 2,
    estimatedDuration: '15 mins',
    completionRules: { requireVideoWatch: true }
  },
  // Module 2 items
  {
    id: 'item-201',
    moduleId: 'mod-2',
    title: '2.1 Skill Station Organization',
    description: 'High-repetition station design to maximize puck touches per minute.',
    type: 'lesson',
    order: 1,
    estimatedDuration: '12 mins',
    completionRules: { autoCompleteOnView: true }
  },
  {
    id: 'item-202',
    moduleId: 'mod-2',
    title: '2.2 Module Knowledge Evaluation',
    description: 'Demonstration assessment test covering safety and station planning.',
    type: 'assessment',
    order: 2,
    estimatedDuration: '10 mins',
    completionRules: { requireQuizPass: true }
  }
];

export const DEMO_ASSESSMENT: Assessment = {
  id: 'assess-demo-1',
  courseId: 'course-demo-101',
  learningItemId: 'item-202',
  title: 'Module 2 Knowledge Evaluation',
  description: 'Complete all scenario questions to verify understanding of station setup and bench safety.',
  passingScore: 75,
  maxAttempts: 3,
  revealAnswers: true,
  questions: [
    {
      id: 'q-1',
      assessmentId: 'assess-demo-1',
      type: 'multiple-choice',
      question: 'What is the primary objective of station-based practices for U11/U13 athletes?',
      options: [
        { id: 'opt-1a', text: 'Minimize total time on ice to save arena energy costs' },
        { id: 'opt-1b', text: 'Maximize active puck touches and decision-making repetitions' },
        { id: 'opt-1c', text: 'Focus exclusively on full-ice conditioning laps' },
        { id: 'opt-1d', text: 'Isolate goaltenders completely away from skaters' }
      ],
      correctAnswers: ['opt-1b'],
      explanation: 'Station-based training dramatically multiplies puck contact time and game-like decision opportunities compared to traditional full-ice queues.',
      points: 25,
      order: 1
    },
    {
      id: 'q-2',
      assessmentId: 'assess-demo-1',
      type: 'true-false',
      question: 'A coach should wait until the end of practice to inspect gate latches and protective netting.',
      options: [
        { id: 'opt-2a', text: 'True' },
        { id: 'opt-2b', text: 'False' }
      ],
      correctAnswers: ['opt-2b'],
      explanation: 'Physical rink inspections must occur prior to any player stepping onto the ice surface.',
      points: 25,
      order: 2
    },
    {
      id: 'q-3',
      assessmentId: 'assess-demo-1',
      type: 'multiple-select',
      question: 'Which of the following are essential elements of an effective station drill? (Select all that apply)',
      options: [
        { id: 'opt-3a', text: 'Clear visual boundaries using markers, cones, or foam dividers' },
        { id: 'opt-3b', text: 'Maximum wait time exceeding 90 seconds per repetition' },
        { id: 'opt-3c', text: 'Clear coaching cues (1-2 focal points per station)' },
        { id: 'opt-3d', text: 'Progressive difficulty adjustment for varying player abilities' }
      ],
      correctAnswers: ['opt-3a', 'opt-3c', 'opt-3d'],
      explanation: 'Stations must minimize passive standing time, provide focused cues, and adapt to individual player growth rates.',
      points: 25,
      order: 3
    },
    {
      id: 'q-4',
      assessmentId: 'assess-demo-1',
      type: 'scenario',
      question: 'Scenario: During a 3v2 drill, a player sustains a direct stick impact to the helmet and appears momentarily disoriented. What is your immediate protocol?',
      options: [
        { id: 'opt-4a', text: 'Tell the player to skate hard to shake it off and finish the shift' },
        { id: 'opt-4b', text: 'Immediately halt drill activity, safely escort player to bench/medical area, and initiate concussion screening' },
        { id: 'opt-4c', text: 'Switch the player to a defensive position for the remainder of the session' }
      ],
      correctAnswers: ['opt-4b'],
      explanation: 'Player safety always takes absolute precedence. Suspected head impacts require immediate removal and evaluation under protocol.',
      points: 25,
      order: 4
    }
  ]
};

export const DEMO_BLOCKS: ContentBlock[] = [
  // Blocks for Item 1.1
  {
    id: 'block-1',
    learningItemId: 'item-101',
    type: 'heading',
    order: 1,
    data: {
      level: 1,
      text: 'Foundations of Athlete-Centered Coaching',
      subtitle: 'Building safe, engaging, and progressive learning environments'
    }
  },
  {
    id: 'block-2',
    learningItemId: 'item-101',
    type: 'callout',
    order: 2,
    data: {
      style: 'info',
      title: 'Course Objective',
      text: 'This engine allows federations to structure learning journeys with mixed multimedia, interactive knowledge checks, and progressive modular verification.'
    }
  },
  {
    id: 'block-3',
    learningItemId: 'item-101',
    type: 'text',
    order: 3,
    data: {
      content: `### Welcome to the IHDP Learning Engine

Coaching education within the **Italia Hockey Development Program** centers on developing athletes holistically—combining technical proficiency, cognitive speed, and sport enjoyment.

As a course author, you can structure lessons by assembling modular blocks in any sequence:
* **Rich explanations** to frame concepts clearly
* **Visual diagrams and video examples** of on-ice execution
* **Interactive scenarios** to test real-world bench and practice decisions
* **Formal assessments** with configurable passing thresholds`
    }
  },
  {
    id: 'block-4',
    learningItemId: 'item-101',
    type: 'image',
    order: 4,
    data: {
      url: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
      caption: 'Figure 1: On-ice communication and small area station organization',
      alt: 'Hockey players in practice formation'
    }
  },
  {
    id: 'block-5',
    learningItemId: 'item-101',
    type: 'question',
    order: 5,
    data: {
      question: 'Quick Check: Who will eventually author and configure course content in this system?',
      options: [
        'External web agencies writing hardcoded React pages',
        'Federation Heads of Coaches using the visual Course Builder without writing code',
        'Database administrators executing SQL queries'
      ],
      correctIndex: 1,
      explanation: 'The authoring experience is designed for federation leaders to create, order, and edit modules and blocks easily.'
    }
  },

  // Blocks for Item 1.2
  {
    id: 'block-10',
    learningItemId: 'item-102',
    type: 'heading',
    order: 1,
    data: {
      level: 1,
      text: 'Safety Briefing & Equipment Checklists',
      subtitle: 'Ensuring ice safety and proactive risk prevention'
    }
  },
  {
    id: 'block-11',
    learningItemId: 'item-102',
    type: 'video',
    order: 2,
    data: {
      title: 'Practice Rink Inspection Walkthrough',
      sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      durationMinutes: 4,
      thumbnail: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=800&q=80',
      provider: 'internal'
    }
  },
  {
    id: 'block-12',
    learningItemId: 'item-102',
    type: 'callout',
    order: 3,
    data: {
      style: 'warning',
      title: 'Zero Tolerance Protocol',
      text: 'No player or coach may enter the ice surface without a properly fastened certified helmet and neck protector.'
    }
  },
  {
    id: 'block-13',
    learningItemId: 'item-102',
    type: 'scenario',
    order: 4,
    data: {
      title: 'Bench Gate Scenario',
      situation: 'Right before practice commences, a bench latch fails to securely fasten. There are 25 young skaters warming up on the ice.',
      choices: [
        {
          id: 'c-1',
          text: 'Ignore it and tell players not to lean on the gate door',
          feedback: 'Unacceptable risk. Skaters colliding near an unsecured gate can suffer severe injury.',
          isCorrect: false
        },
        {
          id: 'c-2',
          text: 'Keep players inside the opposite zone, notify rink staff immediately, and secure gate before drill progression',
          feedback: 'Correct procedure. Immediate containment ensures physical safety while resolving the hazard.',
          isCorrect: true
        }
      ]
    }
  },

  // Blocks for Item 2.1
  {
    id: 'block-20',
    learningItemId: 'item-201',
    type: 'heading',
    order: 1,
    data: {
      level: 1,
      text: 'Small Area Games & Station Design',
      subtitle: 'High density repetitions and progressive complexity'
    }
  },
  {
    id: 'block-21',
    learningItemId: 'item-201',
    type: 'text',
    order: 2,
    data: {
      content: `Stations divide the ice sheet into 3 to 4 distinct operational zones. 

Key principles:
1. **Activity Ratio**: Every player should have at least 80% active movement time.
2. **Read-and-React**: Avoid static cones whenever a defender or passer can be introduced.
3. **Transition Rules**: Rotate clockwise on coach whistle after 6 to 8 minute intervals.`
    }
  },
  {
    id: 'block-22',
    learningItemId: 'item-201',
    type: 'document',
    order: 3,
    data: {
      title: 'Sample 4-Station Practice Ice Layout (PDF Template)',
      fileUrl: '#download-template',
      fileSize: '1.2 MB',
      format: 'PDF'
    }
  },

  // Blocks for Item 2.2 (Assessment)
  {
    id: 'block-30',
    learningItemId: 'item-202',
    type: 'assessment',
    order: 1,
    data: {
      assessmentId: 'assess-demo-1',
      title: 'Module 2 Evaluation'
    }
  }
];
