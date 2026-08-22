export type BirthInputMode = 'solar' | 'lunar' | 'ganzhi';

export interface SolarBirthInput {
  mode: 'solar';
  year: number;
  month: number;
  day: number;
  timeBranch: EarthlyBranch;
}

export interface LunarBirthInput {
  mode: 'lunar';
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  timeBranch: EarthlyBranch;
}

export interface GanzhiBirthInput {
  mode: 'ganzhi';
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
}

export type BirthInput = SolarBirthInput | LunarBirthInput | GanzhiBirthInput;

export type HeavenlyStem =
  | '甲'
  | '乙'
  | '丙'
  | '丁'
  | '戊'
  | '己'
  | '庚'
  | '辛'
  | '壬'
  | '癸';

export type EarthlyBranch =
  | '子'
  | '丑'
  | '寅'
  | '卯'
  | '辰'
  | '巳'
  | '午'
  | '未'
  | '申'
  | '酉'
  | '戌'
  | '亥';

export type WuXing = '木' | '火' | '土' | '金' | '水';
export type YinYang = '阳' | '阴';
export type PillarKey = 'year' | 'month' | 'day' | 'time';
export type SeasonName = '春' | '夏' | '秋' | '冬';
export type HiddenStemRole = '本气' | '中气' | '余气';
export type TwelveGrowthStage =
  | '长生'
  | '沐浴'
  | '冠带'
  | '临官'
  | '帝旺'
  | '衰'
  | '病'
  | '死'
  | '墓'
  | '绝'
  | '胎'
  | '养';
export type ClassicalSourceId =
  | 'ziPingZhenQuan'
  | 'qiongTongBaoJian'
  | 'diTianSui'
  | 'sanMingTongHui';

export interface BaziCharacter {
  value: string;
  role: '天干' | '地支';
  element: WuXing;
  yinYang: YinYang;
}

export interface BaziPillar {
  key: PillarKey;
  label: string;
  gan: BaziCharacter;
  zhi: BaziCharacter;
  ganZhi: string;
  naYin?: string;
  shiShenGan?: string;
  shiShenZhi?: string[];
}

export interface HiddenStem {
  stem: HeavenlyStem;
  role: HiddenStemRole;
  element: WuXing;
}

export interface ClassicalBaziAnalysis {
  sourceIds: ClassicalSourceId[];
  monthCommand: {
    branch: EarthlyBranch;
    season: SeasonName;
    element: WuXing;
    note: string;
  };
  pillarHiddenStems: Record<PillarKey, HiddenStem[]>;
  twelveGrowth: Record<PillarKey, TwelveGrowthStage>;
  dayMasterSupport: '偏强' | '中和' | '偏弱' | '待观察';
  narrativeSignals: string[];
  caution: string;
}

export interface BaziChart {
  inputMode: BirthInputMode;
  sourceLabel: string;
  solarDate?: string;
  lunarDate?: string;
  zodiac?: string;
  season?: string;
  jieQi?: string;
  dayMaster: string;
  dayMasterElement: WuXing;
  pillars: BaziPillar[];
  characters: BaziCharacter[];
  elementCounts: Record<WuXing, number>;
  summary: string;
  classicalAnalysis?: ClassicalBaziAnalysis;
}

export interface LifeStage {
  stageName: string;
  description: string;
}

export interface CharacterProfile {
  name: string;
  nameMeaning: string;
  appearance: string;
  coreConflict: string;
  lifeStages: LifeStage[];
  plotHooks: string[];
}

export interface StoredCharacter {
  id: string;
  name: string;
  birthInput: BirthInput;
  baziChart: BaziChart;
  profile: CharacterProfile;
  createdAt: string;
  updatedAt: string;
}

export interface BondStructure {
  dayMasterRelation: string;
  sharedElements: WuXing[];
  clashes: string[];
  combinations: string[];
  elementBalance: string;
}

export interface CharacterBond {
  relationType: string;
  summary: string;
  complementaryPoints: string[];
  conflictPoints: string[];
  plotUse: string[];
  triggerEvents: string[];
  structure: BondStructure;
}

export interface StoredBond {
  id: string;
  characterAId: string;
  characterBId: string;
  bond: CharacterBond;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveBond {
  key: string;
  primaryId: string;
  secondaryId: string;
  bond: CharacterBond;
}

export interface StoryInputs {
  worldview: string;
  annualNode: string;
  startAnchor: string;
  endAnchor: string;
  coreEvent: string;
}

export interface ScriptOutline {
  sceneSetting: string;
  psychologicalTone: string;
  beatSheet: {
    beat: string;
    description: string;
  }[];
  twistAlternatives: string[];
}
