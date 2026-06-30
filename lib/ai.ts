import { baziChartToPrompt } from './bazi';
import { BondStructure, BaziChart, CharacterBond, CharacterProfile, ScriptOutline, StoredCharacter, StoryInputs } from './types';

type DeepSeekMessage = {
  role: 'system' | 'user';
  content: string;
};

export async function generateCharacterProfile(chart: BaziChart): Promise<CharacterProfile> {
  return callDeepSeekJson<CharacterProfile>({
    maxTokens: 2200,
    messages: [
      {
        role: 'system',
        content: `你是一个精通八字命理的小说角色设计师。请严格返回 JSON，不要输出解释。
JSON 结构：
{
  "name": "角色姓名",
  "nameMeaning": "命名意象，不要出现代号",
  "appearance": "外貌与气质",
  "coreConflict": "核心欲望、恐惧与人物矛盾",
  "lifeStages": [
    { "stageName": "阶段名", "description": "命运基调与叙事用途" }
  ],
  "plotHooks": ["可用于故事的钩子"]
}`,
      },
      {
        role: 'user',
        content: `请根据以下命盘生成一个反俗套、有血有肉、适合小说主角或重要配角的角色档案。

${baziChartToPrompt(chart)}

要求：
1. 删除代号概念，只给真实姓名和命名意象。
2. 名字好听但克制，避开“傲天、琉璃、冷少、紫萱”等网文/古偶套路。
3. 将命理特征转译为人物行动逻辑、视觉气质和叙事冲突。
4. lifeStages 给 3-4 个阶段，plotHooks 给 4-6 条可直接用于故事的钩子。`,
      },
    ],
  });
}

export async function generateCharacterName(profile: CharacterProfile, chart: BaziChart) {
  return callDeepSeekJson<Pick<CharacterProfile, 'name' | 'nameMeaning'>>({
    maxTokens: 700,
    messages: [
      {
        role: 'system',
        content: `你是小说角色命名顾问。请严格返回 JSON：
{ "name": "新名字", "nameMeaning": "命名意象" }`,
      },
      {
        role: 'user',
        content: `请为这个角色换一个更好的中文姓名，不要改变角色本质。

当前名字：${profile.name}
当前命名意象：${profile.nameMeaning}
人物核心：${profile.coreConflict}
命盘：
${baziChartToPrompt(chart)}

要求：名字克制、辨识度高，不要古偶套路，不要代号。`,
      },
    ],
  });
}

export async function generateCharacterBond(
  primary: StoredCharacter,
  secondary: StoredCharacter,
  structure: BondStructure
): Promise<CharacterBond> {
  const bond = await callDeepSeekJson<Omit<CharacterBond, 'structure'>>({
    maxTokens: 1600,
    messages: [
      {
        role: 'system',
        content: `你是小说人物关系设计师。请严格返回 JSON，不要输出解释。
JSON 结构：
{
  "relationType": "关系类型",
  "summary": "一句话羁绊概述",
  "complementaryPoints": ["互补点"],
  "conflictPoints": ["冲突点"],
  "plotUse": ["剧情用途"],
  "triggerEvents": ["可触发关系变化的事件"]
}`,
      },
      {
        role: 'user',
        content: `请把两个角色的命格关系转化为可写故事的羁绊，不要堆命理术语，要让作者能直接拿去写。

主角：${primary.name}
${primary.profile.coreConflict}
${baziChartToPrompt(primary.baziChart)}

配角：${secondary.name}
${secondary.profile.coreConflict}
${baziChartToPrompt(secondary.baziChart)}

本地命格结构分析：
日主关系：${structure.dayMasterRelation}
共同五行：${structure.sharedElements.join('、') || '无'}
冲：${structure.clashes.join('、') || '无'}
合：${structure.combinations.join('、') || '无'}
五行互补：${structure.elementBalance}`,
      },
    ],
  });

  return {
    ...bond,
    structure,
  };
}

export async function generateStory(args: {
  mode: 'chapter' | 'outline';
  inputs: StoryInputs;
  primary: StoredCharacter;
  companions: StoredCharacter[];
  bonds: CharacterBond[];
}) {
  const castContext = [
    `主角：${args.primary.name}
${args.primary.profile.coreConflict}
${baziChartToPrompt(args.primary.baziChart)}`,
    ...args.companions.map(
      (character) => `配角：${character.name}
${character.profile.coreConflict}
${baziChartToPrompt(character.baziChart)}`
    ),
  ].join('\n\n');

  const bondContext = args.bonds
    .map((bond) => `${bond.relationType}：${bond.summary}
互补：${bond.complementaryPoints.join('；')}
冲突：${bond.conflictPoints.join('；')}
剧情用途：${bond.plotUse.join('；')}`)
    .join('\n\n');

  const userPrompt = `用户提供了以下故事设定：
世界观：${args.inputs.worldview}
角色当前流年节点：${args.inputs.annualNode}
章节起点：${args.inputs.startAnchor}
章节终点：${args.inputs.endAnchor}
本章核心事件：${args.inputs.coreEvent}

角色阵容：
${castContext}

命格羁绊：
${bondContext || '无配角羁绊，按单主角故事处理。'}

请让命理只作为底层结构，不要在正文或大纲里堆砌八字术语，除非用户设定本身明确包含命理元素。`;

  if (args.mode === 'chapter') {
    return callDeepSeekText({
      maxTokens: 4200,
      messages: [
        {
          role: 'system',
          content: '你是顶尖小说家。请直接输出 Markdown 格式的小说正文，不要添加解释。',
        },
        {
          role: 'user',
          content: `${userPrompt}

请写出一章完整故事，重点体现人物选择、关系张力和章节推进。`,
        },
      ],
    });
  }

  return callDeepSeekJson<ScriptOutline>({
    maxTokens: 2400,
    messages: [
      {
        role: 'system',
        content: `你是小说导演和结构设计师。请严格返回 JSON：
{
  "sceneSetting": "场景设定",
  "psychologicalTone": "角色心理基调",
  "beatSheet": [
    { "beat": "节拍名称", "description": "剧情描述" }
  ],
  "twistAlternatives": ["备选转折方案"]
}`,
      },
      {
        role: 'user',
        content: `${userPrompt}

请生成结构严密的导演剧本大纲，beatSheet 给 5-7 个节拍，twistAlternatives 给 3 个。`,
      },
    ],
  });
}

async function callDeepSeekJson<T>(args: { messages: DeepSeekMessage[]; maxTokens: number }): Promise<T> {
  const content = await callDeepSeekText({
    ...args,
    responseFormat: { type: 'json_object' },
  });
  return parseJsonFromModel<T>(content);
}

async function callDeepSeekText(args: {
  messages: DeepSeekMessage[];
  maxTokens: number;
  responseFormat?: { type: 'json_object' };
}) {
  const apiKey = getDeepSeekApiKey();
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: args.maxTokens,
      response_format: args.responseFormat,
      messages: args.messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek 请求失败：${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek 返回内容为空');
  }
  return content;
}

function parseJsonFromModel<T>(content: string): T {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
    : trimmed;
  try {
    return JSON.parse(jsonText) as T;
  } catch {
    const start = jsonText.indexOf('{');
    const end = jsonText.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(jsonText.slice(start, end + 1)) as T;
    }
    throw new Error('AI 返回的 JSON 无法解析');
  }
}

function getDeepSeekApiKey() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('缺少 DEEPSEEK_API_KEY 环境变量');
  }
  return apiKey;
}
