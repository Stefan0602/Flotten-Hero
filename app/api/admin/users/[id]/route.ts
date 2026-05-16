import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Prevent self-deletion
  if (id === session.id) {
    return NextResponse.json({ error: 'Sie können sich nicht selbst löschen' }, { status: 400 });
  }

  // Check if user belongs to same mandant
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { mandantId: true, role: true },
  });

  if (!targetUser || targetUser.mandantId !== session.mandantId) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
  }

  // Safety: Always keep at least 2 Admins per Mandant
  if (targetUser.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { mandantId: session.mandantId, role: 'ADMIN' }
    });
    if (adminCount <= 2) {
      return NextResponse.json({ 
        error: 'Es müssen immer mindestens 2 Administratoren pro Mandant vorhanden sein. Löschen nicht möglich.' 
      }, { status: 400 });
    }
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });

  await logAudit({
    mandantId: session.mandantId,
    userId: session.id,
    userName: session.name,
    action: 'USER_DELETED',
    targetType: 'User',
    targetId: id,
    targetName: target?.email,
    details: `Vorherige Rolle: ${target?.role}`,
  });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
