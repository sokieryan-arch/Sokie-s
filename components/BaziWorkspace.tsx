'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, Check, Loader2, Moon, RefreshCw, Save, Sparkles, Sun, Wand2 } from 'lucide-react';
import BaziChartView from './BaziChartView';
import { getLunarMonthOptions, JIA_ZI, TIME_BRANCH_OPTIONS, buildBaziChart } from '@/lib/bazi';
import { BaziChart, BirthInput, BirthInputMode, CharacterProfile, EarthlyBranch, StoredCharacter } from '@/lib/types';

const YEARS = Array.from({ length: 201 }, (_, index) => 1900 + index);
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
const DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
const CONVERSION_STEPS = ['读取出生信息', '换算历法', '排出四柱', '点亮五行'];

interface BaziWorkspaceProps {
  chart: BaziChart | null;
  birthInput: BirthInput | null;
  profile: CharacterProfile | null;
  onChartGenerated: (chart: BaziChart, input: BirthInput) => void;
  onProfileChange: (profile: CharacterProfile | null) => void;
  onCharacterSaved: (character: StoredCharacter) => void;
}

export default function BaziWorkspace({
  chart,
  birthInput,
  profile,
  onChartGenerated,
  onProfileChange,
  onCharacterSaved,
}: BaziWorkspaceProps) {
  const [mode, setMode] = useState<BirthInputMode>(birthInput?.mode || 'solar');
  const [solar, setSolar] = useState({ year: 1995, month: 1, day: 1, timeBranch: '子' as EarthlyBranch });
  const [lunar, setLunar] = useState({
    year: 1995,
    month: 1,
    day: 1,
    isLeapMonth: false,
    timeBranch: '子' as EarthlyBranch,
  });
  const [ganzhi, setGanzhi] = useState({
    yearGanZhi: '甲子',
    monthGanZhi: '丙寅',
    dayGanZhi: '戊辰',
    timeGanZhi: '壬子',
  });
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStep, setConversionStep] = useState(-1);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const lunarMonths = useMemo(() => getLunarMonthOptions(lunar.year), [lunar.year]);

  const currentInput = (): BirthInput => {
    if (mode === 'solar') {
      return { mode, ...solar };
    }
    if (mode === 'lunar') {
      return { mode, ...lunar };
    }
    return { mode, ...ganzhi };
  };

  const handleConvert = async () => {
    setError('');
    setSaveMessage('');
    setIsConverting(true);
    onProfileChange(null);
    try {
      for (let index = 0; index < CONVERSION_STEPS.length; index += 1) {
        setConversionStep(index);
        await sleep(230);
      }
      const input = currentInput();
      const nextChart = buildBaziChart(input);
      onChartGenerated(nextChart, input);
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : '命盘转换失败');
    } finally {
      setIsConverting(false);
      setTimeout(() => setConversionStep(-1), 500);
    }
  };

  const handleGenerateProfile = async () => {
    if (!chart) {
      setError('请先生成命盘');
      return;
    }
    setIsGeneratingProfile(true);
    setError('');
    setSaveMessage('');
    try {
      const data = await postJson<{ profile: CharacterProfile }>('/api/ai/character', { chart });
      onProfileChange(normalizeProfile(data.profile));
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : '角色生成失败');
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleRename = async () => {
    if (!chart || !profile) return;
    setIsRenaming(true);
    setError('');
    try {
      const data = await postJson<Pick<CharacterProfile, 'name' | 'nameMeaning'>>('/api/ai/name', {
        chart,
        profile,
      });
      onProfileChange({
        ...profile,
        name: data.name,
        nameMeaning: data.nameMeaning,
      });
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : '换名失败');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleSave = async () => {
    if (!birthInput || !chart || !profile) {
      setError('请先完成命盘和角色档案');
      return;
    }
    setIsSaving(true);
    setError('');
    setSaveMessage('');
    try {
      const data = await postJson<{ character: StoredCharacter }>('/api/characters', {
        name: profile.name,
        birthInput,
        baziChart: chart,
        profile,
      });
      onCharacterSaved(data.character);
      setSaveMessage('角色已保存');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">命盘生成</h2>
              <div className="mt-1 text-xs text-zinc-500">Birth Chart</div>
            </div>
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            <ModeButton active={mode === 'solar'} icon={<Sun className="h-4 w-4" />} onClick={() => setMode('solar')}>
              公历
            </ModeButton>
            <ModeButton active={mode === 'lunar'} icon={<Moon className="h-4 w-4" />} onClick={() => setMode('lunar')}>
              农历
            </ModeButton>
            <ModeButton
              active={mode === 'ganzhi'}
              icon={<CalendarDays className="h-4 w-4" />}
              onClick={() => setMode('ganzhi')}
            >
              干支
            </ModeButton>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'solar' && (
              <motion.div
                key="solar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-2 gap-3"
              >
                <SelectField label="年" value={solar.year} onChange={(value) => setSolar({ ...solar, year: value })} options={YEARS} />
                <SelectField label="月" value={solar.month} onChange={(value) => setSolar({ ...solar, month: value })} options={MONTHS} />
                <SelectField label="日" value={solar.day} onChange={(value) => setSolar({ ...solar, day: value })} options={DAYS} />
                <TimeSelect value={solar.timeBranch} onChange={(value) => setSolar({ ...solar, timeBranch: value })} />
              </motion.div>
            )}

            {mode === 'lunar' && (
              <motion.div
                key="lunar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-2 gap-3"
              >
                <SelectField label="年" value={lunar.year} onChange={(value) => setLunar({ ...lunar, year: value, isLeapMonth: false })} options={YEARS} />
                <label className="space-y-2 text-xs text-zinc-500">
                  月
                  <select
                    value={`${lunar.month}:${lunar.isLeapMonth ? 1 : 0}`}
                    onChange={(event) => {
                      const [month, leap] = event.target.value.split(':');
                      setLunar({ ...lunar, month: Number(month), isLeapMonth: leap === '1' });
                    }}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500/70"
                  >
                    {lunarMonths.map((item) => (
                      <option key={`${item.month}-${item.isLeapMonth}`} value={`${item.month}:${item.isLeapMonth ? 1 : 0}`}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <SelectField label="日" value={lunar.day} onChange={(value) => setLunar({ ...lunar, day: value })} options={DAYS.slice(0, 30)} />
                <TimeSelect value={lunar.timeBranch} onChange={(value) => setLunar({ ...lunar, timeBranch: value })} />
              </motion.div>
            )}

            {mode === 'ganzhi' && (
              <motion.div
                key="ganzhi"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-2 gap-3"
              >
                <GanZhiSelect label="年柱" value={ganzhi.yearGanZhi} onChange={(value) => setGanzhi({ ...ganzhi, yearGanZhi: value })} />
                <GanZhiSelect label="月柱" value={ganzhi.monthGanZhi} onChange={(value) => setGanzhi({ ...ganzhi, monthGanZhi: value })} />
                <GanZhiSelect label="日柱" value={ganzhi.dayGanZhi} onChange={(value) => setGanzhi({ ...ganzhi, dayGanZhi: value })} />
                <GanZhiSelect label="时柱" value={ganzhi.timeGanZhi} onChange={(value) => setGanzhi({ ...ganzhi, timeGanZhi: value })} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            转换命盘
          </button>

          <AnimatePresence>
            {isConverting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2">
                  {CONVERSION_STEPS.map((step, index) => (
                    <div
                      key={step}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        conversionStep >= index
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {conversionStep > index ? <Check className="mr-1 inline h-3 w-3" /> : null}
                      {step}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-5">
          {chart ? (
            <BaziChartView chart={chart} />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-zinc-600">
              命盘等待转换
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">角色档案</h3>
            <div className="mt-1 text-xs text-zinc-500">Character Profile</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerateProfile}
              disabled={!chart || isGeneratingProfile}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 transition hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              生成档案
            </button>
            <button
              onClick={handleRename}
              disabled={!profile || isRenaming}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              换名
            </button>
            <button
              onClick={handleSave}
              disabled={!profile || isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存角色
            </button>
          </div>
        </div>

        {profile ? (
          <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-3">
              <label className="space-y-2 text-xs text-zinc-500">
                姓名
                <input
                  value={profile.name}
                  onChange={(event) => onProfileChange({ ...profile, name: event.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-base text-zinc-100 outline-none focus:border-amber-500/70"
                />
              </label>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-relaxed text-zinc-300">
                {profile.nameMeaning}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ProfileBlock title="外貌与气质" text={profile.appearance} />
              <ProfileBlock title="核心矛盾" text={profile.coreConflict} />
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 md:col-span-2">
                <div className="mb-3 text-sm font-medium text-zinc-200">大运阶段</div>
                <div className="grid gap-2 md:grid-cols-2">
                  {profile.lifeStages.map((stage, index) => (
                    <div key={`${stage.stageName}-${index}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                      <div className="text-sm text-zinc-100">{stage.stageName}</div>
                      <div className="mt-1 text-xs leading-relaxed text-zinc-400">{stage.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 md:col-span-2">
                <div className="mb-3 text-sm font-medium text-zinc-200">故事钩子</div>
                <div className="flex flex-wrap gap-2">
                  {profile.plotHooks.map((hook, index) => (
                    <span key={`${hook}-${index}`} className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300">
                      {hook}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[170px] rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-sm text-zinc-600">
            角色档案等待生成
          </div>
        )}

        {(error || saveMessage) && (
          <div className={`mt-4 text-sm ${error ? 'text-rose-300' : 'text-amber-300'}`}>
            {error || saveMessage}
          </div>
        )}
      </section>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition ${
        active ? 'bg-zinc-800 text-amber-300' : 'text-zinc-500 hover:text-zinc-200'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2 text-xs text-zinc-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500/70"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TimeSelect({ value, onChange }: { value: EarthlyBranch; onChange: (value: EarthlyBranch) => void }) {
  return (
    <label className="space-y-2 text-xs text-zinc-500">
      时辰
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as EarthlyBranch)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500/70"
      >
        {TIME_BRANCH_OPTIONS.map((option) => (
          <option key={option.branch} value={option.branch}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function GanZhiSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-xs text-zinc-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500/70"
      >
        {JIA_ZI.map((ganZhi) => (
          <option key={ganZhi} value={ganZhi}>
            {ganZhi}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProfileBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-2 text-sm font-medium text-zinc-200">{title}</div>
      <div className="text-sm leading-relaxed text-zinc-400">{text}</div>
    </div>
  );
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data as T;
}

function normalizeProfile(profile: CharacterProfile): CharacterProfile {
  return {
    ...profile,
    lifeStages: profile.lifeStages || [],
    plotHooks: profile.plotHooks || [],
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
