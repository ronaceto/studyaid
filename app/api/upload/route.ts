// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const sessionId = String(form.get("sessionId") || "");

  if (!(file instanceof Blob) || !sessionId) {
    return NextResponse.json({ error: "Bad upload" }, { status: 400 });
  }

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const dir = path.join(uploadDir, sessionId);
  await fs.mkdir(dir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}.jpg`;
  const full = path.join(dir, name);
  await fs.writeFile(full, buf);

  return NextResponse.json({ imageId: `${sessionId}/${name}` });
}
