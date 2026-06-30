import { NextResponse } from 'next/server';
import { generateCharacterBond } from '@/lib/ai';
import { analyzeBondStructure, createLocalBondFallback } from '@/lib/bonds';
import { jsonError } from '@/lib/http';
import { saveBond } from '@/lib/supabaseServer';
import { StoredCharacter } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      primary?: StoredCharacter;
      secondary?: StoredCharacter;
    };
    if (!body.primary || !body.secondary) {
      return jsonError(new Error('请选择两个角色'), 400);
    }

    const structure = analyzeBondStructure(body.primary.baziChart, body.secondary.baziChart);
    let aiWarning: string | undefined;
    let bond;
    try {
      bond = await generateCharacterBond(body.primary, body.secondary, structure);
    } catch (error) {
      aiWarning = error instanceof Error ? error.message : 'AI 羁绊生成失败，已使用本地结构结果';
      bond = createLocalBondFallback(body.primary, body.secondary);
    }

    let saved = null;
    let saveWarning: string | undefined;
    try {
      saved = await saveBond({
        characterAId: body.primary.id,
        characterBId: body.secondary.id,
        bond,
      });
    } catch (error) {
      saveWarning = error instanceof Error ? error.message : '羁绊保存失败';
    }

    return NextResponse.json({ bond, saved, aiWarning, saveWarning });
  } catch (error) {
    return jsonError(error);
  }
}
