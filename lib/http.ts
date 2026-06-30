import { NextResponse } from 'next/server';

export function jsonError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : '请求失败' },
    { status }
  );
}
