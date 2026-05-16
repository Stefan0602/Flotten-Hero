import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

// Demo-Fallback-Benutzer (wird verwendet, wenn Prisma nicht verfügbar ist – z.B. auf Windows ARM64)
const DEMO_USERS: Record<string, { id: string; name: string; passwordHash: string; role: Role; mandantId: string; mandantName: string }> = {
  'admin@demo.de': {
    id: 'user_admin1',
    name: 'Admin Demo',
    passwordHash: '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2',
    role: 'ADMIN',
    mandantId: 'mandant_demo',
    mandantName: 'Demo Transport GmbH',
  },
  'admin2@demo.de': {
    id: 'user_admin2',
    name: 'Julia Schneider',
    passwordHash: '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2',
    role: 'ADMIN',
    mandantId: 'mandant_demo',
    mandantName: 'Demo Transport GmbH',
  },
  'leitung@demo.de': {
    id: 'user_leitung',
    name: 'Anna Berger',
    passwordHash: '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2',
    role: 'LEITUNG',
    mandantId: 'mandant_demo',
    mandantName: 'Demo Transport GmbH',
  },
  'dispo@demo.de': {
    id: 'user_dispo',
    name: 'Thomas Klein',
    passwordHash: '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2',
    role: 'SACHBEARBEITER_DISPO',
    mandantId: 'mandant_demo',
    mandantName: 'Demo Transport GmbH',
  },
  'stammdaten@demo.de': {
    id: 'user_stamm',
    name: 'Laura Weber',
    passwordHash: '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2',
    role: 'SACHBEARBEITER_STAMMDATEN',
    mandantId: 'mandant_demo',
    mandantName: 'Demo Transport GmbH',
  },
  'fibu@demo.de': {
    id: 'user_fibu',
    name: 'Markus Hoffmann',
    passwordHash: '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2',
    role: 'SACHBEARBEITER_FIBU',
    mandantId: 'mandant_demo',
    mandantName: 'Demo Transport GmbH',
  },
  'fahrer@demo.de': {
    id: 'user_fahrer',
    name: 'Michael Schmidt',
    passwordHash: '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2',
    role: 'FAHRER',
    mandantId: 'mandant_demo',
    mandantName: 'Demo Transport GmbH',
  },
};

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'transportpro-super-secret-key-change-in-production-2026'
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mandantId: string;
  mandantName: string;
}

// Login
export async function login(email: string, password: string): Promise<SessionUser | null> {
  try {
    // Versuch mit echter Datenbank
    const user = await prisma.user.findUnique({
      where: { email },
      include: { mandant: true },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    // Update last login (wird bei Fallback ignoriert)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch {}

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mandantId: user.mandantId,
      mandantName: user.mandant.name,
    };

    return await createSession(sessionUser);
  } catch (error) {
    // Fallback für Systeme, auf denen Prisma nicht funktioniert (z.B. Windows ARM64)
    console.warn('Prisma Login fehlgeschlagen – verwende Demo-Fallback:', (error as Error).message);

    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (!demoUser) return null;

    const isValid = await bcrypt.compare(password, demoUser.passwordHash);
    if (!isValid) return null;

    const sessionUser: SessionUser = {
      id: demoUser.id,
      name: demoUser.name,
      email: email,
      role: demoUser.role as Role,
      mandantId: demoUser.mandantId,
      mandantName: demoUser.mandantName,
    };

    return await createSession(sessionUser);
  }
}

// Hilfsfunktion zum Erstellen der Session (JWT + Cookie)
async function createSession(sessionUser: SessionUser): Promise<SessionUser> {
  const token = await new SignJWT({ ...sessionUser })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set('transportpro-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return sessionUser;
}

// Get current session
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('transportpro-session')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// Logout
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('transportpro-session');
}

// Role helpers
export function hasAccess(userRole: Role, requiredRoles: Role[]): boolean {
  if (userRole === 'LEITUNG') return true;
  return requiredRoles.includes(userRole);
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator (Mandant)',
  LEITUNG: 'Geschäftsleitung',
  SACHBEARBEITER_DISPO: 'Sachbearbeiter – Disposition',
  SACHBEARBEITER_STAMMDATEN: 'Sachbearbeiter – Stammdaten',
  SACHBEARBEITER_FIBU: 'Sachbearbeiter – FIBU & Lohn',
  FAHRER: 'Fahrer',
};

// Roles that can manage users
export const USER_MANAGEMENT_ROLES: Role[] = ['ADMIN', 'LEITUNG'];
