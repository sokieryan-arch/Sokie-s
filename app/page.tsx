'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scroll, PenTool, Sparkles } from 'lucide-react';
import CharacterEngine, { CharacterProfile } from '@/components/CharacterEngine';
import ScriptEngine from '@/components/ScriptEngine';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'character' | 'script'>('character');
  const [baziInput, setBaziInput] = useState('');
  const [profile, setProfile] = useState<CharacterProfile | null>(null);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800/50 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-zinc-100 tracking-wider">天机</h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Bazi Novel Engine</p>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('character')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'character'
                ? 'bg-zinc-900 text-amber-400 border border-zinc-800 shadow-lg shadow-black/50'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <Scroll className="w-4 h-4" />
            角色引擎
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'script'
                ? 'bg-zinc-900 text-amber-400 border border-zinc-800 shadow-lg shadow-black/50'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <PenTool className="w-4 h-4" />
            剧本引擎
          </button>
        </nav>

        <div className="mt-auto hidden md:block">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <p className="text-xs text-zinc-500 font-mono leading-relaxed">
              &quot;命理为骨，世界为肉。<br/>大运流年，皆是文章。&quot;
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'character' ? (
              <motion.div
                key="character"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CharacterEngine 
                  baziInput={baziInput}
                  setBaziInput={setBaziInput}
                  profile={profile}
                  setProfile={setProfile}
                />
              </motion.div>
            ) : (
              <motion.div
                key="script"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ScriptEngine profile={profile} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
