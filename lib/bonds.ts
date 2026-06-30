import { BaziChart, BondStructure, CharacterBond, StoredCharacter, WuXing } from './types';

const GENERATES: Record<WuXing, WuXing> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const CONTROLS: Record<WuXing, WuXing> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
};

const CLASHES = new Set(['子午', '午子', '丑未', '未丑', '寅申', '申寅', '卯酉', '酉卯', '辰戌', '戌辰', '巳亥', '亥巳']);
const COMBINATIONS = new Set(['子丑', '丑子', '寅亥', '亥寅', '卯戌', '戌卯', '辰酉', '酉辰', '巳申', '申巳', '午未', '未午']);

export function analyzeBondStructure(primary: BaziChart, secondary: BaziChart): BondStructure {
  const sharedElements = Object.keys(primary.elementCounts).filter((element) => {
    const key = element as WuXing;
    return primary.elementCounts[key] > 0 && secondary.elementCounts[key] > 0;
  }) as WuXing[];

  return {
    dayMasterRelation: describeDayMasterRelation(primary, secondary),
    sharedElements,
    clashes: collectBranchSignals(primary, secondary, CLASHES, '冲'),
    combinations: collectBranchSignals(primary, secondary, COMBINATIONS, '合'),
    elementBalance: describeElementBalance(primary, secondary),
  };
}

export function createLocalBondFallback(primary: StoredCharacter, secondary: StoredCharacter): CharacterBond {
  const structure = analyzeBondStructure(primary.baziChart, secondary.baziChart);
  return {
    relationType: structure.clashes.length > structure.combinations.length ? '张力型羁绊' : '互补型羁绊',
    summary: `${primary.name}与${secondary.name}的日主关系呈现${structure.dayMasterRelation}，适合写成互相牵引又彼此试探的角色关系。`,
    complementaryPoints: [
      structure.elementBalance,
      structure.combinations.length ? `存在${structure.combinations.join('、')}，可转化为默契或宿缘。` : '五行结构可以作为彼此补位的创作依据。',
    ],
    conflictPoints: [
      structure.clashes.length ? `存在${structure.clashes.join('、')}，适合制造立场冲突。` : '明面冲突较弱，适合从目标差异制造阻力。',
    ],
    plotUse: ['作为主线任务中的互相制衡关系', '用于推动一次信任危机或共同破局'],
    triggerEvents: ['资源分配出现偏差', '其中一人隐瞒关键真相'],
    structure,
  };
}

function describeDayMasterRelation(primary: BaziChart, secondary: BaziChart) {
  const a = primary.dayMasterElement;
  const b = secondary.dayMasterElement;
  if (a === b) {
    return `${a}${b}同气，容易共振，也容易互相投射`;
  }
  if (GENERATES[a] === b) {
    return `${a}生${b}，主角倾向滋养或成全对方`;
  }
  if (GENERATES[b] === a) {
    return `${b}生${a}，配角倾向托举或保护主角`;
  }
  if (CONTROLS[a] === b) {
    return `${a}克${b}，主角天然压迫或规训对方`;
  }
  if (CONTROLS[b] === a) {
    return `${b}克${a}，配角会挑战主角的稳定结构`;
  }
  return `${a}${b}关系中性，可从十神与剧情目标制造关系强度`;
}

function collectBranchSignals(primary: BaziChart, secondary: BaziChart, table: Set<string>, suffix: string) {
  const signals: string[] = [];
  for (const a of primary.pillars) {
    for (const b of secondary.pillars) {
      const pair = `${a.zhi.value}${b.zhi.value}`;
      if (table.has(pair)) {
        signals.push(`${a.label}${a.zhi.value}-${b.label}${b.zhi.value}${suffix}`);
      }
    }
  }
  return signals.slice(0, 6);
}

function describeElementBalance(primary: BaziChart, secondary: BaziChart) {
  const primaryWeak = lowestElements(primary);
  const secondaryStrong = highestElements(secondary);
  const supplies = primaryWeak.filter((element) => secondaryStrong.includes(element));
  if (supplies.length) {
    return `${secondary.summary} 可补足 ${primary.summary} 中偏弱的${supplies.join('、')}。`;
  }
  return `${primary.summary} 与 ${secondary.summary} 的五行偏向不同，适合设计为互相校正的关系。`;
}

function lowestElements(chart: BaziChart) {
  const min = Math.min(...Object.values(chart.elementCounts));
  return Object.entries(chart.elementCounts)
    .filter(([, count]) => count === min)
    .map(([element]) => element as WuXing);
}

function highestElements(chart: BaziChart) {
  const max = Math.max(...Object.values(chart.elementCounts));
  return Object.entries(chart.elementCounts)
    .filter(([, count]) => count === max)
    .map(([element]) => element as WuXing);
}
