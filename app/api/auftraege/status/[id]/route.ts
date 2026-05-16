import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuftragStatus } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();

  try {
    await prisma.auftrag.update({
      where: { id },
      data: { status: status as AuftragStatus },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // Demo
  }
}
