import {
  BaziChart,
  ClassicalBaziAnalysis,
  ClassicalSourceId,
  EarthlyBranch,
  HeavenlyStem,
  HiddenStem,
  HiddenStemRole,
  PillarKey,
  SeasonName,
  TwelveGrowthStage,
  WuXing,
} from './types';

export const CLASSICAL_SOURCES: {
  id: ClassicalSourceId;
  title: string;
  focus: string;
}[] = [
  {
    id: 'ziPingZhenQuan',
    title: '《子平真诠评注》',
    focus: '月令、格局、用神、相神与成败救应',
  },
  {
    id: 'qiongTongBaoJian',
    title: '《穷通宝鉴评注》',
    focus: '按月令观察寒暖燥湿与调候取用',
  },
  {
    id: 'diTianSui',
    title: '《滴天髓》原注与白话整理',
    focus: '旺衰、中和、体用、通关、岁运与类象',
  },
  {
    id: 'sanMingTongHui',
    title: '《三命通会》',
    focus: '干支、节气、藏干、十二长生、大运与传统命理条目',
  },
];

const STEM_ELEMENT: Record<HeavenlyStem, WuXing> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

const BRANCH_ELEMENT: Record<EarthlyBranch, WuXing> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

const STEM_YIN_YANG: Record<HeavenlyStem, '阳' | '阴'> = {
  甲: '阳',
  乙: '阴',
  丙: '阳',
  丁: '阴',
  戊: '阳',
  己: '阴',
  庚: '阳',
  辛: '阴',
  壬: '阳',
  癸: '阴',
};

const EARTHLY_BRANCHES: EarthlyBranch[] = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

const HIDDEN_STEMS: Record<EarthlyBranch, { stem: HeavenlyStem; role: HiddenStemRole }[]> = {
  子: [{ stem: '癸', role: '本气' }],
  丑: [
    { stem: '己', role: '本气' },
    { stem: '癸', role: '中气' },
    { stem: '辛', role: '余气' },
  ],
  寅: [
    { stem: '甲', role: '本气' },
    { stem: '丙', role: '中气' },
    { stem: '戊', role: '余气' },
  ],
  卯: [{ stem: '乙', role: '本气' }],
  辰: [
    { stem: '戊', role: '本气' },
    { stem: '乙', role: '中气' },
    { stem: '癸', role: '余气' },
  ],
  巳: [
    { stem: '丙', role: '本气' },
    { stem: '戊', role: '中气' },
    { stem: '庚', role: '余气' },
  ],
  午: [
    { stem: '丁', role: '本气' },
    { stem: '己', role: '中气' },
  ],
  未: [
    { stem: '己', role: '本气' },
    { stem: '丁', role: '中气' },
    { stem: '乙', role: '余气' },
  ],
  申: [
    { stem: '庚', role: '本气' },
    { stem: '壬', role: '中气' },
    { stem: '戊', role: '余气' },
  ],
  酉: [{ stem: '辛', role: '本气' }],
  戌: [
    { stem: '戊', role: '本气' },
    { stem: '辛', role: '中气' },
    { stem: '丁', role: '余气' },
  ],
  亥: [
    { stem: '壬', role: '本气' },
    { stem: '甲', role: '中气' },
  ],
};

const MONTH_COMMAND: Record<
  EarthlyBranch,
  { season: SeasonName; element: WuXing; note: string }
> = {
  寅: { season: '春', element: '木', note: '立春起木气渐生，先观察木气与寒暖的进退。' },
  卯: { season: '春', element: '木', note: '仲春木气当令，先看日主是否得生扶，再辨泄耗制化。' },
  辰: { season: '春', element: '木', note: '暮春土气渐起，需同时观察木气余势与湿土的承载。' },
  巳: { season: '夏', element: '火', note: '初夏火气渐旺，寒暖燥湿会明显影响取用方向。' },
  午: { season: '夏', element: '火', note: '仲夏火气当令，过旺与得用不能只按五行数量判断。' },
  未: { season: '夏', element: '火', note: '季夏土气渐重，需区分燥土、湿土及火土之间的转化。' },
  申: { season: '秋', element: '金', note: '初秋金气渐起，观察金木交战与水气是否得以流通。' },
  酉: { season: '秋', element: '金', note: '仲秋金气当令，先辨日主根气，再看官杀、财星与食伤。' },
  戌: { season: '秋', element: '金', note: '暮秋燥土当令，需兼看火库、金气和燥湿平衡。' },
  亥: { season: '冬', element: '水', note: '初冬水气渐旺，寒暖与印比是否过重是重要观察点。' },
  子: { season: '冬', element: '水', note: '仲冬水气当令，先看寒暖，再看日主是否有根、有化。' },
  丑: { season: '冬', element: '水', note: '季冬湿土蓄水，需区分土的承载、冻结与转化作用。' },
};

const GROWTH_STAGES: TwelveGrowthStage[] = [
  '长生',
  '沐浴',
  '冠带',
  '临官',
  '帝旺',
  '衰',
  '病',
  '死',
  '墓',
  '绝',
  '胎',
  '养',
];

const GROWTH_START: Record<HeavenlyStem, EarthlyBranch> = {
  甲: '亥',
  乙: '午',
  丙: '寅',
  丁: '酉',
  戊: '寅',
  己: '酉',
  庚: '巳',
  辛: '子',
  壬: '申',
  癸: '卯',
};

const GENERATES: Record<WuXing, WuXing> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const CONTROLS: Record<WuXing, WuXing> = {
  木: '土',
  火: '金',
  土: '水',
  金: '木',
  水: '火',
};

export function buildClassicalBaziAnalysis(chart: BaziChart): ClassicalBaziAnalysis {
  const monthPillar = chart.pillars.find((pillar) => pillar.key === 'month') || chart.pillars[1];
  const monthBranch = monthPillar.zhi.value as EarthlyBranch;
  const monthCommand = MONTH_COMMAND[monthBranch];
  const pillarHiddenStems = Object.fromEntries(
    chart.pillars.map((pillar) => [pillar.key, getHiddenStems(pillar.zhi.value as EarthlyBranch)])
  ) as Record<PillarKey, HiddenStem[]>;
  const twelveGrowth = Object.fromEntries(
    chart.pillars.map((pillar) => [
      pillar.key,
      getTwelveGrowthStage(chart.dayMaster as HeavenlyStem, pillar.zhi.value as EarthlyBranch),
    ])
  ) as Record<PillarKey, TwelveGrowthStage>;
  const dayMasterSupport = estimateDayMasterSupport(chart, monthCommand.element);
  const dayStage = twelveGrowth.day;
  const visibleMissing = (Object.keys(chart.elementCounts) as WuXing[]).filter(
    (element) => chart.elementCounts[element] === 0
  );

  return {
    sourceIds: CLASSICAL_SOURCES.map((source) => source.id),
    monthCommand: {
      branch: monthBranch,
      ...monthCommand,
    },
    pillarHiddenStems,
    twelveGrowth,
    dayMasterSupport,
    narrativeSignals: [
      `${monthBranch}月属${monthCommand.season}令，先以${monthCommand.element}气的进退作为观察起点。`,
      `日主${chart.dayMaster}坐${dayStage}，可转译为人物在当下阶段的根气、行动惯性与心理底色。`,
      visibleMissing.length
        ? `明面八字未见${visibleMissing.join('、')}，仅作为创作意象提示，不等同于命局绝对缺失。`
        : '明面五行均有出现，人物设定可从偏向与制化关系中寻找矛盾。',
    ],
    caution: '这是基于经典概念的创作辅助摘要；未纳入出生地、真太阳时、专业起运和具体流派差异，不应替代完整排盘。',
  };
}

export function buildClassicalKnowledgeContext(chart: BaziChart) {
  const analysis = chart.classicalAnalysis || buildClassicalBaziAnalysis(chart);
  const sourceText = CLASSICAL_SOURCES.map((source) => `${source.title}：${source.focus}`).join('；');
  const hiddenStemText = chart.pillars
    .map((pillar) => {
      const hidden = analysis.pillarHiddenStems[pillar.key]
        .map((item) => `${item.stem}${item.role}`)
        .join('、');
      return `${pillar.label}${pillar.zhi.value}[${hidden}]`;
    })
    .join('；');
  const growthText = chart.pillars
    .map((pillar) => `${pillar.label}${analysis.twelveGrowth[pillar.key]}`)
    .join('、');

  return `经典知识层（用于创作转译，不直接下绝对命断）
参考来源：${sourceText}
月令：${analysis.monthCommand.branch}，${analysis.monthCommand.season}令，主气偏${analysis.monthCommand.element}。${analysis.monthCommand.note}
藏干：${hiddenStemText}
日主十二长生：${growthText}
日主结构倾向：${analysis.dayMasterSupport}（仅为明面五行与月令的简化估计）
创作提示：${analysis.narrativeSignals.join(' ')}
解释边界：${analysis.caution}`;
}

function getHiddenStems(branch: EarthlyBranch): HiddenStem[] {
  return HIDDEN_STEMS[branch].map((item) => ({
    ...item,
    element: STEM_ELEMENT[item.stem],
  }));
}

function getTwelveGrowthStage(stem: HeavenlyStem, branch: EarthlyBranch): TwelveGrowthStage {
  const startIndex = EARTHLY_BRANCHES.indexOf(GROWTH_START[stem]);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  const distance = STEM_YIN_YANG[stem] === '阳'
    ? (branchIndex - startIndex + 12) % 12
    : (startIndex - branchIndex + 12) % 12;
  return GROWTH_STAGES[distance];
}

function estimateDayMasterSupport(chart: BaziChart, seasonalElement: WuXing) {
  const dayMaster = chart.dayMasterElement;
  const resourceElement = Object.entries(GENERATES).find(([, generated]) => generated === dayMaster)?.[0] as WuXing;
  const outputElement = GENERATES[dayMaster];
  const officerElement = Object.entries(CONTROLS).find(([, controlled]) => controlled === dayMaster)?.[0] as WuXing;
  const wealthElement = CONTROLS[dayMaster];
  const support = chart.characters.filter(
    (character) => character.element === dayMaster || character.element === resourceElement
  ).length;
  const pressure = chart.characters.filter(
    (character) => character.element === outputElement || character.element === officerElement || character.element === wealthElement
  ).length;
  const seasonalSupport = seasonalElement === dayMaster || seasonalElement === resourceElement ? 2 : 0;
  const score = support + seasonalSupport - pressure;

  if (score >= 3) return '偏强' as const;
  if (score <= -2) return '偏弱' as const;
  if (score === 0 || score === 1) return '中和' as const;
  return '待观察' as const;
}
