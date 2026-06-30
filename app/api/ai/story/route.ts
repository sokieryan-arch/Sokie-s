import { NextResponse } from 'next/server';
import { generateStory } from '@/lib/ai';
import { jsonError } from '@/lib/http';
import { CharacterBond, StoredCharacter, StoryInputs } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: 'chapter' | 'outline';
      inputs?: StoryInputs;
      primary?: StoredCharacter;
      companions?: StoredCharacter[];
      bonds?: CharacterBond[];
    };
    if (!body.mode || !body.inputs || !body.primary) {
      return jsonError(new Error('缺少故事生成参数'), 400);
    }
    const result = await generateStory({
      mode: body.mode,
      inputs: body.inputs,
      primary: body.primary,
      companions: body.companions || [],
      bonds: body.bonds || [],
    });

    return NextResponse.json(
      body.mode === 'chapter' ? { storyContent: result } : { scriptOutline: result }
    );
  } catch (error) {
    return jsonError(error);
  }
}
