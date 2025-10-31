// app/library/page.tsx
import "server-only";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const skills = await prisma.skill.findMany({ orderBy: [{ subject: "asc" }, { title: "asc" }] });
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Skill Library</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skills.map(s => (
          <li key={s.id} className="border rounded-lg p-3 bg-white">
            <div className="font-medium">{s.title}</div>
            <div className="text-xs text-gray-600 mb-2">{s.subject} · Grade {s.grade}</div>
            <Link className="text-[#702E3D] underline" href={`/study/${s.id}`}>Study this</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
