// app/api/sessions/[id]/route.ts
import { NextResponse } from "next/server";
import "server-only";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: { turns: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const turns = session.turns.map(t => ({
    id: t.id,
    actor: t.actor,
    type: t.type,
    content: t.content,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ sessionId: session.id, turns });
}
