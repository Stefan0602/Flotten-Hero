import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { mandantId: session.mandantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch {
    // Demo-Fallback für Systeme ohne funktionierende Prisma-Engine (z.B. Windows ARM64)
    return NextResponse.json({
      users: [
        { id: 'user_admin1', name: 'Admin Demo', email: 'admin@demo.de', role: 'ADMIN', createdAt: '2026-04-20' },
        { id: 'user_admin2', name: 'Julia Schneider', email: 'admin2@demo.de', role: 'ADMIN', createdAt: '2026-04-20' },
        { id: 'user_leitung', name: 'Anna Berger', email: 'leitung@demo.de', role: 'LEITUNG', createdAt: '2026-03-12' },
        { id: 'user_dispo', name: 'Thomas Klein', email: 'dispo@demo.de', role: 'SACHBEARBEITER_DISPO', createdAt: '2026-03-15' },
        { id: 'user_stamm', name: 'Laura Weber', email: 'stammdaten@demo.de', role: 'SACHBEARBEITER_STAMMDATEN', createdAt: '2026-04-01' },
        { id: 'user_fibu', name: 'Markus Hoffmann', email: 'fibu@demo.de', role: 'SACHBEARBEITER_FIBU', createdAt: '2026-04-05' },
        { id: 'user_fahrer', name: 'Michael Schmidt', email: 'fahrer@demo.de', role: 'FAHRER', createdAt: '2026-04-10' },
      ],
      demo: true,
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!['ADMIN', 'LEITUNG'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 });
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'E-Mail-Adresse bereits vergeben' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as Role,
      mandantId: session.mandantId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  await logAudit({
    mandantId: session.mandantId,
    userId: session.id,
    userName: session.name,
    action: 'USER_CREATED',
    targetType: 'User',
    targetId: newUser.id,
    targetName: newUser.email,
    details: `Rolle: ${role}`,
  });

  return NextResponse.json({ user: newUser });
}
