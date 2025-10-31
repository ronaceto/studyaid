import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const { topic } = await req.json();
  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a succinct tutor. Give one nudge, not a solution." },
      { role: "user", content: `Topic: ${topic}. Provide a single actionable hint.` }
    ]
  });
  return NextResponse.json({ ok: true, hint: r.choices[0]?.message?.content ?? "Try breaking it down." });
}
