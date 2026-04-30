import { getOpenAI } from '@/lib/openai';
import { badRequest, parseJsonBody, serverError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return badRequest('Missing prompt');
    }

    const r = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Provide a clear, correct solution plus a one-line why.' },
        { role: 'user', content: `Problem: ${prompt}` },
      ],
    });

    return NextResponse.json({ ok: true, reveal: r.choices[0]?.message?.content ?? 'Here is a clean solution...' });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Server error');
  }
}
