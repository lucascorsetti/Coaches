import React, { useState, useEffect } from 'react';
import { Athlete, PlayerPosition, HealthStatus, SportType } from '../../types';
import { User, Activity, ShieldAlert, Award, HeartPulse, Save } from 'lucide-react';

interface AthleteModalProps {
  athlete?: Athlete | null;
  sport: SportType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (athlete: Athlete) => void;
}

export const AthleteModal: React.FC<AthleteModalProps> = ({
  athlete,
  sport,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Athlete>>({
    name: '',
    number: 10,
    position: 'Forward',
    age: 22,
    heightCm: 180,
    weightKg: 80,
    dominantSide: 'Left',
    healthStatus: 'fit',
    readinessScore: 90,
    attendanceRate: 100,
    lineUnit: 'Line 1',
    notes: '',
    metrics: {
      vo2max: 55,
      maxSpeedKmh: 35,
      heartRateRest: 50,
      heartRateMax: 190,
      acwr: 1.05,
      verticalJumpCm: 60
    },
    stats: {
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      plusMinus: 0,
      penaltiesMinutes: 0
    }
  });

  useEffect(() => {
    if (athlete) {
      setFormData(athlete);
    } else {
      setFormData({
        id: `ath-${Date.now()}`,
        name: '',
        number: Math.floor(Math.random() * 80) + 10,
        position: sport === 'hockey' ? 'Center' : sport === 'soccer' ? 'Midfielder' : 'Point Guard',
        age: 23,
        heightCm: 183,
        weightKg: 82,
        dominantSide: 'Left',
        healthStatus: 'fit',
        readinessScore: 92,
        attendanceRate: 98,
        lineUnit: 'Line 1',
        notes: '',
        metrics: {
          vo2max: 56,
          maxSpeedKmh: 36,
          heartRateRest: 49,
          heartRateMax: 192,
          acwr: 1.05,
          verticalJumpCm: 62
        },
        stats: {
          gamesPlayed: 12,
          goals: 4,
          assists: 7,
          plusMinus: 5,
          penaltiesMinutes: 8
        }
      });
    }
  }, [athlete, sport, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const finalAthlete: Athlete = {
      id: formData.id || `ath-${Date.now()}`,
      name: formData.name.trim(),
      number: Number(formData.number) || 1,
      position: (formData.position as PlayerPosition) || 'Forward',
      secondaryPosition: formData.secondaryPosition,
      age: Number(formData.age) || 20,
      heightCm: Number(formData.heightCm) || 180,
      weightKg: Number(formData.weightKg) || 75,
      dominantSide: formData.dominantSide || 'Left',
      healthStatus: (formData.healthStatus as HealthStatus) || 'fit',
      readinessScore: Number(formData.readinessScore) || 85,
      attendanceRate: Number(formData.attendanceRate) || 95,
      lineUnit: formData.lineUnit || 'Line 1',
      metrics: {
        vo2max: Number(formData.metrics?.vo2max) || 54,
        maxSpeedKmh: Number(formData.metrics?.maxSpeedKmh) || 35,
        heartRateRest: Number(formData.metrics?.heartRateRest) || 52,
        heartRateMax: Number(formData.metrics?.heartRateMax) || 190,
        acwr: Number(formData.metrics?.acwr) || 1.0,
        verticalJumpCm: Number(formData.metrics?.verticalJumpCm) || 60
      },
      notes: formData.notes || '',
      stats: {
        gamesPlayed: Number(formData.stats?.gamesPlayed) || 0,
        goals: Number(formData.stats?.goals) || 0,
        assists: Number(formData.stats?.assists) || 0,
        plusMinus: Number(formData.stats?.plusMinus) || 0,
        penaltiesMinutes: Number(formData.stats?.penaltiesMinutes) || 0
      }
    };

    onSave(finalAthlete);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-lg">
              #{formData.number}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {athlete ? 'Edit Athlete Profile' : 'Register New Athlete'}
              </h3>
              <p className="text-xs text-slate-400">Complete performance vitals and roster assignment.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* General details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Marco Zanatta"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jersey Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={formData.number || 1}
                onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Position & Unit Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Position</label>
              <select
                value={formData.position || 'Forward'}
                onChange={(e) => setFormData({ ...formData, position: e.target.value as PlayerPosition })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Center">Center</option>
                <option value="Winger">Winger</option>
                <option value="Forward">Forward</option>
                <option value="Defenseman">Defenseman</option>
                <option value="Goaltender">Goaltender</option>
                <option value="Striker">Striker</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Defender">Defender</option>
                <option value="Speed Skater">Speed Skater</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Roster Line / Unit</label>
              <select
                value={formData.lineUnit || 'Line 1'}
                onChange={(e) => setFormData({ ...formData, lineUnit: e.target.value as Athlete['lineUnit'] })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Line 1">Line 1 (Starting Top Line)</option>
                <option value="Line 2">Line 2</option>
                <option value="Line 3">Line 3</option>
                <option value="Line 4">Line 4</option>
                <option value="Reserves">Reserves / Taxi Squad</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dominant Hand / Shot</label>
              <select
                value={formData.dominantSide || 'Left'}
                onChange={(e) => setFormData({ ...formData, dominantSide: e.target.value as Athlete['dominantSide'] })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Ambidextrous">Ambidextrous</option>
              </select>
            </div>
          </div>

          {/* Physical & Health Readiness */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>Health Status & Readiness Metrics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Medical Status</label>
                <select
                  value={formData.healthStatus || 'fit'}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as HealthStatus })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white focus:outline-none"
                >
                  <option value="fit">🟢 Fit & Ready</option>
                  <option value="recovering">🟡 Recovering / Limited</option>
                  <option value="injured">🔴 Injured / Out</option>
                  <option value="rested">🔵 Load Managed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Readiness Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.readinessScore || 90}
                  onChange={(e) => setFormData({ ...formData, readinessScore: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ACWR Workload Ratio</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.3"
                  max="2.5"
                  value={formData.metrics?.acwr || 1.05}
                  onChange={(e) => setFormData({
                    ...formData,
                    metrics: { ...formData.metrics, acwr: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">VO2 Max (ml/kg/min)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.metrics?.vo2max || 56}
                  onChange={(e) => setFormData({
                    ...formData,
                    metrics: { ...formData.metrics, vo2max: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1">Top Speed (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.metrics?.maxSpeedKmh || 36}
                  onChange={(e) => setFormData({
                    ...formData,
                    metrics: { ...formData.metrics, maxSpeedKmh: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resting Heart Rate</label>
                <input
                  type="number"
                  value={formData.metrics?.heartRateRest || 50}
                  onChange={(e) => setFormData({
                    ...formData,
                    metrics: { ...formData.metrics, heartRateRest: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm || 182}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg || 82}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Season Game Statistics */}
          <div className="grid grid-cols-4 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <div>
              <label className="block text-slate-400 mb-1">Games Played</label>
              <input
                type="number"
                value={formData.stats?.gamesPlayed || 0}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: { ...formData.stats, gamesPlayed: Number(e.target.value), goals: formData.stats?.goals || 0, assists: formData.stats?.assists || 0 }
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Goals / Points</label>
              <input
                type="number"
                value={formData.stats?.goals || 0}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: { ...formData.stats, goals: Number(e.target.value), gamesPlayed: formData.stats?.gamesPlayed || 0, assists: formData.stats?.assists || 0 }
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Assists</label>
              <input
                type="number"
                value={formData.stats?.assists || 0}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: { ...formData.stats, assists: Number(e.target.value), gamesPlayed: formData.stats?.gamesPlayed || 0, goals: formData.stats?.goals || 0 }
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">+/- Rating</label>
              <input
                type="number"
                value={formData.stats?.plusMinus || 0}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: { ...formData.stats, plusMinus: Number(e.target.value), gamesPlayed: formData.stats?.gamesPlayed || 0, goals: formData.stats?.goals || 0, assists: formData.stats?.assists || 0 }
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
              />
            </div>
          </div>

          {/* Coach confidential notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Coach Notes & Development Plan</label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tactical discipline, leadership tendencies, tactical weaknesses..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{athlete ? 'Save Changes' : 'Create Athlete'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
