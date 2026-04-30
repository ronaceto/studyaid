import { getOpenAI } from '@/lib/openai';
import { badRequest, parseJsonBody, serverError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const attempt = typeof body.attempt === 'string' ? body.attempt.trim() : '';

    if (!attempt) {
      return badRequest('No attempt provided');
    }

    const r = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Give 1–2 targeted improvements. Be brief.' },
        { role: 'user', content: attempt },
      ],
    });

    return NextResponse.json({ ok: true, reflection: r.choices[0]?.message?.content ?? 'Consider your assumptions.' });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Server error');
  }
}
