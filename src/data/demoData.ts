import { 
  Category, 
  Course, 
  Module, 
  LearningItem, 
  ContentBlock, 
  Assessment,
  Enrollment,
  Progress,
  User
} from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Luca Rossi (Federation Admin)',
    email: 'admin@fisg.it',
    role: 'admin'
  },
  {
    id: 'user-author-coaching',
    name: 'Lucas Corsetti (Head of Coaches)',
    email: 'lucas.corsetti@fisg.it',
    role: 'author',
    assignedCategoryIds: ['cat-coaching']
  },
  {
    id: 'user-author-refereeing',
    name: 'Matteo Vian (Head of Officiating)',
    email: 'matteo.vian@fisg.it',
    role: 'author',
    assignedCategoryIds: ['cat-refereeing']
  },
  {
    id: 'user-learner-a',
    name: 'Marco Zanetti (Coach Trainee)',
    email: 'marco.zanetti@fisg.it',
    role: 'learner'
  },
  {
    id: 'user-learner-b',
    name: 'Giulia Moretti (Referee Candidate)',
    email: 'giulia.moretti@fisg.it',
    role: 'learner'
  },
  {
    id: 'user-learner-c',
    name: 'Davide Conti (New Registered Member)',
    email: 'davide.conti@fisg.it',
    role: 'learner'
  }
];

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
    title: 'Demo Coaching Foundation (Maestro di Base)',
    shortTitle: 'Coaching Foundation',
    categoryId: 'cat-coaching',
    level: 'Maestro di Base',
    description: 'Official federation educational module for foundational ice hockey coaches. Covers safe rink culture, high-touch station practices, bench protocols, and player safety evaluations.',
    thumbnail: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=80',
    estimatedDuration: '45 mins',
    status: 'published',
    accessPolicy: 'private',
    completionRules: {
      requireAllLessons: true,
      requireAllAssessmentsPassed: true,
      minimumPassingScore: 75
    },
    authors: ['Lucas Corsetti (Head of Coaches)'],
    createdAt: '2026-10-01',
    updatedAt: '2026-10-05',
    publishedAt: '2026-10-05'
  },
  {
    id: 'course-demo-ref-101',
    title: 'Demo Refereeing: Basic Game Protocols',
    shortTitle: 'Refereeing Level 1',
    categoryId: 'cat-refereeing',
    level: 'Beginner / Level 1',
    description: 'Foundational certification for on-ice game officials. Covers official whistle cadence, signaling standards, bench minor enforcement, and critical safety interventions.',
    thumbnail: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=800&q=80',
    estimatedDuration: '30 mins',
    status: 'published',
    accessPolicy: 'private',
    completionRules: {
      requireAllLessons: true,
      requireAllAssessmentsPassed: true,
      minimumPassingScore: 70
    },
    authors: ['Matteo Vian (Head of Officiating)'],
    createdAt: '2026-10-02',
    updatedAt: '2026-10-06',
    publishedAt: '2026-10-06'
  }
];

export const DEMO_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-learner-a-coach',
    userId: 'user-learner-a',
    courseId: 'course-demo-101',
    status: 'active',
    enrolledAt: '2026-10-01T09:00:00Z',
    startDate: '2026-10-01',
    assignedBy: 'Lucas Corsetti (Head of Coaches)',
    notes: 'Enrolled in 2026 Maestro di Base Regional Cohort'
  },
  {
    id: 'enr-learner-b-ref',
    userId: 'user-learner-b',
    courseId: 'course-demo-ref-101',
    status: 'active',
    enrolledAt: '2026-10-02T10:30:00Z',
    startDate: '2026-10-02',
    assignedBy: 'Matteo Vian (Head of Officiating)',
    notes: 'Junior Referee Accreditation Pathway'
  }
  // user-learner-c intentionally has NO enrollments
];

export const DEMO_MODULES: Module[] = [
  // Coaching Course Modules
  {
    id: 'mod-1',
    courseId: 'course-demo-101',
    title: 'Module 1: Principles & Safe Environment',
    description: 'Orientation to athlete safety, communication culture, and practice structure.',
    order: 1,
    completionRules: { required: true, minimumScore: 70 }
  },
  {
    id: 'mod-2',
    courseId: 'course-demo-101',
    title: 'Module 2: Practical Drills & Decision Scenarios',
    description: 'Design of age-appropriate skill stations and on-ice coaching interventions.',
    order: 2,
    completionRules: { required: true, minimumScore: 75 }
  },
  // Refereeing Course Modules
  {
    id: 'mod-ref-1',
    courseId: 'course-demo-ref-101',
    title: 'Module 1: Official Whistle & Signaling Standards',
    description: 'Mastering accurate penalty signaling and ice positioning.',
    order: 1,
    completionRules: { required: true, minimumScore: 70 }
  },
  {
    id: 'mod-ref-2',
    courseId: 'course-demo-ref-101',
    title: 'Module 2: Conflict Control & Bench Management',
    description: 'Communication with head coaches, player bench control, and official reporting.',
    order: 2,
    completionRules: { required: true, minimumScore: 75 }
  }
];

export const DEMO_ITEMS: LearningItem[] = [
  // Coaching Course items
  {
    id: 'item-101',
    moduleId: 'mod-1',
    title: '1.1 Introduction to Coaching Culture',
    description: 'Fundamental mindsets for youth athlete development.',
    type: 'lesson',
    order: 1,
    estimatedDuration: '10 mins'
  },
  {
    id: 'item-102',
    moduleId: 'mod-1',
    title: '1.2 Safety Briefing & Rink Checks',
    description: 'Equipment inspection protocols and emergency action plan essentials.',
    type: 'lesson',
    order: 2,
    estimatedDuration: '15 mins'
  },
  {
    id: 'item-201',
    moduleId: 'mod-2',
    title: '2.1 Skill Station Organization',
    description: 'High-repetition station design to maximize puck touches per minute.',
    type: 'lesson',
    order: 1,
    estimatedDuration: '12 mins'
  },
  {
    id: 'item-202',
    moduleId: 'mod-2',
    title: '2.2 Module Knowledge Evaluation',
    description: 'Demonstration assessment test covering safety and station planning.',
    type: 'assessment',
    order: 2,
    estimatedDuration: '10 mins'
  },

  // Refereeing Course items
  {
    id: 'item-ref-101',
    moduleId: 'mod-ref-1',
    title: '1.1 Whistle Mechanics & Body Positioning',
    description: 'Standard whistle cadence, goal line positioning, and sightlines.',
    type: 'lesson',
    order: 1,
    estimatedDuration: '12 mins'
  },
  {
    id: 'item-ref-102',
    moduleId: 'mod-ref-1',
    title: '1.2 Signaling Infractions & Safe Play',
    description: 'Visual signals for tripping, boarding, and high-sticking infractions.',
    type: 'lesson',
    order: 2,
    estimatedDuration: '10 mins'
  },
  {
    id: 'item-ref-201',
    moduleId: 'mod-ref-2',
    title: '2.1 Bench Conduct & Captain Dialogue',
    description: 'Managing emotional coach interactions under high-pressure scenarios.',
    type: 'lesson',
    order: 1,
    estimatedDuration: '15 mins'
  },
  {
    id: 'item-ref-202',
    moduleId: 'mod-ref-2',
    title: '2.2 Official Rules Assessment',
    description: 'Certification test covering penalty definitions and faceoff locations.',
    type: 'assessment',
    order: 2,
    estimatedDuration: '12 mins'
  }
];

export const DEMO_ASSESSMENTS: Assessment[] = [

  {
    id: 'assess-demo-1',
    courseId: 'course-demo-101',
    moduleId: 'mod-2',
    title: 'Coaching Module 2 Knowledge Evaluation',
    description: 'Verify understanding of station safety, athlete workload, and concussion protocols.',
    passingScore: 75,
    maxAttempts: 3,
    revealAnswers: true,
    questions: [
      {
        id: 'q-1',
        type: 'multiple-choice',
        question: 'What is the primary objective of station-based practices for youth athletes?',
        options: [
          { id: 'opt-1a', text: 'Minimize total time on ice to save arena energy costs' },
          { id: 'opt-1b', text: 'Maximize active puck touches and decision-making repetitions' },
          { id: 'opt-1c', text: 'Focus exclusively on full-ice conditioning laps' },
          { id: 'opt-1d', text: 'Isolate goaltenders completely away from skaters' }
        ],
        correctAnswers: ['opt-1b'],
        explanation: 'Station-based training multiplies active puck touches and engagement by up to 4x compared to traditional line drills.',
        points: 25,
        order: 1
      },
      {
        id: 'q-2',
        type: 'true-false',
        question: 'A coach should wait until the end of practice to inspect gate latches and protective netting.',
        options: [
          { id: 'opt-2a', text: 'True' },
          { id: 'opt-2b', text: 'False' }
        ],
        correctAnswers: ['opt-2b'],
        explanation: 'Physical rink and board inspections must occur prior to any player stepping onto the ice surface.',
        points: 25,
        order: 2
      },
      {
        id: 'q-3',
        type: 'multiple-select',
        question: 'Which of the following are essential elements of an effective station drill? (Select all that apply)',
        options: [
          { id: 'opt-3a', text: 'Clear visual boundaries using markers, cones, or foam dividers' },
          { id: 'opt-3b', text: 'Maximum wait time exceeding 90 seconds per repetition' },
          { id: 'opt-3c', text: 'Clear coaching cues (1-2 focal points per station)' },
          { id: 'opt-3d', text: 'Progressive difficulty adjustment for varying player abilities' }
        ],
        correctAnswers: ['opt-3a', 'opt-3c', 'opt-3d'],
        explanation: 'Effective station setups minimize passive queue time, provide concise instructions, and adapt to individual player needs.',
        points: 25,
        order: 3
      },
      {
        id: 'q-4',
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
  },
  {
    id: 'assess-ref-1',
    courseId: 'course-demo-ref-101',
    moduleId: 'mod-ref-2',
    title: 'Refereeing Basic Protocols Assessment',
    description: 'Officiating evaluation regarding penalty enforcement, faceoff procedures, and bench management.',
    passingScore: 70,
    maxAttempts: 3,
    revealAnswers: true,
    questions: [
      {
        id: 'q-ref-1',
        type: 'multiple-choice',
        question: 'When signaling a delayed minor penalty, what is the referee standard action?',
        options: [
          { id: 'opt-r1a', text: 'Immediately blow the whistle regardless of who has the puck' },
          { id: 'opt-r1b', text: 'Point directly at the offending player and raise non-whistle arm straight up' },
          { id: 'opt-r1c', text: 'Skate to the penalty box immediately' }
        ],
        correctAnswers: ['opt-r1b'],
        explanation: 'Raise the non-whistle arm vertically and maintain visual surveillance until the offending team secures puck control.',
        points: 35,
        order: 1
      },
      {
        id: 'q-ref-2',
        type: 'true-false',
        question: 'Only designated captains and alternate captains on the ice have the privilege of inquiring about rule interpretations with officials.',
        options: [
          { id: 'opt-r2a', text: 'True' },
          { id: 'opt-r2b', text: 'False' }
        ],
        correctAnswers: ['opt-r2a'],
        explanation: 'Federation rules restrict on-ice dialogue to active captains to maintain order and avoid bench disputes.',
        points: 35,
        order: 2
      },
      {
        id: 'q-ref-3',
        type: 'scenario',
        question: 'Scenario: A coach violently slams the bench gate and yells profanities at a line call. How do you respond?',
        options: [
          { id: 'opt-r3a', text: 'Yell back at the coach to assert authority' },
          { id: 'opt-r3b', text: 'Issue a Bench Minor for Unsportsmanlike Conduct calmly and report the incident on the official game sheet' },
          { id: 'opt-r3c', text: 'Ignore the behavior completely' }
        ],
        correctAnswers: ['opt-r3b'],
        explanation: 'Calm and decisive application of rule penalties maintains game integrity without escalating hostility.',
        points: 30,
        order: 3
      }
    ]
  }
];

export const DEMO_ASSESSMENT = DEMO_ASSESSMENTS[0];

export const DEMO_BLOCKS: ContentBlock[] = [
  // Coaching: Item 1.1 Blocks
  {
    id: 'block-1',
    learningItemId: 'item-101',
    type: 'heading',
    order: 1,
    data: {
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
      title: 'Federation Accreditation Core',
      text: 'This course is part of the official FISG Italia Hockey Development Program accreditation path. Completion is tracked and recorded to your coach profile.'
    }
  },
  {
    id: 'block-3',
    learningItemId: 'item-101',
    type: 'text',
    order: 3,
    data: {
      content: `### Welcome to Maestro di Base (Foundation Level)

Coaching education within the **Italia Hockey Development Program** centers on developing athletes holistically—combining technical proficiency, cognitive speed, and sport enjoyment.

As a certified coach, your key responsibilities include:
* Creating **psychologically safe** team climates where players learn through experimentation.
* Designing **high-touch, station-based** practices that maximize puck touches per minute.
* Modeling **fair play and respect** toward opposing players and match officials.`
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
      question: 'Quick Check: What is the primary focus of youth coaching under IHDP standards?',
      options: [
        'Winning tournaments at all costs with minimal roster rotation',
        'Holistic athletic development, high puck contact, and enjoyment',
        'Endless off-ice fitness tests and dryland running'
      ],
      correctIndex: 1,
      explanation: 'Long-term player retention and skill growth flourish when practice is fun, high-intensity, and inclusive.'
    }
  },

  // Coaching: Item 1.2 Blocks
  {
    id: 'block-10',
    learningItemId: 'item-102',
    type: 'heading',
    order: 1,
    data: {
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
      thumbnail: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=800&q=80'
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
      text: 'No player or coach may step onto the ice surface without a properly fastened certified helmet and BNQ-approved neck guard.'
    }
  },
  {
    id: 'block-13',
    learningItemId: 'item-102',
    type: 'scenario',
    order: 4,
    data: {
      title: 'Bench Gate Latch Failure',
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

  // Coaching: Item 2.1 Blocks
  {
    id: 'block-20',
    learningItemId: 'item-201',
    type: 'heading',
    order: 1,
    data: {
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

  // Coaching: Item 2.2 Assessment Block
  {
    id: 'block-30',
    learningItemId: 'item-202',
    type: 'assessment',
    order: 1,
    data: {
      assessmentId: 'assess-demo-1',
      title: 'Module 2 Evaluation'
    }
  },

  // Refereeing: Item ref-101 Blocks
  {
    id: 'block-ref-1',
    learningItemId: 'item-ref-101',
    type: 'heading',
    order: 1,
    data: {
      text: 'Whistle Mechanics & Sightlines',
      subtitle: 'Clear, authoritative sound delivery and ice positioning'
    }
  },
  {
    id: 'block-ref-2',
    learningItemId: 'item-ref-101',
    type: 'callout',
    order: 2,
    data: {
      style: 'info',
      title: 'The Whistle Speaks',
      text: 'Your whistle is the primary voice on the ice. A crisp, sharp blast immediately commands player attention and halts play safely.'
    }
  },
  {
    id: 'block-ref-3',
    learningItemId: 'item-ref-101',
    type: 'text',
    order: 3,
    data: {
      content: `### Goal Line Positioning
Officials must maintain a position along the goal line (approximately 1.5 meters from the boards) when play enters the attacking zone.

* Move into the **Home Base** position at the goal line.
* Never get pinned behind the net unless avoiding a puck scramble.
* Keep skates facing toward the center of the ice to preserve peripheral vision.`
    }
  },
  {
    id: 'block-ref-4',
    learningItemId: 'item-ref-101',
    type: 'question',
    order: 4,
    data: {
      question: 'Where should a referee stand when play is deep in the attacking zone?',
      options: [
        'At center ice leaning on the red line',
        'At the goal line, 1.5m off the boards in Home Base position',
        'Directly inside the goal crease with the goalie'
      ],
      correctIndex: 1,
      explanation: 'The goal line position ensures the official can judge puck over line without obstructing gameplay.'
    }
  },

  // Refereeing: Item ref-102 Blocks
  {
    id: 'block-ref-10',
    learningItemId: 'item-ref-102',
    type: 'heading',
    order: 1,
    data: {
      text: 'Signaling Infractions & Safe Play',
      subtitle: 'Clean visual communication for players, coaches, and penalty keepers'
    }
  },
  {
    id: 'block-ref-11',
    learningItemId: 'item-ref-102',
    type: 'callout',
    order: 2,
    data: {
      style: 'warning',
      title: 'High-Impact Penalties',
      text: 'Checking from behind, head contact, and boarding carry strict mandatory penalties under FISG rules. Do not hesitate to assess proper penalties.'
    }
  },
  {
    id: 'block-ref-12',
    learningItemId: 'item-ref-102',
    type: 'scenario',
    order: 3,
    data: {
      title: 'Puck Out of Sight During Goalie Cover',
      situation: 'An attacking forward pushes a loose puck under the goaltender pads. You lose visual sight of the puck for more than 1 second.',
      choices: [
        {
          id: 'c-ref-1',
          text: 'Wait 5 seconds to see if it rolls out into the net',
          feedback: 'Dangerous. Waiting too long invites aggressive stick digs on the goalie hands, escalating into scrums.',
          isCorrect: false
        },
        {
          id: 'c-ref-2',
          text: 'Blow the whistle immediately the moment sight of the puck is lost',
          feedback: 'Correct rule application. Protects the goaltender and establishes firm game control.',
          isCorrect: true
        }
      ]
    }
  },

  // Refereeing: Item ref-201 Blocks
  {
    id: 'block-ref-20',
    learningItemId: 'item-ref-201',
    type: 'heading',
    order: 1,
    data: {
      text: 'Bench Conduct & Captain Dialogue',
      subtitle: 'De-escalating tension with coaches and team benches'
    }
  },
  {
    id: 'block-ref-21',
    learningItemId: 'item-ref-201',
    type: 'text',
    order: 2,
    data: {
      content: `Communication with coaches should remain brief, factual, and respectful:

1. **Keep distance**: Stand 2 meters away from the bench railing.
2. **Explain the call**: "Coach, stick made contact directly with the skates, tripping minor."
3. **End dialogue politely**: Do not enter protracted arguments. Resume play promptly.`
    }
  },

  // Refereeing: Item ref-202 Assessment Block
  {
    id: 'block-ref-30',
    learningItemId: 'item-ref-202',
    type: 'assessment',
    order: 1,
    data: {
      assessmentId: 'assess-ref-1',
      title: 'Module 2 Official Rules Assessment'
    }
  }
];

// Seeded initial progress: Learner A has completed Module 1 (Items 101 and 102)
export const DEMO_PROGRESS: Progress[] = [
  {
    id: 'prog-1',
    enrollmentId: 'enr-learner-a-coach',
    userId: 'user-learner-a',
    courseId: 'course-demo-101',
    moduleId: 'mod-1',
    learningItemId: 'item-101',
    completed: true,
    completedAt: '2026-10-02T11:00:00Z',
    lastActivityAt: '2026-10-02T11:00:00Z'
  },
  {
    id: 'prog-2',
    enrollmentId: 'enr-learner-a-coach',
    userId: 'user-learner-a',
    courseId: 'course-demo-101',
    moduleId: 'mod-1',
    learningItemId: 'item-102',
    completed: true,
    completedAt: '2026-10-03T15:30:00Z',
    lastActivityAt: '2026-10-03T15:30:00Z'
  }
];
