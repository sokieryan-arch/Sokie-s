'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, User, Eye, Heart, Activity, Sparkles } from 'lucide-react';

export interface CharacterProfile {
  nameAndCode: string;
  appearance: string;
  coreConflict: string;
  lifeStages: {
    stageName: string;
    description: string;
  }[];
}

interface CharacterEngineProps {
  baziInput: string;
  setBaziInput: (val: string) => void;
  profile: CharacterProfile | null;
  setProfile: (val: CharacterProfile | null) => void;
}

export default function CharacterEngine({ baziInput, setBaziInput, profile, setProfile }: CharacterEngineProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!baziInput.trim()) {
      setError('请输入八字命理参数');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 2000,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `你是一个精通八字命理的小说角色设计大师。请严格按照以下JSON格式返回角色档案，不要输出任何额外内容：
{
  "nameAndCode": "真名与代号及释义（字符串）",
  "appearance": "外貌与气质描写（字符串）",
  "coreConflict": "核心矛盾分析（字符串）",
  "lifeStages": [
    { "stageName": "阶段名称", "description": "命运基调描述" }
  ]
}`
            },
            {
              role: 'user',
              content: `用户输入了一个八字命理参数：${baziInput}

请根据该参数，生成一个角色档案。
要求：
1. [真名与代号]：名字既要好听，又不能落俗套。禁止使用任何带有"傲天、琉璃、冷少、紫萱"等典型网文风、古偶风的字眼。命名可以结合古典诗词、少数民族音译、或者具有冷峻金属感的科幻翻译腔。
2. [外貌与气质]：将命理特征转化为视觉描写（例如：将"七杀"转化为"眉骨高耸，眼神带有常年处于高度戒备状态的冷漠"）。
3. [核心矛盾]：角色内心最深层的欲望与恐惧（由命理格局决定）。
4. [大运流年趋势]：划分该角色一生的3-4个关键阶段（如潜伏期、巅峰期、劫难期），并指出每个阶段的命运基调。`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `请求失败：${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        const parsed = JSON.parse(text);
        setProfile(parsed);
      } else {
        throw new Error('返回内容为空');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-light text-zinc-100">角色引擎 <span className="text-amber-500/50 italic text-2xl">Character Generation</span></h2>
        <p className="text-zinc-500 text-sm">输入八字命理参数，AI将为您推演出一个反俗套、有血有肉的角色档案。</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
          命理参数 (Bazi Parameters)
        </label>
        <textarea
          value={baziInput}
          onChange={(e) => setBaziInput(e.target.value)}
          placeholder="例如：癸水生于子月，透出辛金，七杀格。八字偏寒，金水相生..."
          className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? '推演中...' : '开始推演'}
          </button>
        </div>
      </div>

      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <User className="w-5 h-5" />
                <h3 className="font-serif text-lg">真名与代号</h3>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">{profile.nameAndCode}</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <Eye className="w-5 h-5" />
                <h3 className="font-serif text-lg">外貌与气质</h3>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">{profile.appearance}</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <Heart className="w-5 h-5" />
                <h3 className="font-serif text-lg">核心矛盾</h3>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">{profile.coreConflict}</p>
            </div>
          </div>

          {/* Right Column: Life Stages */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-8 text-amber-500">
                <Activity className="w-5 h-5" />
                <h3 className="font-serif text-lg">大运流年趋势</h3>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                {profile.lifeStages.map((stage, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 bg-amber-500/20 text-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <span className="font-mono text-xs">{index + 1}</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-800/50 bg-zinc-950/50 shadow-sm transition-all hover:bg-zinc-900/80">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-zinc-100 font-serif">{stage.stageName}</div>
                      </div>
                      <div className="text-zinc-400 text-sm leading-relaxed">{stage.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
