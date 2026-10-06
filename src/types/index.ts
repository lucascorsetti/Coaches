export type SportType = 'hockey' | 'soccer' | 'basketball' | 'skating';

export type PlayerPosition = 
  | 'Forward' | 'Defenseman' | 'Goaltender' | 'Center' | 'Winger' // Hockey
  | 'Striker' | 'Midfielder' | 'Defender' | 'Goalkeeper' // Soccer
  | 'Point Guard' | 'Shooting Guard' | 'Small Forward' | 'Power Forward' // Basketball
  | 'Short Track' | 'Speed Skater' | 'Figure Skater'; // Skating

export type HealthStatus = 'fit' | 'recovering' | 'injured' | 'rested';

export interface Athlete {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  secondaryPosition?: string;
  avatarUrl?: string;
  age: number;
  heightCm: number;
  weightKg: number;
  dominantSide: 'Left' | 'Right' | 'Ambidextrous';
  healthStatus: HealthStatus;
  readinessScore: number; // 0 - 100
  attendanceRate: number; // 0 - 100%
  lineUnit: 'Line 1' | 'Line 2' | 'Line 3' | 'Line 4' | 'Reserves';
  metrics: {
    vo2max?: number;
    maxSpeedKmh?: number;
    heartRateRest?: number;
    heartRateMax?: number;
    verticalJumpCm?: number;
    acwr?: number; // Acute:Chronic Workload Ratio
  };
  notes: string;
  stats: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    penaltiesMinutes?: number;
    savesPercentage?: number;
    plusMinus?: number;
  };
}

export interface BoardToken {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'player-offense' | 'player-defense' | 'goalie' | 'ball-puck' | 'cone';
  label: string;
  color?: string;
}

export interface BoardDrawing {
  id: string;
  type: 'pass' | 'skate' | 'arrow' | 'line' | 'zone';
  points: { x: number; y: number }[];
  color: string;
  dashed?: boolean;
}

export interface TacticalDrill {
  id: string;
  title: string;
  category: 'Warmup' | 'Tactical' | 'Skill & Skating' | 'Conditioning' | 'Power Play / Set Piece' | 'Defense / Trap';
  sport: SportType;
  durationMinutes: number;
  intensity: 'Low' | 'Medium' | 'High' | 'Extreme';
  description: string;
  keyCoachingPoints: string[];
  tokens: BoardToken[];
  drawings: BoardDrawing[];
  createdAt: string;
}

export interface TrainingExercise {
  id: string;
  drillId?: string;
  title: string;
  durationMinutes: number;
  focus: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Extreme';
  notes?: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  sport: SportType;
  date: string;
  time: string;
  location: string;
  totalDurationMinutes: number;
  targetRpe: number; // 1-10
  exercises: TrainingExercise[];
  attendeeIds: string[];
  status: 'upcoming' | 'in-progress' | 'completed';
  notes?: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'assist' | 'penalty' | 'shot' | 'save' | 'timeout' | 'substitution';
  team: 'home' | 'away';
  athleteId?: string;
  description: string;
}

export interface Match {
  id: string;
  sport: SportType;
  opponent: string;
  date: string;
  time: string;
  venue: 'Home' | 'Away';
  location: string;
  status: 'upcoming' | 'live' | 'finished';
  scoreHome: number;
  scoreAway: number;
  period: string;
  events: MatchEvent[];
  lineupAthleteIds: string[];
  coachNotes?: string;
}

export interface TeamProfile {
  id: string;
  name: string;
  league: string;
  sport: SportType;
  season: string;
  headCoach: string;
  assistantCoaches: string[];
  primaryColor: string;
  secondaryColor: string;
}
