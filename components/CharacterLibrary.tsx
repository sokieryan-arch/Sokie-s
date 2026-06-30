'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Pencil, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import BaziChartView from './BaziChartView';
import { StoredCharacter } from '@/lib/types';

interface CharacterLibraryProps {
  characters: StoredCharacter[];
  primaryId: string | null;
  companionIds: string[];
  loading: boolean;
  error: string;
  onPrimaryChange: (id: string) => void;
  onCompanionToggle: (id: string) => void;
  onCharacterUpdated: (character: StoredCharacter) => void;
  onCharacterDeleted: (id: string) => void;
}

export default function CharacterLibrary({
  characters,
  primaryId,
  companionIds,
  loading,
  error,
  onPrimaryChange,
  onCompanionToggle,
  onCharacterUpdated,
  onCharacterDeleted,
}: CharacterLibraryProps) {
  const [activeId, setActiveId] = useState<string | null>(characters[0]?.id || null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [localError, setLocalError] = useState('');
  const activeCharacter = characters.find((character) => character.id === activeId) || characters[0] || null;

  const handleEdit = (character: StoredCharacter) => {
    setEditingId(character.id);
    setEditingName(character.name);
    setLocalError('');
  };

  const handleSaveName = async (character: StoredCharacter) => {
    if (!editingName.trim()) {
      setLocalError('姓名不能为空');
      return;
    }
    try {
      const data = await requestJson<{ character: StoredCharacter }>(`/api/characters/${character.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editingName.trim(),
          profile: {
            ...character.profile,
            name: editingName.trim(),
          },
        }),
      });
      onCharacterUpdated(data.character);
      setEditingId(null);
      setEditingName('');
    } catch (updateError) {
      setLocalError(updateError instanceof Error ? updateError.message : '更新失败');
    }
  };

  const handleDelete = async (character: StoredCharacter) => {
    try {
      await requestJson(`/api/characters/${character.id}`, { method: 'DELETE' });
      onCharacterDeleted(character.id);
      if (activeId === character.id) {
        setActiveId(null);
      }
    } catch (deleteError) {
      setLocalError(deleteError instanceof Error ? deleteError.message : '删除失败');
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
      <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">角色库</h2>
            <div className="mt-1 text-xs text-zinc-500">Character Library</div>
          </div>
          <UsersRound className="h-5 w-5 text-amber-400" />
        </div>

        {loading && <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-500">正在读取角色库</div>}
        {(error || localError) && <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error || localError}</div>}

        {!loading && characters.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-sm text-zinc-600">
            暂无已保存角色
          </div>
        )}

        <div className="space-y-3">
          {characters.map((character) => {
            const isPrimary = primaryId === character.id;
            const isCompanion = companionIds.includes(character.id);
            const isEditing = editingId === character.id;
            return (
              <div
                key={character.id}
                className={`rounded-lg border p-4 transition ${
                  activeCharacter?.id === character.id
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => setActiveId(character.id)} className="min-w-0 flex-1 text-left">
                    {isEditing ? (
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/70"
                      />
                    ) : (
                      <>
                        <div className="truncate text-base font-medium text-zinc-100">{character.name}</div>
                        <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">{character.profile.coreConflict}</div>
                      </>
                    )}
                  </button>

                  <div className="flex shrink-0 gap-1">
                    {isEditing ? (
                      <>
                        <IconButton label="保存" onClick={() => handleSaveName(character)}>
                          <Check className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="取消" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton label="编辑" onClick={() => handleEdit(character)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="删除" onClick={() => handleDelete(character)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => onPrimaryChange(character.id)}
                    className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs ${
                      isPrimary
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    主角
                  </button>
                  <button
                    onClick={() => onCompanionToggle(character.id)}
                    disabled={isPrimary}
                    className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
                      isCompanion
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <UsersRound className="h-3.5 w-3.5" />
                    配角
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-5">
        {activeCharacter ? (
          <div className="space-y-5">
            <div>
              <div className="text-2xl font-semibold text-zinc-100">{activeCharacter.name}</div>
              <div className="mt-2 text-sm leading-relaxed text-zinc-400">{activeCharacter.profile.nameMeaning}</div>
            </div>
            <BaziChartView chart={activeCharacter.baziChart} compact />
            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock title="外貌与气质" text={activeCharacter.profile.appearance} />
              <InfoBlock title="核心矛盾" text={activeCharacter.profile.coreConflict} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] items-center justify-center text-sm text-zinc-600">未选择角色</div>
        )}
      </section>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-2 text-sm text-zinc-200">{title}</div>
      <div className="text-sm leading-relaxed text-zinc-400">{text}</div>
    </div>
  );
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data as T;
}
