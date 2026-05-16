import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AuftragStatus, FahrerStatus, FahrzeugStatus } from '@prisma/client';

export async function GET() {
  const session = await getSession();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    // Offene Aufträge (nicht abgeschlossen / abgerechnet)
    const offeneAuftraege = await prisma.auftrag.count({
      where: {
        status: { notIn: [AuftragStatus.ABGESCHLOSSEN, AuftragStatus.ABGERECHNET, AuftragStatus.STORNIERT] },
      },
    });

    // Heute unterwegs (konsistent mit Dashboard-Logik):
    // - DISPONIERT und geplant für heute
    // - ALLE IN_AUSFUEHRUNG (laufende Touren zählen immer, auch wenn geplantes Datum minimal abweicht)
    const morgen = new Date(today.getTime() + 86400000);
    const heuteUnterwegs = await prisma.auftrag.count({
      where: {
        OR: [
          {
            status: AuftragStatus.DISPONIERT,
            geplanteAbfahrt: { gte: today, lt: morgen },
          },
          {
            status: AuftragStatus.IN_AUSFUEHRUNG,
          },
        ],
      },
    });

    // Fahrzeuge verfügbar (für Auslastung)
    const fahrzeugeVerfuegbar = await prisma.fahrzeug.count({
      where: { status: FahrzeugStatus.VERFUEGBAR },
    });

    // Fahrzeuge eingesetzt (aktuell auf aktiven Aufträgen)
    const aktiveAuftraege = await prisma.auftrag.findMany({
      where: {
        status: { in: [AuftragStatus.DISPONIERT, AuftragStatus.IN_AUSFUEHRUNG] },
      },
      select: { fahrzeugId: true },
    });
    const fahrzeugeEingesetzt = new Set(
      aktiveAuftraege.map(a => a.fahrzeugId).filter(Boolean)
    ).size;

    // Aktive Fahrer
    const fahrerAktiv = await prisma.fahrer.count({
      where: { status: FahrerStatus.AKTIV },
    });

    // Umsatz diese Woche (abgeschlossene Aufträge)
    const abgeschlosseneDieseWoche = await prisma.auftrag.findMany({
      where: {
        status: { in: [AuftragStatus.ABGESCHLOSSEN, AuftragStatus.ABGERECHNET] },
        tatsaechlicheAnkunft: { gte: today },
      },
      select: { preis: true },
    });
    const umsatzDieseWoche = abgeschlosseneDieseWoche.reduce((sum, a) => sum + (a.preis || 0), 0);

    // Wartungen fällig (nächste Fälligkeit in den nächsten 14 Tagen)
    const in14Tagen = new Date(today);
    in14Tagen.setDate(today.getDate() + 14);
    const wartungFaellig = await prisma.wartung.count({
      where: {
        naechsteFaelligkeitDatum: { lte: in14Tagen, gte: today },
      },
    });

    // Auslastung (vereinfacht)
    const totalFahrzeuge = await prisma.fahrzeug.count();
    const totalFahrer = await prisma.fahrer.count();
    const auslastungProzent = totalFahrzeuge > 0 
      ? Math.round(((totalFahrzeuge - fahrzeugeVerfuegbar) / totalFahrzeuge) * 100) 
      : 0;

    // Aktuelle Abweichungen
    const abweichungenHeute = await prisma.abweichung.count({
      where: { zeitpunkt: { gte: today } },
    });

    // Letzte Aufträge
    const recentAuftraege = await prisma.auftrag.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { kunde: true },
    });

    const formattedRecent = recentAuftraege.map(a => ({
      id: a.id,
      kundeName: a.kunde.name,
      status: a.status,
      geplanteAbfahrt: a.geplanteAbfahrt.toISOString(),
      preis: a.preis,
    }));

    return NextResponse.json({
      stats: {
        offeneAuftraege,
        heuteUnterwegs,
        fahrzeugeVerfuegbar,
        fahrzeugeEingesetzt,
        fahrerAktiv,
        umsatzDieseWoche: Math.round(umsatzDieseWoche),
        wartungFaellig,
        auslastungProzent,
        abweichungenHeute,
        // Neue Felder für korrekte "X / Y" Anzeige im Dashboard
        totalFahrzeuge,
        totalFahrer,
      },
      recentAuftraege: formattedRecent,
      mandantName: session?.mandantName || 'Ihr Unternehmen',
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
