import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In Produktion: Speichere den Key sicher in env + rate limiting
const TRACKING_API_KEY = process.env.TRACKING_WEBHOOK_KEY || 'demo-tracking-key-123';

interface TrackingPayload {
  vehicleId: string;           // entspricht Fahrzeug.id oder externer Kennung (z.B. IMEI)
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;           // ISO String vom Gerät
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentifizierung (vom externen Anbieter)
    const authHeader = request.headers.get('authorization') || request.headers.get('x-api-key');
    if (!authHeader || !authHeader.includes(TRACKING_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TrackingPayload = await request.json();

    // 2. Fahrzeug finden (über kennzeichen oder id)
    const fahrzeug = await prisma.fahrzeug.findFirst({
      where: {
        OR: [
          { id: body.vehicleId },
          { kennzeichen: body.vehicleId }
        ]
      }
    });

    if (!fahrzeug) {
      return NextResponse.json({ error: 'Fahrzeug nicht gefunden' }, { status: 404 });
    }

    // 3. Position speichern
    const position = await prisma.fahrzeugPosition.create({
      data: {
        mandantId: fahrzeug.mandantId,
        fahrzeugId: fahrzeug.id,
        latitude: body.latitude,
        longitude: body.longitude,
        speed: body.speed ?? null,
        heading: body.heading ?? null,
        accuracy: body.accuracy ?? null,
        timestamp: new Date(body.timestamp),
        source: body.source || 'external-provider',
      }
    });

    // 4. Automatische Abweichungserkennung (Plan vs Ist)
    await detectAndCreateDeviation(fahrzeug.id, position);

    return NextResponse.json({ 
      success: true, 
      positionId: position.id,
      message: 'Position empfangen und verarbeitet' 
    });

  } catch (error) {
    console.error('Tracking webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Erkennt Abweichungen zwischen Plan und Ist-Daten
 * und erstellt automatisch Abweichung-Einträge
 */
async function detectAndCreateDeviation(fahrzeugId: string, latestPosition: any) {
  // Finde aktiven Auftrag für dieses Fahrzeug
  const activeAuftrag = await prisma.auftrag.findFirst({
    where: {
      fahrzeugId,
      status: { in: ['DISPONIERT', 'IN_AUSFUEHRUNG'] }
    },
    include: { abweichungen: true }
  });

  if (!activeAuftrag) return;

  const now = new Date();
  const plannedTime = new Date(activeAuftrag.geplanteAbfahrt);
  const actualTime = new Date(latestPosition.timestamp);

  // Zeitabweichung in Minuten
  const timeDiffMinutes = Math.round((actualTime.getTime() - plannedTime.getTime()) / 60000);

  // Sehr einfache Abweichungserkennung (kann später stark erweitert werden)
  let abweichungTyp = '';
  let beschreibung = '';
  let auswirkung = 0;

  if (timeDiffMinutes > 8) {
    abweichungTyp = 'Verspätung';
    beschreibung = `Fahrzeug ist ${timeDiffMinutes} Minuten später als geplant unterwegs (GPS: ${latestPosition.latitude.toFixed(4)}, ${latestPosition.longitude.toFixed(4)})`;
    auswirkung = timeDiffMinutes;
  } else if (timeDiffMinutes < -6) {
    abweichungTyp = 'Frühzeitige Abfahrt';
    beschreibung = `Fahrzeug ist ${Math.abs(timeDiffMinutes)} Minuten früher als geplant gestartet`;
    auswirkung = Math.abs(timeDiffMinutes);
  }

  // Nur Abweichung anlegen, wenn relevant und noch keine ähnliche in den letzten 10 Minuten
  if (abweichungTyp && !activeAuftrag.abweichungen.some(a => 
    a.typ === abweichungTyp && 
    (now.getTime() - new Date(a.zeitpunkt).getTime()) < 10 * 60 * 1000
  )) {
    await prisma.abweichung.create({
      data: {
        mandantId: activeAuftrag.mandantId,
        auftragId: activeAuftrag.id,
        typ: abweichungTyp,
        beschreibung,
        auswirkungMinuten: auswirkung,
        zeitpunkt: now,
      }
    });
  }

  // TODO in Zukunft: Streckenabweichung, Geschwindigkeitsüberschreitung, etc.
}