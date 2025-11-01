import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Subject } from '@prisma/client';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const subjectLabels: Record<Subject, string> = {
  MATH: 'Math',
  SCIENCE: 'Science',
  STEM_FLIGHT_SPACE: 'STEM: Flight & Space',
  SOCIAL_STUDIES: 'Social Studies',
  LANGUAGE_ARTS: 'Language Arts',
};

export default async function Library({
  searchParams,
}: {
  searchParams: { subject?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  const skills = await prisma.skill.findMany({
    where: searchParams.subject
      ? { subject: searchParams.subject as Subject }
      : undefined,
    orderBy: [{ subject: 'asc' }, { title: 'asc' }],
  });

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.subject]) {
      acc[skill.subject] = [];
    }
    acc[skill.subject].push(skill);
    return acc;
  }, {} as Record<Subject, typeof skills>);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Skill Library</h1>
        <p className="text-muted-foreground">Choose a skill to practice</p>
      </div>

      <Tabs defaultValue={searchParams.subject || 'MATH'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(subjectLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedSkills).map(([subject, subjectSkills]) => (
          <TabsContent key={subject} value={subject} className="space-y-4">
            {subjectSkills.map((skill) => (
              <Card key={skill.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{skill.title}</CardTitle>
                      <CardDescription>{skill.description}</CardDescription>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="secondary">Grade {skill.grade}</Badge>
                        <Badge variant="outline">{subjectLabels[skill.subject]}</Badge>
                      </div>
                    </div>
                    <Link href={`/study/${skill.id}`}>
                      <Button>Start Learning</Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
