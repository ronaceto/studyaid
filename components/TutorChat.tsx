// components/TutorChat.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Turn = {
  id: string;
  actor: "STUDENT" | "TUTOR";
  type: "QUESTION" | "HINT" | "ATTEMPT" | "SOLUTION" | "FEEDBACK";
  content: string;
  createdAt: string;
};

export default function TutorChat({ sessionId }: { sessionId: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [reflection, setReflection] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageId, setImageId] = useState<string | undefined>(undefined);
  const scroller = useRef<HTMLDivElement>(null);

  const fetchTurns = async () => {
    const r = await fetch(`/api/sessions/${sessionId}`);
    if (r.ok) {
      const json = await r.json();
      setTurns(json.turns);
    }
  };

  useEffect(() => {
    fetchTurns();
    const t = setInterval(fetchTurns, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const send = async (payload: any) => {
    const r = await fetch("/api/tutor/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...payload }),
    });
    if (r.ok) {
      await fetchTurns();
      setText("");
    } else {
      const j = await r.json().catch(() => ({}));
      alert(j.error ?? "Tutor error");
    }
  };

  const onAttempt = async () => {
    await send({ action: "attempt", studentText: text, imageId });
    setImageId(undefined);
    setReflection("");
  };
  const onHint = async () => send({ action: "hint" });
  const onStuck = async () => send({ action: "stuck" });
  const onReveal = async () => send({ action: "reveal", reflection });

  const onUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("sessionId", sessionId);
    setUploading(true);
    try {
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (r.ok) setImageId(j.imageId);
      else alert(j.error ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const hasAttempt = turns.some(t => t.type === "ATTEMPT");
  const canReveal = hasAttempt;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div ref={scroller} className="h-[60vh] overflow-y-auto rounded-xl border p-4 bg-white">
        {turns.map(t => (
          <div key={t.id} className={`mb-3 ${t.actor === "STUDENT" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block px-3 py-2 rounded-2xl whitespace-pre-wrap ${
                t.actor === "STUDENT"
                  ? "bg-gray-100"
                  : t.type === "SOLUTION"
                  ? "bg-[#702E3D] text-white no-copy"
                  : "bg-[#E7E7E7]"
              }`}
              title={`${t.type}`}
            >
              {t.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your attempt or steps…"
          className="flex-1 border rounded-lg p-2 min-h-[70px]"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
          <span className="px-3 py-2 rounded-lg border">{uploading ? "Uploading…" : "Add work photo"}</span>
        </label>
        {imageId && <span className="text-sm text-gray-600">Attached: {imageId.split("/").pop()}</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={onAttempt} className="px-4 py-2 rounded-lg bg-[#702E3D] text-white">Submit attempt</button>
        <button onClick={onHint} className="px-4 py-2 rounded-lg border">Hint</button>
        <button onClick={onStuck} className="px-4 py-2 rounded-lg border">I’m stuck</button>
      </div>

      <div className="border rounded-lg p-3 bg-gray-50">
        <p className="text-sm mb-2">To reveal a full worked solution, write one sentence reflecting on where you got stuck.</p>
        <input
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Example: I lost track when combining like terms…"
          className="w-full border rounded p-2 mb-2"
        />
        <button
          onClick={onReveal}
          disabled={!canReveal || reflection.trim().length < 10}
          className={`px-4 py-2 rounded-lg ${canReveal && reflection.trim().length >= 10 ? "bg-black text-white" : "bg-gray-300 text-gray-600"}`}
          title={!canReveal ? "Make an honest attempt first" : ""}
        >
          Reveal worked solution
        </button>
      </div>

      <style>{`.no-copy { user-select: none; }`}</style>
    </div>
  );
}
