// lib/openai.ts
import "server-only";
import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI() {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  client = new OpenAI({ apiKey });
  return client;
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function openaiChat(
  messages: ChatMessage[],
  opts?: { model?: string; temperature?: number }
) {
  const model = opts?.model ?? "gpt-4o-mini";
  const temperature = opts?.temperature ?? 0.3;

  const res = await getOpenAI().chat.completions.create({ model, temperature, messages });
  return (res.choices[0]?.message?.content ?? "").trim();
}
