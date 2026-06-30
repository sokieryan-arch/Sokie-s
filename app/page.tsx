'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, PenTool, Sparkles, UsersRound } from 'lucide-react';
import BaziWorkspace from '@/components/BaziWorkspace';
import CharacterLibrary from '@/components/CharacterLibrary';
import StoryWorkspace from '@/components/StoryWorkspace';
import { ActiveBond, BaziChart, BirthInput, CharacterProfile, StoredCharacter } from '@/lib/types';

type ActiveTab = 'chart' | 'library' | 'story';

export default function Page() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chart');
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [characters, setCharacters] = useState<StoredCharacter[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [companionIds, setCompanionIds] = useState<string[]>([]);
  const [bonds, setBonds] = useState<ActiveBond[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [libraryError, setLibraryError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadCharacters() {
      setIsLoadingCharacters(true);
      setLibraryError('');
      try {
        const response = await fetch('/api/characters');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || '角色库读取失败');
        }
        if (!cancelled) {
          setCharacters(data.characters || []);
          setPrimaryId((current) => current || data.characters?.[0]?.id || null);
        }
      } catch (error) {
        if (!cancelled) {
          setLibraryError(error instanceof Error ? error.message : '角色库读取失败');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCharacters(false);
        }
      }
    }
    loadCharacters();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChartGenerated = (nextChart: BaziChart, nextInput: BirthInput) => {
    setChart(nextChart);
    setBirthInput(nextInput);
    setProfile(null);
  };

  const handleCharacterSaved = (character: StoredCharacter) => {
    setCharacters((current) => [character, ...current.filter((item) => item.id !== character.id)]);
    setPrimaryId((current) => current || character.id);
    setActiveTab('library');
  };

  const handlePrimaryChange = (id: string) => {
    setPrimaryId(id);
    setCompanionIds((current) => current.filter((item) => item !== id));
  };

  const handleCompanionToggle = (id: string) => {
    if (id === primaryId) return;
    setCompanionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleCharacterUpdated = (character: StoredCharacter) => {
    setCharacters((current) => current.map((item) => (item.id === character.id ? character : item)));
  };

  const handleCharacterDeleted = (id: string) => {
    setCharacters((current) => current.filter((item) => item.id !== id));
    setCompanionIds((current) => current.filter((item) => item !== id));
    setBonds((current) => current.filter((item) => item.primaryId !== id && item.secondaryId !== id));
    setPrimaryId((current) => {
      if (current !== id) return current;
      const next = characters.find((character) => character.id !== id);
      return next?.id || null;
    });
  };

  const handleBondGenerated = (bond: ActiveBond) => {
    setBonds((current) => [bond, ...current.filter((item) => item.key !== bond.key)]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-zinc-800 bg-zinc-950 px-5 py-5 md:w-72 md:border-b-0 md:border-r">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-100">天机</h1>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Bazi Novel Engine</div>
            </div>
          </div>

          <nav className="grid gap-2 md:block md:space-y-2">
            <NavButton active={activeTab === 'chart'} icon={<CalendarDays className="h-4 w-4" />} onClick={() => setActiveTab('chart')}>
              命盘生成
            </NavButton>
            <NavButton active={activeTab === 'library'} icon={<UsersRound className="h-4 w-4" />} onClick={() => setActiveTab('library')}>
              角色库
            </NavButton>
            <NavButton active={activeTab === 'story'} icon={<PenTool className="h-4 w-4" />} onClick={() => setActiveTab('story')}>
              故事工作台
            </NavButton>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              {activeTab === 'chart' && (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <BaziWorkspace
                    chart={chart}
                    birthInput={birthInput}
                    profile={profile}
                    onChartGenerated={handleChartGenerated}
                    onProfileChange={setProfile}
                    onCharacterSaved={handleCharacterSaved}
                  />
                </motion.div>
              )}

              {activeTab === 'library' && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <CharacterLibrary
                    characters={characters}
                    primaryId={primaryId}
                    companionIds={companionIds}
                    loading={isLoadingCharacters}
                    error={libraryError}
                    onPrimaryChange={handlePrimaryChange}
                    onCompanionToggle={handleCompanionToggle}
                    onCharacterUpdated={handleCharacterUpdated}
                    onCharacterDeleted={handleCharacterDeleted}
                  />
                </motion.div>
              )}

              {activeTab === 'story' && (
                <motion.div
                  key="story"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <StoryWorkspace
                    characters={characters}
                    primaryId={primaryId}
                    companionIds={companionIds}
                    bonds={bonds}
                    onBondGenerated={handleBondGenerated}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavButton({
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
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
          : 'text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-200'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
