import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const mandant = await prisma.mandant.findUnique({
      where: { id: session.mandantId },
    });
    return NextResponse.json({ mandant });
  } catch {
    // Demo-Fallback (wichtig für Windows ARM64)
    return NextResponse.json({
      mandant: {
        id: session.mandantId,
        name: 'Demo Transport GmbH',
        strasse: 'Gewerbepark 12',
        plz: '82319',
        ort: 'Starnberg',
        telefon: '08151 998877',
        email: 'info@demo-transport.de',
        logoUrl: null,
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
      },
      demo: true,
    });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  try {
    const updated = await prisma.mandant.update({
      where: { id: session.mandantId },
      data: {
        name: body.name,
        strasse: body.strasse,
        plz: body.plz,
        ort: body.ort,
        telefon: body.telefon,
        email: body.email,
        logoUrl: body.logoUrl || null,
        primaryColor: body.primaryColor || null,
        secondaryColor: body.secondaryColor || null,
      },
    });
    return NextResponse.json({ mandant: updated });
  } catch {
    // Demo-Modus: Änderungen werden nicht persistent gespeichert, aber UI-Feedback geben
    return NextResponse.json({
      mandant: {
        ...body,
        id: session.mandantId,
      },
      demo: true,
    });
  }
}
