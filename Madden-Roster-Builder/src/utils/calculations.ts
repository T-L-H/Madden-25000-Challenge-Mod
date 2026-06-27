import { PlayerAttributes, PricingTier } from '../types';
import { getAttributeTier } from '../data';

/**
 * Calculates the cost for a single attribute based on its rating value (0-99) and its tier.
 * Tiers: Elite ($129 max), Premium ($84 max), Standard ($41 max), Cheap ($15 max)
 * Follows an exponential cost curve such that 0-60 is cheap, 60-80 is moderate, 80-99 is expensive.
 */
export function calculateAttributeCost(value: number, tier: PricingTier): number {
  if (value <= 0) return 0;
  const boundedValue = Math.max(0, Math.min(99, value));

  let tierMax = 15;
  if (tier === 'Elite') tierMax = 129;
  else if (tier === 'Premium') tierMax = 84;
  else if (tier === 'Standard') tierMax = 41;

  // Exponential scaling formula: Cost = Max * (v / 99) ^ 3.5
  // This satisfies the 0-60 cheap, 60-80 moderate, 80-99 expensive curve perfectly.
  const cost = tierMax * Math.pow(boundedValue / 99, 3.5);
  return Math.round(cost);
}

/**
 * Calculates the cost for development traits.
 * Normal: $0, Star: $150, Superstar: $350, X-Factor: $600
 */
export function calculateDevTraitCost(devTrait: number): number {
  switch (devTrait) {
    case 1: return 150; // Star Dev
    case 2: return 350; // Superstar Dev
    case 3: return 600; // Superstar X-Factor Dev
    default: return 0;  // Normal Dev
  }
}

/**
 * Calculates the total cost for all attributes of a player.
 */
export function calculateTotalAttributesCost(posGroup: string, attributes: PlayerAttributes): number {
  let totalCost = 0;
  Object.entries(attributes).forEach(([key, value]) => {
    const tier = getAttributeTier(posGroup, key);
    totalCost += calculateAttributeCost(value, tier);
  });
  return totalCost;
}

/**
 * Returns the ideal height (in inches) and weight (in lbs) ranges for a position group.
 */
export function getIdealPhysicalRanges(posGroup: string): { minHeight: number; maxHeight: number; minWeight: number; maxWeight: number } {
  switch (posGroup) {
    case 'QB':
      return { minHeight: 72, maxHeight: 78, minWeight: 190, maxWeight: 245 }; // 6'0" - 6'6"
    case 'HB':
      return { minHeight: 67, maxHeight: 74, minWeight: 180, maxWeight: 235 }; // 5'7" - 6'2"
    case 'WR':
      return { minHeight: 69, maxHeight: 77, minWeight: 170, maxWeight: 225 }; // 5'9" - 6'5"
    case 'TE':
      return { minHeight: 74, maxHeight: 79, minWeight: 235, maxWeight: 265 }; // 6'2" - 6'7"
    case 'OL':
      return { minHeight: 74, maxHeight: 80, minWeight: 295, maxWeight: 345 }; // 6'2" - 6'8"
    case 'DL':
      return { minHeight: 73, maxHeight: 79, minWeight: 245, maxWeight: 335 }; // 6'1" - 6'7"
    case 'LB':
      return { minHeight: 72, maxHeight: 76, minWeight: 220, maxWeight: 255 }; // 6'0" - 6'4"
    case 'DB':
      return { minHeight: 70, maxHeight: 75, minWeight: 180, maxWeight: 215 }; // 5'10" - 6'3"
    case 'ST':
      return { minHeight: 70, maxHeight: 77, minWeight: 170, maxWeight: 235 }; // 5'10" - 6'5"
    default:
      return { minHeight: 60, maxHeight: 84, minWeight: 150, maxWeight: 450 };
  }
}

/**
 * Calculates the compounding cost for ages below 27.
 * Formula: 40 * diff * (diff + 1)
 */
export function calculateAgeCost(age: number): number {
  if (age >= 27) return 0;
  const diff = 27 - age;
  return Math.round(40 * diff * (diff + 1));
}

/**
 * Calculates a compounding physical anomaly cost if height or weight exceeds the ideal range.
 * If the player is smaller than the ideal range, there is no cost.
 */
export function calculatePhysicalAnomalyCost(posGroup: string, heightInches: number, weightLbs: number): number {
  const range = getIdealPhysicalRanges(posGroup);
  
  const heightOver = Math.max(0, heightInches - range.maxHeight);
  const weightOver = Math.max(0, weightLbs - range.maxWeight);
  
  const heightPenalty = heightOver > 0 ? Math.round(40 * Math.pow(heightOver, 1.8)) : 0;
  const weightPenalty = weightOver > 0 ? Math.round(1.5 * Math.pow(weightOver, 1.5)) : 0;
  
  return heightPenalty + weightPenalty;
}

/**
 * Checks if a player's physical stats (height/weight) exceed position ideals.
 * Returns true if the player has an active physical anomaly (i.e. is larger than ideal).
 */
export function checkPhysicalAnomaly(posGroup: string, heightInches: number, weightLbs: number): boolean {
  const range = getIdealPhysicalRanges(posGroup);
  return (
    heightInches > range.maxHeight ||
    weightLbs > range.maxWeight
  );
}

/**
 * Calculates a pseudo-Overall Rating (OVR) based on the attributes purchased for a specific position.
 * This weights key stats for each position.
 */
export function calculateOVR(posGroup: string, attributes: PlayerAttributes): number {
  let weightedSum = 0;
  let weightTotal = 0;

  const addWeight = (key: keyof PlayerAttributes, weight: number) => {
    weightedSum += attributes[key] * weight;
    weightTotal += weight;
  };

  switch (posGroup) {
    case 'QB':
      addWeight('PTHP', 0.15);
      addWeight('PTAS', 0.15);
      addWeight('PTAM', 0.15);
      addWeight('PTAD', 0.15);
      addWeight('PTHA', 0.10);
      addWeight('PTOR', 0.08);
      addWeight('PAWR', 0.10);
      addWeight('PACC', 0.04);
      addWeight('PSPD', 0.04);
      addWeight('PELU', 0.04);
      break;
    case 'HB':
      addWeight('PSPD', 0.15);
      addWeight('PACC', 0.15);
      addWeight('PAGI', 0.10);
      addWeight('PCAR', 0.15);
      addWeight('PELU', 0.10);
      addWeight('PBCV', 0.10);
      addWeight('PBKT', 0.10);
      addWeight('PSTR', 0.05);
      addWeight('PCTH', 0.05);
      addWeight('PLJM', 0.05);
      break;
    case 'WR':
      addWeight('PSPD', 0.18);
      addWeight('PACC', 0.12);
      addWeight('PAGI', 0.10);
      addWeight('PCTH', 0.15);
      addWeight('PLCI', 0.10);
      addWeight('PLSC', 0.10);
      addWeight('SRRN', 0.08);
      addWeight('PMRR', 0.08);
      addWeight('PDRR', 0.05);
      addWeight('PLRL', 0.04);
      break;
    case 'TE':
      addWeight('PCTH', 0.15);
      addWeight('PLCI', 0.10);
      addWeight('PSPD', 0.10);
      addWeight('PACC', 0.08);
      addWeight('PSTR', 0.10);
      addWeight('PPBK', 0.10);
      addWeight('PRBK', 0.12);
      addWeight('PAWR', 0.08);
      addWeight('PAGI', 0.07);
      addWeight('SRRN', 0.05);
      addWeight('PLIB', 0.05);
      break;
    case 'OL':
      addWeight('PPBK', 0.22);
      addWeight('PRBK', 0.22);
      addWeight('PSTR', 0.20);
      addWeight('PAWR', 0.15);
      addWeight('PLIB', 0.10);
      addWeight('PPBF', 0.04);
      addWeight('PPBS', 0.04);
      addWeight('PRBF', 0.04);
      addWeight('PRBS', 0.04);
      break;
    case 'DL':
      addWeight('PLPM', 0.20);
      addWeight('PFMS', 0.15);
      addWeight('PBSG', 0.20);
      addWeight('PTAK', 0.15);
      addWeight('PSTR', 0.15);
      addWeight('PAWR', 0.10);
      addWeight('PLPR', 0.05);
      break;
    case 'LB':
      addWeight('PTAK', 0.15);
      addWeight('PLPR', 0.15);
      addWeight('PLPU', 0.15);
      addWeight('PSPD', 0.15);
      addWeight('PACC', 0.10);
      addWeight('PAWR', 0.10);
      addWeight('PBSG', 0.10);
      addWeight('PLZC', 0.05);
      addWeight('PLMC', 0.05);
      break;
    case 'DB':
      addWeight('PLMC', 0.20);
      addWeight('PLZC', 0.20);
      addWeight('PSPD', 0.15);
      addWeight('PACC', 0.15);
      addWeight('PLPE', 0.10);
      addWeight('PAGI', 0.10);
      addWeight('PAWR', 0.10);
      break;
    case 'ST':
      addWeight('PKPR', 0.45);
      addWeight('PKAC', 0.45);
      addWeight('PAWR', 0.10);
      break;
    default:
      // Generic average
      Object.keys(attributes).forEach(key => {
        addWeight(key as keyof PlayerAttributes, 1);
      });
  }

  if (weightTotal === 0) return 0;
  const rawOVR = weightedSum / weightTotal;
  return Math.max(12, Math.min(99, Math.round(rawOVR)));
}

/**
 * Format height in inches to standard FT'IN" format (e.g. 74 => 6'2")
 */
export function formatHeight(inches: number): string {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}
