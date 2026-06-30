'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Clapperboard, Loader2, Map, Network, Sparkles, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ActiveBond, CharacterBond, ScriptOutline, StoredCharacter, StoryInputs } from '@/lib/types';

interface StoryWorkspaceProps {
  characters: StoredCharacter[];
  primaryId: string | null;
  companionIds: string[];
  bonds: ActiveBond[];
  onBondGenerated: (bond: ActiveBond) => void;
}

export default function StoryWorkspace({
  characters,
  primaryId,
  companionIds,
  bonds,
  onBondGenerated,
}: StoryWorkspaceProps) {
  const [inputs, setInputs] = useState<StoryInputs>({
    worldview: '',
    annualNode: '',
    startAnchor: '',
    endAnchor: '',
    coreEvent: '',
  });
  const [mode, setMode] = useState<'chapter' | 'outline'>('outline');
  const [generatingBondId, setGeneratingBondId] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [scriptOutline, setScriptOutline] = useState<ScriptOutline | null>(null);
  const [error, setError] = useState('');

  const primary = characters.find((character) => character.id === primaryId) || null;
  const companions = characters.filter((character) => companionIds.includes(character.id));
  const activeBonds = useMemo(
    () =>
      bonds.filter(
        (item) =>
          item.primaryId === primaryId &&
          companionIds.includes(item.secondaryId)
      ),
    [bonds, companionIds, primaryId]
  );

  const handleInputChange = (name: keyof StoryInputs, value: string) => {
    setInputs((current) => ({ ...current, [name]: value }));
  };

  const handleGenerateBond = async (secondary: StoredCharacter) => {
    if (!primary) return;
    setGeneratingBondId(secondary.id);
    setError('');
    try {
      const data = await postJson<{ bond: CharacterBond }>('/api/ai/bond', {
        primary,
        secondary,
      });
      onBondGenerated({
        key: `${primary.id}:${secondary.id}`,
        primaryId: primary.id,
        secondaryId: secondary.id,
        bond: data.bond,
      });
    } catch (bondError) {
      setError(bondError instanceof Error ? bondError.message : '羁绊生成失败');
    } finally {
      setGeneratingBondId(null);
    }
  };

  const handleGenerateStory = async () => {
    if (!primary) {
      setError('请先选择主角');
      return;
    }
    if (!inputs.worldview || !inputs.annualNode || !inputs.startAnchor || !inputs.endAnchor || !inputs.coreEvent) {
      setError('请填写故事参数');
      return;
    }
    setIsGeneratingStory(true);
    setError('');
    setStoryContent('');
    setScriptOutline(null);
    try {
      const data = await postJson<{ storyContent?: string; scriptOutline?: ScriptOutline }>('/api/ai/story', {
        mode,
        inputs,
        primary,
        companions,
        bonds: activeBonds.map((item) => item.bond),
      });
      setStoryContent(data.storyContent || '');
      setScriptOutline(data.scriptOutline || null);
    } catch (storyError) {
      setError(storyError instanceof Error ? storyError.message : '故事生成失败');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">故事工作台</h2>
            <div className="mt-1 text-xs text-zinc-500">Story Workspace</div>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            <button
              onClick={() => setMode('outline')}
              className={`rounded-md px-3 py-2 text-sm transition ${
                mode === 'outline' ? 'bg-zinc-800 text-amber-300' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              导演大纲
            </button>
            <button
              onClick={() => setMode('chapter')}
              className={`rounded-md px-3 py-2 text-sm transition ${
                mode === 'chapter' ? 'bg-zinc-800 text-amber-300' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              完整章节
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <CastTile label="主角" value={primary?.name || '未选择'} tone="amber" />
          <CastTile label="配角" value={companions.length ? companions.map((item) => item.name).join('、') : '无'} tone="amber" />
          <CastTile label="羁绊" value={`${activeBonds.length}/${companions.length}`} tone="amber" />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-zinc-200">
              <Map className="h-4 w-4 text-amber-300" />
              章节参数
            </div>
            <div className="space-y-3">
              <TextAreaField label="世界观" value={inputs.worldview} onChange={(value) => handleInputChange('worldview', value)} />
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="流年节点" value={inputs.annualNode} onChange={(value) => handleInputChange('annualNode', value)} />
                <InputField label="章节起点" value={inputs.startAnchor} onChange={(value) => handleInputChange('startAnchor', value)} />
                <InputField label="章节终点" value={inputs.endAnchor} onChange={(value) => handleInputChange('endAnchor', value)} />
              </div>
              <TextAreaField label="核心事件" value={inputs.coreEvent} onChange={(value) => handleInputChange('coreEvent', value)} />
            </div>
            <button
              onClick={handleGenerateStory}
              disabled={!primary || isGeneratingStory}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingStory ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
              生成故事
            </button>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-zinc-200">
              <Network className="h-4 w-4 text-amber-300" />
              命格羁绊
            </div>
            {companions.length ? (
              <div className="space-y-3">
                {companions.map((companion) => {
                  const activeBond = activeBonds.find((item) => item.secondaryId === companion.id);
                  return (
                    <div key={companion.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-zinc-100">{companion.name}</div>
                          {activeBond && <div className="mt-1 text-xs leading-relaxed text-zinc-400">{activeBond.bond.summary}</div>}
                        </div>
                        <button
                          onClick={() => handleGenerateBond(companion)}
                          disabled={!primary || generatingBondId === companion.id}
                          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-200 transition hover:bg-amber-500/15 disabled:opacity-50"
                        >
                          {generatingBondId === companion.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          生成
                        </button>
                      </div>
                      {activeBond && (
                        <div className="mt-3 grid gap-2 text-xs text-zinc-400 md:grid-cols-2">
                          <BondList title="互补" items={activeBond.bond.complementaryPoints} />
                          <BondList title="冲突" items={activeBond.bond.conflictPoints} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-600">
                当前为单主角故事
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-5">
          {error && <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}

          {!storyContent && !scriptOutline && !isGeneratingStory && (
            <div className="flex min-h-[560px] flex-col items-center justify-center gap-3 text-zinc-600">
              <Clapperboard className="h-12 w-12 opacity-40" />
              <div className="text-sm">故事内容等待生成</div>
            </div>
          )}

          {isGeneratingStory && (
            <div className="flex min-h-[560px] flex-col items-center justify-center gap-3 text-amber-300">
              <Loader2 className="h-8 w-8 animate-spin" />
              <div className="text-sm">正在生成</div>
            </div>
          )}

          {storyContent && (
            <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{storyContent}</ReactMarkdown>
            </div>
          )}

          {scriptOutline && (
            <div className="space-y-5">
              <OutlineBlock title="场景设定" text={scriptOutline.sceneSetting} />
              <OutlineBlock title="心理基调" text={scriptOutline.psychologicalTone} />
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-zinc-200">
                  <Clapperboard className="h-4 w-4 text-amber-300" />
                  剧情节拍
                </div>
                <div className="space-y-3">
                  {scriptOutline.beatSheet?.map((beat, index) => (
                    <div key={`${beat.beat}-${index}`} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
                      <div className="text-sm font-medium text-zinc-100">{beat.beat}</div>
                      <div className="mt-2 text-sm leading-relaxed text-zinc-400">{beat.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-zinc-200">
                  <Target className="h-4 w-4 text-amber-300" />
                  备选转折
                </div>
                <div className="flex flex-wrap gap-2">
                  {scriptOutline.twistAlternatives?.map((twist, index) => (
                    <span key={`${twist}-${index}`} className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300">
                      {twist}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CastTile({ label, value, tone }: { label: string; value: string; tone: 'amber' }) {
  const toneClass = {
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  }[tone];
  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-2 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-xs text-zinc-500">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500/70"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-xs text-zinc-500">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-24 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500/70"
      />
    </label>
  );
}

function BondList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="mb-2 text-zinc-300">{title}</div>
      <div className="space-y-1">
        {(items || []).slice(0, 3).map((item, index) => (
          <div key={`${item}-${index}`} className="leading-relaxed">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function OutlineBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-2 text-sm text-zinc-200">{title}</div>
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
