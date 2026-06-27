import React, { useState, useEffect, useRef } from 'react';
import { Player, LiveTicketData, PlayerAttributes, PlayerTraits } from './types';
import PlayerBuilder from './components/PlayerBuilder';
import RosterList from './components/RosterList';
import ExportPopup from './components/ExportPopup';
import { BadgeAlert, ShieldCheck, Share2, HelpCircle, DollarSign, Award, Trophy, Info, FileSpreadsheet, Youtube } from 'lucide-react';
import { POSITIONS, createZeroAttributes, createZeroTraits } from './data';
import {
  calculateOVR,
  checkPhysicalAnomaly,
  calculatePhysicalAnomalyCost,
  calculateAgeCost,
  calculateDevTraitCost,
  calculateTotalAttributesCost
} from './utils/calculations';

const BUDGET_CAP = 25000;

export default function App() {
  // State for the Live Draft Ticket
  const [liveTicket, setLiveTicket] = useState<LiveTicketData | null>(null);

  // Ref to trigger submit inside PlayerBuilder from the Ticket on the right column
  const builderSubmitRef = useRef<() => void>();

  // Load roster from LocalStorage for persistence
  const [roster, setRoster] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('madden_roster_builder_data');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('madden_roster_builder_data', JSON.stringify(roster));
  }, [roster]);

  // Calculate total roster budget spent
  const totalRosterCost = roster.reduce((sum, p) => sum + p.cost, 0);

  // Remaining budget calculation, but adjusting if we are currently editing a player
  // (so the player's old cost is refunded during edit calculation)
  const activeRemainingBudget = BUDGET_CAP - (totalRosterCost - (editingPlayer?.cost || 0));

  const handleDraftPlayer = (player: Player) => {
    if (editingPlayer) {
      // Replace existing player
      setRoster(prev => prev.map(p => p.id === player.id ? player : p));
      setEditingPlayer(null);
    } else {
      // Draft new player
      if (roster.length >= 22) {
        alert('You have reached the maximum 22-man roster limit!');
        return;
      }
      setRoster(prev => [...prev, player]);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    // Scroll smoothly to player builder container
    document.getElementById('player-builder-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeletePlayer = (player: Player) => {
    if (confirm(`Are you sure you want to release ${player.PFNA} ${player.PLNA} from your roster?`)) {
      setRoster(prev => prev.filter(p => p.id !== player.id));
      if (editingPlayer?.id === player.id) {
        setEditingPlayer(null);
      }
    }
  };

  const handleClearRoster = () => {
    if (confirm('Are you sure you want to clear your entire drafted roster? This cannot be undone.')) {
      setRoster([]);
      setEditingPlayer(null);
    }
  };

  const presetInputRef = useRef<HTMLInputElement>(null);

  const handleLoadLeaguePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        alert("Invalid preset file. The file is empty.");
        return;
      }

      // Read headers and match columns
      const headerCells = lines[0].split(',').map(c => c.trim().replace(/^["']|["']$/g, '').toUpperCase());
      const colIndex: Record<string, number> = {};
      headerCells.forEach((h, idx) => {
        colIndex[h] = idx;
      });

      // Check required columns for creating a player
      const requiredCols = ['PFNA', 'PLNA', 'PPOS', 'PAGE', 'PHGT', 'PWGT', 'PJEN', 'PROL', 'PYRP'];
      const missing = requiredCols.filter(col => colIndex[col] === undefined);
      if (missing.length > 0) {
        alert(`Error: This CSV is not a valid league preset. Missing columns: ${missing.join(', ')}`);
        return;
      }

      const importedPlayers: Player[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom parser to handle commas within double quotes correctly
        const cells: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cells.push(current.trim());

        if (cells.length < requiredCols.length) {
          continue;
        }

        const getValue = (colName: string) => cells[colIndex[colName]]?.replace(/^["']|["']$/g, '') || '';

        const pfna = getValue('PFNA');
        const pna = getValue('PLNA');
        const ppos = parseInt(getValue('PPOS'));
        const pageVal = parseInt(getValue('PAGE')) || 27;
        const phgtVal = parseInt(getValue('PHGT')) || 72;
        const pwgtVal = parseInt(getValue('PWGT')) || 60; // offset (Actual - 160)
        const pjenVal = parseInt(getValue('PJEN')) || 10;
        const prolVal = parseInt(getValue('PROL')) || 0;
        const pyrpVal = parseInt(getValue('PYRP')) || 4;

        // Rebuild attributes dictionary
        const attributes = createZeroAttributes();
        Object.keys(attributes).forEach(attr => {
          const colU = attr.toUpperCase();
          if (colIndex[colU] !== undefined) {
            const val = parseInt(cells[colIndex[colU]]) || 0;
            attributes[attr as keyof PlayerAttributes] = val;
          }
        });

        // Rebuild traits dictionary
        const traits = createZeroTraits();
        Object.keys(traits).forEach(trait => {
          const colU = trait.toUpperCase();
          if (colIndex[colU] !== undefined) {
            const val = parseInt(cells[colIndex[colU]]) || 0;
            traits[trait as keyof PlayerTraits] = val;
          }
        });

        const posObj = POSITIONS.find(p => p.id === ppos);
        if (!posObj) continue;
        const posGroup = posObj.group;

        // Recompute OVR, cost, and physical anomaly
        const finalOVR = calculateOVR(posGroup, attributes);
        const hasPhysicalAnomaly = checkPhysicalAnomaly(posGroup, phgtVal, pwgtVal + 160);
        const physicalPenalty = calculatePhysicalAnomalyCost(posGroup, phgtVal, pwgtVal + 160);
        const ageCost = calculateAgeCost(pageVal);
        const devCost = calculateDevTraitCost(prolVal);
        const attributesCost = calculateTotalAttributesCost(posGroup, attributes);
        const cost = attributesCost + physicalPenalty + ageCost + devCost;

        const importedPlayer: Player = {
          id: Math.random().toString(36).substring(2, 9),
          PFNA: pfna,
          PLNA: pna,
          PHGT: phgtVal,
          PWGT: pwgtVal,
          PAGE: pageVal,
          PYRP: pyrpVal,
          PJEN: pjenVal,
          PROL: prolVal,
          PPOS: ppos,
          POVR: finalOVR,
          attributes,
          traits,
          cost,
          hasPhysicalAnomaly,
        };

        importedPlayers.push(importedPlayer);
      }

      if (importedPlayers.length === 0) {
        alert("Could not find any valid custom players in this league preset file.");
        return;
      }

      const presetTotalCost = importedPlayers.reduce((sum, p) => sum + p.cost, 0);
      setRoster(importedPlayers);
      setEditingPlayer(null);
      
      let feedbackMsg = `Success! Imported ${importedPlayers.length} players from the league preset.\n\n`;
      feedbackMsg += `Total cost of this team: $${presetTotalCost.toLocaleString()} / $${BUDGET_CAP.toLocaleString()} budget.\n`;
      if (presetTotalCost > BUDGET_CAP) {
        feedbackMsg += `⚠️ Note: This preset team is currently OVER the $25,000 budget cap. You can edit their attributes to reduce costs.`;
      } else {
        feedbackMsg += `✅ Compliance Check: Roster is fully compliant and within budget!`;
      }
      alert(feedbackMsg);
    };

    reader.readAsText(file);
    e.target.value = ''; // Reset input to allow re-upload
  };

  return (
    <div className="min-h-screen bg-[#0d111a] text-gray-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0f1422]/90 backdrop-blur-md border-b border-gray-850 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/30 tracking-tighter border border-indigo-500/20">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 uppercase font-sans">
                Madden <span className="text-indigo-400 font-extrabold normal-case">$25,000 Challenge</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">by WHCRs?</p>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Salary Cap Badge */}
            <div className="bg-[#161d2d] border border-gray-800 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <div>
                <span className="text-gray-500 block text-[9px] uppercase font-bold leading-none">Cap Space Left</span>
                <span className={`font-bold ${BUDGET_CAP - totalRosterCost < 0 ? 'text-rose-400 animate-pulse' : 'text-green-400'}`}>
                  ${(BUDGET_CAP - totalRosterCost).toLocaleString()} / ${BUDGET_CAP.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Use League Preset Button */}
            <div className="relative">
              <input
                id="league-preset-uploader"
                type="file"
                accept=".csv"
                onChange={handleLoadLeaguePreset}
                className="hidden"
                ref={presetInputRef}
              />
              <button
                onClick={() => presetInputRef.current?.click()}
                className="bg-[#1a2035] hover:bg-[#202744] text-indigo-400 border border-indigo-900/60 hover:border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2 cursor-pointer transition-all shadow-md group"
                title="Upload a saved team league preset"
              >
                <FileSpreadsheet className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="text-indigo-500 block text-[9px] uppercase font-bold leading-none">League Tools</span>
                  <span className="text-gray-200 font-bold">Use league preset</span>
                </div>
              </button>
            </div>

            {/* Tutorial Link Button */}
            <a
              href="https://www.youtube.com/watch?v=R5d1-LJm4LY"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1c162e] hover:bg-[#291e45] text-rose-400 border border-rose-950/60 hover:border-rose-500/50 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2 cursor-pointer transition-all shadow-md group"
              title="Watch Tutorial for Gameplay and Importing into Madden"
            >
              <Youtube className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-rose-500 block text-[9px] uppercase font-bold leading-none">Madden Guide</span>
                <span className="text-gray-200 font-bold">Tutorial for Gameplay & Importing</span>
              </div>
            </a>

            <button
              onClick={() => setShowGuide(prev => !prev)}
              className="p-2 rounded bg-gray-800/60 hover:bg-gray-850 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="View Roster Builder Guidelines"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        
        {/* Help Guidelines Accordion Box */}
        {showGuide && (
          <div className="bg-[#161d2d] border border-indigo-900/40 rounded-xl p-5 text-sm leading-relaxed space-y-4 animate-fadeIn relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-xs text-gray-500 hover:text-white"
            >
              Close
            </button>
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-yellow-400" /> Roster Builder Guidelines & Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
              <ul className="space-y-1.5 list-disc list-inside">
                <li><span className="text-white font-semibold">Budget Cap:</span> Max $25,000 to construct a full 22-man NFL roster.</li>
                <li><span className="text-white font-semibold">Base Attributes:</span> Every player starts with all skill ratings at 0, age 27, and Normal development.</li>
                <li><span className="text-white font-semibold">Attribute Costs:</span> Exponential curves apply. Rating 99 costs: Elite ($500), Premium ($300), Standard ($150), and Cheap ($75).</li>
              </ul>
              <ul className="space-y-1.5 list-disc list-inside">
                <li><span className="text-white font-semibold">Physical Standards:</span> Height 5'5"-7'0", Weight 150-450 lbs.</li>
                <li><span className="text-white font-semibold">Anomaly Penalties:</span> A $150 penalty applies if dimensions fall outside of the selected position's ideal ranges.</li>
                <li><span className="text-white font-semibold">Positional OVRs:</span> Overalls are dynamically weighted based on critical stats for that position (e.g. THP for QBs).</li>
              </ul>
            </div>
          </div>
        )}

        {/* Editing HUD alert banner */}
        {editingPlayer && (
          <div className="bg-indigo-950/40 border-2 border-indigo-500/30 rounded-xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
              <div>
                <span className="text-sm font-extrabold text-white uppercase tracking-wider block">Editing Player Mode</span>
                <span className="text-xs text-indigo-300">Modifying {editingPlayer.PFNA} {editingPlayer.PLNA}. Click "Save Player Edits" or "Cancel Edit" in the draft ticket on the right.</span>
              </div>
            </div>
            <button
              onClick={() => setEditingPlayer(null)}
              className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-900 text-indigo-100 hover:bg-indigo-800 transition-colors"
            >
              Exit Edit
            </button>
          </div>
        )}

        {/* Core Layout: Player Builder and Roster Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Builder column (7 cols desktop) */}
          <div className="xl:col-span-7 space-y-8">
            <PlayerBuilder
              onDraft={handleDraftPlayer}
              editingPlayer={editingPlayer}
              onCancelEdit={() => setEditingPlayer(null)}
              remainingBudget={activeRemainingBudget}
              currentRosterSize={roster.length}
              onTicketChange={setLiveTicket}
              submitRef={builderSubmitRef}
            />
          </div>

          {/* Roster list column (5 cols desktop) */}
          <div className="xl:col-span-5 space-y-8">
            {liveTicket && (
              <div className="bg-gradient-to-b from-[#111622] to-[#0f1422] rounded-xl p-6 border border-indigo-950/80 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex justify-between items-center border-b border-gray-850 pb-3">
                  <h3 className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                    Live Draft Ticket
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-semibold">Madden $25K</span>
                </div>

                {/* OVR & Player Info (No horizontal squeeze) */}
                <div className="flex items-center gap-4">
                  {/* Overall Display */}
                  <div className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex flex-col items-center justify-center shadow-lg border border-yellow-300/20 text-black shrink-0">
                    <Award className="h-5 w-5" />
                    <span className="text-2xl font-extrabold font-sans tracking-tighter leading-none">{liveTicket.ovr}</span>
                    <span className="text-[9px] font-bold uppercase font-mono tracking-widest">OVR</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-white font-extrabold block text-lg uppercase truncate leading-tight tracking-tight">
                      {liveTicket.firstName.trim() || 'First Name'}
                    </span>
                    <span className="text-white font-extrabold block text-lg uppercase truncate leading-none tracking-tight">
                      {liveTicket.lastName.trim() || 'Last Name'}
                    </span>
                    <span className="text-xs font-mono text-gray-400 block mt-1">
                      {liveTicket.positionCode} • {liveTicket.devLabel} • Age {liveTicket.age}
                    </span>
                  </div>
                </div>

                {/* Perforation Line Effect */}
                <div className="relative py-1 select-none">
                  <div className="absolute -left-[29px] top-1/2 -translate-y-1/2 w-3 h-4 bg-[#090d16] rounded-r-full border-r border-indigo-950/40"></div>
                  <div className="absolute -right-[29px] top-1/2 -translate-y-1/2 w-3 h-4 bg-[#090d16] rounded-l-full border-l border-indigo-950/40"></div>
                  <div className="border-t border-dashed border-gray-800"></div>
                </div>

                {/* Player Cost Premium Display Box */}
                <div className="bg-[#161d2d]/50 border border-gray-850/50 rounded-lg p-3 text-center space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">Player Draft Cost</span>
                  <div className={`text-3xl font-black font-mono tracking-tight flex items-center justify-center ${liveTicket.isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                    <DollarSign className="h-6 w-6 -mr-1" />
                    <span>{liveTicket.totalCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Financial Ledger breakdown */}
                <div className="text-xs font-mono space-y-2 border-t border-gray-850 pt-4 text-gray-400">
                  <div className="flex justify-between">
                    <span>Base Attributes Cost:</span>
                    <span className="text-white">${liveTicket.attributesCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dev Trait Premium:</span>
                    <span className={liveTicket.devCost > 0 ? 'text-indigo-400 font-bold' : 'text-gray-500'}>
                      {liveTicket.devCost > 0 ? `+$${liveTicket.devCost.toLocaleString()}` : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Youth Premium (Age &lt; 27):</span>
                    <span className={liveTicket.ageCost > 0 ? 'text-amber-400 font-bold' : 'text-gray-500'}>
                      {liveTicket.ageCost > 0 ? `+$${liveTicket.ageCost.toLocaleString()}` : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oversize Penalty:</span>
                    <span className={liveTicket.physicalPenalty > 0 ? 'text-rose-400 font-bold' : 'text-gray-500'}>
                      {liveTicket.physicalPenalty > 0 ? `+$${liveTicket.physicalPenalty.toLocaleString()}` : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-800 pt-3 text-sm text-gray-300 font-bold">
                    <span>Team Budget Remaining:</span>
                    <span className={liveTicket.budgetDelta < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      ${liveTicket.budgetDelta.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Error Message display */}
                {liveTicket.errorMsg && (
                  <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 text-center font-semibold">
                    {liveTicket.errorMsg}
                  </div>
                )}

                {/* Submit / Save action button */}
                <div className="pt-2">
                  <button
                    id="btn-submit-player"
                    type="button"
                    onClick={() => {
                      if (builderSubmitRef.current) {
                        builderSubmitRef.current();
                      }
                    }}
                    disabled={liveTicket.isOverBudget || !liveTicket.firstName.trim() || !liveTicket.lastName.trim()}
                    className={`w-full py-4 px-4 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                      liveTicket.isOverBudget || !liveTicket.firstName.trim() || !liveTicket.lastName.trim()
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-750'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-[0.98]'
                    }`}
                  >
                    {liveTicket.isEditing ? 'Save Player Edits' : 'Draft to 22-Man Roster'}
                  </button>

                  {liveTicket.isEditing && (
                    <button
                      type="button"
                      onClick={() => setEditingPlayer(null)}
                      className="w-full mt-3 py-3 px-4 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-750 text-gray-300 border border-gray-700 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            )}

            <RosterList
              roster={roster}
              onEdit={handleEditPlayer}
              onDelete={handleDeletePlayer}
              totalCost={totalRosterCost}
              budget={BUDGET_CAP}
            />
          </div>

        </div>

      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="sticky bottom-0 z-40 bg-[#0f1422]/95 border-t border-gray-850 px-4 py-4 sm:px-6 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Active Roster Info */}
          <div className="text-center sm:text-left">
            <span className="text-gray-400 text-xs font-mono uppercase tracking-wide block">Current Franchise Status</span>
            <div className="flex items-center gap-2 mt-0.5 justify-center sm:justify-start">
              <span className="text-white text-sm font-extrabold font-mono">{roster.length} / 22 Players Signed</span>
              <span className="text-gray-500">•</span>
              <span className={`text-sm font-mono font-bold ${totalRosterCost > BUDGET_CAP ? 'text-rose-400' : 'text-green-400'}`}>
                ${totalRosterCost.toLocaleString()} Cap Spent
              </span>
            </div>
          </div>

          {/* Core Footer Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {roster.length > 0 && (
              <button
                onClick={handleClearRoster}
                className="px-4 py-3 rounded-lg text-xs font-medium bg-transparent hover:bg-rose-950/20 text-gray-500 hover:text-rose-400 border border-gray-800 transition-colors w-full sm:w-auto cursor-pointer"
              >
                Clear Roster
              </button>
            )}
            
            <button
              id="btn-trigger-export"
              onClick={() => setIsExportOpen(true)}
              className="px-6 py-3 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all w-full sm:w-auto cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              Export Custom Team
            </button>
          </div>

        </div>
      </footer>

      {/* Export Popup modal */}
      {isExportOpen && (
        <ExportPopup
          roster={roster}
          onClose={() => setIsExportOpen(false)}
        />
      )}

    </div>
  );
}
