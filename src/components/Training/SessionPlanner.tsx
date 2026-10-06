import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Play, 
  CheckCircle, 
  Users, 
  Flame, 
  Layers, 
  Trash2, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { TrainingSession, TacticalDrill, Athlete, SportType } from '../../types';
import { LiveSessionTimer } from './LiveSessionTimer';

interface SessionPlannerProps {
  sessions: TrainingSession[];
  drills: TacticalDrill[];
  athletes: Athlete[];
  sport: SportType;
  onAddSession: (session: TrainingSession) => void;
  onUpdateSession: (session: TrainingSession) => void;
  onDeleteSession: (id: string) => void;
  onOpenPlayboardWithDrill?: (drill: TacticalDrill) => void;
}

export const SessionPlanner: React.FC<SessionPlannerProps> = ({
  sessions,
  drills,
  athletes,
  sport,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onOpenPlayboardWithDrill
}) => {
  const [activeLiveSession, setActiveLiveSession] = useState<TrainingSession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Session Form State
  const [newTitle, setNewTitle] = useState('High Intensity Tactical Scrimmage');
  const [newDate, setNewDate] = useState('2026-10-12');
  const [newTime, setNewTime] = useState('18:00 - 19:30');
  const [newLocation, setNewLocation] = useState('Stadio Olimpico del Ghiaccio');
  const [newRpe, setNewRpe] = useState(8);
  const [newNotes, setNewNotes] = useState('');
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>([]);
  const [customExerciseTitle, setCustomExerciseTitle] = useState('');
  const [customExerciseDuration, setCustomExerciseDuration] = useState(15);
  const [exerciseList, setExerciseList] = useState<{ title: string; durationMinutes: number; intensity: 'Low'|'Medium'|'High'|'Extreme'; focus: string; drillId?: string }[]>([
    { title: 'Dynamic Warmup & Mobility', durationMinutes: 15, intensity: 'Medium', focus: 'Edge work and hip openers' }
  ]);

  const handleAddCustomExercise = () => {
    if (customExerciseTitle.trim()) {
      setExerciseList([
        ...exerciseList,
        {
          title: customExerciseTitle.trim(),
          durationMinutes: customExerciseDuration,
          intensity: 'High',
          focus: 'Execution tempo'
        }
      ]);
      setCustomExerciseTitle('');
    }
  };

  const handleAddDrillToExerciseList = (drillId: string) => {
    const drill = drills.find((d) => d.id === drillId);
    if (drill) {
      setExerciseList([
        ...exerciseList,
        {
          title: drill.title,
          drillId: drill.id,
          durationMinutes: drill.durationMinutes,
          intensity: drill.intensity,
          focus: drill.category
        }
      ]);
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExerciseList(exerciseList.filter((_, i) => i !== index));
  };

  const totalCalculatedDuration = exerciseList.reduce((acc, e) => acc + e.durationMinutes, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSession: TrainingSession = {
      id: `sess-${Date.now()}`,
      title: newTitle.trim(),
      sport,
      date: newDate,
      time: newTime,
      location: newLocation,
      totalDurationMinutes: totalCalculatedDuration || 90,
      targetRpe: newRpe,
      status: 'upcoming',
      attendeeIds: athletes.map((a) => a.id),
      notes: newNotes,
      exercises: exerciseList.map((e, idx) => ({
        id: `ex-${Date.now()}-${idx}`,
        title: e.title,
        durationMinutes: e.durationMinutes,
        focus: e.focus,
        intensity: e.intensity,
        drillId: e.drillId
      }))
    };

    onAddSession(newSession);
    setIsCreateModalOpen(false);
  };

  const handleFinishLiveSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      onUpdateSession({
        ...target,
        status: 'completed'
      });
    }
    setActiveLiveSession(null);
  };

  if (activeLiveSession) {
    return (
      <LiveSessionTimer
        session={activeLiveSession}
        athletes={athletes}
        onFinishSession={handleFinishLiveSession}
        onExit={() => setActiveLiveSession(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Training Sessions & Periodization
          </h2>
          <p className="text-xs text-slate-400">
            Structure progressive microcycles, manage practice intensity, and execute live on ice/field.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Practice</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const totalMins = session.exercises.reduce((acc, e) => acc + e.durationMinutes, 0);

          return (
            <div
              key={session.id}
              className="bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 transition-all shadow-lg space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      session.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : session.status === 'in-progress'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {session.status}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {session.time}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {session.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{session.title}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{session.location}</span>
                  </div>
                </div>

                {/* Top Right: Launch Live Practice Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveLiveSession(session)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Live Practice</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete session "${session.title}"?`)) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Intensity & Duration Summary strip */}
              <div className="flex items-center gap-4 text-xs bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-400">Total Duration:</span>
                  <strong className="text-white">{totalMins} minutes</strong>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-slate-400">Target Load:</span>
                  <strong className="text-rose-400 font-bold">RPE {session.targetRpe}/10</strong>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-400">Expected:</span>
                  <strong className="text-white">{session.attendeeIds.length} athletes</strong>
                </div>
              </div>

              {/* Exercise Timeline Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Session Drills & Sequence ({session.exercises.length} blocks):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {session.exercises.map((ex, i) => (
                    <div
                      key={ex.id || i}
                      className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-slate-200 line-clamp-1">
                          {i + 1}. {ex.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          ex.intensity === 'Extreme' || ex.intensity === 'High'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {ex.durationMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {ex.focus}
                      </p>

                      {ex.drillId && onOpenPlayboardWithDrill && (
                        <button
                          onClick={() => {
                            const drill = drills.find((d) => d.id === ex.drillId);
                            if (drill) onOpenPlayboardWithDrill(drill);
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 pt-1 border-t border-slate-800"
                        >
                          <Compass className="w-3 h-3" />
                          <span>View on Whiteboard</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {session.notes && (
                <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/30">
                  "{session.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Create New Practice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Schedule New Training Session
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="18:00 - 19:30"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target RPE (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRpe}
                    onChange={(e) => setNewRpe(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Facility / Arena Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              {/* Add Drills from Bank or Custom */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                <span className="text-slate-200 font-bold block">
                  Add Drills & Exercises ({totalCalculatedDuration} mins planned)
                </span>

                {/* Drill Bank selector */}
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddDrillToExerciseList(e.target.value);
                      e.target.value = '';
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="">-- Add drill from Playbook Drill Bank --</option>
                    {drills.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.durationMinutes} mins - {d.intensity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom quick exercise */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Or enter custom exercise name..."
                    value={customExerciseTitle}
                    onChange={(e) => setCustomExerciseTitle(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={customExerciseDuration}
                    onChange={(e) => setCustomExerciseDuration(Number(e.target.value))}
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomExercise}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold"
                  >
                    Add
                  </button>
                </div>

                {/* Exercise list */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {exerciseList.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <span className="font-semibold text-slate-200">
                        {idx + 1}. {ex.title} ({ex.durationMinutes}m)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Session Objectives & Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Focus areas for today..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30"
                >
                  Save Practice Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
