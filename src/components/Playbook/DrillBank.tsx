import React, { useState } from 'react';
import { 
  Compass, 
  Clock, 
  Flame, 
  Plus, 
  ArrowRight, 
  Trash2, 
  Filter, 
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TacticalDrill, SportType } from '../../types';

interface DrillBankProps {
  drills: TacticalDrill[];
  sport: SportType;
  onSelectDrill: (drill: TacticalDrill) => void;
  onDeleteDrill: (id: string) => void;
  onCreateNew: () => void;
  onAddToActiveSession?: (drill: TacticalDrill) => void;
}

export const DrillBank: React.FC<DrillBankProps> = ({
  drills,
  sport,
  onSelectDrill,
  onDeleteDrill,
  onCreateNew,
  onAddToActiveSession
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedDrillId, setAddedDrillId] = useState<string | null>(null);

  const categories = [
    'all',
    'Tactical',
    'Warmup',
    'Skill & Skating',
    'Conditioning',
    'Power Play / Set Piece',
    'Defense / Trap'
  ];

  const filteredDrills = drills.filter((drill) => {
    const matchesCategory = selectedCategory === 'all' || drill.category === selectedCategory;
    const matchesIntensity = selectedIntensity === 'all' || drill.intensity === selectedIntensity;
    const matchesSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesIntensity && matchesSearch;
  });

  const handleQuickAdd = (drill: TacticalDrill, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToActiveSession) {
      onAddToActiveSession(drill);
      setAddedDrillId(drill.id);
      setTimeout(() => setAddedDrillId(null), 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              Tactical Drill Bank & Playbook
            </h2>
            <p className="text-xs text-slate-400">
              Curated strategic plays, skating patterns, and game situations ready for whiteboard breakdown.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Drill</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/60">
          <input
            type="text"
            placeholder="Search drills by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrills.map((drill) => (
          <div
            key={drill.id}
            onClick={() => onSelectDrill(drill)}
            className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg hover:shadow-blue-500/5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  {drill.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    drill.intensity === 'High' || drill.intensity === 'Extreme'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    <Flame className="w-3 h-3" />
                    {drill.intensity}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete drill "${drill.title}"?`)) {
                        onDeleteDrill(drill.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Delete drill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">
                  {drill.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {drill.description}
                </p>
              </div>

              {/* Coaching cues preview */}
              {drill.keyCoachingPoints && drill.keyCoachingPoints.length > 0 && (
                <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40 text-[11px] text-slate-300">
                  <div className="font-semibold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Key Focus:
                  </div>
                  <div className="italic text-slate-300 line-clamp-1">
                    "{drill.keyCoachingPoints[0]}"
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-3 mt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{drill.durationMinutes} mins</span>
              </div>

              <div className="flex items-center gap-2">
                {onAddToActiveSession && (
                  <button
                    onClick={(e) => handleQuickAdd(drill, e)}
                    className="text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-1"
                    title="Add directly to practice session"
                  >
                    {addedDrillId === drill.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Add to Session</span>
                      </>
                    )}
                  </button>
                )}

                <span className="text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Open Board <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrills.length === 0 && (
        <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
          <Layers className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No drills match your filter criteria.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedIntensity('all'); setSearchQuery(''); }}
            className="text-xs text-blue-400 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
