import { Lunar, LunarUtil, LunarYear, Solar } from 'lunar-typescript';
import {
  BaziCharacter,
  BaziChart,
  BaziPillar,
  BirthInput,
  EarthlyBranch,
  HeavenlyStem,
  PillarKey,
  WuXing,
  YinYang,
} from './types';

export const ELEMENT_ORDER: WuXing[] = ['木', '火', '土', '金', '水'];

export const HEAVENLY_STEMS: HeavenlyStem[] = [
  '甲',
  '乙',
  '丙',
  '丁',
  '戊',
  '己',
  '庚',
  '辛',
  '壬',
  '癸',
];

export const EARTHLY_BRANCHES: EarthlyBranch[] = [
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

export const JIA_ZI = Array.from({ length: 60 }, (_, index) => {
  const gan = HEAVENLY_STEMS[index % HEAVENLY_STEMS.length];
  const zhi = EARTHLY_BRANCHES[index % EARTHLY_BRANCHES.length];
  return `${gan}${zhi}`;
});

export const TIME_BRANCH_OPTIONS: {
  branch: EarthlyBranch;
  label: string;
  hour: number;
}[] = [
  { branch: '子', label: '子时 00:00', hour: 0 },
  { branch: '丑', label: '丑时 01:00', hour: 1 },
  { branch: '寅', label: '寅时 03:00', hour: 3 },
  { branch: '卯', label: '卯时 05:00', hour: 5 },
  { branch: '辰', label: '辰时 07:00', hour: 7 },
  { branch: '巳', label: '巳时 09:00', hour: 9 },
  { branch: '午', label: '午时 11:00', hour: 11 },
  { branch: '未', label: '未时 13:00', hour: 13 },
  { branch: '申', label: '申时 15:00', hour: 15 },
  { branch: '酉', label: '酉时 17:00', hour: 17 },
  { branch: '戌', label: '戌时 19:00', hour: 19 },
  { branch: '亥', label: '亥时 21:00', hour: 21 },
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

const STEM_YIN_YANG: Record<HeavenlyStem, YinYang> = {
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

const BRANCH_YIN_YANG: Record<EarthlyBranch, YinYang> = {
  子: '阳',
  丑: '阴',
  寅: '阳',
  卯: '阴',
  辰: '阳',
  巳: '阴',
  午: '阳',
  未: '阴',
  申: '阳',
  酉: '阴',
  戌: '阳',
  亥: '阴',
};

const PILLAR_LABEL: Record<PillarKey, string> = {
  year: '年柱',
  month: '月柱',
  day: '日柱',
  time: '时柱',
};

export function getLunarMonthOptions(year: number) {
  const leapMonth = LunarYear.fromYear(year).getLeapMonth();
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const base = { month, isLeapMonth: false, label: `${month}月` };
    if (leapMonth === month) {
      return [
        base,
        { month, isLeapMonth: true, label: `闰${month}月` },
      ];
    }
    return [base];
  }).flat();
}

export function buildBaziChart(input: BirthInput): BaziChart {
  if (input.mode === 'ganzhi') {
    return buildManualGanzhiChart(input);
  }

  const time = TIME_BRANCH_OPTIONS.find((item) => item.branch === input.timeBranch);
  if (!time) {
    throw new Error('请选择有效时辰');
  }

  if (input.mode === 'solar') {
    assertValidSolarDate(input.year, input.month, input.day);
    const solar = Solar.fromYmdHms(input.year, input.month, input.day, time.hour, 0, 0);
    const lunar = solar.getLunar();
    return chartFromLunar(
      lunar,
      input.mode,
      `公历 ${solar.toYmd()} ${input.timeBranch}时`
    );
  }

  const lunarMonth = input.isLeapMonth ? -input.month : input.month;
  const lunar = Lunar.fromYmdHms(input.year, lunarMonth, input.day, time.hour, 0, 0);
  return chartFromLunar(
    lunar,
    input.mode,
    `农历 ${input.year}年${input.isLeapMonth ? '闰' : ''}${input.month}月${input.day}日 ${input.timeBranch}时`
  );
}

export function baziChartToPrompt(chart: BaziChart) {
  const pillars = chart.pillars
    .map(
      (pillar) =>
        `${pillar.label}${pillar.ganZhi}(${pillar.gan.element}${pillar.zhi.element}${
          pillar.naYin ? `，纳音${pillar.naYin}` : ''
        })`
    )
    .join('；');
  const elements = ELEMENT_ORDER.map((element) => `${element}${chart.elementCounts[element]}`).join('、');
  return `${chart.sourceLabel}
八字：${chart.pillars.map((pillar) => pillar.ganZhi).join(' ')}
${pillars}
日主：${chart.dayMaster}${chart.dayMasterElement}
五行分布：${elements}
公历：${chart.solarDate || '未反推'}
农历：${chart.lunarDate || '未反推'}
生肖/节气：${[chart.zodiac, chart.season, chart.jieQi].filter(Boolean).join(' / ') || '无'}`;
}

function chartFromLunar(
  lunar: Lunar,
  inputMode: BaziChart['inputMode'],
  sourceLabel: string
): BaziChart {
  const eight = lunar.getEightChar();
  const pillars: BaziPillar[] = [
    buildPillar('year', eight.getYear(), eight.getYearNaYin(), eight.getYearShiShenGan(), eight.getYearShiShenZhi()),
    buildPillar(
      'month',
      eight.getMonth(),
      eight.getMonthNaYin(),
      eight.getMonthShiShenGan(),
      eight.getMonthShiShenZhi()
    ),
    buildPillar('day', eight.getDay(), eight.getDayNaYin(), eight.getDayShiShenGan(), eight.getDayShiShenZhi()),
    buildPillar('time', eight.getTime(), eight.getTimeNaYin(), eight.getTimeShiShenGan(), eight.getTimeShiShenZhi()),
  ];
  const characters = pillars.flatMap((pillar) => [pillar.gan, pillar.zhi]);
  const elementCounts = countElements(characters);
  const dayMaster = eight.getDayGan();
  const dayMasterElement = getStemElement(dayMaster);
  const jieQi = lunar.getJieQi() || lunar.getCurrentJieQi()?.getName();

  return {
    inputMode,
    sourceLabel,
    solarDate: lunar.getSolar().toYmdHms(),
    lunarDate: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
    zodiac: lunar.getYearShengXiao(),
    season: lunar.getSeason(),
    jieQi,
    dayMaster,
    dayMasterElement,
    pillars,
    characters,
    elementCounts,
    summary: `日主${dayMaster}${dayMasterElement}，四柱为${pillars.map((pillar) => pillar.ganZhi).join('、')}。`,
  };
}

function buildManualGanzhiChart(input: Extract<BirthInput, { mode: 'ganzhi' }>): BaziChart {
  const pillars = [
    buildPillar('year', input.yearGanZhi),
    buildPillar('month', input.monthGanZhi),
    buildPillar('day', input.dayGanZhi),
    buildPillar('time', input.timeGanZhi),
  ];
  const characters = pillars.flatMap((pillar) => [pillar.gan, pillar.zhi]);
  const elementCounts = countElements(characters);
  const dayMaster = pillars[2].gan.value;
  const dayMasterElement = pillars[2].gan.element;

  return {
    inputMode: 'ganzhi',
    sourceLabel: '干支四柱手动输入',
    dayMaster,
    dayMasterElement,
    pillars,
    characters,
    elementCounts,
    summary: `手动四柱${pillars.map((pillar) => pillar.ganZhi).join('、')}，日主${dayMaster}${dayMasterElement}。`,
  };
}

function buildPillar(
  key: PillarKey,
  ganZhi: string,
  naYin = getNaYin(ganZhi),
  shiShenGan?: string,
  shiShenZhi?: string[]
): BaziPillar {
  const chars = Array.from(ganZhi.trim());
  const gan = chars[0] as HeavenlyStem;
  const zhi = chars[1] as EarthlyBranch;
  if (!HEAVENLY_STEMS.includes(gan) || !EARTHLY_BRANCHES.includes(zhi)) {
    throw new Error(`无效干支：${ganZhi}`);
  }

  return {
    key,
    label: PILLAR_LABEL[key],
    gan: {
      value: gan,
      role: '天干',
      element: STEM_ELEMENT[gan],
      yinYang: STEM_YIN_YANG[gan],
    },
    zhi: {
      value: zhi,
      role: '地支',
      element: BRANCH_ELEMENT[zhi],
      yinYang: BRANCH_YIN_YANG[zhi],
    },
    ganZhi: `${gan}${zhi}`,
    naYin,
    shiShenGan,
    shiShenZhi,
  };
}

function countElements(characters: BaziCharacter[]): Record<WuXing, number> {
  return characters.reduce(
    (counts, character) => {
      counts[character.element] += 1;
      return counts;
    },
    { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 } as Record<WuXing, number>
  );
}

function getNaYin(ganZhi: string) {
  const table = LunarUtil.NAYIN as unknown as Record<string, string>;
  return table?.[ganZhi];
}

function getStemElement(stem: string): WuXing {
  if (!HEAVENLY_STEMS.includes(stem as HeavenlyStem)) {
    throw new Error(`无效天干：${stem}`);
  }
  return STEM_ELEMENT[stem as HeavenlyStem];
}

function assertValidSolarDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('请选择有效公历日期');
  }
}
