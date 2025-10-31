import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const count = Number.isFinite(body.count) ? Math.max(1, Math.min(10, body.count)) : 5;
    if (!topic) return NextResponse.json({ ok:false, error:"Missing topic" }, { status:400 });

    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return strict JSON: items:[{prompt, choices:[A,B,C,D], answer:'A'|'B'|'C'|'D'}]" },
        { role: "user", content: `Create ${count} concise MCQs for "${topic}". JSON only.` }
      ],
      response_format: { type: "json_object" }
    });

    let items: any[] = [];
    try {
      const payload = JSON.parse(r.choices[0]?.message?.content ?? "{}");
      items = Array.isArray(payload.items) ? payload.items : [];
    } catch {}
    return NextResponse.json({ ok: true, quiz: { title: `Quick Quiz: ${topic}`, items } });
  } catch (err:any) {
    return NextResponse.json({ ok:false, error: err?.message ?? "Server error" }, { status:500 });
  }
}