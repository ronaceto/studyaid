import { NextResponse } from 'next/server';

export async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  const parsed = await req.json().catch(() => ({}));
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return {};
}

export function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export function serverError(error = 'Server error') {
  return NextResponse.json({ ok: false, error }, { status: 500 });
}
