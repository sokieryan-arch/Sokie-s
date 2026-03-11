'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Clapperboard, BookOpen, Map, Clock, Target, Flag, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CharacterProfile } from './CharacterEngine';

interface ScriptOutline {
  sceneSetting: string;
  psychologicalTone: string;
  beatSheet: {
    beat: string;
    description: string;
  }[];
  twistAlternatives: string[];
}

interface ScriptEngineProps {
  profile: CharacterProfile | null;
}

export default function ScriptEngine({ profile }: ScriptEngineProps) {
  const [inputs, setInputs] = useState({
    worldview: '',
    annualNode: '',
    startAnchor: '',
    endAnchor: '',
    coreEvent: '',
  });
  const [mode, setMode] = useState<'1' | '2'>('2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyContent, setStoryContent] = useState<string | null>(null);
  const [scriptOutline, setScriptOutline] = useState<ScriptOutline | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const profileContext = profile ? `
当前角色档案：
真名与代号：${profile.nameAndCode}
外貌与气质：${profile.appearance}
核心矛盾：${profile.coreConflict}
大运流年趋势：${profile.lifeStages.map(s => `${s.stageName}: ${s.description}`).join('\n')}
` : '';

  const handleGenerate = async () => {
    if (!inputs.worldview || !inputs.annualNode || !inputs.startAnchor || !inputs.endAnchor || !inputs.coreEvent) {
      setError('请填写所有必填字段');
      return;
    }

    setIsGenerating(true);
    setError('');
    setStoryContent(null);
    setScriptOutline(null);

    try {
      if (mode === '1') {
        // 模式一：生成完整章节（纯文本）
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            max_tokens: 4000,
            messages: [
              {
                role: 'system',
                content: '你是一个精通八字命理的顶尖小说家。请直接输出Markdown格式的小说正文，不要添加任何解释或说明。'
              },
              {
                role: 'user',
                content: `用户提供了以下设定：
世界观：${inputs.worldview}
角色当前流年节点：${inputs.annualNode}
章节起点：${inputs.startAnchor}
章节终点：${inputs.endAnchor}
本章核心事件：${inputs.coreEvent}
${profileContext}

请在如此复杂的条件共同作用下，直接为用户写出一章完整的故事。
故事的起伏和角色的行为逻辑需要暗合角色在当前流年节点下的命运起伏，以及与世界观的融合。
【重要警告】：除非用户的世界观或事件中明确包含命理元素，否则在生成的小说正文中**绝对不要**出现任何命理术语（如"七杀"、"流年"、"八字"等）。讲故事就专注讲故事，命理只作为你构思情节的底层逻辑。
输出一段完整的Markdown格式的小说正文。`
              }
            ],
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `请求失败：${response.status}`);
        }

        const data = await response.json();
        setStoryContent(data.choices?.[0]?.message?.content || '');

      } else {
        // 模式二：生成导演剧本（JSON）
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
                content: `你是一个精通八字命理的顶尖小说家和导演。请严格按照以下JSON格式返回导演剧本大纲，不要输出任何额外内容：
{
  "sceneSetting": "场景设定：结合世界观，搭建本章的环境氛围（字符串）",
  "psychologicalTone": "角色心理基调：结合该角色此时的流年运势，分析他面对突发事件的潜意识反应（字符串）",
  "beatSheet": [
    { "beat": "节拍名称（如：事件发生、角色应对、意外阻碍、结尾悬念）", "description": "剧情描述" }
  ],
  "twistAlternatives": ["备选转折方案1", "备选转折方案2", "备选转折方案3"]
}`
              },
              {
                role: 'user',
                content: `用户提供了以下设定：
世界观：${inputs.worldview}
角色当前流年节点：${inputs.annualNode}
章节起点：${inputs.startAnchor}
章节终点：${inputs.endAnchor}
本章核心事件：${inputs.coreEvent}
${profileContext}

请为用户创作故事脚本大纲（骨架先行，留白血肉）。你只负责生成结构严密、充满戏剧张力的"导演剧本大纲"，绝不代替作者撰写具体的文学描写和对话（禁止水字数）。
【重要警告】：除非用户的世界观或事件中明确包含命理元素，否则在生成的大纲和剧情描述中**绝对不要**出现任何命理术语。命理参数仅作为你构思情节走向和角色心理的底层逻辑，请专注于故事本身的戏剧张力和逻辑。`
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
          setScriptOutline(parsed);
        } else {
          throw new Error('返回内容为空');
        }
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
        <h2 className="font-serif text-3xl font-light text-zinc-100">剧本引擎 <span className="text-amber-500/50 italic text-2xl">Script Generation</span></h2>
        <p className="text-zinc-500 text-sm">提供世界观与流年节点，AI将为您构建充满戏剧张力的故事骨架或完整章节。</p>
        {!profile && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>提示：您还没有生成角色档案。建议先在"角色引擎"中生成角色，剧本将更加贴合人物命运。</span>
          </div>
        )}
        {profile && (
          <div className="mt-4 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-zinc-300 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            <span>当前角色：<span className="font-serif text-amber-400">{profile.nameAndCode}</span></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm space-y-5">

          <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800">
            <button
              onClick={() => setMode('1')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === '1' ? 'bg-zinc-800 text-amber-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              模式一：生成完整章节
            </button>
            <button
              onClick={() => setMode('2')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === '2' ? 'bg-zinc-800 text-amber-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              模式二：生成导演剧本
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                <Map className="w-3.5 h-3.5" /> 世界观 (Worldview)
              </label>
              <textarea
                name="worldview"
                value={inputs.worldview}
                onChange={handleInputChange}
                placeholder="例如：赛博朋克修仙界，灵气被大公司垄断..."
                className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  <Clock className="w-3.5 h-3.5" /> 流年节点 (Annual Node)
                </label>
                <input
                  type="text"
                  name="annualNode"
                  value={inputs.annualNode}
                  onChange={handleInputChange}
                  placeholder="例如：甲辰年，七杀攻身"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  <Target className="w-3.5 h-3.5" /> 章节起点 (Start Anchor)
                </label>
                <input
                  type="text"
                  name="startAnchor"
                  value={inputs.startAnchor}
                  onChange={handleInputChange}
                  placeholder="例如：主角在贫民窟醒来"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  <Flag className="w-3.5 h-3.5" /> 章节终点 (End Anchor)
                </label>
                <input
                  type="text"
                  name="endAnchor"
                  value={inputs.endAnchor}
                  onChange={handleInputChange}
                  placeholder="例如：获得神秘义体"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  <Clapperboard className="w-3.5 h-3.5" /> 核心事件 (Core Event)
                </label>
                <textarea
                  name="coreEvent"
                  value={inputs.coreEvent}
                  onChange={handleInputChange}
                  placeholder="例如：公司雇佣兵突袭贫民窟，主角被迫反击..."
                  className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              {isGenerating ? '创作中...' : '生成剧本'}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-6 min-h-[500px] overflow-y-auto">
          {!storyContent && !scriptOutline && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
              <Clapperboard className="w-12 h-12 opacity-20" />
              <p className="text-sm">等待生成内容...</p>
            </div>
          )}

          {isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-amber-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-mono animate-pulse">正在推演天机...</p>
            </div>
          )}

          {storyContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-zinc-300 prose-headings:font-serif prose-headings:text-zinc-100"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{storyContent}</ReactMarkdown>
            </motion.div>
          )}

          {scriptOutline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="border-l-2 border-amber-500 pl-4">
                  <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-1">场景设定</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{scriptOutline.sceneSetting}</p>
                </div>
                <div className="border-l-2 border-blue-500 pl-4">
                  <h3 className="text-xs font-mono text-blue-500 uppercase tracking-widest mb-1">角色心理基调</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{scriptOutline.psychologicalTone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clapperboard className="w-4 h-4" /> 剧情节拍器 (Beat Sheet)
                </h3>
                <div className="space-y-4">
                  {scriptOutline.beatSheet.map((beat, idx) => (
                    <div key={idx} className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif text-zinc-100 font-bold">{beat.beat}</span>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{beat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" /> 备选转折方案
                </h3>
                <ul className="space-y-2">
                  {scriptOutline.twistAlternatives.map((twist, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                      <span className="text-amber-500 font-mono">{idx + 1}.</span>
                      <span className="leading-relaxed">{twist}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
