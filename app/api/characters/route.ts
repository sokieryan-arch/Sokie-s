import { NextResponse } from 'next/server';
import { createCharacter, listCharacters } from '@/lib/supabaseServer';
import { jsonError } from '@/lib/http';
import { BaziChart, BirthInput, CharacterProfile } from '@/lib/types';

export async function GET() {
  try {
    const characters = await listCharacters();
    return NextResponse.json({ characters });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      birthInput?: BirthInput;
      baziChart?: BaziChart;
      profile?: CharacterProfile;
    };
    if (!body.birthInput || !body.baziChart || !body.profile) {
      return jsonError(new Error('缺少角色保存参数'), 400);
    }
    const name = body.name || body.profile.name;
    const character = await createCharacter({
      name,
      birthInput: body.birthInput,
      baziChart: body.baziChart,
      profile: {
        ...body.profile,
        name,
      },
    });
    return NextResponse.json({ character });
  } catch (error) {
    return jsonError(error);
  }
}
