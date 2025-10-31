// app/api/tutor/turn/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openaiChat, type ChatMessage } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { sessionId, kind, attempt, reflection } = await req.json();

    // guard: session exists
    const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { skill: true } });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // helper to ensure we never pass empty content to Prisma
    const ensure = (s: string | undefined | null, fallback: string) =>
      (s ?? "").trim().length ? (s as string).trim() : fallback;

    if (kind === "HINT") {
      // build minimal messages from latest attempt (or lack thereof)
      const messages: ChatMessage[] = [
        {
          role: "system",
          content:
            "You are a strict, encouraging tutor. Give ONE short hint, no steps or answers. If no attempt, nudge the student to try first.",
        },
        {
          role: "user",
          content:
            attempt?.trim().length
              ? `Student attempt:\n${attempt}\n\nGive ONE next hint only.`
              : "No attempt yet. Give a brief nudge to attempt the problem first.",
        },
      ];

      const modelText = await openaiChat(messages, { temperature: 0.2 });
      const content = ensure(
        modelText,
        "Try something first: restate the question in your own words and write your first idea. I’ll help after that."
      );

      const turn = await prisma.turn.create({
        data: { sessionId, actor: "TUTOR", type: "HINT", content },
      });

      return NextResponse.json({ turn });
    }

    if (kind === "SOLUTION") {
      // require a reflection before solution
      const messages: ChatMessage[] = [
        {
          role: "system",
          content:
            "Provide a short worked solution. Be concise, show key steps, and end with a quick check. No extra commentary.",
        },
        {
          role: "user",
          content:
            `Problem context: ${session.skill?.title ?? "Skill"} (subject ${session.skill?.subject ?? "N/A"})\n` +
            `Student reflection: ${reflection ?? "(none)"}\n` +
            `Provide the worked solution now.`,
        },
      ];

      const modelText = await openaiChat(messages, { temperature: 0.2 });
      const content = ensure(
        modelText,
        "Worked solution unavailable. Tell me exactly what you tried and where it went off track."
      );

      const turn = await prisma.turn.create({
        data: { sessionId, actor: "TUTOR", type: "SOLUTION", content },
      });

      return NextResponse.json({ turn });
    }

    // Unknown kind
    return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  } catch (err: any) {
    console.error("tutor/turn error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
