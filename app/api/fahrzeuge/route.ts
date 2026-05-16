import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getDemoFahrzeuge, addDemoFahrzeug } from '@/lib/demo-data';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  try {
    const fahrzeuge = await prisma.fahrzeug.findMany({
      where: { mandantId: session.mandantId },
      orderBy: { kennzeichen: 'asc' }
    });
    return NextResponse.json(fahrzeuge);
  } catch {
    return NextResponse.json(getDemoFahrzeuge());
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const fahrzeug = await prisma.fahrzeug.create({
      data: {
        ...body,
        mandantId: session.mandantId,
      }
    });
    return NextResponse.json(fahrzeug);
  } catch {
    // Demo fallback
    const body = await req.json();
    const newFahrzeug = addDemoFahrzeug({
      kennzeichen: body.kennzeichen,
      modell: body.modell || 'Unbekannt',
      baujahr: body.baujahr || 2023,
      kmStand: body.kmStand || 0,
      status: body.status || 'VERFUEGBAR',
      anschaffungskosten: body.anschaffungskosten || 35000,
    });
    return NextResponse.json(newFahrzeug);
  }
}
