import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  CheckCircle, 
  ArrowLeft, 
  Users, 
  Flame, 
  Clock, 
  BellRing 
} from 'lucide-react';
import { TrainingSession, Athlete } from '../../types';
import { playWhistleSound, playCountdownBeep, playBuzzer } from '../../utils/audio';

interface LiveSessionTimerProps {
  session: TrainingSession;
  athletes: Athlete[];
  onFinishSession: (sessionId: string) => void;
  onExit: () => void;
}

export const LiveSessionTimer: React.FC<LiveSessionTimerProps> = ({
  session,
  athletes,
  onFinishSession,
  onExit
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = session.exercises[currentExerciseIndex] || session.exercises[0];

  // Time in seconds for current exercise
  const initialExerciseSeconds = (currentExercise?.durationMinutes || 15) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(initialExerciseSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [attendanceIds, setAttendanceIds] = useState<string[]>(session.attendeeIds || []);
  const [showAttendanceList, setShowAttendanceList] = useState(false);

  // Sync remainingSeconds when current exercise changes
  useEffect(() => {
    if (currentExercise) {
      setRemainingSeconds(currentExercise.durationMinutes * 60);
    }
  }, [currentExerciseIndex]);

  // Main timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTotalElapsedSeconds((prev) => prev + 1);

        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Exercise ended!
            playBuzzer();
            if (currentExerciseIndex < session.exercises.length - 1) {
              setCurrentExerciseIndex((idx) => idx + 1);
              return 0;
            } else {
              setIsRunning(false);
              return 0;
            }
          }

          // Countdown beeps at 3, 2, 1 seconds
          if (prev === 4 || prev === 3 || prev === 2) {
            playCountdownBeep(false);
          } else if (prev === 1) {
            playCountdownBeep(true);
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentExerciseIndex, session.exercises.length]);

  const toggleTimer = () => {
    if (!isRunning) {
      playWhistleSound();
    }
    setIsRunning(!isRunning);
  };

  const handleResetCurrent = () => {
    setIsRunning(false);
    if (currentExercise) {
      setRemainingSeconds(currentExercise.durationMinutes * 60);
    }
  };

  const handleNextExercise = () => {
    playWhistleSound();
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleWhistle = () => {
    playWhistleSound();
  };

  const toggleAttendance = (athleteId: string) => {
    if (attendanceIds.includes(athleteId)) {
      setAttendanceIds(attendanceIds.filter((id) => id !== athleteId));
    } else {
      setAttendanceIds([...attendanceIds, athleteId]);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const nextExercise = session.exercises[currentExerciseIndex + 1];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background glow for high energy */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Live Mode</span>
        </button>

        <div className="text-center">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">
            LIVE PRACTICE SESSION
          </span>
          <h2 className="text-lg font-black text-white">{session.title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAttendanceList(!showAttendanceList)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              showAttendanceList
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Attendance ({attendanceIds.length}/{athletes.length})</span>
          </button>

          <button
            onClick={() => {
              playWhistleSound();
              onFinishSession(session.id);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>End Practice</span>
          </button>
        </div>
      </div>

      {/* Main Clock & Exercise Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
        {/* Left: Current Exercise Info */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              Drill {currentExerciseIndex + 1} of {session.exercises.length}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              currentExercise?.intensity === 'High' || currentExercise?.intensity === 'Extreme'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              <Flame className="w-3 h-3" />
              {currentExercise?.intensity} Intensity
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-white">{currentExercise?.title}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {currentExercise?.focus || 'Execute with fast tempo and continuous puck pressure.'}
            </p>
          </div>

          {currentExercise?.notes && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
              <span className="font-bold text-slate-300 block mb-1">Coach Note:</span>
              {currentExercise.notes}
            </div>
          )}

          {nextExercise && (
            <div className="pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Up Next</span>
              <span className="text-slate-300 font-semibold">{nextExercise.title}</span>
              <span className="text-slate-500 ml-2">({nextExercise.durationMinutes}m)</span>
            </div>
          )}
        </div>

        {/* Center: Big Digital Stopwatch Clock */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 shadow-inner">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Drill Countdown</span>
          </div>

          {/* Huge Timer Digits */}
          <div className={`font-mono font-black text-6xl sm:text-7xl lg:text-8xl tracking-tight select-none transition-colors ${
            remainingSeconds < 30 ? 'text-rose-500 animate-pulse' : 'text-white'
          }`}>
            {formatTime(remainingSeconds)}
          </div>

          <div className="text-xs text-slate-400 mt-2 font-mono">
            Total Session Time: <strong className="text-white">{formatTime(totalElapsedSeconds)}</strong>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handlePrevExercise}
              disabled={currentExerciseIndex === 0}
              className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Previous Drill"
            >
              ⯇
            </button>

            <button
              onClick={toggleTimer}
              className={`p-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
              title={isRunning ? 'Pause' : 'Start'}
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>

            <button
              onClick={handleNextExercise}
              disabled={currentExerciseIndex >= session.exercises.length - 1}
              className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Next Drill"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={handleResetCurrent}
              className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Reset Drill Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Coach Field Whistle & Audio Control */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <button
            onClick={handleWhistle}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-amber-500/25 active:scale-90 hover:scale-105 transition-all group"
          >
            <Volume2 className="w-8 h-8 group-hover:animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-wider mt-1">Whistle</span>
          </button>

          <div>
            <h4 className="font-bold text-white text-sm">Synthetic Audio Whistle</h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Dual-tone frequency whistle audible across the arena or rink.
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Check-in Panel */}
      {showAttendanceList && (
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Practice Attendance Roster
            </h4>
            <span className="text-xs text-slate-400">
              Click player to toggle present / absent
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {athletes.map((a) => {
              const isPresent = attendanceIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAttendance(a.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                    isPresent
                      ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="truncate">#{a.number} {a.name.split(' ')[0]}</span>
                  <span>{isPresent ? '✓' : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
