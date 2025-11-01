import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// We need Node runtime for fs access
export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const sessionId = String(form.get("sessionId") || "");

  if (!(file instanceof Blob) || !sessionId) {
    return NextResponse.json({ error: "Bad upload" }, { status: 400 });
  }

  // Use /tmp on Netlify (ephemeral, but writable); local 'uploads' in dev
  const baseDir = process.env.NETLIFY
    ? "/tmp/uploads"
    : path.join(process.cwd(), "uploads");

  const targetDir = path.join(baseDir, sessionId);
  await fs.promises.mkdir(targetDir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}.jpg`;
  const target = path.join(targetDir, filename);

  await fs.promises.writeFile(target, buf);

  return NextResponse.json({ ok: true, imageId: `${sessionId}/${filename}` });
}
