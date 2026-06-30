import { NextResponse } from 'next/server';
import { generateCharacterName } from '@/lib/ai';
import { jsonError } from '@/lib/http';
import { BaziChart, CharacterProfile } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile?: CharacterProfile;
      chart?: BaziChart;
    };
    if (!body.profile || !body.chart) {
      return jsonError(new Error('缺少角色档案或命盘信息'), 400);
    }
    const name = await generateCharacterName(body.profile, body.chart);
    return NextResponse.json(name);
  } catch (error) {
    return jsonError(error);
  }
}
