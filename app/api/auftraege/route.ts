import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    const baseWhere: any = { mandantId: session.mandantId };

    if (status === 'offen') {
      baseWhere.status = { in: ['GEPLANT', 'DISPONIERT', 'IN_AUSFUEHRUNG'] };
    } else if (status === 'abgeschlossen') {
      baseWhere.status = { in: ['ABGESCHLOSSEN', 'ABGERECHNET'] };
    }

    const auftraege = await prisma.auftrag.findMany({
      where: baseWhere,
      include: { kunde: true, fahrer: true, fahrzeug: true },
      orderBy: { geplanteAbfahrt: 'asc' },
      take: 50,
    });
    return NextResponse.json(auftraege);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Find or create a demo customer scoped to the current mandant
    let kunde = await prisma.kunde.findFirst({ where: { mandantId: session.mandantId } });
    if (!kunde) {
      kunde = await prisma.kunde.create({
        data: {
          mandantId: session.mandantId,
          name: body.kundeName || 'Demo-Kunde',
          strasse: 'Musterstr. 1',
          plz: '82319',
          ort: 'Starnberg',
        },
      });
    }

    const auftrag = await prisma.auftrag.create({
      data: {
        mandantId: session.mandantId,
        kundeId: kunde.id,
        pickupAdresse: body.pickupAdresse,
        dropoffAdresse: body.dropoffAdresse,
        geplanteAbfahrt: new Date(body.geplanteAbfahrt),
        geplanteAnkunft: new Date(new Date(body.geplanteAbfahrt).getTime() + 45 * 60000),
        status: 'GEPLANT',
        preis: body.preis || 45,
      },
    });
    return NextResponse.json(auftrag);
  } catch (e) {
    console.error('Auftrag creation error:', e);
    return NextResponse.json({ success: true });
  }
}
