import { PositionInfo, TeamInfo, PlayerAttributes, PlayerTraits, PricingTier } from './types';

export const TEAMS: TeamInfo[] = [
  { id: 1, name: 'Bears', city: 'Chicago', colors: { primary: '#0B2265', secondary: '#C83803' } },
  { id: 2, name: 'Bengals', city: 'Cincinnati', colors: { primary: '#FB4F14', secondary: '#000000' } },
  { id: 3, name: 'Bills', city: 'Buffalo', colors: { primary: '#00338D', secondary: '#C60C30' } },
  { id: 4, name: 'Broncos', city: 'Denver', colors: { primary: '#FB4F14', secondary: '#002244' } },
  { id: 5, name: 'Browns', city: 'Cleveland', colors: { primary: '#311D00', secondary: '#FF3C00' } },
  { id: 6, name: 'Buccaneers', city: 'Tampa Bay', colors: { primary: '#D50A0A', secondary: '#34302B' } },
  { id: 7, name: 'Cardinals', city: 'Arizona', colors: { primary: '#97233F', secondary: '#FFB612' } },
  { id: 8, name: 'Chargers', city: 'Los Angeles', colors: { primary: '#0080C6', secondary: '#FFC20E' } },
  { id: 9, name: 'Chiefs', city: 'Kansas City', colors: { primary: '#E31837', secondary: '#FFB612' } },
  { id: 10, name: 'Colts', city: 'Indianapolis', colors: { primary: '#002C5F', secondary: '#A2AAAD' } },
  { id: 11, name: 'Cowboys', city: 'Dallas', colors: { primary: '#003594', secondary: '#869397' } },
  { id: 12, name: 'Dolphins', city: 'Miami', colors: { primary: '#008E97', secondary: '#FC4C02' } },
  { id: 13, name: 'Eagles', city: 'Philadelphia', colors: { primary: '#004C54', secondary: '#A5ACAF' } },
  { id: 14, name: 'Falcons', city: 'Atlanta', colors: { primary: '#A71930', secondary: '#000000' } },
  { id: 15, name: '49ers', city: 'San Francisco', colors: { primary: '#AA0000', secondary: '#B3995D' } },
  { id: 16, name: 'Giants', city: 'New York', colors: { primary: '#0B2265', secondary: '#A71930' } },
  { id: 17, name: 'Jaguars', city: 'Jacksonville', colors: { primary: '#006778', secondary: '#D7A22A' } },
  { id: 18, name: 'Jets', city: 'New York', colors: { primary: '#125740', secondary: '#FFFFFF' } },
  { id: 19, name: 'Lions', city: 'Detroit', colors: { primary: '#0076B6', secondary: '#B0B7BC' } },
  { id: 20, name: 'Packers', city: 'Green Bay', colors: { primary: '#203731', secondary: '#FFB612' } },
  { id: 21, name: 'Panthers', city: 'Carolina', colors: { primary: '#0085CA', secondary: '#101820' } },
  { id: 22, name: 'Patriots', city: 'New England', colors: { primary: '#002244', secondary: '#C60C30' } },
  { id: 23, name: 'Raiders', city: 'Las Vegas', colors: { primary: '#000000', secondary: '#A5ACAF' } },
  { id: 24, name: 'Rams', city: 'Los Angeles', colors: { primary: '#003594', secondary: '#FFA300' } },
  { id: 25, name: 'Ravens', city: 'Baltimore', colors: { primary: '#241773', secondary: '#9E7C0C' } },
  { id: 26, name: 'Commanders', city: 'Washington', colors: { primary: '#5A1414', secondary: '#FFB612' } },
  { id: 27, name: 'Saints', city: 'New Orleans', colors: { primary: '#D3BC8D', secondary: '#101820' } },
  { id: 28, name: 'Seahawks', city: 'Seattle', colors: { primary: '#002244', secondary: '#69BE28' } },
  { id: 29, name: 'Steelers', city: 'Pittsburgh', colors: { primary: '#FFB612', secondary: '#101820' } },
  { id: 30, name: 'Titans', city: 'Tennessee', colors: { primary: '#4B92DB', secondary: '#C60C30' } },
  { id: 31, name: 'Vikings', city: 'Minnesota', colors: { primary: '#4F2683', secondary: '#FFC62F' } },
  { id: 32, name: 'Texans', city: 'Houston', colors: { primary: '#03202F', secondary: '#A71930' } },
  { id: 1099, name: 'Free Agent', city: 'FA', colors: { primary: '#4A5568', secondary: '#CBD5E1' } },
];

export const POSITIONS: PositionInfo[] = [
  { id: 0, name: 'Quarterback', code: 'QB', group: 'QB' },
  { id: 1, name: 'Halfback', code: 'HB', group: 'HB' },
  { id: 2, name: 'Fullback', code: 'FB', group: 'HB' },
  { id: 3, name: 'Wide Receiver', code: 'WR', group: 'WR' },
  { id: 4, name: 'Tight End', code: 'TE', group: 'TE' },
  { id: 5, name: 'Left Tackle', code: 'LT', group: 'OL' },
  { id: 6, name: 'Left Guard', code: 'LG', group: 'OL' },
  { id: 7, name: 'Center', code: 'C', group: 'OL' },
  { id: 8, name: 'Right Guard', code: 'RG', group: 'OL' },
  { id: 9, name: 'Right Tackle', code: 'RT', group: 'OL' },
  { id: 10, name: 'Left Edge', code: 'LEDGE', group: 'DL' },
  { id: 11, name: 'Right Edge', code: 'REDGE', group: 'DL' },
  { id: 12, name: 'Defensive Tackle', code: 'DT', group: 'DL' },
  { id: 13, name: 'Left Outside Linebacker', code: 'LOLB/SAM', group: 'LB' },
  { id: 14, name: 'Middle Linebacker', code: 'MLB/MIKE', group: 'LB' },
  { id: 15, name: 'Right Outside Linebacker', code: 'ROLB/WILL', group: 'LB' },
  { id: 16, name: 'Cornerback', code: 'CB', group: 'DB' },
  { id: 17, name: 'Free Safety', code: 'FS', group: 'DB' },
  { id: 18, name: 'Strong Safety', code: 'SS', group: 'DB' },
  { id: 19, name: 'Kicker', code: 'K', group: 'ST' },
  { id: 20, name: 'Punter', code: 'P', group: 'ST' },
  { id: 21, name: 'Long Snapper', code: 'LS', group: 'ST' },
];

export const ATTRIBUTE_CATEGORIES = [
  {
    id: 'athletics',
    name: 'Athletics & Physical',
    attributes: [
      { key: 'PSPD', label: 'Speed (SPD)', desc: 'Player top speed' },
      { key: 'PACC', label: 'Acceleration (ACC)', desc: 'How fast a player reaches top speed' },
      { key: 'PAGI', label: 'Agility (AGI)', desc: 'How quickly a player cuts/turns' },
      { key: 'PSTR', label: 'Strength (STR)', desc: 'Determines block wins and tackle power' },
      { key: 'PAWR', label: 'Awareness (AWR)', desc: 'Player reaction time and intelligence' },
      { key: 'PJMP', label: 'Jump (JMP)', desc: 'Leaping ability' },
      { key: 'PSTA', label: 'Stamina (STA)', desc: 'Fatigue rate' },
      { key: 'PTGH', label: 'Toughness (TGH)', desc: 'Injury recovery speed' },
      { key: 'PINJ', label: 'Injury (INJ)', desc: 'Resistance to injuries' },
      { key: 'PELU', label: 'Change of Dir (ELU)', desc: 'Elusiveness and route cuts' },
    ],
  },
  {
    id: 'passing',
    name: 'Passing Abilities',
    attributes: [
      { key: 'PTHP', label: 'Throw Power (THP)', desc: 'Maximum passing distance and velocity' },
      { key: 'PTHA', label: 'Throw Accuracy (THA)', desc: 'General accuracy of passes' },
      { key: 'PTAS', label: 'Short Accuracy (SAC)', desc: 'Accuracy under 20 yards' },
      { key: 'PTAM', label: 'Med Accuracy (MAC)', desc: 'Accuracy between 20-40 yards' },
      { key: 'PTAD', label: 'Deep Accuracy (DAC)', desc: 'Accuracy over 40 yards' },
      { key: 'PTOR', label: 'Throw on Run (RUN)', desc: 'Accuracy while escaping the pocket' },
      { key: 'PTUP', label: 'Under Pressure (PTUP)', desc: 'Accuracy with defenders nearby' },
      { key: 'PPLA', label: 'Play Action (PAC)', desc: 'Deception on play action fakes' },
      { key: 'PBSK', label: 'Break Sack (PBSK)', desc: 'Shedding pass rushers in the pocket' },
    ],
  },
  {
    id: 'ballcarrying',
    name: 'Ball Carrying',
    attributes: [
      { key: 'PCAR', label: 'Carry (CAR)', desc: 'Fumble resistance' },
      { key: 'PBCV', label: 'Ball Carrier Vision (BCV)', desc: 'Finding open running lanes' },
      { key: 'PBKT', label: 'Break Tackle (BKT)', desc: 'Breaking defensive arm tackles' },
      { key: 'PLSA', label: 'Stiff Arm (SFA)', desc: 'Sticking a hand out to repel defenders' },
      { key: 'PLTR', label: 'Trucking (TRK)', desc: 'Running directly over defenders' },
      { key: 'PLSM', label: 'Spin Move (SPM)', desc: 'Spinning past defenders' },
      { key: 'PLJM', label: 'Juke Move (JKM)', desc: 'Juking left/right' },
    ],
  },
  {
    id: 'receiving',
    name: 'Receiving Abilities',
    attributes: [
      { key: 'PCTH', label: 'Catching (CTH)', desc: 'Securing open passes' },
      { key: 'PLCI', label: 'Catch in Traffic (CIT)', desc: 'Securing contested passes' },
      { key: 'PLSC', label: 'Spec Catch (SPC)', desc: 'One-handed and spectacular catches' },
      { key: 'SRRN', label: 'Short Route (SRRN)', desc: 'Short route sharpness' },
      { key: 'PMRR', label: 'Med Route (PMRR)', desc: 'Medium route sharpness' },
      { key: 'PDRR', label: 'Deep Route (PDRR)', desc: 'Deep route sharpness' },
      { key: 'PLRL', label: 'Release (RLS)', desc: 'Beating press coverage at the line' },
    ],
  },
  {
    id: 'blocking',
    name: 'Blocking',
    attributes: [
      { key: 'PPBK', label: 'Pass Block (PBK)', desc: 'General pass protection' },
      { key: 'PPBF', label: 'Pass Block Fin (PPBF)', desc: 'Protection against finesse rushers' },
      { key: 'PPBS', label: 'Pass Block Pow (PPBS)', desc: 'Protection against power rushers' },
      { key: 'PRBK', label: 'Run Block (RBK)', desc: 'General run blocking' },
      { key: 'PRBF', label: 'Run Block Fin (PRBF)', desc: 'Run block positioning and agility' },
      { key: 'PRBS', label: 'Run Block Pow (PRBS)', desc: 'Run block strength and displacement' },
      { key: 'PLIB', label: 'Impact Block (IBL)', desc: 'Pancake blocks in open field' },
      { key: 'PLBK', label: 'Lead Block (PLBK)', desc: 'Blocking for a ball carrier from fullback' },
    ],
  },
  {
    id: 'defense',
    name: 'Defensive Skills',
    attributes: [
      { key: 'PLPR', label: 'Play Recognition (PRC)', desc: 'Recognizing play types quickly' },
      { key: 'PTAK', label: 'Tackle (TAK)', desc: 'Securing ball carrier wrap tackles' },
      { key: 'PLHT', label: 'Hit Power (POW)', desc: 'Enforcing big hits and fumbles' },
      { key: 'PBSG', label: 'Block Shedding (BSH)', desc: 'Disengaging from blockers' },
      { key: 'PLPU', label: 'Pursuit (PUR)', desc: 'Angles taken towards ball carrier' },
      { key: 'PLPM', label: 'Power Moves (PMV)', desc: 'Bull rush moves' },
      { key: 'PFMS', label: 'Finesse Moves (FMV)', desc: 'Spin and swim moves' },
      { key: 'PLMC', label: 'Man Coverage (MCV)', desc: 'Shadowing receivers 1-on-1' },
      { key: 'PLZC', label: 'Zone Coverage (ZCV)', desc: 'Defending assigned areas' },
      { key: 'PLPE', label: 'Press Coverage (PRS)', desc: 'Jamming receivers at the snap' },
    ],
  },
  {
    id: 'specialteams',
    name: 'Special Teams',
    attributes: [
      { key: 'PKPR', label: 'Kick Power (KPW)', desc: 'Maximum kicking distance' },
      { key: 'PKAC', label: 'Kick Accuracy (KAC)', desc: 'Control over kick trajectory' },
      { key: 'PKRT', label: 'Kick Return (PKRT)', desc: 'Returning punts and kickoffs' },
    ],
  },
];

export const TRAITS = [
  { key: 'TRCL', label: 'Clutch', desc: 'Performs better in critical game situations' },
  { key: 'TRHM', label: 'High Motor', desc: 'Plays with relentless effort till the whistle' },
  { key: 'TRCB', label: 'Cover Ball', desc: 'Protects the ball securely while being hit' },
  { key: 'TRBH', label: 'Big Hit', desc: 'Attempts heavy, force-fumble hit sticks' },
  { key: 'TRSB', label: 'Strip Ball', desc: 'Attempts to strip the ball while tackling' },
  { key: 'TRDO', label: 'Drop Open Pass', desc: 'Slightly higher rate of dropping easy catches' },
  { key: 'TRTA', label: 'Throw Away', desc: 'Throws the ball away to avoid sacks when pressured' },
] as const;

export function getAttributeTier(positionGroup: string, attributeKey: string): PricingTier {
  // Force high-value physical/rare attributes to Elite regardless of position
  if (['PSPD', 'PACC', 'PELU', 'PAGI', 'PSTR', 'PJMP', 'PSTA', 'PTHP'].includes(attributeKey)) {
    return 'Elite';
  }

  // QB tiers
  if (positionGroup === 'QB') {
    if (['PSPD', 'PACC', 'PAGI'].includes(attributeKey)) return 'Elite';
    if (['PTHP', 'PTAS', 'PTAM', 'PTAD', 'PTOR', 'PAWR', 'PTHA', 'PTUP', 'PBSK'].includes(attributeKey)) return 'Premium';
    if (['PPLA', 'PCAR', 'PBCV', 'PELU', 'PLJM', 'PLSM', 'PSTR', 'PSTA', 'PINJ', 'PTGH', 'PJMP'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // HB tiers
  if (positionGroup === 'HB') {
    if (['PSPD', 'PACC', 'PAGI'].includes(attributeKey)) return 'Elite';
    if (['PCTH', 'PLCI', 'SRRN', 'PMRR', 'PDRR', 'PLSC', 'PLRL', 'PELU', 'PLJM', 'PLSM', 'PCAR'].includes(attributeKey)) return 'Premium';
    if (['PLTR', 'PLSA', 'PBCV', 'PSTR', 'PJMP', 'PAWR', 'PSTA', 'PINJ', 'PTGH', 'PBKT'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // WR tiers
  if (positionGroup === 'WR') {
    if (['PSPD', 'PACC', 'PAGI'].includes(attributeKey)) return 'Elite';
    if (['PCTH', 'PLCI', 'SRRN', 'PMRR', 'PDRR', 'PLSC', 'PLRL', 'PELU', 'PLJM', 'PLSM', 'PCAR'].includes(attributeKey)) return 'Premium';
    if (['PLTR', 'PLSA', 'PBCV', 'PSTR', 'PJMP', 'PAWR', 'PSTA', 'PINJ', 'PTGH'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // TE tiers
  if (positionGroup === 'TE') {
    if (['PSPD', 'PACC', 'PAGI'].includes(attributeKey)) return 'Elite';
    if (['PCTH', 'PLCI', 'SRRN', 'PMRR', 'PDRR', 'PLSC', 'PLRL', 'PELU', 'PLJM', 'PLSM', 'PCAR'].includes(attributeKey)) return 'Premium';
    if (['PLTR', 'PLSA', 'PBCV', 'PSTR', 'PJMP', 'PAWR', 'PSTA', 'PINJ', 'PTGH', 'PPBK', 'PRBK', 'PLIB'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // OL tiers
  if (positionGroup === 'OL') {
    if (['PPBK', 'PRBK', 'PLIB', 'PSTR', 'PAWR'].includes(attributeKey)) return 'Premium';
    if (['PACC', 'PAGI', 'PSTA', 'PINJ', 'PTGH', 'PLBK', 'PPBF', 'PPBS', 'PRBF', 'PRBS'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // DL tiers
  if (positionGroup === 'DL') {
    if (['PLPM', 'PFMS', 'PBSG', 'PTAK', 'PSTR', 'PLPR'].includes(attributeKey)) return 'Premium';
    if (['PSPD', 'PACC', 'PAGI', 'PLPU', 'PLHT', 'PAWR', 'PSTA', 'PINJ', 'PTGH'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // LB tiers
  if (positionGroup === 'LB') {
    if (['PSPD', 'PACC', 'PAGI'].includes(attributeKey)) return 'Elite';
    if (['PTAK', 'PLHT', 'PLPU', 'PLPR', 'PBSG', 'PLZC', 'PLMC'].includes(attributeKey)) return 'Premium';
    if (['PSTR', 'PAWR', 'PSTA', 'PINJ', 'PTGH', 'PJMP'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // DB tiers
  if (positionGroup === 'DB') {
    if (['PSPD', 'PACC', 'PAGI'].includes(attributeKey)) return 'Elite';
    if (['PLMC', 'PLZC', 'PLPE', 'PLPR', 'PLPU', 'PCTH'].includes(attributeKey)) return 'Premium';
    if (['PTAK', 'PLHT', 'PAWR', 'PJMP', 'PSTA', 'PINJ', 'PTGH'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  // ST tiers
  if (positionGroup === 'ST') {
    if (['PKPR', 'PKAC'].includes(attributeKey)) return 'Premium';
    if (['PAWR', 'PSTA', 'PINJ', 'PTGH'].includes(attributeKey)) return 'Standard';
    return 'Cheap';
  }

  return 'Cheap';
}

export function createZeroAttributes(): PlayerAttributes {
  return {
    PSPD: 0, PAGI: 0, PACC: 0, PAWR: 0, PSTR: 0, PJMP: 0, PSTA: 0, PTGH: 0, PINJ: 0, PELU: 0,
    PTHP: 0, PTHA: 0, PTAS: 0, PTAM: 0, PTAD: 0, PTOR: 0, PTUP: 0, PPLA: 0, PBSK: 0,
    PCAR: 0, PBCV: 0, PBKT: 0, PLSA: 0, PLTR: 0, PLSM: 0, PLJM: 0,
    PCTH: 0, PLCI: 0, PLSC: 0, SRRN: 0, PMRR: 0, PDRR: 0, PLRL: 0,
    PPBK: 0, PPBF: 0, PPBS: 0, PRBK: 0, PRBF: 0, PRBS: 0, PLIB: 0, PLBK: 0,
    PLPR: 0, PTAK: 0, PLHT: 0, PBSG: 0, PLPU: 0, PLPM: 0, PFMS: 0, PLMC: 0, PLZC: 0, PLPE: 0,
    PKPR: 0, PKAC: 0, PKRT: 0,
  };
}

export function createZeroTraits(): PlayerTraits {
  return {
    TRCL: 0, TRHM: 0, TRCB: 0, TRBH: 0, TRSB: 0, TRDO: 0, TRTA: 0,
  };
}

export const CSV_HEADERS = [
  'PFNA', 'PLNA', 'PHGT', 'PWGT', 'PAGE', 'PYRP', 'PJEN', 'PROL', 'POVR', 'TGID', 'PPOS',
  'PSPD', 'PAGI', 'PACC', 'PAWR', 'PSTR', 'PJMP', 'PSTA', 'PTGH', 'PINJ', 'PELU',
  'PTHP', 'PTHA', 'PTAS', 'PTAM', 'PTAD', 'PTOR', 'PTUP', 'PPLA', 'PBSK',
  'PCAR', 'PBCV', 'PBKT', 'PLSA', 'PLTR', 'PLSM', 'PLJM',
  'PCTH', 'PLCI', 'PLSC', 'SRRN', 'PMRR', 'PDRR', 'PLRL',
  'PPBK', 'PPBF', 'PPBS', 'PRBK', 'PRBF', 'PRBS', 'PLIB', 'PLBK',
  'PLPR', 'PTAK', 'PLHT', 'PBSG', 'PLPU', 'PLPM', 'PFMS', 'PLMC', 'PLZC', 'PLPE',
  'PKPR', 'PKAC', 'PKRT',
  'TRCL', 'TRHM', 'TRCB', 'TRBH', 'TRSB', 'TRDO', 'TRTA',
  // Extra columns to make exactly 140 columns
  'EPAV', 'ISCN', 'PCMT', 'PCOL', 'PCON', 'PCSA', 'PCYL', 'PDPI', 'PDRO', 'PEGO',
  'PEPS', 'PGHE', 'PGID', 'PHSN', 'PHTN', 'PIMP', 'PLBD', 'PLCP', 'PLHY', 'PLMO',
  'PLPL', 'PLPO', 'POID', 'PQBS', 'PRSE', 'PSA0', 'PSA1', 'PSA2', 'PSB0', 'PSB1',
  'PSBO', 'PSKI', 'PSTM', 'PSTN', 'PSXP', 'PTEN', 'PTSA', 'PVCO', 'PVSB', 'PVTS',
  'PYCF', 'TRBR', 'TRDS', 'TRFB', 'TRFK', 'TRFY', 'TRJR', 'TRSW', 'TRTL', 'TRTS',
  'TRWU', 'PLTY', 'PYWT', 'PLDT', 'PCPH', 'PCBT', 'PSA3', 'PSB2', 'PSB3', 'PICN',
  'PHAN', 'PSA4', 'PSB4', 'PSA5', 'PSA6', 'PSB5', 'PSB6', 'PSTY'
];

/**
 * Generates a full baseline roster in CSV string format.
 * Generates exactly 3,162 players to match standard Madden 53-man rosters with depth.
 * Total rows: 3162 rows + header
 */
export function generateBaseRosterCSV(selectedTeamId?: number): string {
  const rows: string[][] = [CSV_HEADERS];
  const activeTeams = TEAMS.filter(t => t.id !== 1099); // 32 teams

  let globalPlayerIndex = 0;

  activeTeams.forEach((team, teamIdx) => {
    const playersCount = teamIdx < 26 ? 99 : 98;
    
    for (let pIdx = 0; pIdx < playersCount; pIdx++) {
      const pos = POSITIONS[pIdx % POSITIONS.length];
      const baseValue = 80;

      // Height and weight ranges for default roster
      let height = 72; // Inches (6'0")
      let weight = 220; // lbs
      if (pos.group === 'OL') { height = 77; weight = 315; }
      else if (pos.group === 'DL') { height = 75; weight = 290; }
      else if (pos.group === 'WR') { height = 73; weight = 195; }
      else if (pos.group === 'HB') { height = 70; weight = 215; }
      else if (pos.group === 'TE') { height = 76; weight = 250; }
      else if (pos.group === 'DB') { height = 71; weight = 190; }
      else if (pos.group === 'ST') { height = 72; weight = 200; }

      const weightOffset = weight - 160;

      const playerRowMap: Record<string, string> = {
        PFNA: 'Player',
        PLNA: 'Player',
        PHGT: String(height),
        PWGT: String(weightOffset),
        PAGE: '26',
        PYRP: '4',
        PJEN: String((team.id * 1000 + pIdx) % 99 + 1),
        PROL: '0',
        POVR: String(baseValue),
        TGID: String(team.id),
        PPOS: String(pos.id),
        PGID: String(globalPlayerIndex),
        POID: String(globalPlayerIndex),
      };

      const row: string[] = CSV_HEADERS.map(header => {
        if (playerRowMap[header] !== undefined) {
          return playerRowMap[header];
        }
        if (header.startsWith('P') && header !== 'PPOS' && header !== 'PROL' && !['PGID', 'POID', 'PLTY', 'PLDT', 'PCPH', 'PCBT', 'PICN', 'PHAN', 'PSTY'].includes(header)) {
          return String(baseValue);
        }
        return '0';
      });

      rows.push(row);
      globalPlayerIndex++;
    }
  });

  return rows.map(r => r.join(',')).join('\n');
}
