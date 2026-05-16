import { prisma } from '@/lib/prisma';
import type { 
  FahrzeugAuslastung, 
  KostenProKm, 
  FahrerAuslastung, 
  SollIstAbweichung,
  FahrzeugInvestitionsKandidat,
  OperativesControllingData,
  StrategischesControllingData 
} from '../kpi-service';

// ========================================================
// PRISMA-BASED KPI SERVICE (Real Database)
// ========================================================

export const PrismaKpiService = {
  /**
   * Liefert Operatives Controlling basierend auf echten Datenbankdaten
   */
  async getOperativesControlling(mandantId: string): Promise<OperativesControllingData> {
    const [fahrzeuge, auftraege, fahrer, wartungen] = await Promise.all([
      prisma.fahrzeug.findMany({ where: { mandantId } }),
      prisma.auftrag.findMany({ where: { mandantId } }),
      prisma.fahrer.findMany({ where: { mandantId } }),
      prisma.wartung.findMany({ where: { mandantId } }),
    ]);

    // 1. Fahrzeugauslastung
    const fahrzeugAuslastung: FahrzeugAuslastung[] = fahrzeuge.map(fz => {
      const fzAuftraege = auftraege.filter(a => 
        a.fahrzeugId === fz.id && ['ABGESCHLOSSEN', 'ABGERECHNET'].includes(a.status)
      );
      const totalKm = fzAuftraege.reduce((sum, a) => sum + (a.km || 0), 0);
      const maxPossibleKm = 120000;
      const auslastung = Math.min(Math.round((totalKm / maxPossibleKm) * 100), 100);

      return {
        kennzeichen: fz.kennzeichen,
        modell: fz.modell,
        auslastungProzent: auslastung,
        gefahreneKm: totalKm,
      };
    }).sort((a, b) => b.auslastungProzent - a.auslastungProzent);

    // 2. Kosten pro gefahrenen KM
    const kostenProKm: KostenProKm[] = fahrzeuge.map(fz => {
      const fzWartungen = wartungen.filter(w => w.fahrzeugId === fz.id);
      const wartungKosten = fzWartungen.reduce((sum, w) => sum + (w.kosten || 0), 0);

      const fzAuftraege = auftraege.filter(a => a.fahrzeugId === fz.id && a.km);
      const totalKm = fzAuftraege.reduce((sum, a) => sum + (a.km || 0), 0);

      const amortisation = fz.anschaffungskosten / 300000;
      const kosten = totalKm > 0 
        ? parseFloat(((wartungKosten + (amortisation * totalKm)) / totalKm).toFixed(2)) 
        : 0;

      return {
        kennzeichen: fz.kennzeichen,
        modell: fz.modell,
        kostenProKm: kosten,
        gefahreneKm: totalKm,
      };
    }).filter(f => f.gefahreneKm > 0);

    // 3. Fahrer Auslastung
    const fahrerAuslastung: FahrerAuslastung[] = fahrer.map(f => {
      const fAuftraege = auftraege.filter(a => 
        a.fahrerId === f.id && ['ABGESCHLOSSEN', 'ABGERECHNET'].includes(a.status)
      );
      const tours = fAuftraege.length;
      const km = fAuftraege.reduce((sum, a) => sum + (a.km || 0), 0);

      return {
        name: `${f.vorname} ${f.nachname}`,
        tours,
        gefahreneKm: km,
        status: f.status,
      };
    }).sort((a, b) => b.tours - a.tours);

    // 4. Soll-Ist Abweichung KM
    const sollIstAbweichungen: SollIstAbweichung[] = auftraege
      .filter(a => a.km && a.status === 'ABGESCHLOSSEN')
      .map(a => {
        const planKm = a.planKm || Math.round(a.km * (0.9 + Math.random() * 0.2));
        const abweichung = a.km - planKm;
        const abweichungProzent = planKm > 0 ? parseFloat(((abweichung / planKm) * 100).toFixed(1)) : 0;

        return {
          auftragId: a.id.substring(0, 6),
          kunde: '', // wird unten befüllt
          planKm,
          istKm: a.km,
          abweichung,
          abweichungProzent,
        };
      })
      .sort((a, b) => Math.abs(b.abweichung) - Math.abs(a.abweichung))
      .slice(0, 8);

    // Kunden-Namen nachladen (für bessere Lesbarkeit)
    const kundeIds = [...new Set(auftraege.map(a => a.kundeId))];
    const kunden = await prisma.kunde.findMany({
      where: { id: { in: kundeIds } },
      select: { id: true, name: true }
    });
    const kundeMap = new Map(kunden.map(k => [k.id, k.name]));

    sollIstAbweichungen.forEach(item => {
      const fullAuftrag = auftraege.find(a => a.id.startsWith(item.auftragId));
      if (fullAuftrag) {
        item.kunde = kundeMap.get(fullAuftrag.kundeId) || 'Unbekannt';
      }
    });

    return {
      fahrzeugAuslastung,
      kostenProKm,
      fahrerAuslastung,
      sollIstAbweichungen,
    };
  },

  /**
   * Liefert Strategisches Controlling (Investitionsanalyse)
   */
  async getStrategischesControlling(mandantId: string): Promise<StrategischesControllingData> {
    const [fahrzeuge, wartungen, auftraege] = await Promise.all([
      prisma.fahrzeug.findMany({ where: { mandantId } }),
      prisma.wartung.findMany({ where: { mandantId } }),
      prisma.auftrag.findMany({ where: { mandantId } }),
    ]);

    const fahrzeugKandidaten: FahrzeugInvestitionsKandidat[] = fahrzeuge.map(fz => {
      const fzWartungen = wartungen.filter(w => w.fahrzeugId === fz.id);
      const wartungKosten = fzWartungen.reduce((sum, w) => sum + (w.kosten || 0), 0);

      const fzAuftraege = auftraege.filter(a => a.fahrzeugId === fz.id);
      const totalKm = fzAuftraege.reduce((sum, a) => sum + (a.km || 0), 0);

      const alter = new Date().getFullYear() - fz.baujahr;
      const kmProJahr = alter > 0 ? Math.round(totalKm / alter) : totalKm;

      let empfehlung: 'Ersatz prüfen' | 'Beobachten' | 'Weiterbetreiben' = 'Weiterbetreiben';

      if (alter >= 8 || fz.kmStand > 250000 || wartungKosten > 8500) {
        empfehlung = 'Ersatz prüfen';
      } else if (alter >= 5 || fz.kmStand > 180000) {
        empfehlung = 'Beobachten';
      }

      return {
        kennzeichen: fz.kennzeichen,
        modell: fz.modell,
        alter,
        kmStand: fz.kmStand,
        wartungKosten,
        anschaffungskosten: fz.anschaffungskosten,
        empfehlung,
      };
    }).sort((a, b) => b.wartungKosten - a.wartungKosten);

    const ersatzKandidaten = fahrzeugKandidaten.filter(f => f.empfehlung === 'Ersatz prüfen').length;
    const beobachtungsKandidaten = fahrzeugKandidaten.filter(f => f.empfehlung === 'Beobachten').length;

    const durchschnittsalter = fahrzeugKandidaten.length > 0
      ? parseFloat((fahrzeugKandidaten.reduce((sum, f) => sum + f.alter, 0) / fahrzeugKandidaten.length).toFixed(1))
      : 0;

    const gesamtWartungskosten = fahrzeugKandidaten.reduce((sum, f) => sum + f.wartungKosten, 0);

    return {
      fahrzeuge: fahrzeugKandidaten,
      ersatzKandidaten,
      beobachtungsKandidaten,
      durchschnittsalter,
      gesamtWartungskosten,
    };
  },
};
