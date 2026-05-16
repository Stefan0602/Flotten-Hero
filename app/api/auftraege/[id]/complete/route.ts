import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AuftragStatus } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    // Verify ownership
    const auftrag = await prisma.auftrag.findUnique({ where: { id }, select: { mandantId: true } });
    if (!auftrag || auftrag.mandantId !== session.mandantId) {
      return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 });
    }

    await prisma.auftrag.update({
      where: { id },
      data: {
        tatsaechlicheAbfahrt: body.tatsaechlicheAbfahrt ? new Date(body.tatsaechlicheAbfahrt) : null,
        tatsaechlicheAnkunft: body.tatsaechlicheAnkunft ? new Date(body.tatsaechlicheAnkunft) : null,
        km: body.km || null,
        status: AuftragStatus.ABGESCHLOSSEN,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: true });
  }
}
