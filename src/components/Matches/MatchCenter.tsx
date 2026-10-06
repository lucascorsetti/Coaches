import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Flag, 
  Activity, 
  Trash2, 
  Award,
  Zap
} from 'lucide-react';
import { Match, Athlete, MatchEvent, SportType } from '../../types';

interface MatchCenterProps {
  matches: Match[];
  athletes: Athlete[];
  sport: SportType;
  teamName: string;
  onUpdateMatch: (match: Match) => void;
  onAddMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
}

export const MatchCenter: React.FC<MatchCenterProps> = ({
  matches,
  athletes,
  sport,
  teamName,
  onUpdateMatch,
  onAddMatch,
  onDeleteMatch
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match>(matches[0] || null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Match State
  const [newOpponent, setNewOpponent] = useState('HC Pustertal');
  const [newDate, setNewDate] = useState('2026-10-18');
  const [newTime, setNewTime] = useState('20:30');
  const [newVenue, setNewVenue] = useState<'Home' | 'Away'>('Home');
  const [newLocation, setNewLocation] = useState('Stadio Olimpico, Cortina');

  // Quick Event Log state
  const [eventAthleteId, setEventAthleteId] = useState<string>(athletes[0]?.id || '');
  const [eventDesc, setEventDesc] = useState('');
  const [eventMinute, setEventMinute] = useState(15);

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponent.trim()) return;

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      sport,
      opponent: newOpponent.trim(),
      date: newDate,
      time: newTime,
      venue: newVenue,
      location: newLocation,
      status: 'upcoming',
      scoreHome: 0,
      scoreAway: 0,
      period: '1st Period',
      events: [],
      lineupAthleteIds: athletes.slice(0, 7).map((a) => a.id),
      coachNotes: ''
    };

    onAddMatch(newMatch);
    setSelectedMatch(newMatch);
    setIsScheduleModalOpen(false);
  };

  const handleAddEvent = (type: MatchEvent['type']) => {
    if (!selectedMatch) return;
    const athlete = athletes.find((a) => a.id === eventAthleteId);

    const description = eventDesc.trim() || 
      (type === 'goal' ? `Goal scored by ${athlete?.name || 'Home Player'}` :
       type === 'assist' ? `Assist registered by ${athlete?.name}` :
       type === 'penalty' ? `Penalty (2 min) on ${athlete?.name}` :
       `${type.toUpperCase()} recorded`);

    const newEvent: MatchEvent = {
      id: `ev-${Date.now()}`,
      minute: eventMinute,
      type,
      team: selectedMatch.venue === 'Home' ? 'home' : 'away',
      athleteId: athlete?.id,
      description
    };

    const updatedScoreHome = type === 'goal' && selectedMatch.venue === 'Home' 
      ? selectedMatch.scoreHome + 1 
      : selectedMatch.scoreHome;
    const updatedScoreAway = type === 'goal' && selectedMatch.venue === 'Away' 
      ? selectedMatch.scoreAway + 1 
      : selectedMatch.scoreAway;

    const updated: Match = {
      ...selectedMatch,
      scoreHome: updatedScoreHome,
      scoreAway: updatedScoreAway,
      events: [...selectedMatch.events, newEvent]
    };

    onUpdateMatch(updated);
    setSelectedMatch(updated);
    setEventDesc('');
  };

  const handleUpdateScore = (home: number, away: number) => {
    if (!selectedMatch) return;
    const updated: Match = {
      ...selectedMatch,
      scoreHome: Math.max(0, home),
      scoreAway: Math.max(0, away)
    };
    onUpdateMatch(updated);
    setSelectedMatch(updated);
  };

  const handleUpdateStatus = (status: Match['status'], period: string) => {
    if (!selectedMatch) return;
    const updated: Match = {
      ...selectedMatch,
      status,
      period
    };
    onUpdateMatch(updated);
    setSelectedMatch(updated);
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Match Day Center & Fixtures
          </h2>
          <p className="text-xs text-slate-400">
            Log live game events, roster lineups, and track box score statistics.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Fixture</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Matches List (1 col) */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Scheduled Matches ({matches.length})
          </span>

          <div className="space-y-2.5">
            {matches.map((m) => {
              const isSelected = selectedMatch?.id === m.id;
              const isHome = m.venue === 'Home';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.status === 'live'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
                        : m.status === 'finished'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {m.status === 'live' ? '● LIVE' : m.status}
                    </span>

                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {m.date}
                    </span>
                  </div>

                  {/* Team vs Team */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{isHome ? teamName : m.opponent}</span>
                        {isHome && <span className="text-[10px] text-blue-400 font-bold">(H)</span>}
                      </div>
                      <div className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                        <span>{isHome ? m.opponent : teamName}</span>
                        {!isHome && <span className="text-[10px] text-blue-400 font-bold">(H)</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-white">
                        {m.scoreHome} - {m.scoreAway}
                      </div>
                      <div className="text-[10px] text-slate-400">{m.period}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <span className="truncate max-w-[180px]">{m.location}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete match against ${m.opponent}?`)) {
                          onDeleteMatch(m.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Match Detail & Live Event Logger (2 cols) */}
        {selectedMatch ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Big Match Scoreboard Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {selectedMatch.location} ({selectedMatch.venue})
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedMatch.status}
                    onChange={(e) => handleUpdateStatus(e.target.value as Match['status'], selectedMatch.period)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live in Progress</option>
                    <option value="finished">Final / Finished</option>
                  </select>

                  <select
                    value={selectedMatch.period}
                    onChange={(e) => handleUpdateStatus(selectedMatch.status, e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="1st Period">1st Period</option>
                    <option value="2nd Period">2nd Period</option>
                    <option value="3rd Period">3rd Period</option>
                    <option value="Overtime">Overtime (OT)</option>
                    <option value="Final">Final</option>
                    <option value="Final (OT)">Final (OT)</option>
                  </select>
                </div>
              </div>

              {/* Main Scoreboard Display */}
              <div className="flex items-center justify-around py-4 border-y border-slate-700/60">
                <div className="text-center space-y-2">
                  <div className="text-sm lg:text-base font-bold text-white max-w-[140px] truncate">
                    {selectedMatch.venue === 'Home' ? teamName : selectedMatch.opponent}
                  </div>
                  <div className="text-4xl lg:text-6xl font-black font-mono text-white">
                    {selectedMatch.scoreHome}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleUpdateScore(selectedMatch.scoreHome + 1, selectedMatch.scoreAway)}
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleUpdateScore(selectedMatch.scoreHome - 1, selectedMatch.scoreAway)}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-xs text-white font-bold"
                    >
                      -1
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">VS</span>
                  <span className="text-xs font-bold text-amber-400 mt-1 block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {selectedMatch.period}
                  </span>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-sm lg:text-base font-bold text-white max-w-[140px] truncate">
                    {selectedMatch.venue === 'Away' ? teamName : selectedMatch.opponent}
                  </div>
                  <div className="text-4xl lg:text-6xl font-black font-mono text-white">
                    {selectedMatch.scoreAway}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleUpdateScore(selectedMatch.scoreHome, selectedMatch.scoreAway + 1)}
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleUpdateScore(selectedMatch.scoreHome, selectedMatch.scoreAway - 1)}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-xs text-white font-bold"
                    >
                      -1
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Match Event Quick Logger Bar */}
              <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-xs">
                <span className="font-bold text-slate-200 block">
                  Log Live In-Game Event:
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={eventAthleteId}
                    onChange={(e) => setEventAthleteId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white flex-1 min-w-[150px]"
                  >
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        #{a.number} {a.name} ({a.position})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Min"
                    value={eventMinute}
                    onChange={(e) => setEventMinute(Number(e.target.value))}
                    className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />

                  <input
                    type="text"
                    placeholder="Optional description (e.g. wrist shot top shelf)..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white min-w-[180px]"
                  />
                </div>

                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleAddEvent('goal')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <span>⚽/🏒 + GOAL</span>
                  </button>
                  <button
                    onClick={() => handleAddEvent('assist')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    <span>+ Assist</span>
                  </button>
                  <button
                    onClick={() => handleAddEvent('penalty')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    <span>+ Penalty (2m)</span>
                  </button>
                  <button
                    onClick={() => handleAddEvent('shot')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    <span>+ Shot on Goal</span>
                  </button>
                  <button
                    onClick={() => handleAddEvent('save')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    <span>+ Goalie Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Match Event Timeline ({selectedMatch.events.length})
              </h4>

              {selectedMatch.events.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No events logged yet for this match.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedMatch.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-400 w-8">{ev.minute}'</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ev.type === 'goal'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : ev.type === 'penalty'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {ev.type}
                        </span>
                        <span className="text-slate-200 font-medium">{ev.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
            <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-400">Select or schedule a match to view match day details.</p>
          </div>
        )}
      </div>

      {/* Schedule Fixture Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Schedule Fixture
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Opponent Club Name</label>
                <input
                  type="text"
                  required
                  value={newOpponent}
                  onChange={(e) => setNewOpponent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-slate-300 font-semibold mb-1">Puck Drop / Kickoff Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Venue</label>
                  <select
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value as 'Home' | 'Away')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Home">Home Match</option>
                    <option value="Away">Away Match</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Arena Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30"
                >
                  Save Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
