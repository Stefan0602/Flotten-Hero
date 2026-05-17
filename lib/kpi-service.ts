import { 
  getDemoFahrzeuge, 
  getDemoAuftraege, 
  getDemoFahrer, 
  getDemoWartungen,
  DemoAuftrag 
} from './demo-data';

// ========================================================
// TYPE DEFINITIONS
// ========================================================

export interface FahrzeugAuslastung {
  kennzeichen: string;
  modell: string;
  auslastungProzent: number;
  gefahreneKm: number;
}

export interface KostenProKm {
  kennzeichen: string;
  modell: string;
  kostenProKm: number;
  gefahreneKm: number;
}

export interface FahrerAuslastung {
  name: string;
  tours: number;
  gefahreneKm: number;
  status: string;
}

export interface SollIstAbweichung {
  auftragId: string;
  kunde: string;
  planKm: number;
  istKm: number;
  abweichung: number;
  abweichungProzent: number;
}

export interface OperativesControllingData {
  fahrzeugAuslastung: FahrzeugAuslastung[];
  kostenProKm: KostenProKm[];
  fahrerAuslastung: FahrerAuslastung[];
  sollIstAbweichungen: SollIstAbweichung[];
}

export interface FahrzeugInvestitionsKandidat {
  kennzeichen: string;
  modell: string;
  alter: number;
  kmStand: number;
  wartungKosten: number;
  anschaffungskosten: number;
  empfehlung: 'Ersatz prüfen' | 'Beobachten' | 'Weiterbetreiben';
}

export interface StrategischesControllingData {
  fahrzeuge: FahrzeugInvestitionsKandidat[];
  ersatzKandidaten: number;
  beobachtungsKandidaten: number;
  durchschnittsalter: number;
  gesamtWartungskosten: number;
}

// ========================================================
// KPI SERVICE
// ========================================================

export const KpiService = {
  /**
   * Liefert alle Daten für das Operative Controlling
   */
  getOperativesControlling(): OperativesControllingData {
    const fahrzeuge = getDemoFahrzeuge();
    const auftraege = getDemoAuftraege();
    const fahrer = getDemoFahrer();
    const wartungen = getDemoWartungen();

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
      .filter((a): a is DemoAuftrag & { km: number } => !!a.km && a.status === 'ABGESCHLOSSEN')
      .map(a => {
        const km = a.km; // now guaranteed to be number
        const planKm = a.planKm || Math.round(km * (0.9 + Math.random() * 0.2));
        const abweichung = km - planKm;
        const abweichungProzent = planKm > 0 ? parseFloat(((abweichung / planKm) * 100).toFixed(1)) : 0;

        return {
          auftragId: a.id.substring(0, 6),
          kunde: a.kundeName,
          planKm,
          istKm: km,
          abweichung,
          abweichungProzent,
        };
      })
      .sort((a, b) => Math.abs(b.abweichung) - Math.abs(a.abweichung))
      .slice(0, 8);

    return {
      fahrzeugAuslastung,
      kostenProKm,
      fahrerAuslastung,
      sollIstAbweichungen,
    };
  },

  /**
   * Liefert alle Daten für das Strategische Controlling (Investitionsentscheidungen)
   */
  getStrategischesControlling(): StrategischesControllingData {
    const fahrzeuge = getDemoFahrzeuge();
    const wartungen = getDemoWartungen();
    const auftraege = getDemoAuftraege();

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

// ========================================================
// TYPE EXPORTS (for use in pages)
// ========================================================

// Types are already exported via "export interface" above.
// The previous re-export block was removed to avoid duplicate export conflicts.
