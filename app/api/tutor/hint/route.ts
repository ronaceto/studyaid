import { getOpenAI } from '@/lib/openai';
import { badRequest, parseJsonBody, serverError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';

    if (!topic) {
      return badRequest('Missing topic');
    }

    const r = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a succinct tutor. Give one nudge, not a solution.' },
        { role: 'user', content: `Topic: ${topic}. Provide a single actionable hint.` },
      ],
    });

    return NextResponse.json({ ok: true, hint: r.choices[0]?.message?.content ?? 'Try breaking it down.' });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Server error');
  }
}
