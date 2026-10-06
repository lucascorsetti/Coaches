import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  Flame, 
  Zap, 
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { Athlete, SportType, HealthStatus } from '../../types';
import { AthleteModal } from './AthleteModal';

interface RosterViewProps {
  athletes: Athlete[];
  sport: SportType;
  onUpdateAthlete: (athlete: Athlete) => void;
  onAddAthlete: (athlete: Athlete) => void;
  onDeleteAthlete: (id: string) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  athletes,
  sport,
  onUpdateAthlete,
  onAddAthlete,
  onDeleteAthlete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [modalAthlete, setModalAthlete] = useState<Athlete | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetailAthlete, setSelectedDetailAthlete] = useState<Athlete | null>(null);

  // Calculations
  const totalSquad = athletes.length;
  const fitCount = athletes.filter((a) => a.healthStatus === 'fit').length;
  const recoveringCount = athletes.filter((a) => a.healthStatus === 'recovering').length;
  const injuredCount = athletes.filter((a) => a.healthStatus === 'injured').length;
  const avgReadiness = totalSquad > 0 
    ? Math.round(athletes.reduce((acc, a) => acc + a.readinessScore, 0) / totalSquad) 
    : 0;

  // Filter athletes
  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(athlete.number).includes(searchQuery);
    const matchesUnit = selectedUnit === 'all' || athlete.lineUnit === selectedUnit;
    const matchesStatus = selectedStatus === 'all' || athlete.healthStatus === selectedStatus;
    const matchesPosition = selectedPosition === 'all' || athlete.position === selectedPosition;
    return matchesSearch && matchesUnit && matchesStatus && matchesPosition;
  });

  const handleOpenAddModal = () => {
    setModalAthlete(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (athlete: Athlete, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalAthlete(athlete);
    setIsModalOpen(true);
  };

  const handleSaveModal = (saved: Athlete) => {
    if (modalAthlete) {
      onUpdateAthlete(saved);
      if (selectedDetailAthlete?.id === saved.id) {
        setSelectedDetailAthlete(saved);
      }
    } else {
      onAddAthlete(saved);
    }
  };

  const handleQuickStatusChange = (athlete: Athlete, newStatus: HealthStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateAthlete({
      ...athlete,
      healthStatus: newStatus,
      readinessScore: newStatus === 'injured' ? 45 : newStatus === 'recovering' ? 75 : 95
    });
  };

  return (
    <div className="space-y-5">
      {/* Squad Readiness & Availability Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Roster Availability</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{fitCount}/{totalSquad}</span>
            <span className="text-xs text-emerald-400 font-bold">
              {totalSquad > 0 ? Math.round((fitCount / totalSquad) * 100) : 0}% Active
            </span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalSquad > 0 ? (fitCount / totalSquad) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average Readiness</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{avgReadiness}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100 PTS</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                avgReadiness >= 85 ? 'bg-emerald-500' : avgReadiness >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${avgReadiness}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Medical / Injured</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{injuredCount}</span>
            <span className="text-xs text-amber-400 font-medium">
              +{recoveringCount} recovering
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {injuredCount === 0 ? 'Full squad healthy' : 'Monitored by physiotherapy'}
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Quick Action</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <button
            onClick={handleOpenAddModal}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Player</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by player name or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Units / Lines tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'Line 1', 'Line 2', 'Line 3', 'Line 4', 'Reserves'].map((unit) => (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedUnit === unit
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {unit === 'all' ? 'All Units' : unit}
            </button>
          ))}
        </div>

        {/* Health status filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Health Statuses</option>
            <option value="fit">🟢 Fit Only</option>
            <option value="recovering">🟡 Recovering Only</option>
            <option value="injured">🔴 Injured Only</option>
          </select>
        </div>
      </div>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAthletes.map((athlete) => {
          const isSelected = selectedDetailAthlete?.id === athlete.id;
          const acwr = athlete.metrics?.acwr ?? 1.0;
          const isAcwrDanger = acwr > 1.45 || acwr < 0.65;

          return (
            <div
              key={athlete.id}
              onClick={() => setSelectedDetailAthlete(athlete)}
              className={`bg-slate-800/60 hover:bg-slate-800 border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg ${
                isSelected ? 'border-blue-500 shadow-blue-500/10' : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top: Number, Name, Position, Health */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                      {athlete.number}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors leading-tight">
                        {athlete.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-300">{athlete.position}</span>
                        <span>•</span>
                        <span>{athlete.dominantSide}-handed</span>
                        <span>•</span>
                        <span className="text-slate-400">{athlete.lineUnit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Readiness Indicator Badge */}
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      athlete.healthStatus === 'fit'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : athlete.healthStatus === 'recovering'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{athlete.readinessScore}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {athlete.healthStatus.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Vitals & Performance Strip */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Workload (ACWR)</span>
                    <span className={`font-bold ${isAcwrDanger ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {acwr} {isAcwrDanger && '⚠️'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">VO2 Max</span>
                    <span className="font-bold text-slate-200">{athlete.metrics?.vo2max || '55'} ml</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Top Speed</span>
                    <span className="font-bold text-slate-200">{athlete.metrics?.maxSpeedKmh || '36'} km/h</span>
                  </div>
                </div>

                {/* Match Statistics */}
                <div className="flex items-center justify-between text-xs text-slate-300 px-1">
                  <span>GP: <strong className="text-white">{athlete.stats.gamesPlayed}</strong></span>
                  <span>Goals: <strong className="text-white">{athlete.stats.goals}</strong></span>
                  <span>Assists: <strong className="text-white">{athlete.stats.assists}</strong></span>
                  <span>+/-: <strong className="text-white">{athlete.stats.plusMinus || 0}</strong></span>
                  <span>PIM: <strong className="text-white">{athlete.stats.penaltiesMinutes || 0}m</strong></span>
                </div>

                {athlete.notes && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-1 bg-slate-900/30 px-2 py-1 rounded">
                    "{athlete.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                {/* Quick status switch buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleQuickStatusChange(athlete, 'fit', e)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      athlete.healthStatus === 'fit' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Set to Fit"
                  >
                    ✓
                  </button>
                  <button
                    onClick={(e) => handleQuickStatusChange(athlete, 'recovering', e)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      athlete.healthStatus === 'recovering' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Set to Recovering"
                  >
                    !
                  </button>
                  <button
                    onClick={(e) => handleQuickStatusChange(athlete, 'injured', e)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      athlete.healthStatus === 'injured' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Set to Injured"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleOpenEditModal(athlete, e)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Remove ${athlete.name} from roster?`)) {
                        onDeleteAthlete(athlete.id);
                      }
                    }}
                    className="text-xs text-slate-500 hover:text-rose-400 px-1.5 py-1"
                    title="Remove from roster"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAthletes.length === 0 && (
        <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No athletes found matching the active filters.</p>
        </div>
      )}

      {/* Edit / Register Modal */}
      <AthleteModal
        athlete={modalAthlete}
        sport={sport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
};
