import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const { attempt } = await req.json(); // send attempt back from client for now
  if (!attempt) return NextResponse.json({ ok: false, error: "No attempt provided" }, { status: 400 });
  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Give 1–2 targeted improvements. Be brief." },
      { role: "user", content: String(attempt) }
    ]
  });
  return NextResponse.json({ ok: true, reflection: r.choices[0]?.message?.content ?? "Consider your assumptions." });
}
