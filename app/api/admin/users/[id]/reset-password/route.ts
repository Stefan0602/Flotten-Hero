import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { newPassword } = await req.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id }, select: { mandantId: true } });
  if (!targetUser || targetUser.mandantId !== session.mandantId) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true } });

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  await logAudit({
    mandantId: session.mandantId,
    userId: session.id,
    userName: session.name,
    action: 'USER_PASSWORD_RESET',
    targetType: 'User',
    targetId: id,
    targetName: target?.email,
  });

  return NextResponse.json({ success: true });
}
