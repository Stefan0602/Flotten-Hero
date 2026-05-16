import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  try {
    const kunden = await prisma.kunde.findMany({
      where: { mandantId: session.mandantId },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(kunden);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kunde = await prisma.kunde.create({ data: body });
    return NextResponse.json(kunde);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
