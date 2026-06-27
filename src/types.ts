export interface PlayerAttributes {
  // Athletics
  PSPD: number; // Speed
  PAGI: number; // Agility
  PACC: number; // Acceleration
  PAWR: number; // Awareness
  PSTR: number; // Strength
  PJMP: number; // Jump
  PSTA: number; // Stamina
  PTGH: number; // Toughness
  PINJ: number; // Injury
  PELU: number; // Change of Direction / Elusiveness

  // QB Spec
  PTHP: number; // Throw Power
  PTHA: number; // Throw Accuracy
  PTAS: number; // Accuracy Short
  PTAM: number; // Accuracy Medium
  PTAD: number; // Accuracy Deep
  PTOR: number; // Throw on Run
  PTUP: number; // Throw Under Pressure
  PPLA: number; // Play Action
  PBSK: number; // Break Sack

  // Ball Carrier
  PCAR: number; // Carry
  PBCV: number; // Ball Carrier Vision
  PBKT: number; // Break Tackle
  PLSA: number; // Stiff Arm
  PLTR: number; // Trucking
  PLSM: number; // Spin Move
  PLJM: number; // Juke Move

  // Receiving
  PCTH: number; // Catching
  PLCI: number; // Catch in Traffic
  PLSC: number; // Spec Catch
  SRRN: number; // Route Run Short
  PMRR: number; // Route Run Medium
  PDRR: number; // Route Run Deep
  PLRL: number; // Release

  // Blocking
  PPBK: number; // Pass Block
  PPBF: number; // Pass Block Finesse
  PPBS: number; // Pass Block Power
  PRBK: number; // Run Block
  PRBF: number; // Run Block Finesse
  PRBS: number; // Run Block Power
  PLIB: number; // Impact Block
  PLBK: number; // Lead Block

  // Defensive
  PLPR: number; // Play Recognition
  PTAK: number; // Tackle
  PLHT: number; // Hit Power
  PBSG: number; // Block Shedding
  PLPU: number; // Pursuit
  PLPM: number; // Power Moves
  PFMS: number; // Finesse Moves
  PLMC: number; // Man Coverage
  PLZC: number; // Zone Coverage
  PLPE: number; // Press Coverage

  // Special Teams
  PKPR: number; // Kick Power
  PKAC: number; // Kick Accuracy
  PKRT: number; // Kick Return
}

export interface PlayerTraits {
  TRCL: number; // Clutch (0 or 1)
  TRHM: number; // High Motor (0 or 1)
  TRCB: number; // Cover Ball (0 or 1)
  TRBH: number; // Big Hit (0 or 1)
  TRSB: number; // Strip Ball (0 or 1)
  TRDO: number; // Drop Open Pass (0 or 1)
  TRTA: number; // Throw Away (0 or 1)
}

export interface Player {
  id: string; // Unique local UI ID
  PFNA: string; // First name
  PLNA: string; // Last name
  PHGT: number; // Height in inches (e.g., 65 to 84)
  PWGT: number; // Weight offset (Actual Weight - 160)
  PAGE: number; // Age (usually 27 for base)
  PYRP: number; // Years pro
  PJEN: number; // Jersey number
  PROL: number; // Dev Trait (0: Normal, 1: Star, 2: Superstar, 3: X-Factor)
  PPOS: number; // Position ID (0 to 21)
  POVR: number; // Calculated overall rating
  attributes: PlayerAttributes;
  traits: PlayerTraits;
  cost: number; // Calculated cost of this player
  hasPhysicalAnomaly: boolean;
}

export type PricingTier = 'Elite' | 'Premium' | 'Standard' | 'Cheap';

export interface LiveTicketData {
  firstName: string;
  lastName: string;
  ovr: number;
  totalCost: number;
  attributesCost: number;
  ageCost: number;
  physicalPenalty: number;
  devCost: number;
  hasPhysicalAnomaly: boolean;
  positionCode: string;
  devLabel: string;
  age: number;
  isOverBudget: boolean;
  budgetDelta: number;
  errorMsg: string | null;
  isEditing: boolean;
}

export interface PositionInfo {
  id: number;
  name: string;
  code: string;
  group: 'QB' | 'HB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'DB' | 'ST';
}

export interface TeamInfo {
  id: number;
  name: string;
  city: string;
  colors: {
    primary: string;
    secondary: string;
  };
}
