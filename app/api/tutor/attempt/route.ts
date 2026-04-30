import { NextResponse } from 'next/server';
import { parseJsonBody } from '@/lib/api';

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  const attempt = typeof body.attempt === 'string' ? body.attempt : String(body.attempt ?? '');
  return NextResponse.json({ ok: true, received: attempt.trim() });
}
