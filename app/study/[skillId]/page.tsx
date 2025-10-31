// app/study/[skillId]/page.tsx
import "server-only";
import { prisma } from "@/lib/prisma";
import TutorChat from "@/components/TutorChat";

export default async function StudyPage({ params }: { params: { skillId: string } }) {
  // TODO: replace with real auth; for now use a single dev user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { email: "student@example.com", role: "STUDENT", name: "Student" } });
  }

  const skill = await prisma.skill.findUnique({ where: { id: params.skillId } });
  if (!skill) {
    return <div className="p-6">Unknown skill.</div>;
  }

  // Get or create a session for this user+skill
  let session = await prisma.session.findFirst({ where: { userId: user.id, skillId: skill.id, status: "ACTIVE" } });
  if (!session) {
    session = await prisma.session.create({
      data: { userId: user.id, skillId: skill.id, mode: "STUDY", status: "ACTIVE" }
    });
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{skill.title}</h1>
      <p className="text-sm text-gray-600">{skill.description}</p>
      <TutorChat sessionId={session.id} />
    </div>
  );
}
