import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auftragId, typ, beschreibung, auswirkungMinuten } = await req.json();

    const abweichung = await prisma.abweichung.create({
      data: {
        mandantId: session.mandantId,
        auftragId,
        typ,
        beschreibung,
        auswirkungMinuten: auswirkungMinuten ?? null,
      },
    });

    return NextResponse.json({ success: true, abweichung });
  } catch (e) {
    console.error('Abweichung creation error:', e);
    return NextResponse.json({ success: false, error: 'Failed to create deviation' }, { status: 500 });
  }
}
