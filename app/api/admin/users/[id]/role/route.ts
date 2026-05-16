import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (!role || !Object.values(Role).includes(role)) {
    return NextResponse.json({ error: 'Ungültige Rolle' }, { status: 400 });
  }

  // Prevent changing own role (safety)
  if (id === session.id) {
    return NextResponse.json({ error: 'Sie können Ihre eigene Rolle nicht ändern' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id }, select: { mandantId: true, role: true } });
  if (!targetUser || targetUser.mandantId !== session.mandantId) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
  }

  // Safety: Always keep at least 2 Admins
  if (targetUser.role === 'ADMIN' && role !== 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { mandantId: session.mandantId, role: 'ADMIN' }
    });
    if (adminCount <= 2) {
      return NextResponse.json({ 
        error: 'Es müssen immer mindestens 2 Administratoren vorhanden sein. Rolle kann nicht geändert werden.' 
      }, { status: 400 });
    }
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });

  await prisma.user.update({
    where: { id },
    data: { role: role as Role },
  });

  await logAudit({
    mandantId: session.mandantId,
    userId: session.id,
    userName: session.name,
    action: 'USER_ROLE_CHANGED',
    targetType: 'User',
    targetId: id,
    targetName: target?.email,
    details: `Von ${target?.role} → ${role}`,
  });

  return NextResponse.json({ success: true });
}
