import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  try {
    const fahrer = await prisma.fahrer.findMany({
      where: { mandantId: session.mandantId },
      orderBy: { nachname: 'asc' }
    });
    return NextResponse.json(fahrer);
  } catch {
    return NextResponse.json([]);
  }
}
