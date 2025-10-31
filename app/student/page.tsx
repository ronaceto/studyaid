// app/student/page.tsx
import { prisma } from "../../lib/prisma";

type SessionRow = {
  id: string;
  userId: string;
  skillId: string;
  mode: string | null;
  startedAt: Date;
  completedAt: Date | null;
  status: string | null;
};

export default async function StudentPage() {
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
          select: { id: true, title: true },
        })
      : [];

  const skillTitleById = new Map<string, string>(
    skills.map((s: { id: string; title: string }) => [s.id, s.title])
  );

  const getSkillTitle = (id: string | null | undefined) =>
    id ? String(skillTitleById.get(id) ?? id) : "—";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Student Sessions</h1>
      <ul className="space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="border p-4 rounded-xl">
            <div className="font-semibold">{getSkillTitle(s.skillId)}</div>
            <div className="text-sm opacity-80">Session: {s.id}</div>
            <div className="text-sm opacity-80">
              Started: {new Date(s.startedAt).toLocaleString()}
            </div>
            <div className="text-sm opacity-80">Status: {s.status ?? "—"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
