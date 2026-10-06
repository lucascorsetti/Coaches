import React, { useState } from 'react';
import { 
  Volume2, 
  Calendar, 
  User, 
  Activity, 
  ChevronDown
} from 'lucide-react';
import { TeamProfile, SportType } from '../types';
import { playWhistleSound } from '../utils/audio';

interface HeaderProps {
  team: TeamProfile;
  onUpdateSport: (sport: SportType) => void;
  onUpdateTeamName: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ team, onUpdateSport, onUpdateTeamName }) => {
  const [isWhistleActive, setIsWhistleActive] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [tempTeamName, setTempTeamName] = useState(team.name);

  const handleWhistleClick = () => {
    setIsWhistleActive(true);
    playWhistleSound();
    setTimeout(() => setIsWhistleActive(false), 600);
  };

  const handleSaveTeamName = () => {
    if (tempTeamName.trim()) {
      onUpdateTeamName(tempTeamName.trim());
    }
    setIsEditingTeam(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-6 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Team Details */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl tracking-wider">
            C
          </div>

          <div>
            <div className="flex items-center gap-2">
              {isEditingTeam ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTeamName}
                    onChange={(e) => setTempTeamName(e.target.value)}
                    className="bg-slate-800 text-white font-bold text-lg px-2.5 py-0.5 rounded border border-blue-500 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTeamName()}
                    onBlur={handleSaveTeamName}
                  />
                  <button
                    onClick={handleSaveTeamName}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h1 
                  onClick={() => setIsEditingTeam(true)}
                  className="font-bold text-lg lg:text-xl text-white hover:text-blue-400 cursor-pointer flex items-center gap-1.5 transition-colors group"
                  title="Click to edit team name"
                >
                  {team.name}
                  <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ✎
                  </span>
                </h1>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold uppercase tracking-wider">
                {team.sport}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{team.league}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
              <span>Season {team.season}</span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Sport Selector Dropdown */}
          <div className="relative">
            <select
              value={team.sport}
              onChange={(e) => onUpdateSport(e.target.value as SportType)}
              className="appearance-none bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
            >
              <option value="hockey">🏒 Ice Hockey</option>
              <option value="skating">⛸️ Speed / Figure Skating</option>
              <option value="soccer">⚽ Soccer / Football</option>
              <option value="basketball">🏀 Basketball</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Coach Quick Whistle Button */}
          <button
            onClick={handleWhistleClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 border shadow-md active:scale-95 ${
              isWhistleActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-750 text-amber-400 border-amber-500/30 hover:border-amber-500/60'
            }`}
            title="Blow Coach Whistle (Audio Signal)"
          >
            <Volume2 className={`w-4 h-4 ${isWhistleActive ? 'animate-bounce' : ''}`} />
            <span>Coach Whistle</span>
          </button>

          {/* Head Coach Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 leading-tight">{team.headCoach}</div>
              <div className="text-[10px] text-slate-400">Head Coach</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
