// app/parent/page.tsx
import { prisma } from "../../lib/prisma";

// Keep types minimal to match your actual schema right now
type SessionRow = {
  id: string;
  userId: string;
  skillId: string;          // not nullable per your error output
  mode: string | null;      // if Mode enum exists, we can tighten later
  startedAt: Date;
  completedAt: Date | null;
  status: string | null;    // if SessionStatus enum exists, we can tighten later
};

export default async function ParentPage() {
  // 1) Use only fields that exist; order by startedAt (exists) not createdAt/updatedAt
  const sessions: SessionRow[] = await prisma.session.findMany({
    orderBy: { startedAt: "desc" as const },
    select: {
      id: true,
      userId: true,
      skillId: true,
      mode: true,
      startedAt: true,
      completedAt: true,
      status: true,
    },
  });

  // 2) Resolve skill titles (Skill has id/title, not name)
  const skillIds = Array.from(
    new Set(
      sessions
        .map((s) => s.skillId)
        .filter((x): x is string => typeof x === "string" && x.length > 0)
    )
  );

  const skills =
    skillIds.length > 0
      ? await prisma.skill.findMany({
          where: { id: { in: skillIds } },
          select: { id: true, title: true }, // title exists per your types
        })
      : [];

  const skillTitleById = new Map<string, string>(
    skills.map((s: { id: string; title: string }) => [s.id, s.title])
  );

  const getSkillTitle = (id: string | null | undefined) =>
    id ? String(skillTitleById.get(id) ?? id) : "—";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>
      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="border p-4 rounded-xl">
            <div className="font-medium">Session: {s.id}</div>
            <div>User: {s.userId}</div>
            <div>Skill: {getSkillTitle(s.skillId)}</div>
            <div>Mode: {s.mode ?? "—"}</div>
            <div>Status: {s.status ?? "—"}</div>
            <div>Started: {new Date(s.startedAt).toLocaleString()}</div>
            <div>
              Completed:{" "}
              {s.completedAt ? new Date(s.completedAt).toLocaleString() : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
