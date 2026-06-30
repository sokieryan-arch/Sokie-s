import { NextResponse } from 'next/server';
import { deleteCharacter, updateCharacter } from '@/lib/supabaseServer';
import { jsonError } from '@/lib/http';
import { BaziChart, BirthInput, CharacterProfile } from '@/lib/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      birthInput?: BirthInput;
      baziChart?: BaziChart;
      profile?: CharacterProfile;
    };
    const character = await updateCharacter(id, body);
    return NextResponse.json({ character });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteCharacter(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
