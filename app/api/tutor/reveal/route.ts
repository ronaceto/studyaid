import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Provide a clear, correct solution plus a one-line why." },
      { role: "user", content: `Problem: ${prompt}` }
    ]
  });
  return NextResponse.json({ ok: true, reveal: r.choices[0]?.message?.content ?? "Here is a clean solution..." });
}
