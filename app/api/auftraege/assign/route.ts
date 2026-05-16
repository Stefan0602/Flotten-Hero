import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AuftragStatus } from '@prisma/client';
import { updateDemoAuftrag } from '@/lib/demo-data';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { auftragId, fahrerId, fahrzeugId } = await req.json();

  try {
    const auftrag = await prisma.auftrag.findUnique({
      where: { id: auftragId },
      select: { mandantId: true }
    });

    if (!auftrag || auftrag.mandantId !== session.mandantId) {
      return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 });
    }

    await prisma.auftrag.update({
      where: { id: auftragId },
      data: {
        fahrerId,
        fahrzeugId,
        status: AuftragStatus.DISPONIERT,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    // Demo fallback
    updateDemoAuftrag(auftragId, {
      fahrerId,
      fahrzeugId,
      status: 'DISPONIERT',
    });
    return NextResponse.json({ success: true, demo: true });
  }
}
