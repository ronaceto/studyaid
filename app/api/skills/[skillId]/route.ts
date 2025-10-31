import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { skillId: string } }
) {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: params.skillId },
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
