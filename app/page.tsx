// app/page.tsx
import "server-only";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Study Aid",
  description: "Carsyn’s guardrailed tutor",
};

export default async function HomePage() {
  // Pull all skills and group by subject
  const skills = await prisma.skill.findMany({
    orderBy: [{ subject: "asc" }, { title: "asc" }],
  });

  const bySubject = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.subject] ||= []).push(s);
    return acc;
  }, {});

  const subjectsOrder = ["MATH", "SCIENCE", "STEM_FLIGHT_SPACE", "SOCIAL_STUDIES", "LANGUAGE_ARTS"];

  return (
    <div className="space-y-8">
      {/* Features */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-xl font-semibold mb-2">Attempt-First Learning</div>
          <p className="text-sm text-gray-600">
            Students must try first. No answers until a genuine attempt or help is requested.
          </p>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-xl font-semibold mb-2">Socratic Guidance</div>
          <p className="text-sm text-gray-600">
            One hint at a time. Strategic questions build understanding without giving away answers.
          </p>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-xl font-semibold mb-2">Parent Insights</div>
          <p className="text-sm text-gray-600">
            Time on task, attempts, and accuracy by skill—full visibility.
          </p>
        </div>
      </div>

      {/* Subjects Covered (now clickable) */}
      <div className="rounded-xl p-5 bg-[#702E3D] text-white">
        <h2 className="text-2xl font-semibold mb-4">Subjects Covered</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjectsOrder
            .filter((subj) => bySubject[subj]?.length)
            .map((subj) => (
              <div key={subj}>
                <div className="font-semibold mb-2">
                  {subj === "STEM_FLIGHT_SPACE" ? "STEM: Flight & Space" :
                   subj.replace("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase())}
                </div>
                <ul className="space-y-1">
                  {bySubject[subj].map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/study/${s.id}`}
                        className="underline underline-offset-2 hover:no-underline"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <div className="mt-6">
          <Link
            href="/library"
            className="inline-block bg-white text-[#702E3D] px-3 py-2 rounded-lg"
          >
            View Full Library →
          </Link>
        </div>
      </div>
    </div>
  );
}
