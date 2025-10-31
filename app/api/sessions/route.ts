import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  skillId: z.string(),
  mode: z.enum(['STUDY', 'ASSESSMENT']).optional().default('STUDY'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = createSchema.parse(await req.json());

    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        skillId: body.skillId,
        mode: body.mode,
      },
    });

    await prisma.event.create({
      data: {
        sessionId: newSession.id,
        name: 'start',
      },
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
