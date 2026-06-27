import React from 'react';
import { Player } from '../types';
import { POSITIONS } from '../data';
import { formatHeight } from '../utils/calculations';
import { Edit2, Trash2, Shield, Award, Sparkles, Users, Info } from 'lucide-react';

interface RosterListProps {
  roster: Player[];
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
  totalCost: number;
  budget: number;
}

export default function RosterList({
  roster,
  onEdit,
  onDelete,
  totalCost,
  budget,
}: RosterListProps) {
  const budgetPercentage = Math.min(100, (totalCost / budget) * 100);
  const remainingBudget = budget - totalCost;

  const getPositionLabel = (posId: number) => {
    return POSITIONS.find(p => p.id === posId)?.code || 'N/A';
  };

  const getDevLabel = (dev: number) => {
    switch (dev) {
      case 1: return 'Star';
      case 2: return 'Superstar';
      case 3: return 'X-Factor';
      default: return 'Normal';
    }
  };

  return (
    <div id="roster-list-container" className="bg-[#1a202c] rounded-xl border border-gray-800 p-6 shadow-2xl space-y-6">
      
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 id="roster-title" className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Active Team Franchise Roster
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Manage your starting players and stay under the strict $25,000 budget cap.
          </p>
        </div>
        
        {/* Roster Size */}
        <div className="bg-[#111622] border border-gray-850 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-sm shrink-0">
          <span className="text-gray-400">Roster Limit:</span>
          <span className={`font-bold ${roster.length === 22 ? 'text-amber-400' : 'text-indigo-400'}`}>
            {roster.length} / 22
          </span>
        </div>
      </div>

      {/* Roster Budget Meter */}
      <div className="bg-[#111622] rounded-lg p-4 border border-gray-850 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-400">Budget Spent:</span>
            <span className="font-mono text-white font-bold">${totalCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-right">
            <span className="font-semibold text-gray-400">Remaining Cap Room:</span>
            <span className={`font-mono font-bold ${remainingBudget < 0 ? 'text-rose-400 animate-pulse' : 'text-green-400'}`}>
              ${remainingBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cap Gauge */}
        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              budgetPercentage > 90
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : budgetPercentage > 70
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
            }`}
            style={{ width: `${budgetPercentage}%` }}
          ></div>
        </div>
        
        {/* Help Banner if empty */}
        {roster.length === 0 && (
          <p className="text-gray-500 text-[11px] flex items-center gap-1.5 pt-1">
            <Info className="h-3 w-3 shrink-0 text-gray-400" />
            No players drafted yet. Enter an identity and customize attributes above to sign your first player!
          </p>
        )}
      </div>

      {/* Active Roster List Cards */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {roster.map(player => {
          const positionCode = getPositionLabel(player.PPOS);
          const devLabel = getDevLabel(player.PROL);
          
          // Count active purchased stats
          const purchasedStats = Object.entries(player.attributes).filter(([_, val]) => val > 0);

          return (
            <div
              key={player.id}
              className="bg-[#111622] rounded-lg border border-gray-800 hover:border-gray-700/80 transition-all p-4.5 relative overflow-hidden group"
            >
              {/* Subtle background color based on Dev Trait */}
              {player.PROL > 0 && (
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  player.PROL === 3 ? 'bg-gradient-to-b from-yellow-400 to-amber-600' :
                  player.PROL === 2 ? 'bg-rose-500' : 'bg-cyan-500'
                }`}></div>
              )}

              {/* Card top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-850 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  {/* OVR circular Badge */}
                  <div className="h-10 w-10 shrink-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded border border-gray-700 flex flex-col items-center justify-center font-mono">
                    <span className="text-[9px] text-gray-500 font-bold uppercase leading-none">OVR</span>
                    <span className="text-lg font-extrabold text-indigo-400 leading-none">{player.POVR}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {player.PFNA} {player.PLNA}
                      <span className="text-xs font-mono text-indigo-300 font-black bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900/40">
                        {positionCode}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-400 font-mono mt-0.5">
                      <span># {player.PJEN}</span>
                      <span>•</span>
                      <span>{player.PAGE} yrs old</span>
                      <span>•</span>
                      <span>{formatHeight(player.PHGT)}, {player.PWGT + 160} lbs</span>
                      
                      {player.PROL > 0 && (
                        <>
                          <span>•</span>
                          <span className={`text-[10px] px-1 py-0.1 rounded font-bold flex items-center gap-0.5 ${
                            player.PROL === 3 ? 'bg-amber-900/40 text-amber-300 border border-amber-800/40' :
                            player.PROL === 2 ? 'bg-rose-950/40 text-rose-300 border border-rose-900/40' :
                            'bg-cyan-950/40 text-cyan-300 border border-cyan-900/40'
                          }`}>
                            <Sparkles className="h-2.5 w-2.5" /> {devLabel}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Costs and action buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right font-mono">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">Cap Charge</span>
                    <span className="text-sm font-extrabold text-green-400">${player.cost.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(player)}
                      title="Edit player attributes (refunds cost)"
                      className="p-1.5 rounded bg-gray-800 hover:bg-indigo-900/60 text-gray-400 hover:text-indigo-200 border border-gray-750 transition-all cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(player)}
                      title="Release player from team (refunds cost)"
                      className="p-1.5 rounded bg-gray-800 hover:bg-rose-950/60 text-gray-400 hover:text-rose-400 border border-gray-750 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Receipt Grid of purchased attributes */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
                  Attribute Purchases ({purchasedStats.length})
                </span>
                
                {purchasedStats.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                    {purchasedStats.map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-[#161c2a] border border-gray-800 rounded px-1.5 py-1 text-xs text-center font-mono hover:border-indigo-900/50 hover:bg-indigo-950/5 transition-colors"
                      >
                        <span className="text-[9px] text-gray-500 block leading-tight font-semibold uppercase">{key.substring(1)}</span>
                        <span className="text-indigo-400 font-extrabold block text-[11px] leading-none mt-0.5">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-600 font-mono italic">
                    Base player details with zero purchased stats.
                  </p>
                )}
              </div>

              {/* Physical Anomaly Warning badge inside list */}
              {player.hasPhysicalAnomaly && (
                <div className="mt-2 text-[10px] bg-amber-950/20 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono">
                  <Shield className="h-3 w-3 text-amber-500" /> Physical Anomaly Penalty Active (+$150 included)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
