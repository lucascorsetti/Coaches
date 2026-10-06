import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Play, 
  Square, 
  Move, 
  Circle, 
  Compass, 
  Sparkles,
  Download,
  Info
} from 'lucide-react';
import { BoardToken, BoardDrawing, TacticalDrill, SportType } from '../../types';

interface TacticalBoardProps {
  sport: SportType;
  initialDrill?: TacticalDrill | null;
  onSaveDrill: (drill: Partial<TacticalDrill>) => void;
  onSelectDrillFromBank: () => void;
}

type BoardMode = 'select' | 'token' | 'draw-skate' | 'draw-pass' | 'draw-shot' | 'draw-free';
type TokenType = 'player-offense' | 'player-defense' | 'goalie' | 'ball-puck' | 'cone';

export const TacticalBoard: React.FC<TacticalBoardProps> = ({
  sport,
  initialDrill,
  onSaveDrill,
  onSelectDrillFromBank
}) => {
  const [boardType, setBoardType] = useState<SportType>(sport);
  const [mode, setMode] = useState<BoardMode>('select');
  const [selectedTokenType, setSelectedTokenType] = useState<TokenType>('player-offense');
  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [drawings, setDrawings] = useState<BoardDrawing[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<{ x: number; y: number }[] | null>(null);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  
  // Drill Metadata Form State
  const [drillTitle, setDrillTitle] = useState('New Custom Drill');
  const [drillCategory, setDrillCategory] = useState<TacticalDrill['category']>('Tactical');
  const [drillDuration, setDrillDuration] = useState(15);
  const [drillIntensity, setDrillIntensity] = useState<TacticalDrill['intensity']>('High');
  const [drillDescription, setDrillDescription] = useState('');
  const [drillCues, setDrillCues] = useState<string[]>(['Quick puck movement', 'Maintain defensive gap']);
  const [newCueText, setNewCueText] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync when initialDrill changes
  useEffect(() => {
    if (initialDrill) {
      setTokens(initialDrill.tokens || []);
      setDrawings(initialDrill.drawings || []);
      setDrillTitle(initialDrill.title);
      setDrillCategory(initialDrill.category);
      setDrillDuration(initialDrill.durationMinutes);
      setDrillIntensity(initialDrill.intensity);
      setDrillDescription(initialDrill.description);
      setDrillCues(initialDrill.keyCoachingPoints || []);
      setBoardType(initialDrill.sport);
    } else {
      loadDefaultPreset(boardType);
    }
  }, [initialDrill]);

  // Sync boardType with sport prop if changed from header
  useEffect(() => {
    setBoardType(sport);
  }, [sport]);

  const loadDefaultPreset = (currentSport: SportType) => {
    if (currentSport === 'hockey') {
      setTokens([
        { id: 't-1', x: 25, y: 70, type: 'player-offense', label: 'LW' },
        { id: 't-2', x: 50, y: 75, type: 'player-offense', label: 'C' },
        { id: 't-3', x: 75, y: 70, type: 'player-offense', label: 'RW' },
        { id: 't-4', x: 35, y: 40, type: 'player-defense', label: 'LD' },
        { id: 't-5', x: 65, y: 40, type: 'player-defense', label: 'RD' },
        { id: 't-6', x: 50, y: 14, type: 'goalie', label: 'G' },
        { id: 't-7', x: 27, y: 65, type: 'ball-puck', label: 'P' }
      ]);
      setDrawings([
        {
          id: 'dw-1',
          type: 'skate',
          points: [{ x: 25, y: 70 }, { x: 30, y: 48 }],
          color: '#38bdf8'
        },
        {
          id: 'dw-2',
          type: 'pass',
          points: [{ x: 30, y: 48 }, { x: 50, y: 35 }],
          color: '#facc15',
          dashed: true
        }
      ]);
    } else if (currentSport === 'soccer') {
      setTokens([
        { id: 's-1', x: 50, y: 15, type: 'goalie', label: 'GK' },
        { id: 's-2', x: 30, y: 35, type: 'player-defense', label: 'CB' },
        { id: 's-3', x: 70, y: 35, type: 'player-defense', label: 'CB' },
        { id: 's-4', x: 50, y: 60, type: 'player-offense', label: 'CM' },
        { id: 's-5', x: 25, y: 75, type: 'player-offense', label: 'LW' },
        { id: 's-6', x: 75, y: 75, type: 'player-offense', label: 'RW' },
        { id: 's-7', x: 50, y: 80, type: 'player-offense', label: 'ST' },
        { id: 's-8', x: 50, y: 62, type: 'ball-puck', label: '⚽' }
      ]);
      setDrawings([]);
    } else if (currentSport === 'basketball') {
      setTokens([
        { id: 'b-1', x: 50, y: 85, type: 'player-offense', label: '1' },
        { id: 'b-2', x: 20, y: 65, type: 'player-offense', label: '2' },
        { id: 'b-3', x: 80, y: 65, type: 'player-offense', label: '3' },
        { id: 'b-4', x: 30, y: 40, type: 'player-defense', label: 'X2' },
        { id: 'b-5', x: 70, y: 40, type: 'player-defense', label: 'X3' },
        { id: 'b-6', x: 50, y: 87, type: 'ball-puck', label: '🏀' }
      ]);
      setDrawings([]);
    } else {
      // Skating track
      setTokens([
        { id: 'sk-1', x: 20, y: 30, type: 'cone', label: 'C1' },
        { id: 'sk-2', x: 80, y: 30, type: 'cone', label: 'C2' },
        { id: 'sk-3', x: 80, y: 70, type: 'cone', label: 'C3' },
        { id: 'sk-4', x: 20, y: 70, type: 'cone', label: 'C4' },
        { id: 'sk-5', x: 50, y: 85, type: 'player-offense', label: 'S1' }
      ]);
      setDrawings([]);
    }
  };

  // Convert client coordinates to percentage (0-100) inside SVG
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  // Board interaction handlers
  const handleBoardMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    if (mode === 'token') {
      const newToken: BoardToken = {
        id: `token-${Date.now()}`,
        x: coords.x,
        y: coords.y,
        type: selectedTokenType,
        label: selectedTokenType === 'goalie' ? 'G' :
               selectedTokenType === 'ball-puck' ? (boardType === 'hockey' ? 'P' : '●') :
               selectedTokenType === 'cone' ? '▲' :
               selectedTokenType === 'player-offense' ? `O${tokens.filter(t => t.type === 'player-offense').length + 1}` :
               `X${tokens.filter(t => t.type === 'player-defense').length + 1}`
      };
      setTokens((prev) => [...prev, newToken]);
    } else if (mode.startsWith('draw-')) {
      setActiveDrawing([coords]);
    }
  };

  const handleBoardMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    if (draggingTokenId) {
      setTokens((prev) =>
        prev.map((t) => (t.id === draggingTokenId ? { ...t, x: coords.x, y: coords.y } : t))
      );
    } else if (activeDrawing) {
      setActiveDrawing((prev) => (prev ? [...prev, coords] : [coords]));
    }
  };

  const handleBoardMouseUp = () => {
    if (draggingTokenId) {
      setDraggingTokenId(null);
    }

    if (activeDrawing && activeDrawing.length > 1) {
      const type = mode === 'draw-pass' ? 'pass' : mode === 'draw-shot' ? 'arrow' : 'skate';
      const color = mode === 'draw-pass' ? '#facc15' : mode === 'draw-shot' ? '#ef4444' : '#38bdf8';
      const isDashed = mode === 'draw-pass';

      const newDrawing: BoardDrawing = {
        id: `dw-${Date.now()}`,
        type,
        points: activeDrawing,
        color,
        dashed: isDashed
      };

      setDrawings((prev) => [...prev, newDrawing]);
      setActiveDrawing(null);
    } else {
      setActiveDrawing(null);
    }
  };

  const handleRemoveToken = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      setDrawings((prev) => prev.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all drawings and players from the board?')) {
      setTokens([]);
      setDrawings([]);
    }
  };

  const handleAddCue = () => {
    if (newCueText.trim()) {
      setDrillCues([...drillCues, newCueText.trim()]);
      setNewCueText('');
    }
  };

  const handleRemoveCue = (index: number) => {
    setDrillCues(drillCues.filter((_, i) => i !== index));
  };

  const handleSaveSubmit = () => {
    onSaveDrill({
      id: initialDrill?.id || `drill-${Date.now()}`,
      title: drillTitle,
      category: drillCategory,
      sport: boardType,
      durationMinutes: drillDuration,
      intensity: drillIntensity,
      description: drillDescription,
      keyCoachingPoints: drillCues,
      tokens,
      drawings,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setShowSaveModal(false);
  };

  // Quick animation preview of player routes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAnimation) {
      interval = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev >= 20) {
            setIsPlayingAnimation(false);
            return 0;
          }
          return prev + 1;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlayingAnimation]);

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
        <div className="flex items-center flex-wrap gap-2">
          {/* Surface Type Switcher */}
          <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-700/80 text-xs">
            <button
              onClick={() => { setBoardType('hockey'); loadDefaultPreset('hockey'); }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${boardType === 'hockey' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🏒 Ice Rink
            </button>
            <button
              onClick={() => { setBoardType('soccer'); loadDefaultPreset('soccer'); }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${boardType === 'soccer' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              ⚽ Pitch
            </button>
            <button
              onClick={() => { setBoardType('basketball'); loadDefaultPreset('basketball'); }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${boardType === 'basketball' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🏀 Court
            </button>
            <button
              onClick={() => { setBoardType('skating'); loadDefaultPreset('skating'); }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${boardType === 'skating' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              ⛸️ Oval
            </button>
          </div>

          {/* Drill title banner */}
          <div className="px-3 py-1 bg-slate-900/60 rounded-lg border border-slate-700/60 text-xs flex items-center gap-2">
            <span className="text-slate-400">Current Drill:</span>
            <span className="font-bold text-white truncate max-w-[200px]">{drillTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSelectDrillFromBank}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-650 text-slate-200 transition-colors border border-slate-600"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Drill Bank</span>
          </button>

          <button
            onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isPlayingAnimation
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-700 hover:bg-slate-650 text-slate-200 border-slate-600'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isPlayingAnimation ? 'animate-pulse text-amber-400' : ''}`} />
            <span>{isPlayingAnimation ? 'Simulating...' : 'Preview'}</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Drill</span>
          </button>
        </div>
      </div>

      {/* Main Board & Toolset Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Tactical Whiteboard Canvas Area (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {/* Tool Palette Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 px-1">Mode:</span>
              <button
                onClick={() => setMode('select')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'select' ? 'bg-blue-600 text-white' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
                title="Select and drag players"
              >
                <Move className="w-3.5 h-3.5" />
                <span>Move</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <span className="text-[11px] font-bold text-slate-400 px-1">Add:</span>
              <button
                onClick={() => { setMode('token'); setSelectedTokenType('player-offense'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'token' && selectedTokenType === 'player-offense'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/60 text-blue-400 hover:bg-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Offense</span>
              </button>

              <button
                onClick={() => { setMode('token'); setSelectedTokenType('player-defense'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'token' && selectedTokenType === 'player-defense'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-700/60 text-rose-400 hover:bg-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Defense</span>
              </button>

              <button
                onClick={() => { setMode('token'); setSelectedTokenType('goalie'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'token' && selectedTokenType === 'goalie'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700/60 text-amber-400 hover:bg-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Goalie</span>
              </button>

              <button
                onClick={() => { setMode('token'); setSelectedTokenType('ball-puck'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'token' && selectedTokenType === 'ball-puck'
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'bg-slate-700/60 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>{boardType === 'hockey' ? 'Puck' : 'Ball'}</span>
              </button>

              <button
                onClick={() => { setMode('token'); setSelectedTokenType('cone'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'token' && selectedTokenType === 'cone'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700/60 text-orange-400 hover:bg-slate-700'
                }`}
              >
                <span>▲ Cone</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <span className="text-[11px] font-bold text-slate-400 px-1">Draw:</span>
              <button
                onClick={() => setMode('draw-skate')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'draw-skate' ? 'bg-sky-500 text-white' : 'bg-slate-700/60 text-sky-400 hover:bg-slate-700'
                }`}
                title="Skate / Movement route"
              >
                <span>〰 Route</span>
              </button>

              <button
                onClick={() => setMode('draw-pass')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'draw-pass' ? 'bg-yellow-500 text-slate-950 font-bold' : 'bg-slate-700/60 text-yellow-400 hover:bg-slate-700'
                }`}
                title="Pass line"
              >
                <span>⤏ Pass</span>
              </button>

              <button
                onClick={() => setMode('draw-shot')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'draw-shot' ? 'bg-rose-500 text-white font-bold' : 'bg-slate-700/60 text-rose-400 hover:bg-slate-700'
                }`}
                title="Shot arrow"
              >
                <span>➔ Shot</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleUndo}
                disabled={drawings.length === 0}
                className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Undo last line"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClearAll}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                title="Reset board"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive SVG Board Canvas */}
          <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              onMouseDown={handleBoardMouseDown}
              onMouseMove={handleBoardMouseMove}
              onMouseUp={handleBoardMouseUp}
              className={`w-full h-full ${mode === 'select' ? 'cursor-grab' : 'cursor-crosshair'}`}
            >
              <defs>
                <marker
                  id="arrow-pass"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
                </marker>
                <marker
                  id="arrow-shot"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                </marker>
                <marker
                  id="arrow-skate"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Surface Markings */}
              {boardType === 'hockey' && (
                <g className="rink-lines" strokeWidth="0.6">
                  {/* Ice Surface background */}
                  <rect x="2" y="2" width="96" height="96" rx="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.9" />

                  {/* Red Center Line */}
                  <line x1="2" y1="50" x2="98" y2="50" stroke="#ef4444" strokeWidth="1" />
                  <circle cx="50" cy="50" r="10" stroke="#3b82f6" fill="none" strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="1" fill="#3b82f6" />

                  {/* Blue Lines */}
                  <line x1="2" y1="34" x2="98" y2="34" stroke="#2563eb" strokeWidth="1" />
                  <line x1="2" y1="66" x2="98" y2="66" stroke="#2563eb" strokeWidth="1" />

                  {/* Goal Lines */}
                  <line x1="12" y1="12" x2="88" y2="12" stroke="#ef4444" strokeWidth="0.8" />
                  <line x1="12" y1="88" x2="88" y2="88" stroke="#ef4444" strokeWidth="0.8" />

                  {/* Top Goal Crease */}
                  <path d="M 46 12 A 4 4 0 0 0 54 12 Z" fill="#38bdf8" opacity="0.3" stroke="#ef4444" strokeWidth="0.6" />
                  <rect x="47" y="9.5" width="6" height="2.5" fill="none" stroke="#ef4444" strokeWidth="0.7" />

                  {/* Bottom Goal Crease */}
                  <path d="M 46 88 A 4 4 0 0 1 54 88 Z" fill="#38bdf8" opacity="0.3" stroke="#ef4444" strokeWidth="0.6" />
                  <rect x="47" y="88" width="6" height="2.5" fill="none" stroke="#ef4444" strokeWidth="0.7" />

                  {/* Top Faceoff Circles */}
                  <circle cx="28" cy="22" r="9" stroke="#ef4444" fill="none" strokeWidth="0.7" />
                  <circle cx="28" cy="22" r="0.8" fill="#ef4444" />
                  <circle cx="72" cy="22" r="9" stroke="#ef4444" fill="none" strokeWidth="0.7" />
                  <circle cx="72" cy="22" r="0.8" fill="#ef4444" />

                  {/* Bottom Faceoff Circles */}
                  <circle cx="28" cy="78" r="9" stroke="#ef4444" fill="none" strokeWidth="0.7" />
                  <circle cx="28" cy="78" r="0.8" fill="#ef4444" />
                  <circle cx="72" cy="78" r="9" stroke="#ef4444" fill="none" strokeWidth="0.7" />
                  <circle cx="72" cy="78" r="0.8" fill="#ef4444" />
                </g>
              )}

              {boardType === 'soccer' && (
                <g className="soccer-lines" stroke="#e2e8f0" strokeWidth="0.6" fill="none">
                  <rect x="3" y="3" width="94" height="94" fill="#064e3b" stroke="#e2e8f0" opacity="0.9" />
                  <line x1="3" y1="50" x2="97" y2="50" />
                  <circle cx="50" cy="50" r="10" />
                  <circle cx="50" cy="50" r="1" fill="#e2e8f0" />

                  {/* Top penalty box */}
                  <rect x="25" y="3" width="50" height="18" />
                  <rect x="35" y="3" width="30" height="6" />
                  <circle cx="50" cy="14" r="0.8" fill="#e2e8f0" />
                  <path d="M 42 21 A 8 8 0 0 0 58 21" />

                  {/* Bottom penalty box */}
                  <rect x="25" y="79" width="50" height="18" />
                  <rect x="35" y="91" width="30" height="6" />
                  <circle cx="50" cy="86" r="0.8" fill="#e2e8f0" />
                  <path d="M 42 79 A 8 8 0 0 1 58 79" />
                </g>
              )}

              {boardType === 'basketball' && (
                <g className="basketball-lines" stroke="#e2e8f0" strokeWidth="0.6" fill="none">
                  <rect x="3" y="3" width="94" height="94" fill="#78350f" stroke="#e2e8f0" opacity="0.9" />
                  <line x1="3" y1="50" x2="97" y2="50" />
                  <circle cx="50" cy="50" r="8" />

                  {/* Top key & 3-point */}
                  <rect x="34" y="3" width="32" height="24" fill="#92400e" fillOpacity="0.3" />
                  <circle cx="50" cy="27" r="8" />
                  <path d="M 12 3 L 12 14 A 38 38 0 0 0 88 14 L 88 3" />
                  <circle cx="50" cy="8" r="2" />

                  {/* Bottom key & 3-point */}
                  <rect x="34" y="73" width="32" height="24" fill="#92400e" fillOpacity="0.3" />
                  <circle cx="50" cy="73" r="8" />
                  <path d="M 12 97 L 12 86 A 38 38 0 0 1 88 86 L 88 97" />
                  <circle cx="50" cy="92" r="2" />
                </g>
              )}

              {boardType === 'skating' && (
                <g className="skating-lines" stroke="#38bdf8" strokeWidth="0.8" fill="none">
                  <rect x="3" y="3" width="94" height="94" rx="20" fill="#082f49" opacity="0.9" stroke="#38bdf8" />
                  <rect x="18" y="18" width="64" height="64" rx="14" stroke="#0284c7" strokeWidth="0.6" strokeDasharray="2,2" />
                  <line x1="50" y1="82" x2="50" y2="97" stroke="#ef4444" strokeWidth="1" />
                  <text x="52" y="88" fill="#ef4444" fontSize="3" fontWeight="bold">FINISH</text>
                </g>
              )}

              {/* Saved Drawings */}
              {drawings.map((d) => {
                const pathStr = d.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
                const markerEnd = d.type === 'pass' ? 'url(#arrow-pass)' : d.type === 'arrow' ? 'url(#arrow-shot)' : 'url(#arrow-skate)';
                return (
                  <path
                    key={d.id}
                    d={pathStr}
                    stroke={d.color}
                    strokeWidth={d.type === 'arrow' ? '1.2' : '1'}
                    strokeDasharray={d.dashed ? '2,2' : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    markerEnd={markerEnd}
                  />
                );
              })}

              {/* In-progress drawing preview */}
              {activeDrawing && activeDrawing.length > 0 && (
                <path
                  d={activeDrawing.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                  stroke={mode === 'draw-pass' ? '#facc15' : mode === 'draw-shot' ? '#ef4444' : '#38bdf8'}
                  strokeWidth="1"
                  strokeDasharray={mode === 'draw-pass' ? '2,2' : undefined}
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {/* Tokens / Players */}
              {tokens.map((token) => {
                const isOffense = token.type === 'player-offense';
                const isDefense = token.type === 'player-defense';
                const isGoalie = token.type === 'goalie';
                const isBall = token.type === 'ball-puck';
                const isCone = token.type === 'cone';

                // Subtle animation offset if preview is playing
                const animOffsetX = isPlayingAnimation ? Math.sin(animationStep + Number(token.x)) * 1.5 : 0;
                const animOffsetY = isPlayingAnimation ? Math.cos(animationStep + Number(token.y)) * 1.5 : 0;
                const currentX = token.x + animOffsetX;
                const currentY = token.y + animOffsetY;

                return (
                  <g
                    key={token.id}
                    transform={`translate(${currentX}, ${currentY})`}
                    className="cursor-move group"
                    onMouseDown={(e) => {
                      if (mode === 'select') {
                        e.stopPropagation();
                        setDraggingTokenId(token.id);
                      }
                    }}
                    onDoubleClick={(e) => handleRemoveToken(token.id, e)}
                  >
                    {/* Shadow */}
                    <circle cx="0.4" cy="0.4" r={isBall ? 2 : isCone ? 2.5 : 3.8} fill="#000000" opacity="0.4" />

                    {/* Main Token Shape */}
                    {isCone ? (
                      <polygon
                        points="0,-3.5 3,2.5 -3,2.5"
                        fill="#f97316"
                        stroke="#ffedd5"
                        strokeWidth="0.5"
                      />
                    ) : isBall ? (
                      <circle
                        cx="0"
                        cy="0"
                        r="2.2"
                        fill={boardType === 'hockey' ? '#0f172a' : '#ffffff'}
                        stroke={boardType === 'hockey' ? '#64748b' : '#0f172a'}
                        strokeWidth="0.6"
                      />
                    ) : (
                      <circle
                        cx="0"
                        cy="0"
                        r="3.8"
                        fill={isOffense ? '#2563eb' : isDefense ? '#dc2626' : '#d97706'}
                        stroke="#ffffff"
                        strokeWidth="0.7"
                      />
                    )}

                    {/* Token Text Label */}
                    {!isCone && (
                      <text
                        x="0"
                        y={isBall ? 0.7 : 1.2}
                        textAnchor="middle"
                        fill={isBall && boardType === 'hockey' ? '#ffffff' : isBall ? '#000000' : '#ffffff'}
                        fontSize={isBall ? '1.8' : '2.6'}
                        fontWeight="bold"
                        className="select-none pointer-events-none"
                      >
                        {token.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Board active. Drag tokens to reposition, double-click to delete.</span>
            </div>
            <span>Tokens: {tokens.length} | Lines: {drawings.length}</span>
          </div>
        </div>

        {/* Drill Coaching Notes & Tactics Panel (1 col) */}
        <div className="lg:col-span-1 bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Tactical Briefing</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                  {drillCategory}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{drillTitle}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {drillDescription || 'No description added yet. Click "Save Drill" to edit full parameters or add coaching cues below.'}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Estimated Time</span>
                <span className="font-bold text-slate-100">{drillDuration} mins</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Intensity</span>
                <span className={`font-bold ${
                  drillIntensity === 'High' || drillIntensity === 'Extreme' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {drillIntensity}
                </span>
              </div>
            </div>

            {/* Key Coaching Points / Cues */}
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Key Coaching Cues
              </span>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {drillCues.map((cue, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-200">
                    <span className="leading-snug">{cue}</span>
                    <button
                      onClick={() => handleRemoveCue(idx)}
                      className="text-slate-400 hover:text-rose-400 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add cue inline */}
              <div className="flex items-center gap-1.5 mt-2">
                <input
                  type="text"
                  placeholder="Add coaching cue..."
                  value={newCueText}
                  onChange={(e) => setNewCueText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCue()}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddCue}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/60">
            <button
              onClick={() => setShowSaveModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Drill Specifications</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save / Edit Drill Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Save className="w-4 h-4 text-blue-400" />
                Save Tactical Drill
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Drill Name</label>
                <input
                  type="text"
                  value={drillTitle}
                  onChange={(e) => setDrillTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={drillCategory}
                    onChange={(e) => setDrillCategory(e.target.value as TacticalDrill['category'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Warmup">Warmup</option>
                    <option value="Tactical">Tactical</option>
                    <option value="Skill & Skating">Skill & Skating</option>
                    <option value="Conditioning">Conditioning</option>
                    <option value="Power Play / Set Piece">Power Play / Set Piece</option>
                    <option value="Defense / Trap">Defense / Trap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Intensity</label>
                  <select
                    value={drillIntensity}
                    onChange={(e) => setDrillIntensity(e.target.value as TacticalDrill['intensity'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={drillDuration}
                  onChange={(e) => setDrillDuration(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coach Instructions & Objectives</label>
                <textarea
                  rows={3}
                  value={drillDescription}
                  onChange={(e) => setDrillDescription(e.target.value)}
                  placeholder="Detail movement patterns, passing triggers, and read-and-react options..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubmit}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30"
              >
                Save to Drill Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
