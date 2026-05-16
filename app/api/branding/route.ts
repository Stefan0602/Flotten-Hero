import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
    });
  }

  const mandant = await prisma.mandant.findUnique({
    where: { id: session.mandantId },
    select: {
      primaryColor: true,
      secondaryColor: true,
    },
  });

  return NextResponse.json({
    primaryColor: mandant?.primaryColor || '#2563eb',
    secondaryColor: mandant?.secondaryColor || '#1e40af',
  });
}
