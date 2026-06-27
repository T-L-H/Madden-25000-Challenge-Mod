import React, { useState, useEffect } from 'react';
import { Player, PlayerAttributes, PlayerTraits, PositionInfo, LiveTicketData } from '../types';
import { POSITIONS, TEAMS, ATTRIBUTE_CATEGORIES, TRAITS, createZeroAttributes, createZeroTraits, getAttributeTier } from '../data';
import { calculateOVR, calculateTotalAttributesCost, checkPhysicalAnomaly, getIdealPhysicalRanges, formatHeight, calculateAttributeCost, calculateAgeCost, calculatePhysicalAnomalyCost, calculateDevTraitCost } from '../utils/calculations';
import { Award, DollarSign, ShieldAlert, User, Zap, RefreshCw, Layers } from 'lucide-react';

interface PlayerBuilderProps {
  onDraft: (player: Player) => void;
  editingPlayer: Player | null;
  onCancelEdit: () => void;
  remainingBudget: number; // Budget excluding currently editing player (if any)
  currentRosterSize: number;
  onTicketChange?: (ticket: LiveTicketData | null) => void;
  submitRef?: React.RefObject<(() => void) | undefined>;
}

export default function PlayerBuilder({
  onDraft,
  editingPlayer,
  onCancelEdit,
  remainingBudget,
  currentRosterSize,
  onTicketChange,
  submitRef,
}: PlayerBuilderProps) {
  // Identity state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [positionId, setPositionId] = useState<number>(0);
  const [height, setHeight] = useState<number>(72); // 6'0" (72 inches)
  const [weight, setWeight] = useState<number>(200); // 200 lbs
  const [age, setAge] = useState<number>(27);
  const [yearsPro, setYearsPro] = useState<number>(5);
  const [jerseyNumber, setJerseyNumber] = useState<number>(12);
  const [devTrait, setDevTrait] = useState<number>(0); // 0: Normal, 1: Star, 2: Superstar, 3: X-Factor
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Attributes & Traits
  const [attributes, setAttributes] = useState<PlayerAttributes>(createZeroAttributes());
  const [traits, setTraits] = useState<PlayerTraits>(createZeroTraits());

  // Tabs for attributes
  const [activeTab, setActiveTab] = useState<string>('athletics');

  // Find selected position info
  const selectedPosition = POSITIONS.find(p => p.id === positionId) || POSITIONS[0];
  const positionGroup = selectedPosition.group;

  // Clear errors when any input changes
  useEffect(() => {
    setErrorMsg(null);
  }, [firstName, lastName, positionId, height, weight, age, attributes]);

  // Sync state if editing player changes
  useEffect(() => {
    if (editingPlayer) {
      setFirstName(editingPlayer.PFNA);
      setLastName(editingPlayer.PLNA);
      setPositionId(editingPlayer.PPOS);
      setHeight(editingPlayer.PHGT);
      setWeight(editingPlayer.PWGT + 160); // weight offset formula: PWGT = Actual - 160
      setAge(editingPlayer.PAGE);
      setYearsPro(editingPlayer.PYRP);
      setJerseyNumber(editingPlayer.PJEN);
      setDevTrait(editingPlayer.PROL);
      setAttributes({ ...editingPlayer.attributes });
      setTraits({ ...editingPlayer.traits });
    } else {
      // Reset to default base player
      setFirstName('');
      setLastName('');
      setPositionId(0);
      setHeight(72);
      setWeight(200);
      setAge(27);
      setYearsPro(5);
      setJerseyNumber(10);
      setDevTrait(0);
      setAttributes(createZeroAttributes());
      setTraits(createZeroTraits());
    }
  }, [editingPlayer]);

  // Handle position change (update default physicals for realism)
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const posId = parseInt(e.target.value);
    setPositionId(posId);
    const newPos = POSITIONS.find(p => p.id === posId) || POSITIONS[0];
    const ranges = getIdealPhysicalRanges(newPos.group);
    // Put height and weight inside the ideal range on position change to avoid starting with penalty
    setHeight(Math.round((ranges.minHeight + ranges.maxHeight) / 2));
    setWeight(Math.round((ranges.minWeight + ranges.maxWeight) / 2));
  };

  // Calculations
  const hasPhysicalAnomaly = checkPhysicalAnomaly(positionGroup, height, weight);
  const physicalPenalty = calculatePhysicalAnomalyCost(positionGroup, height, weight);
  const ageCost = calculateAgeCost(age);
  const devCost = calculateDevTraitCost(devTrait);
  const attributesCost = calculateTotalAttributesCost(positionGroup, attributes);
  const totalPlayerCost = attributesCost + physicalPenalty + ageCost + devCost;
  const currentOVR = calculateOVR(positionGroup, attributes);

  // Sync the submit function to the ref
  if (submitRef) {
    submitRef.current = () => {
      handleSubmit();
    };
  }

  const budgetDelta = remainingBudget - totalPlayerCost;
  const isOverBudget = budgetDelta < 0;

  // Handle individual attribute sliders
  const handleAttrChange = (key: keyof PlayerAttributes, val: number) => {
    setAttributes(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  // Handle trait toggles
  const handleTraitToggle = (key: keyof PlayerTraits) => {
    setTraits(prev => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  // Helper to bulk set attributes for easy building (Preset stats)
  const applyPreset = (type: 'zero' | 'balanced' | 'star' | 'max_key') => {
    const fresh = createZeroAttributes();
    if (type === 'zero') {
      setAttributes(fresh);
      return;
    }

    // Identify which stats are Premium/Elite/Standard for this position
    Object.keys(fresh).forEach(k => {
      const key = k as keyof PlayerAttributes;
      const tier = getAttributeTier(positionGroup, key);

      if (type === 'balanced') {
        // High-60s for standard, 75 for elite/premium
        if (tier === 'Elite') fresh[key] = 75;
        else if (tier === 'Premium') fresh[key] = 70;
        else if (tier === 'Standard') fresh[key] = 65;
        else fresh[key] = 40;
      } else if (type === 'star') {
        // Star stats: Elite=85, Premium=80, Standard=75
        if (tier === 'Elite') fresh[key] = 85;
        else if (tier === 'Premium') fresh[key] = 80;
        else if (tier === 'Standard') fresh[key] = 75;
        else fresh[key] = 50;
      } else if (type === 'max_key') {
        // High-90s for elite and premium, standard=80
        if (tier === 'Elite') fresh[key] = 95;
        else if (tier === 'Premium') fresh[key] = 90;
        else if (tier === 'Standard') fresh[key] = 80;
        else fresh[key] = 50;
      }
    });

    setAttributes(fresh);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter a First and Last Name.');
      return;
    }
    if (isOverBudget) {
      setErrorMsg('This player configuration exceeds your team budget!');
      return;
    }
    if (!editingPlayer && currentRosterSize >= 22) {
      setErrorMsg('Your 22-man roster is full! Edit or delete players to make room.');
      return;
    }

    setErrorMsg(null);
    const newPlayer: Player = {
      id: editingPlayer?.id || Math.random().toString(36).substring(2, 9),
      PFNA: firstName.trim(),
      PLNA: lastName.trim(),
      PHGT: height,
      PWGT: weight - 160, // weight offset: Weight stored = actual - 160
      PAGE: age,
      PYRP: yearsPro,
      PJEN: jerseyNumber,
      PROL: devTrait,
      PPOS: positionId,
      POVR: currentOVR,
      attributes,
      traits,
      cost: totalPlayerCost,
      hasPhysicalAnomaly,
    };

    onDraft(newPlayer);
  };

  const getDevLabel = (val: number) => {
    switch (val) {
      case 1: return 'Star';
      case 2: return 'Superstar';
      case 3: return 'X-Factor';
      default: return 'Normal';
    }
  };

  // Synchronize live draft ticket data with parent component
  useEffect(() => {
    if (onTicketChange) {
      onTicketChange({
        firstName,
        lastName,
        ovr: currentOVR,
        totalCost: totalPlayerCost,
        attributesCost,
        ageCost,
        physicalPenalty,
        devCost,
        hasPhysicalAnomaly,
        positionCode: selectedPosition.code,
        devLabel: getDevLabel(devTrait),
        age,
        isOverBudget,
        budgetDelta,
        errorMsg,
        isEditing: !!editingPlayer,
      });
    }

    return () => {
      onTicketChange?.(null);
    };
  }, [
    onTicketChange,
    firstName,
    lastName,
    currentOVR,
    totalPlayerCost,
    attributesCost,
    ageCost,
    physicalPenalty,
    devCost,
    hasPhysicalAnomaly,
    selectedPosition.code,
    devTrait,
    age,
    isOverBudget,
    budgetDelta,
    errorMsg,
    !!editingPlayer,
  ]);

  const idealRanges = getIdealPhysicalRanges(positionGroup);

  return (
    <div id="player-builder-container" className="bg-[#1a202c] rounded-xl border border-gray-800 p-6 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 id="builder-title" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            {editingPlayer ? 'Edit Franchise Star' : 'Draft New Franchise Player'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Customize identities, physical structures, and skill attributes under budget.
          </p>
        </div>

        {/* Preset Helper Bar */}
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-gray-500 uppercase flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('zero')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Reset (0s)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('balanced')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-800/50 transition-colors"
          >
            Balanced (~65-75s)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('star')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/50 transition-colors"
          >
            Star (~75-85s)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('max_key')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/50 transition-colors"
          >
            Dominant (~90s)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: IDENTITY, PHYSICALS, DETAILS & FLOATING STATS CARD */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Core Player Identity */}
          <div className="bg-[#111622] rounded-xl p-6 border border-gray-800 space-y-5">
            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase border-b border-gray-800 pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" /> Identity & Position
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">First Name</label>
                <input
                  id="input-first-name"
                  type="text"
                  required
                  placeholder="e.g. Patrick"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-[#161d2d] border border-gray-750 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Last Name</label>
                <input
                  id="input-last-name"
                  type="text"
                  required
                  placeholder="e.g. Mahomes"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full bg-[#161d2d] border border-gray-750 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Position</label>
                <select
                  id="select-position"
                  value={positionId}
                  onChange={handlePositionChange}
                  className="w-full bg-[#161d2d] border border-gray-750 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer font-sans"
                >
                  {POSITIONS.map(pos => (
                    <option key={pos.id} value={pos.id}>
                      {pos.code} - {pos.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Dev Trait</label>
                <select
                  id="select-dev"
                  value={devTrait}
                  onChange={e => setDevTrait(parseInt(e.target.value))}
                  className="w-full bg-[#161d2d] border border-gray-750 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer font-sans"
                >
                  <option value={0}>Normal Dev</option>
                  <option value={1}>Star Dev</option>
                  <option value={2}>Superstar Dev</option>
                  <option value={3}>Superstar X-Factor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Age (Max 30)</label>
                  <input
                    id="input-age"
                    type="number"
                    min={20}
                    max={30}
                    value={age}
                    onChange={e => setAge(Math.max(20, Math.min(30, parseInt(e.target.value) || 20)))}
                    className="w-full bg-[#161d2d] border border-gray-750 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-base text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Years Pro</label>
                  <input
                    id="input-years-pro"
                    type="number"
                    min={0}
                    max={25}
                    value={yearsPro}
                    onChange={e => setYearsPro(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#161d2d] border border-gray-750 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-base text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Physical Dimensions & Realism Check */}
          <div className="bg-[#111622] rounded-xl p-6 border border-gray-800 space-y-6">
            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase border-b border-gray-800 pb-3 flex justify-between items-center">
              <span>Physical Dimensions</span>
              <span className="text-xs font-mono text-indigo-400">POS Group: {selectedPosition.code}</span>
            </h3>

            {/* Height Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-semibold">Height:</span>
                <span className="font-bold text-indigo-300 font-mono text-base">{formatHeight(height)} ({height} in)</span>
              </div>
              <input
                id="slider-height"
                type="range"
                min={65} // 5'5"
                max={84} // 7'0"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Weight Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-semibold">Weight:</span>
                <span className="font-bold text-indigo-300 font-mono text-base">{weight} lbs</span>
              </div>
              <input
                id="slider-weight"
                type="range"
                min={150}
                max={450}
                value={weight}
                onChange={e => setWeight(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Ideal Position Range Display */}
            <div className="bg-[#0f1422] rounded-lg p-4 border border-gray-850/50 space-y-3">
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">
                {selectedPosition.code} Ideal Dimensions (Up to):
              </span>
              <div className="grid grid-cols-2 text-xs font-mono text-gray-300 gap-2">
                <div className="bg-[#161d2d] p-2 rounded border border-gray-800">Height Max: <span className="text-white font-bold">{formatHeight(idealRanges.maxHeight)}</span></div>
                <div className="bg-[#161d2d] p-2 rounded border border-gray-800">Weight Max: <span className="text-white font-bold">{idealRanges.maxWeight} lbs</span></div>
              </div>

              {/* Physical Anomaly Penalty Warning */}
              {hasPhysicalAnomaly ? (
                <div className="flex items-start gap-3 text-xs text-amber-400 bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <span className="font-extrabold block text-sm mb-0.5">Oversize Penalty: +${physicalPenalty.toLocaleString()}</span>
                    Your player exceeds the ideal {selectedPosition.code} limits. A compounding penalty has been added to their contract cost.
                  </div>
                </div>
              ) : (
                <div className="text-xs text-emerald-400 bg-emerald-950/10 border border-emerald-900/20 rounded-lg p-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span>Compliant dimensions or smaller. No penalty applied ($0 penalty)</span>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: ATTRIBUTE SLIDERS CATEGORIES */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#111622] p-1 rounded-lg border border-gray-800">
            {ATTRIBUTE_CATEGORIES.map(tab => {
              // Check if any attribute in this category is Elite or Premium to highlight it
              const hasPremiumOrElite = tab.attributes.some(attr => 
                ['Elite', 'Premium'].includes(getAttributeTier(positionGroup, attr.key))
              );
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a202c]'
                  }`}
                >
                  {tab.name}
                  {hasPremiumOrElite && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sliders Panels */}
          <div className="bg-[#111622] rounded-lg border border-gray-800 p-5 space-y-5 min-h-[440px]">
            <div className="flex justify-between items-center border-b border-gray-850 pb-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {ATTRIBUTE_CATEGORIES.find(c => c.id === activeTab)?.name} Attributes
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                Tiers determine exponential cost scaling
              </span>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {ATTRIBUTE_CATEGORIES.find(c => c.id === activeTab)?.attributes.map(attr => {
                const key = attr.key as keyof PlayerAttributes;
                const rating = attributes[key] || 0;
                const tier = getAttributeTier(positionGroup, key);
                const cost = calculateAttributeCost(rating, tier);

                // Dynamic Tier badge style
                let badgeClass = 'bg-slate-900 text-slate-400 border border-slate-800';
                if (tier === 'Elite') badgeClass = 'bg-amber-950/60 text-amber-400 border border-amber-800/60';
                else if (tier === 'Premium') badgeClass = 'bg-red-950/60 text-red-400 border border-red-800/60';
                else if (tier === 'Standard') badgeClass = 'bg-blue-950/60 text-blue-400 border border-blue-800/60';

                return (
                  <div key={attr.key} className="bg-[#161d2d] rounded p-3 border border-gray-800/60 space-y-2 hover:border-gray-700/60 transition-colors">
                    
                    {/* Title and Badge row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-semibold text-white block">
                          {attr.label}
                        </span>
                        <span className="text-[10px] text-gray-400 block max-w-[340px]">
                          {attr.desc}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${badgeClass}`}>
                          {tier}
                        </span>
                        <span className="text-xs font-mono text-gray-500 min-w-[45px] text-right">
                          ${cost}
                        </span>
                      </div>
                    </div>

                    {/* Slider and Buttons Row */}
                    <div className="flex items-center gap-3">
                      <input
                        id={`slider-attr-${attr.key}`}
                        type="range"
                        min={0}
                        max={99}
                        value={rating}
                        onChange={e => handleAttrChange(key, parseInt(e.target.value))}
                        className="w-full accent-indigo-400 h-1.5 bg-gray-800 rounded appearance-none cursor-pointer"
                      />
                      
                      {/* Fine-Tuning Buttons & Value */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAttrChange(key, Math.max(0, rating - 5))}
                          className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -5
                        </button>
                        <span className="text-base font-black font-mono text-indigo-400 text-center w-8 select-none">
                          {rating}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAttrChange(key, Math.min(99, rating + 5))}
                          className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
