"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";

type Item = { prompt: string; choices: string[]; answer: "A"|"B"|"C"|"D" };

export default function QuickQuiz() {
  const [topic, setTopic] = useState("Lord of the Flies");
  const [items, setItems] = useState<Item[]>([]);
  const [resp, setResp] = useState<Record<number,string>>({});
  const [score, setScore] = useState<number|null>(null);

  async function gen() {
    const r = await fetch("/api/quick-quiz/create", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ topic, count: 5 })
    });
    const j = await r.json();
    setItems(j.quiz?.items ?? []);
    setResp({}); setScore(null);
  }

  function submit() {
    const s = items.reduce(
      (acc, it, i) => acc + ((resp[i] ?? "") === it.answer ? 1 : 0), 0
    );
    setScore(s);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Quick Quiz</h1>
      <div className="flex gap-2">
        <input className="border p-2 flex-1" value={topic}
               onChange={e=>setTopic(e.target.value)} />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={gen}>
          Generate
        </button>
      </div>
      <div className="space-y-4">
        {items.map((q, i) => (
          <div key={i} className="border p-4 rounded-xl space-y-2">
            <div className="font-medium">{i+1}. {q.prompt}</div>
            {q.choices.map((c, idx) => {
              const letter = ["A","B","C","D"][idx] as "A"|"B"|"C"|"D";
              return (
                <label key={idx} className="flex items-center gap-2">
                  <input type="radio" name={`q${i}`} value={letter}
                         onChange={(e)=>setResp(r=>({...r,[i]:e.target.value}))}
                         checked={resp[i] === letter}/>
                  <span>{letter}. {c}</span>
                </label>
              );
            })}
          </div>
        ))}
        {items.length > 0 && (
          <>
            <button className="px-3 py-2 rounded bg-indigo-700 text-white"
                    onClick={submit}>Submit</button>
            {score !== null &&
              <div className="text-lg font-semibold">
                Score: {score} / {items.length}
              </div>}
          </>
        )}
      </div>
    </div>
  );
}
