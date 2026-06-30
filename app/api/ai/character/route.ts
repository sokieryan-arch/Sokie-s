import { NextResponse } from 'next/server';
import { generateCharacterProfile } from '@/lib/ai';
import { jsonError } from '@/lib/http';
import { BaziChart } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { chart?: BaziChart };
    if (!body.chart) {
      return jsonError(new Error('缺少命盘信息'), 400);
    }
    const profile = await generateCharacterProfile(body.chart);
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
