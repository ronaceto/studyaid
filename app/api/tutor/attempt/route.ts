import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { attempt } = await req.json();
  return NextResponse.json({ ok: true, received: String(attempt ?? "") });
}
