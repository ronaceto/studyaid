// lib/openai.ts
import "server-only";
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function openaiChat(
  messages: ChatMessage[],
  opts?: { model?: string; temperature?: number }
) {
  const model = opts?.model ?? "gpt-4o-mini";
  const temperature = opts?.temperature ?? 0.3;

  const res = await openai.chat.completions.create({ model, temperature, messages });
  // ALWAYS return a string
  return (res.choices[0]?.message?.content ?? "").trim();
}
