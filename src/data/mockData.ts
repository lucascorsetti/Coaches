import { Athlete, TacticalDrill, TrainingSession, Match, TeamProfile } from '../types';

export const INITIAL_TEAM: TeamProfile = {
  id: 'team-1',
  name: 'Cortina Ice Wolves',
  league: 'Italian Hockey Championship / Alpine League',
  sport: 'hockey',
  season: '2025/2026',
  headCoach: 'Lucas Corsetti',
  assistantCoaches: ['Matteo Rossi', 'Elena Bianchi (Strength & Conditioning)'],
  primaryColor: '#3b82f6',
  secondaryColor: '#0ea5e9'
};

export const INITIAL_ATHLETES: Athlete[] = [
  {
    id: 'ath-1',
    name: 'Marco Zanatta',
    number: 19,
    position: 'Center',
    secondaryPosition: 'Winger',
    age: 26,
    heightCm: 185,
    weightKg: 88,
    dominantSide: 'Left',
    healthStatus: 'fit',
    readinessScore: 94,
    attendanceRate: 98,
    lineUnit: 'Line 1',
    metrics: {
      vo2max: 58.2,
      maxSpeedKmh: 37.4,
      heartRateRest: 48,
      heartRateMax: 192,
      acwr: 1.08,
      verticalJumpCm: 64
    },
    notes: 'Team captain. Elite faceoff win rate (62%). High hockey IQ on transitional breaks.',
    stats: {
      gamesPlayed: 24,
      goals: 18,
      assists: 22,
      plusMinus: 14,
      penaltiesMinutes: 12
    }
  },
  {
    id: 'ath-2',
    name: 'Davide Kostner',
    number: 71,
    position: 'Winger',
    secondaryPosition: 'Forward',
    age: 24,
    heightCm: 182,
    weightKg: 84,
    dominantSide: 'Right',
    healthStatus: 'fit',
    readinessScore: 89,
    attendanceRate: 96,
    lineUnit: 'Line 1',
    metrics: {
      vo2max: 56.5,
      maxSpeedKmh: 38.1,
      heartRateRest: 51,
      heartRateMax: 195,
      acwr: 1.15,
      verticalJumpCm: 68
    },
    notes: 'Explosive acceleration along the boards. Excellent wrist shot release from the high slot.',
    stats: {
      gamesPlayed: 24,
      goals: 15,
      assists: 16,
      plusMinus: 11,
      penaltiesMinutes: 8
    }
  },
  {
    id: 'ath-3',
    name: 'Andrea Bernard',
    number: 8,
    position: 'Defenseman',
    age: 28,
    heightCm: 191,
    weightKg: 95,
    dominantSide: 'Left',
    healthStatus: 'recovering',
    readinessScore: 78,
    attendanceRate: 92,
    lineUnit: 'Line 1',
    metrics: {
      vo2max: 53.8,
      maxSpeedKmh: 34.6,
      heartRateRest: 54,
      heartRateMax: 188,
      acwr: 0.92,
      verticalJumpCm: 59
    },
    notes: 'Recovering from mild groin tightness. Limited to non-contact drills on Tuesday.',
    stats: {
      gamesPlayed: 22,
      goals: 4,
      assists: 19,
      plusMinus: 16,
      penaltiesMinutes: 28
    }
  },
  {
    id: 'ath-4',
    name: 'Gianluca De Luca',
    number: 30,
    position: 'Goaltender',
    age: 27,
    heightCm: 188,
    weightKg: 87,
    dominantSide: 'Left',
    healthStatus: 'fit',
    readinessScore: 96,
    attendanceRate: 100,
    lineUnit: 'Line 1',
    metrics: {
      vo2max: 51.0,
      maxSpeedKmh: 28.0,
      heartRateRest: 46,
      heartRateMax: 186,
      acwr: 1.02,
      verticalJumpCm: 61
    },
    notes: 'Starting netminder. Butterfly style, quick lateral post-to-post recoveries.',
    stats: {
      gamesPlayed: 20,
      goals: 0,
      assists: 2,
      savesPercentage: 92.8,
      plusMinus: 0,
      penaltiesMinutes: 2
    }
  },
  {
    id: 'ath-5',
    name: 'Luca Oberrauch',
    number: 22,
    position: 'Forward',
    secondaryPosition: 'Center',
    age: 22,
    heightCm: 180,
    weightKg: 81,
    dominantSide: 'Right',
    healthStatus: 'fit',
    readinessScore: 92,
    attendanceRate: 100,
    lineUnit: 'Line 2',
    metrics: {
      vo2max: 59.0,
      maxSpeedKmh: 36.9,
      heartRateRest: 49,
      heartRateMax: 196,
      acwr: 1.05,
      verticalJumpCm: 66
    },
    notes: 'Relentless forecheck engine. Creates high-danger turnovers on opponent breakouts.',
    stats: {
      gamesPlayed: 24,
      goals: 9,
      assists: 12,
      plusMinus: 7,
      penaltiesMinutes: 14
    }
  },
  {
    id: 'ath-6',
    name: 'Stefano Marchetti',
    number: 44,
    position: 'Defenseman',
    age: 29,
    heightCm: 189,
    weightKg: 93,
    dominantSide: 'Right',
    healthStatus: 'fit',
    readinessScore: 88,
    attendanceRate: 95,
    lineUnit: 'Line 2',
    metrics: {
      vo2max: 52.4,
      maxSpeedKmh: 35.1,
      heartRateRest: 52,
      heartRateMax: 187,
      acwr: 1.09,
      verticalJumpCm: 58
    },
    notes: 'Shutdown stay-at-home blue liner. Outstanding gap control and stick checking.',
    stats: {
      gamesPlayed: 24,
      goals: 2,
      assists: 11,
      plusMinus: 9,
      penaltiesMinutes: 22
    }
  },
  {
    id: 'ath-7',
    name: 'Filippo Rigoni',
    number: 9,
    position: 'Winger',
    age: 21,
    heightCm: 178,
    weightKg: 78,
    dominantSide: 'Left',
    healthStatus: 'injured',
    readinessScore: 42,
    attendanceRate: 78,
    lineUnit: 'Reserves',
    metrics: {
      vo2max: 55.0,
      maxSpeedKmh: 36.0,
      heartRateRest: 58,
      heartRateMax: 194,
      acwr: 0.65,
      verticalJumpCm: 62
    },
    notes: 'Shoulder sprain (grade 1). Undergoing rehab with physiotherapist; estimated return 10 days.',
    stats: {
      gamesPlayed: 14,
      goals: 5,
      assists: 6,
      plusMinus: 3,
      penaltiesMinutes: 6
    }
  },
  {
    id: 'ath-8',
    name: 'Alex Trivellato',
    number: 55,
    position: 'Defenseman',
    age: 31,
    heightCm: 187,
    weightKg: 90,
    dominantSide: 'Left',
    healthStatus: 'fit',
    readinessScore: 85,
    attendanceRate: 98,
    lineUnit: 'Line 1',
    metrics: {
      vo2max: 54.1,
      maxSpeedKmh: 34.9,
      heartRateRest: 50,
      heartRateMax: 184,
      acwr: 1.04,
      verticalJumpCm: 60
    },
    notes: 'Veteran leader. Quarterbacks the first power play unit with crisp point distribution.',
    stats: {
      gamesPlayed: 24,
      goals: 6,
      assists: 21,
      plusMinus: 12,
      penaltiesMinutes: 16
    }
  }
];

export const INITIAL_DRILLS: TacticalDrill[] = [
  {
    id: 'drill-1',
    title: '3-on-2 Rush with High Trailer Option',
    category: 'Tactical',
    sport: 'hockey',
    durationMinutes: 15,
    intensity: 'High',
    description: 'Forwards execute wide zone entry driving defenders deep, pulling puck back to trailing defenseman at high slot for screened one-timer.',
    keyCoachingPoints: [
      'Outside wingers must drive the dots with speed to push defensemen back',
      'Center stays central to create net-front screen and tip window',
      'Trailer defenseman reads shooting lane before firing'
    ],
    tokens: [
      { id: 't-1', x: 20, y: 75, type: 'player-offense', label: 'LW' },
      { id: 't-2', x: 50, y: 85, type: 'player-offense', label: 'C' },
      { id: 't-3', x: 80, y: 75, type: 'player-offense', label: 'RW' },
      { id: 't-4', x: 50, y: 92, type: 'player-offense', label: 'D1' },
      { id: 't-5', x: 35, y: 40, type: 'player-defense', label: 'LD' },
      { id: 't-6', x: 65, y: 40, type: 'player-defense', label: 'RD' },
      { id: 't-7', x: 50, y: 15, type: 'goalie', label: 'G' },
      { id: 't-8', x: 22, y: 70, type: 'ball-puck', label: 'P' }
    ],
    drawings: [
      {
        id: 'd-1',
        type: 'skate',
        points: [{ x: 20, y: 75 }, { x: 22, y: 45 }, { x: 32, y: 30 }],
        color: '#38bdf8'
      },
      {
        id: 'd-2',
        type: 'pass',
        points: [{ x: 25, y: 42 }, { x: 50, y: 60 }],
        color: '#facc15',
        dashed: true
      },
      {
        id: 'd-3',
        type: 'arrow',
        points: [{ x: 50, y: 60 }, { x: 50, y: 22 }],
        color: '#ef4444'
      }
    ],
    createdAt: '2026-09-15'
  },
  {
    id: 'drill-2',
    title: '1-2-2 Neutral Zone Forecheck Trap',
    category: 'Defense / Trap',
    sport: 'hockey',
    durationMinutes: 20,
    intensity: 'Medium',
    description: 'System drill to steer breakout towards weak side board, pinching with strong side winger and forcing a dump-in or turnover.',
    keyCoachingPoints: [
      'F1 steers puck carrier, never over-commits behind goal line',
      'F2 locks down the passing lane to defenseman partner',
      'Strong defenseman holds blue line firm'
    ],
    tokens: [
      { id: 't-10', x: 50, y: 70, type: 'player-offense', label: 'F1' },
      { id: 't-11', x: 25, y: 55, type: 'player-offense', label: 'F2' },
      { id: 't-12', x: 75, y: 55, type: 'player-offense', label: 'F3' },
      { id: 't-13', x: 35, y: 35, type: 'player-offense', label: 'D1' },
      { id: 't-14', x: 65, y: 35, type: 'player-offense', label: 'D2' },
      { id: 't-15', x: 20, y: 88, type: 'player-defense', label: 'Opp D' },
      { id: 't-16', x: 50, y: 88, type: 'player-defense', label: 'Opp C' }
    ],
    drawings: [
      {
        id: 'd-10',
        type: 'arrow',
        points: [{ x: 50, y: 70 }, { x: 30, y: 82 }],
        color: '#eab308'
      },
      {
        id: 'd-11',
        type: 'arrow',
        points: [{ x: 25, y: 55 }, { x: 22, y: 68 }],
        color: '#38bdf8'
      }
    ],
    createdAt: '2026-09-20'
  },
  {
    id: 'drill-3',
    title: 'Power Play 1-3-1 Umbrella Movement',
    category: 'Power Play / Set Piece',
    sport: 'hockey',
    durationMinutes: 18,
    intensity: 'High',
    description: 'Circulation drill between high quarterback point and half-wall playmakers to manipulate penalty kill diamond formation.',
    keyCoachingPoints: [
      'Quick puck movement: max two touches before release',
      'Bumper player in slot provides one-touch link or deflection',
      'Net front screening goalie eyes throughout'
    ],
    tokens: [
      { id: 't-20', x: 50, y: 65, type: 'player-offense', label: 'QB' },
      { id: 't-21', x: 18, y: 40, type: 'player-offense', label: 'HW-L' },
      { id: 't-22', x: 82, y: 40, type: 'player-offense', label: 'HW-R' },
      { id: 't-23', x: 50, y: 42, type: 'player-offense', label: 'Bumper' },
      { id: 't-24', x: 50, y: 22, type: 'player-offense', label: 'Screen' },
      { id: 't-25', x: 50, y: 15, type: 'goalie', label: 'G' }
    ],
    drawings: [
      {
        id: 'd-20',
        type: 'pass',
        points: [{ x: 50, y: 65 }, { x: 18, y: 40 }],
        color: '#facc15',
        dashed: true
      },
      {
        id: 'd-21',
        type: 'pass',
        points: [{ x: 18, y: 40 }, { x: 50, y: 42 }],
        color: '#facc15',
        dashed: true
      }
    ],
    createdAt: '2026-10-01'
  }
];

export const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: 'sess-1',
    title: 'Pre-Game Tactical & Special Teams Prep',
    sport: 'hockey',
    date: '2026-10-07',
    time: '10:00 - 11:30',
    location: 'Stadio Olimpico del Ghiaccio, Cortina',
    totalDurationMinutes: 90,
    targetRpe: 7,
    status: 'upcoming',
    attendeeIds: ['ath-1', 'ath-2', 'ath-3', 'ath-4', 'ath-5', 'ath-6', 'ath-8'],
    notes: 'Focus on clean breakouts under pressure and 5v4 power play execution against Bolzano trap.',
    exercises: [
      {
        id: 'ex-1',
        title: 'Dynamic Warmup & Edge Work',
        durationMinutes: 15,
        focus: 'Mobility, quick feet, groin activation',
        intensity: 'Medium'
      },
      {
        id: 'ex-2',
        title: '3-on-2 Rush with High Trailer Option',
        drillId: 'drill-1',
        durationMinutes: 20,
        focus: 'Transition speed & slot finishing',
        intensity: 'High'
      },
      {
        id: 'ex-3',
        title: '1-2-2 Neutral Zone Trap Execution',
        drillId: 'drill-2',
        durationMinutes: 25,
        focus: 'Gap control, angle checking',
        intensity: 'High'
      },
      {
        id: 'ex-4',
        title: 'Special Teams 5v4 & 4v5',
        drillId: 'drill-3',
        durationMinutes: 20,
        focus: 'Umbrella puck circulation and PK clears',
        intensity: 'High'
      },
      {
        id: 'ex-5',
        title: 'Cool-down & Coach Debrief',
        durationMinutes: 10,
        focus: 'Heart rate recovery, tactical recap',
        intensity: 'Low'
      }
    ]
  },
  {
    id: 'sess-2',
    title: 'High Intensity Skating Intervals & Conditioning',
    sport: 'hockey',
    date: '2026-10-09',
    time: '17:30 - 19:00',
    location: 'Stadio Olimpico del Ghiaccio, Cortina',
    totalDurationMinutes: 90,
    targetRpe: 9,
    status: 'upcoming',
    attendeeIds: ['ath-1', 'ath-2', 'ath-4', 'ath-5', 'ath-6', 'ath-8'],
    notes: 'Aerobic threshold work, shuttle turns, battle drills around boards.',
    exercises: [
      {
        id: 'ex-21',
        title: 'Stretching and Mobility Routine',
        durationMinutes: 12,
        focus: 'Lower chain activation',
        intensity: 'Low'
      },
      {
        id: 'ex-22',
        title: 'Iron Cross Skating Shuttles',
        durationMinutes: 25,
        focus: 'Anaerobic capacity & change of direction',
        intensity: 'Extreme'
      },
      {
        id: 'ex-23',
        title: 'Small Area Games (2v2 Cross-Ice)',
        durationMinutes: 30,
        focus: 'Compete level, puck battles, quick decision making',
        intensity: 'Extreme'
      },
      {
        id: 'ex-24',
        title: 'Flush Skating & Stretch',
        durationMinutes: 15,
        focus: 'Lactate clearance',
        intensity: 'Low'
      }
    ]
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm-1',
    sport: 'hockey',
    opponent: 'HC Bolzano Foxes',
    date: '2026-10-08',
    time: '20:00',
    venue: 'Home',
    location: 'Stadio Olimpico, Cortina d’Ampezzo',
    status: 'upcoming',
    scoreHome: 0,
    scoreAway: 0,
    period: 'Not Started',
    events: [],
    lineupAthleteIds: ['ath-1', 'ath-2', 'ath-3', 'ath-4', 'ath-5', 'ath-6', 'ath-8'],
    coachNotes: 'Bolzano plays high-pressure forecheck. Quick touch first passes behind our net will bypass their wingers.'
  },
  {
    id: 'm-2',
    sport: 'hockey',
    opponent: 'Asiago Hockey',
    date: '2026-10-03',
    time: '19:30',
    venue: 'Away',
    location: 'PalaOdegar, Asiago',
    status: 'finished',
    scoreHome: 2,
    scoreAway: 4,
    period: 'Final (OT)',
    events: [
      { id: 'ev-1', minute: 14, type: 'goal', team: 'away', athleteId: 'ath-1', description: 'Marco Zanatta wrist shot top corner from right circle (Assist: Kostner)' },
      { id: 'ev-2', minute: 28, type: 'penalty', team: 'away', athleteId: 'ath-3', description: 'Andrea Bernard 2 min for Hooking' },
      { id: 'ev-3', minute: 31, type: 'goal', team: 'home', description: 'Asiago PPG tip-in from slot' },
      { id: 'ev-4', minute: 46, type: 'goal', team: 'away', athleteId: 'ath-2', description: 'Davide Kostner breakaway deke forehand backhand' },
      { id: 'ev-5', minute: 58, type: 'goal', team: 'home', description: 'Asiago 6-on-5 extra attacker scramble' },
      { id: 'ev-6', minute: 62, type: 'goal', team: 'away', athleteId: 'ath-1', description: 'Marco Zanatta OT game-winner on 3v3 counterattack' }
    ],
    lineupAthleteIds: ['ath-1', 'ath-2', 'ath-3', 'ath-4', 'ath-5', 'ath-6', 'ath-8'],
    coachNotes: 'Resilient road victory! Overcame penalty kill adversity. Zanatta clutch in OT.'
  }
];
