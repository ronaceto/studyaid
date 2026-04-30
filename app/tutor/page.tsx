'use client';

import { useState } from 'react';
import Link from 'next/link';

type ApiState = {
  sessionId?: string;
  hint?: string;
  reflection?: string;
  reveal?: string;
  receivedAttempt?: string;
  error?: string;
};

const stepLinks = ['hint', 'attempt', 'reflection', 'reveal'] as const;

export default function TutorPage() {
  const [topic, setTopic] = useState('Shakespeare sonnets');
  const [attempt, setAttempt] = useState('');
  const [prompt, setPrompt] = useState('Explain the central metaphor in Sonnet 18.');
  const [loading, setLoading] = useState<string | null>(null);
  const [state, setState] = useState<ApiState>({});

  async function callApi(path: string, payload: Record<string, unknown>, loadingKey: string) {
    setLoading(loadingKey);
    setState((prev) => ({ ...prev, error: undefined }));

    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }
      setState((prev) => ({
        ...prev,
        sessionId: json.sessionId ?? prev.sessionId,
        hint: json.hint ?? prev.hint,
        reflection: json.reflection ?? prev.reflection,
        reveal: json.reveal ?? prev.reveal,
        receivedAttempt: json.received ?? prev.receivedAttempt,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : 'Unexpected error' }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Tutor Flow</h1>
      <p className="text-muted-foreground">Functional scaffold wired to tutor APIs for start, hint, attempt, reflection, and reveal.</p>

      <section className="rounded-lg border p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button className="rounded border px-3 py-1" onClick={() => callApi('/api/tutor/start', {}, 'start')}>
            {loading === 'start' ? 'Starting…' : 'Start Session'}
          </button>
          <button className="rounded border px-3 py-1" onClick={() => callApi('/api/tutor/hint', { topic }, 'hint')}>
            {loading === 'hint' ? 'Loading hint…' : 'Get Hint'}
          </button>
          <button className="rounded border px-3 py-1" onClick={() => callApi('/api/tutor/attempt', { attempt }, 'attempt')}>
            {loading === 'attempt' ? 'Saving…' : 'Submit Attempt'}
          </button>
          <button className="rounded border px-3 py-1" onClick={() => callApi('/api/tutor/reflection', { attempt }, 'reflection')}>
            {loading === 'reflection' ? 'Reflecting…' : 'Get Reflection'}
          </button>
          <button className="rounded border px-3 py-1" onClick={() => callApi('/api/tutor/reveal', { prompt }, 'reveal')}>
            {loading === 'reveal' ? 'Revealing…' : 'Reveal Answer'}
          </button>
        </div>

        <label className="block text-sm">Topic</label>
        <input className="w-full rounded border px-3 py-2" value={topic} onChange={(e) => setTopic(e.target.value)} />

        <label className="block text-sm">Your attempt</label>
        <textarea className="w-full rounded border px-3 py-2 min-h-[100px]" value={attempt} onChange={(e) => setAttempt(e.target.value)} />

        <label className="block text-sm">Prompt for reveal</label>
        <input className="w-full rounded border px-3 py-2" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </section>

      <section className="rounded-lg border p-4 space-y-2 text-sm">
        <p><strong>Session:</strong> {state.sessionId || '—'}</p>
        <p><strong>Saved attempt:</strong> {state.receivedAttempt || '—'}</p>
        <p><strong>Hint:</strong> {state.hint || '—'}</p>
        <p><strong>Reflection:</strong> {state.reflection || '—'}</p>
        <p><strong>Reveal:</strong> {state.reveal || '—'}</p>
        {state.error ? <p className="text-red-600"><strong>Error:</strong> {state.error}</p> : null}
      </section>

      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Direct route checks:</p>
        <ul className="flex gap-4 text-sm underline">
          {stepLinks.map((slug) => (
            <li key={slug}>
              <Link href={`/tutor/${slug}`}>/tutor/{slug}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
