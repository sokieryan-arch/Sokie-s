'use client';

import { Activity, CalendarDays, Compass, Orbit } from 'lucide-react';
import { ELEMENT_ORDER } from '@/lib/bazi';
import { BaziCharacter, BaziChart, WuXing } from '@/lib/types';

const ELEMENT_STYLE: Record<WuXing, string> = {
  木: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  火: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  土: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-100',
  金: 'border-zinc-300/40 bg-zinc-200/10 text-zinc-100',
  水: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
};

export function ElementBadge({ element }: { element: WuXing }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${ELEMENT_STYLE[element]}`}>
      {element}
    </span>
  );
}

export default function BaziChartView({ chart, compact = false }: { chart: BaziChart; compact?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {chart.pillars.map((pillar) => (
          <div key={pillar.key} className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="mb-3 flex min-w-0 items-center justify-between gap-2 text-xs text-zinc-500">
              <span className="shrink-0">{pillar.label}</span>
              {pillar.naYin && <span className="truncate text-right">{pillar.naYin}</span>}
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2">
              <BaziGlyph character={pillar.gan} />
              <BaziGlyph character={pillar.zhi} />
            </div>
            {!compact && pillar.shiShenGan && (
              <div className="mt-3 text-xs text-zinc-500">
                十神：{pillar.shiShenGan}
                {pillar.shiShenZhi?.length ? ` / ${pillar.shiShenZhi.join('、')}` : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
            <Activity className="h-4 w-4 text-amber-300" />
            五行分布
          </div>
          <div className="grid grid-cols-5 gap-2">
            {ELEMENT_ORDER.map((element) => (
              <div key={element} className={`rounded-lg border p-3 ${ELEMENT_STYLE[element]}`}>
                <div className="text-xs opacity-75">{element}</div>
                <div className="mt-1 text-2xl font-semibold">{chart.elementCounts[element]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-zinc-300">
            <Compass className="h-4 w-4 text-amber-300" />
            命盘摘要
          </div>
          <div className="space-y-2 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <Orbit className="h-3.5 w-3.5 text-zinc-500" />
              日主 <span className="text-zinc-100">{chart.dayMaster}</span>
              <ElementBadge element={chart.dayMasterElement} />
            </div>
            {chart.solarDate && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                {chart.solarDate}
              </div>
            )}
            {chart.lunarDate && <div>{chart.lunarDate}</div>}
            <div>{[chart.zodiac, chart.season, chart.jieQi].filter(Boolean).join(' / ')}</div>
            <div className="pt-1 text-zinc-300">{chart.summary}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BaziGlyph({ character }: { character: BaziCharacter }) {
  return (
    <div className={`flex min-h-[104px] min-w-0 flex-col items-center justify-center rounded-lg border px-2 py-3 text-center ${ELEMENT_STYLE[character.element]}`}>
      <div className="flex h-11 items-center justify-center text-[2rem] font-semibold leading-none">
        {character.value}
      </div>
      <div className="mt-2 whitespace-nowrap text-[11px] leading-none opacity-75">
        {character.role} · {character.yinYang}
      </div>
    </div>
  );
}
