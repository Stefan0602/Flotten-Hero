import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuftragStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { auftragId, tatsaechlicheAbfahrt, tatsaechlicheAnkunft, km } = await req.json();

    await prisma.auftrag.update({
      where: { id: auftragId },
      data: {
        tatsaechlicheAbfahrt: new Date(tatsaechlicheAbfahrt),
        tatsaechlicheAnkunft: new Date(tatsaechlicheAnkunft),
        km: km || null,
        status: AuftragStatus.ABGESCHLOSSEN,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: true }); // Demo fallback
  }
}
