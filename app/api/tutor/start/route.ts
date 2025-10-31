import { NextResponse } from "next/server";

export async function POST() {
  // generate a pseudo session id; replace with Prisma later
  const sessionId = "sess_" + Math.random().toString(36).slice(2, 10);
  return NextResponse.json({ ok: true, sessionId });
}
