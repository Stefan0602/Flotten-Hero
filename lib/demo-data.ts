// lib/demo-data.ts
// Einfacher Demo-Daten-Layer mit localStorage
// Ermöglicht manuelles Anlegen von Daten, auch wenn Prisma nicht verfügbar ist (z.B. Windows ARM64)

export type DemoKunde = {
  id: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string | null;
  email: string | null;
  vertragsart: string | null;
  rechnungsintervall: string;
};

export type DemoFahrer = {
  id: string;
  vorname: string;
  nachname: string;
  fuehrerscheinKlasse: string;
  qualifikationen: string;
  stundenlohn: number;
  status: string;
};

export type DemoFahrzeug = {
  id: string;
  kennzeichen: string;
  modell: string;
  baujahr: number;
  kmStand: number;
  status: string;
  anschaffungskosten: number;
  verbrauchPro100Km?: number;   // Neu für Kosten-pro-KM Berechnung
};

export type DemoWartung = {
  id: string;
  fahrzeugId: string;
  typ: string;
  datum: string;
  kmStand: number;
  kosten: number;
  beschreibung: string | null;
};

export type DemoAuftrag = {
  id: string;
  kundeName: string;
  pickupAdresse: string;
  dropoffAdresse: string;
  geplanteAbfahrt: string;
  status: string;
  preis: number;
  fahrerId?: string;
  fahrerName?: string;
  fahrzeugId?: string;
  fahrzeugKennzeichen?: string;
  km?: number;
  planKm?: number;              // Neu für Soll-Ist Abweichung
  planDauerMinuten?: number;    // Neu für Tourenplanung
  tatsaechlicheAbfahrt?: string;
  tatsaechlicheAnkunft?: string;
};

const STORAGE_KEY = 'transportpro_demo_data';

function loadData() {
  if (typeof window === 'undefined') return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultData();
}

function saveData(data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getDefaultData() {
  return {
    kunden: [] as DemoKunde[],
    fahrer: [] as DemoFahrer[],
    fahrzeuge: [] as DemoFahrzeug[],
    wartungen: [] as DemoWartung[],
    auftraege: [] as DemoAuftrag[],
  };
}

// === Public API ===

export function getDemoKunden(): DemoKunde[] {
  const data = loadData();
  return data.kunden.length > 0 ? data.kunden : getDefaultKunden();
}

export function addDemoKunde(kunde: Omit<DemoKunde, 'id'>): DemoKunde {
  const data = loadData();
  const newKunde: DemoKunde = {
    ...kunde,
    id: 'demo_kunde_' + Date.now(),
  };
  data.kunden.push(newKunde);
  saveData(data);
  return newKunde;
}

export function getDemoFahrer(): DemoFahrer[] {
  const data = loadData();
  return data.fahrer.length > 0 ? data.fahrer : getDefaultFahrer();
}

export function addDemoFahrer(fahrer: Omit<DemoFahrer, 'id'>): DemoFahrer {
  const data = loadData();
  const newFahrer: DemoFahrer = {
    ...fahrer,
    id: 'demo_fahrer_' + Date.now(),
  };
  data.fahrer.push(newFahrer);
  saveData(data);
  return newFahrer;
}

export function getDemoFahrzeuge(): DemoFahrzeug[] {
  const data = loadData();
  return data.fahrzeuge.length > 0 ? data.fahrzeuge : getDefaultFahrzeuge();
}

export function addDemoFahrzeug(fahrzeug: Omit<DemoFahrzeug, 'id'>): DemoFahrzeug {
  const data = loadData();
  const newFahrzeug: DemoFahrzeug = {
    ...fahrzeug,
    id: 'demo_fahrzeug_' + Date.now(),
  };
  data.fahrzeuge.push(newFahrzeug);
  saveData(data);
  return newFahrzeug;
}

export function getDemoWartungen(fahrzeugId?: string): DemoWartung[] {
  const data = loadData();
  if (!fahrzeugId) return data.wartungen;
  return data.wartungen.filter((w: DemoWartung) => w.fahrzeugId === fahrzeugId);
}

export function addDemoWartung(wartung: Omit<DemoWartung, 'id'>): DemoWartung {
  const data = loadData();
  const newWartung: DemoWartung = {
    ...wartung,
    id: 'demo_wartung_' + Date.now(),
  };
  data.wartungen.push(newWartung);
  saveData(data);
  return newWartung;
}

export function getDemoAuftraege(): DemoAuftrag[] {
  return loadData().auftraege;
}

export function addDemoAuftrag(auftrag: Omit<DemoAuftrag, 'id' | 'status'>): DemoAuftrag {
  const data = loadData();
  const newAuftrag: DemoAuftrag = {
    ...auftrag,
    id: 'demo_' + Date.now(),
    status: 'GEPLANT',
  };
  data.auftraege.push(newAuftrag);
  saveData(data);
  return newAuftrag;
}

export function updateDemoAuftrag(id: string, updates: Partial<DemoAuftrag>) {
  const data = loadData();
  const index = data.auftraege.findIndex((a: DemoAuftrag) => a.id === id);
  if (index !== -1) {
    data.auftraege[index] = { ...data.auftraege[index], ...updates };
    saveData(data);
  }
}

function getDefaultFahrer(): DemoFahrer[] {
  return [
    { id: 'f1', vorname: 'Michael', nachname: 'Schmidt', fuehrerscheinKlasse: 'B, BE', qualifikationen: '["Rollstuhl","Trage"]', stundenlohn: 24.5, status: 'AKTIV' },
    { id: 'f2', vorname: 'Sandra', nachname: 'Weber', fuehrerscheinKlasse: 'B', qualifikationen: '["Rollstuhl"]', stundenlohn: 22.8, status: 'AKTIV' },
    { id: 'f3', vorname: 'Thomas', nachname: 'Bauer', fuehrerscheinKlasse: 'B, BE, C1', qualifikationen: '["Trage","Intensiv"]', stundenlohn: 26.0, status: 'AKTIV' },
    { id: 'f4', vorname: 'Laura', nachname: 'Müller', fuehrerscheinKlasse: 'B', qualifikationen: '["Rollstuhl","Trage"]', stundenlohn: 23.5, status: 'AKTIV' },
  ];
}

function getDefaultFahrzeuge(): DemoFahrzeug[] {
  return [
    { 
      id: 'fz1', 
      kennzeichen: 'STA-AB 1234', 
      modell: 'Mercedes-Benz Vito Tourer', 
      baujahr: 2022, 
      kmStand: 78500, 
      status: 'VERFUEGBAR', 
      anschaffungskosten: 48500,
      verbrauchPro100Km: 9.2
    },
    { 
      id: 'fz2', 
      kennzeichen: 'STA-CD 5678', 
      modell: 'Volkswagen Crafter', 
      baujahr: 2021, 
      kmStand: 112400, 
      status: 'VERFUEGBAR', 
      anschaffungskosten: 52900,
      verbrauchPro100Km: 10.1
    },
    { 
      id: 'fz4', 
      kennzeichen: 'STA-GH 3456', 
      modell: 'Mercedes-Benz Sprinter', 
      baujahr: 2020, 
      kmStand: 134800, 
      status: 'VERFUEGBAR', 
      anschaffungskosten: 46700,
      verbrauchPro100Km: 11.4
    },
  ];
}

function getDefaultKunden(): DemoKunde[] {
  return [
    { id: 'k1', name: 'Seniorenresidenz Sonnenhof', strasse: 'Am Park 12', plz: '82319', ort: 'Starnberg', telefon: '08151 98765', email: 'verwaltung@sonnenhof.de', vertragsart: 'Pflegeheim', rechnungsintervall: 'monatlich' },
    { id: 'k2', name: 'Krankenhaus München-Süd', strasse: 'Thalkirchner Str. 48', plz: '81371', ort: 'München', telefon: '089 123456', email: 'transport@kh-muenchen-sued.de', vertragsart: 'Klinik', rechnungsintervall: 'monatlich' },
    { id: 'k3', name: 'Frau Maria Huber', strasse: 'Lindenstraße 7', plz: '82347', ort: 'Penzberg', telefon: '0172 3344556', email: 'm.huber@web.de', vertragsart: 'Privat', rechnungsintervall: 'monatlich' },
    { id: 'k4', name: 'Pflegeheim Haus am See', strasse: 'Seestraße 22', plz: '82418', ort: 'Murnau', telefon: '08841 556677', email: 'info@hausamsee-pflege.de', vertragsart: 'Pflegeheim', rechnungsintervall: 'monatlich' },
  ];
}

// Hilfsfunktion zum Zurücksetzen (für Tests)
export function resetDemoData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ========================================================
// GROSSER TESTDATEN-GENERATOR – 55 Kunden, 22 Fahrer, 15 Fahrzeuge, 110+ Aufträge
// Rufe seedLargeDemoDataset() im Browser auf (z.B. über Button oder Konsole)
// ========================================================

const VORNAMEN = ["Michael","Sandra","Thomas","Laura","Andreas","Julia","Markus","Anna","Stefan","Claudia","Peter","Sabine","Christian","Nicole","Daniel","Katrin","Martin","Birgit","Frank","Heike","Tobias","Melanie","Sebastian","Lisa"];
const NACHNAMEN = ["Schmidt","Weber","Bauer","Müller","Koch","Fischer","Hoffmann","Schulz","Wagner","Becker","Schäfer","König","Lang","Meier","Huber","Kaiser","Roth","Schwarz","Zimmermann","Braun","Hartmann","Wolf","Neumann","Schmitt"];
const ORTE = [
  {ort:"Starnberg",plz:"82319"},{ort:"München",plz:"81371"},{ort:"Penzberg",plz:"82347"},{ort:"Murnau",plz:"82418"},
  {ort:"Germering",plz:"82110"},{ort:"Landsberg am Lech",plz:"86899"},{ort:"Weilheim",plz:"82362"},{ort:"Pöcking",plz:"82343"},
  {ort:"Garmisch-Partenkirchen",plz:"82467"},{ort:"Wolfratshausen",plz:"82515"},{ort:"Bad Tölz",plz:"83646"},{ort:"Tutzing",plz:"82327"},
  {ort:"Feldafing",plz:"82340"},{ort:"Seefeld",plz:"82229"},{ort:"Iffeldorf",plz:"82393"}
];
const VERTRAGS = ["Pflegeheim","Klinik","Privat","Firma"] as const;
const FAHRER_STATUS = ["AKTIV","AKTIV","AKTIV","URLAUB","KRANK"] as const;
const FAHRZEUG_MODELLS = [
  {mod:"Mercedes-Benz Vito Tourer", baujahr:2022, preis:48500},{mod:"Volkswagen Crafter", baujahr:2021, preis:52900},
  {mod:"Mercedes-Benz Sprinter", baujahr:2020, preis:46700},{mod:"Skoda Octavia Combi", baujahr:2023, preis:31200},
  {mod:"Volkswagen Multivan", baujahr:2019, preis:38900},{mod:"Mercedes-Benz V-Klasse", baujahr:2024, preis:62900},
  {mod:"Ford Transit Custom", baujahr:2022, preis:39800},{mod:"Opel Vivaro", baujahr:2021, preis:37500},
  {mod:"Mercedes-Benz Vito", baujahr:2023, preis:45200},{mod:"Volkswagen Caddy", baujahr:2022, preis:28900},
  {mod:"Renault Trafic", baujahr:2020, preis:34100},{mod:"Peugeot Traveller", baujahr:2021, preis:41900},
  {mod:"Mercedes-Benz Sprinter 316", baujahr:2019, preis:44500},{mod:"VW Crafter 35", baujahr:2023, preis:55800},
  {mod:"Mercedes-Benz V-Klasse Extra Long", baujahr:2022, preis:67500}
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }
function makeId(prefix: string) { return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,7); }

export function seedLargeDemoDataset() {
  if (typeof window === 'undefined') { alert("Im Browser ausführen"); return; }

  const data: any = { kunden: [], fahrer: [], fahrzeuge: [], wartungen: [], auftraege: [] };
  const today = new Date();

  // 55 Kunden (stark erweitert)
  for (let i = 0; i < 55; i++) {
    const o = ORTE[i % ORTE.length];
    const typ = VERTRAGS[i % 4];
    let name = "";
    if (i < 18) name = ["Seniorenresidenz","Pflegeheim","Haus","Zentrum","Seniorenzentrum"][i%5] + " " + ["Sonnenhof","Am See","Bergblick","Lebenswert","St. Elisabeth","Schlossberg","Sonnenwinkel","Hofgartl"][i%8];
    else if (i < 32) name = ["Krankenhaus","Klinikum","MVZ","Reha-Zentrum","Kreisklinik","Orthopädie-Zentrum"][i%6] + " " + ["Süd","Nord","Starnberg","Weilheim","Landsberg","Murnau","Wolfratshausen"][i%7];
    else name = (i%2 ? "Herr " : "Frau ") + VORNAMEN[i % VORNAMEN.length] + " " + NACHNAMEN[(i*3) % NACHNAMEN.length];
    const str = ["Am Park","Lindenstraße","Seestraße","Bahnhofstraße","Hauptstraße","Mozartstraße","Rosenweg","Feldweg","Kirchplatz","Schulstraße","Wiesenstraße","Am Anger"][i%12];
    data.kunden.push({
      id: makeId("k"), name,
      strasse: str + " " + (4 + (i % 31)),
      plz: o.plz, ort: o.ort,
      telefon: "0" + (800 + (i % 199)) + " " + (100000 + i * 17).toString().slice(-6),
      email: i < 32 ? `verwaltung@${name.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,16)}.de` : `${VORNAMEN[i%VORNAMEN.length].toLowerCase()}.${NACHNAMEN[(i+4)%NACHNAMEN.length].toLowerCase()}@web.de`,
      vertragsart: typ,
      rechnungsintervall: typ === "Firma" ? "wöchentlich" : (i % 6 === 0 ? "quartalsweise" : "monatlich")
    });
  }

  // 22 Fahrer
  for (let i = 0; i < 22; i++) {
    const q = i % 4 === 0 ? ["Rollstuhl","Trage","Intensiv"] : i % 3 === 0 ? ["Trage","Intensiv"] : i % 5 === 0 ? ["Rollstuhl"] : ["Rollstuhl","Trage"];
    data.fahrer.push({
      id: makeId("f"),
      vorname: VORNAMEN[i % VORNAMEN.length],
      nachname: NACHNAMEN[(i * 7) % NACHNAMEN.length],
      fuehrerscheinKlasse: i % 4 === 0 ? "B, BE, C1" : i % 3 === 0 ? "B, BE" : "B",
      qualifikationen: JSON.stringify(q),
      stundenlohn: 21.8 + (i % 8) * 0.85 + (i > 15 ? 2 : 0),
      status: FAHRER_STATUS[i % FAHRER_STATUS.length]
    });
  }

  // 15 Fahrzeuge
  FAHRZEUG_MODELLS.forEach((fz, i) => {
    const km = Math.max(9200, 16500 + i * 11800 + randInt(-3200, 7800));
    data.fahrzeuge.push({
      id: makeId("fz"),
      kennzeichen: ["STA","WM","LL","GAP","TÖL","WOR","MUC"][i%7] + "-" + String.fromCharCode(65+(i%19)) + String.fromCharCode(65+((i+11)%19)) + " " + (1000 + i*67 + randInt(20,99)),
      modell: fz.mod, baujahr: fz.baujahr, kmStand: km,
      status: (i === 2 || i === 9) ? "IN_WARTUNG" : "VERFUEGBAR",
      anschaffungskosten: fz.preis,
      verbrauchPro100Km: 8.5 + (i % 4) * 0.8 + randInt(-5, 8) / 10   // realistischer Verbrauch 8.5 - 12.5 l/100km
    });
  });

  // Wartungen (2–4 pro Fahrzeug)
  data.fahrzeuge.forEach((fz: any, idx: number) => {
    const count = 2 + (idx % 3);
    for (let w = 0; w < count; w++) {
      const days = 9 + w * 41 + idx * 2;
      const datum = new Date(today.getTime() - days * 86400000);
      const typen = ["REINIGUNG","INSPEKTION","REIFEN","BREMSEN","KLIMA","SONSTIGES"];
      const typ = typen[w % 6];
      data.wartungen.push({
        id: makeId("w"), fahrzeugId: fz.id, typ,
        datum: datum.toISOString(),
        kmStand: Math.max(4000, fz.kmStand - (w + 1) * 2600 - randInt(150,900)),
        kosten: [68, 89, 435, 195, 710, 940, 210, 1280][w % 8] + randInt(-12, 38),
        beschreibung: ["Innen- & Außenreinigung + Desinfektion","Große Inspektion, Öl + Filter","Winterreifen-Satz montiert + Auswuchten","Bremsbeläge + Bremsscheiben","Klimaanlage-Service + Pollenfilter","Getriebeölwechsel + Inspektion","Stoßdämpfer + Achsvermessung","HU/AU + Sicherheitsprüfung"][w % 8],
        naechsteFaelligkeitDatum: new Date(today.getTime() + (85 + w * 18) * 86400000).toISOString()
      });
    }
  });

  // 112 realistische Aufträge über ~6 Wochen
  const stat = ["ABGESCHLOSSEN","ABGESCHLOSSEN","ABGESCHLOSSEN","ABGERECHNET","DISPONIERT","IN_AUSFUEHRUNG","GEPLANT"];
  for (let i = 0; i < 112; i++) {
    const k = data.kunden[i % 52];
    const f = data.fahrer[i % 20];
    const fz = data.fahrzeuge[i % 14];
    const daysAgo = Math.floor(i / 2.65);
    const base = new Date(today.getTime() - daysAgo * 86400000);
    const h = 7 + (i % 12);
    const abf = new Date(base); abf.setHours(h, 8 + (i % 47), 0, 0);
    const dauer = 27 + (i % 6) * 8 + randInt(-5, 16);
    const ank = new Date(abf.getTime() + dauer * 60000);
    const status = stat[i % stat.length];

    const planKm = 12 + (i % 27) + randInt(0, 12);
    const auf: any = {
      id: makeId("a"),
      kundeName: k.name,
      pickupAdresse: `${k.strasse}, ${k.plz} ${k.ort}`,
      dropoffAdresse: ["Klinikum München-Großhadern, Marchioninistr. 15, 81377 München","Krankenhaus Starnberg, Osswaldstraße 1, 82319 Starnberg","Klinikum Landsberg, Bgm.-Dr.-Hartl-Ring 1, 86899 Landsberg am Lech","MVZ Radiologie Starnberg, Possartstraße 4, 82319 Starnberg","Kreisklinik Wolfratshausen, Schießstättstraße 7, 82515 Wolfratshausen","Reha-Zentrum Bad Tölz, Bahnhofstraße 12, 83646 Bad Tölz","Orthopädische Klinik Tutzing, Hauptstraße 48, 82327 Tutzing"][i % 7],
      geplanteAbfahrt: abf.toISOString(),
      status,
      preis: Math.round((31 + (i % 9) * 2.4 + (k.vertragsart === "Pflegeheim" ? -3 : k.vertragsart === "Klinik" ? 3.5 : 0)) * 100) / 100,
      fahrerId: f.id, fahrerName: f.vorname + " " + f.nachname,
      fahrzeugId: fz.id, fahrzeugKennzeichen: fz.kennzeichen,
      planKm: planKm,
      planDauerMinuten: dauer
    };

    if (status === "ABGESCHLOSSEN" || status === "ABGERECHNET") {
      const delta = (Math.random() > 0.52 ? 1 : -1) * randInt(2, 17);
      auf.km = planKm + randInt(-8, 12); // leichte Abweichung vom Plan
      auf.tatsaechlicheAbfahrt = new Date(abf.getTime() + delta * 60000).toISOString();
      auf.tatsaechlicheAnkunft = new Date(ank.getTime() + (delta + randInt(-4, 12)) * 60000).toISOString();
    } else {
      auf.km = planKm; // Für nicht abgeschlossene Aufträge Plan = Ist (noch)
    }
    data.auftraege.push(auf);
  }

  saveData(data);
  window.dispatchEvent(new CustomEvent('transportpro:data-updated'));
  return { kunden: data.kunden.length, fahrer: data.fahrer.length, fahrzeuge: data.fahrzeuge.length, auftraege: data.auftraege.length, wartungen: data.wartungen.length };
}

export function getDemoStats() {
  const d = loadData();
  return { kunden: d.kunden.length, fahrer: d.fahrer.length, fahrzeuge: d.fahrzeuge.length, auftraege: d.auftraege.length, wartungen: d.wartungen.length };
}
