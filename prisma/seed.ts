import { PrismaClient, AuftragStatus, FahrerStatus, FahrzeugStatus, WartungTyp, Role } from '@prisma/client'
import { addDays, subDays } from 'date-fns'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starte Seed für TransportPro (Multi-Tenant + Rollen)...')

  // Cleanup (Reihenfolge wichtig wegen Foreign Keys)
  await prisma.abweichung.deleteMany()
  await prisma.auftrag.deleteMany()
  await prisma.wartung.deleteMany()
  await prisma.fahrzeug.deleteMany()
  await prisma.fahrer.deleteMany()
  await prisma.kunde.deleteMany()
  await prisma.user.deleteMany()
  await prisma.mandant.deleteMany()

  // ========== KUNDEN (25 Stück) ==========
  const kundenData = [
    { name: "Seniorenresidenz Sonnenhof", strasse: "Am Park 12", plz: "82319", ort: "Starnberg", telefon: "08151 98765", email: "verwaltung@sonnenhof.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Krankenhaus München-Süd", strasse: "Thalkirchner Str. 48", plz: "81371", ort: "München", telefon: "089 123456", email: "transport@kh-muenchen-sued.de", vertragsart: "Klinik", rechnungsintervall: "monatlich" },
    { name: "Frau Maria Huber", strasse: "Lindenstraße 7", plz: "82347", ort: "Penzberg", telefon: "0172 3344556", email: "m.huber@web.de", vertragsart: "Privat", rechnungsintervall: "monatlich" },
    { name: "Pflegeheim Haus am See", strasse: "Seestraße 22", plz: "82418", ort: "Murnau", telefon: "08841 556677", email: "info@hausamsee-pflege.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Rollstuhl-Transporte GmbH", strasse: "Industriestraße 5", plz: "82110", ort: "Germering", telefon: "089 998877", email: "auftraege@rollstuhl-transporte.de", vertragsart: "Firma", rechnungsintervall: "wöchentlich" },
    { name: "Klinikum Landsberg", strasse: "Bgm.-Dr.-Hartl-Ring 1", plz: "86899", ort: "Landsberg am Lech", telefon: "08191 333000", email: "patiententransport@klinikum-landsberg.de", vertragsart: "Klinik", rechnungsintervall: "monatlich" },
    { name: "Herr Josef Maier", strasse: "Bahnhofstraße 44", plz: "82362", ort: "Weilheim", telefon: "0176 11223344", email: "j.maier@t-online.de", vertragsart: "Privat", rechnungsintervall: "monatlich" },
    { name: "Caritas Sozialstation", strasse: "Rathausplatz 3", plz: "82343", ort: "Pöcking", telefon: "08157 889900", email: "fahrten@caritas-starnberg.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Dr. med. Petra Schmidt", strasse: "Hauptstraße 18", plz: "82467", ort: "Garmisch-Partenkirchen", telefon: "08821 445566", email: "praxis@dr-schmidt-gp.de", vertragsart: "Privat", rechnungsintervall: "quartalsweise" },
    { name: "AWO Pflegedienst", strasse: "Schulstraße 9", plz: "82178", ort: "Puchheim", telefon: "089 879654", email: "einsatz@awo-puchheim.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Frau Anna Berger", strasse: "Feldweg 2", plz: "82319", ort: "Starnberg", telefon: "0151 99887766", email: "anna.berger@gmail.com", vertragsart: "Privat", rechnungsintervall: "monatlich" },
    { name: "MVZ Radiologie Starnberg", strasse: "Possartstraße 4", plz: "82319", ort: "Starnberg", telefon: "08151 200300", email: "patienten@mvz-radiologie.de", vertragsart: "Klinik", rechnungsintervall: "monatlich" },
    { name: "Seniorenzentrum Bergblick", strasse: "Am Berg 1", plz: "82494", ort: "Krün", telefon: "08825 112233", email: "info@bergblick-krün.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Herr Thomas Klein", strasse: "Mozartstraße 15", plz: "82319", ort: "Starnberg", telefon: "0170 44556677", email: "th.klein@outlook.de", vertragsart: "Privat", rechnungsintervall: "monatlich" },
    { name: "Bayerische Verkehrsbetriebe", strasse: "Zeppelinstraße 12", plz: "82110", ort: "Germering", telefon: "089 1234567", email: "logistik@bvb-germering.de", vertragsart: "Firma", rechnungsintervall: "wöchentlich" },
    { name: "Haus St. Elisabeth", strasse: "Kirchplatz 5", plz: "82433", ort: "Bad Kohlgrub", telefon: "08845 667788", email: "verwaltung@st-elisabeth.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Frau Helga Fischer", strasse: "Rosenweg 8", plz: "82347", ort: "Penzberg", telefon: "0172 55667788", email: "helga.fischer@web.de", vertragsart: "Privat", rechnungsintervall: "monatlich" },
    { name: "Kreisklinik Wolfratshausen", strasse: "Schießstättstraße 7", plz: "82515", ort: "Wolfratshausen", telefon: "08171 629000", email: "transport@kreisklinik-wolfratshausen.de", vertragsart: "Klinik", rechnungsintervall: "monatlich" },
    { name: "Pflegedienst Lebenswert", strasse: "Münchner Straße 33", plz: "82110", ort: "Germering", telefon: "089 654321", email: "einsatz@lebenswert-pflege.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Herr und Frau Wagner", strasse: "Am Anger 27", plz: "82319", ort: "Starnberg", telefon: "08151 334455", email: "wagner.starnberg@t-online.de", vertragsart: "Privat", rechnungsintervall: "quartalsweise" },
    { name: "Orthopädische Praxis Dr. Lang", strasse: "Bahnhofstraße 29", plz: "86899", ort: "Landsberg am Lech", telefon: "08191 445577", email: "praxis@dr-lang-ortho.de", vertragsart: "Privat", rechnungsintervall: "monatlich" },
    { name: "Seniorenheim Am Schlossberg", strasse: "Schlossberg 3", plz: "82418", ort: "Murnau", telefon: "08841 998877", email: "info@schlossberg-murnau.de", vertragsart: "Pflegeheim", rechnungsintervall: "monatlich" },
    { name: "Frau Renate Huber", strasse: "Wiesenstraße 14", plz: "82362", ort: "Weilheim", telefon: "0176 22334455", email: "renate.huber66@gmail.com", vertragsart: "Privat", rechnungsintervall: "monatlich" },
    { name: "Reha-Zentrum Starnberger See", strasse: "Seepromenade 1", plz: "82319", ort: "Starnberg", telefon: "08151 556600", email: "patienten@reha-starnberg.de", vertragsart: "Klinik", rechnungsintervall: "monatlich" },
    { name: "Taxiservice & Krankentransport Gruber", strasse: "Gewerbepark 8", plz: "82178", ort: "Puchheim", telefon: "089 33445566", email: "dispo@gruber-transporte.de", vertragsart: "Firma", rechnungsintervall: "wöchentlich" },
  ]

  // ========== MANDANTEN (Multi-Tenant) ==========
  const mandant1 = await prisma.mandant.create({
    data: {
      name: 'Demo Transport GmbH',
      strasse: 'Gewerbepark 12',
      plz: '82319',
      ort: 'Starnberg',
      telefon: '08151 998877',
      email: 'info@demo-transport.de',
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      logoUrl: null,
    },
  });

  const mandant2 = await prisma.mandant.create({
    data: {
      name: 'Muster Spedition Süd',
      strasse: 'Industriestraße 44',
      plz: '86899',
      ort: 'Landsberg am Lech',
      telefon: '08191 556600',
      email: 'kontakt@muster-spedition.de',
      primaryColor: '#059669',
      secondaryColor: '#047857',
    },
  });

  console.log('✅ 2 Mandanten (Unternehmen) angelegt');

  // ========== BENUTZER MIT ROLLEN ==========
  const pwHash = await bcrypt.hash('demo123', 10);

  await prisma.user.createMany({
    data: [
      // === 2 Admins (wichtig: immer mindestens 2 Administratoren pro Mandant) ===
      { email: 'admin@demo.de', name: 'Admin Demo', passwordHash: pwHash, role: Role.ADMIN, mandantId: mandant1.id },
      { email: 'admin2@demo.de', name: 'Julia Schneider (Admin)', passwordHash: pwHash, role: Role.ADMIN, mandantId: mandant1.id },

      // Leitung
      { email: 'leitung@demo.de', name: 'Anna Berger', passwordHash: pwHash, role: Role.LEITUNG, mandantId: mandant1.id },
      // Sachbearbeiter
      { email: 'dispo@demo.de', name: 'Thomas Klein', passwordHash: pwHash, role: Role.SACHBEARBEITER_DISPO, mandantId: mandant1.id },
      { email: 'stammdaten@demo.de', name: 'Laura Weber', passwordHash: pwHash, role: Role.SACHBEARBEITER_STAMMDATEN, mandantId: mandant1.id },
      { email: 'fibu@demo.de', name: 'Markus Hoffmann', passwordHash: pwHash, role: Role.SACHBEARBEITER_FIBU, mandantId: mandant1.id },
      // Fahrer
      { email: 'fahrer@demo.de', name: 'Michael Schmidt', passwordHash: pwHash, role: Role.FAHRER, mandantId: mandant1.id },

      // Zweiter Mandant
      { email: 'leitung@muster.de', name: 'Sabine Roth', passwordHash: pwHash, role: Role.LEITUNG, mandantId: mandant2.id },
    ],
  });

  console.log('✅ 6 Benutzer mit verschiedenen Rollen angelegt');

  // ========== KUNDEN (Mandant 1) ==========
  const kunden = []
  for (const k of kundenData) {
    const kunde = await prisma.kunde.create({
      data: { ...k, mandantId: mandant1.id },
    });
    kunden.push(kunde);
  }
  console.log(`✅ ${kunden.length} Kunden (Mandant 1) angelegt`);

  // ========== FAHRER (8 Stück) ==========
  const fahrerData = [
    { vorname: "Michael", nachname: "Schmidt", fuehrerscheinKlasse: "B, BE", qualifikationen: JSON.stringify(["Rollstuhl", "Trage"]), stundenlohn: 24.50, status: FahrerStatus.AKTIV },
    { vorname: "Sandra", nachname: "Weber", fuehrerscheinKlasse: "B", qualifikationen: JSON.stringify(["Rollstuhl"]), stundenlohn: 22.80, status: FahrerStatus.AKTIV },
    { vorname: "Thomas", nachname: "Bauer", fuehrerscheinKlasse: "B, BE, C1", qualifikationen: JSON.stringify(["Trage", "Intensiv"]), stundenlohn: 26.00, status: FahrerStatus.AKTIV },
    { vorname: "Laura", nachname: "Müller", fuehrerscheinKlasse: "B", qualifikationen: JSON.stringify(["Rollstuhl", "Trage"]), stundenlohn: 23.50, status: FahrerStatus.AKTIV },
    { vorname: "Andreas", nachname: "Koch", fuehrerscheinKlasse: "B, BE", qualifikationen: JSON.stringify([]), stundenlohn: 21.90, status: FahrerStatus.URLAUB },
    { vorname: "Julia", nachname: "Fischer", fuehrerscheinKlasse: "B", qualifikationen: JSON.stringify(["Rollstuhl"]), stundenlohn: 22.20, status: FahrerStatus.AKTIV },
    { vorname: "Markus", nachname: "Hoffmann", fuehrerscheinKlasse: "B, BE", qualifikationen: JSON.stringify(["Trage"]), stundenlohn: 25.00, status: FahrerStatus.KRANK },
    { vorname: "Anna", nachname: "Schulz", fuehrerscheinKlasse: "B", qualifikationen: JSON.stringify(["Rollstuhl", "Trage", "Intensiv"]), stundenlohn: 27.50, status: FahrerStatus.AKTIV },
  ]

  const fahrer = []
  for (const f of fahrerData) {
    const created = await prisma.fahrer.create({
      data: { ...f, mandantId: mandant1.id },
    });
    fahrer.push(created)
  }
  console.log(`✅ ${fahrer.length} Fahrer (Mandant 1) angelegt`)

  // ========== FAHRZEUGE (6 Stück) ==========
  const fahrzeugeData = [
    { kennzeichen: "STA-AB 1234", modell: "Mercedes-Benz Vito Tourer", baujahr: 2022, kmStand: 87450, anschaffungskosten: 48500, status: FahrzeugStatus.VERFUEGBAR },
    { kennzeichen: "STA-CD 5678", modell: "Volkswagen Crafter", baujahr: 2021, kmStand: 124300, anschaffungskosten: 52900, status: FahrzeugStatus.VERFUEGBAR },
    { kennzeichen: "WM-EF 9012", modell: "Mercedes-Benz Sprinter", baujahr: 2020, kmStand: 187600, anschaffungskosten: 46700, status: FahrzeugStatus.IN_WARTUNG },
    { kennzeichen: "STA-GH 3456", modell: "Skoda Octavia Combi", baujahr: 2023, kmStand: 39200, anschaffungskosten: 31200, status: FahrzeugStatus.VERFUEGBAR },
    { kennzeichen: "LL-IJ 7890", modell: "Volkswagen Multivan", baujahr: 2019, kmStand: 215800, anschaffungskosten: 38900, status: FahrzeugStatus.VERFUEGBAR },
    { kennzeichen: "STA-KL 1122", modell: "Mercedes-Benz V-Klasse", baujahr: 2024, kmStand: 18400, anschaffungskosten: 62900, status: FahrzeugStatus.VERFUEGBAR },
  ]

  const fahrzeuge = []
  for (const fz of fahrzeugeData) {
    const created = await prisma.fahrzeug.create({
      data: { ...fz, mandantId: mandant1.id },
    });
    fahrzeuge.push(created)
  }
  console.log(`✅ ${fahrzeuge.length} Fahrzeuge (Mandant 1) angelegt`)

  // Wartungen für Fahrzeuge
  const today = new Date()
  await prisma.wartung.createMany({
    data: [
      { mandantId: mandant1.id, fahrzeugId: fahrzeuge[0].id, typ: WartungTyp.REINIGUNG, datum: subDays(today, 4), kmStand: 86950, kosten: 85, beschreibung: "Innen- und Außenreinigung, Desinfektion", naechsteFaelligkeitDatum: addDays(today, 26) },
      { mandantId: mandant1.id, fahrzeugId: fahrzeuge[0].id, typ: WartungTyp.INSPEKTION, datum: subDays(today, 92), kmStand: 81200, kosten: 420, beschreibung: "Große Inspektion, Ölwechsel, Filter", naechsteFaelligkeitKm: 95000 },
      { mandantId: mandant1.id, fahrzeugId: fahrzeuge[2].id, typ: WartungTyp.BREMSEN, datum: subDays(today, 9), kmStand: 186200, kosten: 680, beschreibung: "Bremsbeläge vorne + hinten erneuert", naechsteFaelligkeitDatum: addDays(today, 180) },
      { mandantId: mandant1.id, fahrzeugId: fahrzeuge[4].id, typ: WartungTyp.REIFEN, datum: subDays(today, 18), kmStand: 212400, kosten: 920, beschreibung: "4x Winterreifen montiert + Auswuchten", naechsteFaelligkeitDatum: addDays(today, 160) },
      { mandantId: mandant1.id, fahrzeugId: fahrzeuge[5].id, typ: WartungTyp.KLIMA, datum: subDays(today, 31), kmStand: 15200, kosten: 195, beschreibung: "Klimaanlage-Service + Pollenfilter", naechsteFaelligkeitDatum: addDays(today, 120) },
    ]
  })
  console.log(`✅ Wartungshistorie angelegt`)

  // ========== AUFTRÄGE ==========
  // Abgeschlossene Aufträge (letzte 3 Wochen)
  const abgeschlossene = []
  const statusAbgeschlossen = [AuftragStatus.ABGESCHLOSSEN, AuftragStatus.ABGESCHLOSSEN, AuftragStatus.ABGESCHLOSSEN, AuftragStatus.ABGESCHLOSSEN]

  for (let i = 0; i < 95; i++) {
    const k = kunden[i % kunden.length]
    const f = fahrer[i % 5]
    const fz = fahrzeuge[i % 5]
    const baseDate = subDays(today, 2 + Math.floor(i / 2))

    const geplanteAbfahrt = new Date(baseDate)
    geplanteAbfahrt.setHours(7 + (i % 8), 15, 0, 0)
    const geplanteAnkunft = new Date(geplanteAbfahrt.getTime() + (35 + (i % 4) * 12) * 60000)

    const tatsaechlicheAbfahrt = new Date(geplanteAbfahrt.getTime() + (Math.random() > 0.6 ? -3 : 7) * 60000)
    const tatsaechlicheAnkunft = new Date(geplanteAnkunft.getTime() + (Math.random() > 0.5 ? 4 : 11) * 60000)

    const km = 14 + Math.floor(Math.random() * 38)
    const preis = Math.round((28 + km * 1.85 + (k.vertragsart === "Pflegeheim" ? -4 : 0)) * 100) / 100

    const auftrag = await prisma.auftrag.create({
      data: {
        mandantId: mandant1.id,
        kundeId: k.id,
        fahrerId: f.id,
        fahrzeugId: fz.id,
        pickupAdresse: `${k.strasse}, ${k.plz} ${k.ort}`,
        dropoffAdresse: i % 3 === 0 ? "Klinikum München-Großhadern, Marchioninistr. 15, 81377 München" : "Krankenhaus Starnberg, Osswaldstraße 1, 82319 Starnberg",
        geplanteAbfahrt,
        geplanteAnkunft,
        tatsaechlicheAbfahrt,
        tatsaechlicheAnkunft,
        km,
        status: AuftragStatus.ABGESCHLOSSEN,
        preis,
        notizen: i % 5 === 0 ? "Patient mit Rollstuhl, 2. Begleitperson" : undefined,
      }
    })

    // Abweichung bei ca. 35% der Fahrten
    if (Math.random() > 0.65) {
      await prisma.abweichung.create({
        data: {
          mandantId: mandant1.id,
          auftragId: auftrag.id,
          typ: ["Verspätung", "Stau", "Kunde nicht erreichbar", "Witterung"][i % 4],
          beschreibung: i % 4 === 0 ? "Starker Berufsverkehr auf B2, +11 Minuten" : "Patient war noch nicht fertig, 8 Min Wartezeit",
          auswirkungMinuten: 8 + Math.floor(Math.random() * 14),
        }
      })
    }
    abgeschlossene.push(auftrag)
  }

  // Heutige / diese Woche - DISPONIERT und IN_AUSFUEHRUNG
  const heute = new Date()
  heute.setHours(8, 30, 0, 0)

  // 4 DISPONIERTE Aufträge
  for (let i = 0; i < 4; i++) {
    const k = kunden[20 + i]
    const f = fahrer[(i + 2) % 6]
    const fz = fahrzeuge[i % 4]
    const abfahrt = addDays(heute, i === 0 ? 0 : 1)
    abfahrt.setHours(9 + i, 0, 0, 0)

    await prisma.auftrag.create({
      data: {
        mandantId: mandant1.id,
        kundeId: k.id,
        fahrerId: f.id,
        fahrzeugId: fz.id,
        pickupAdresse: `${k.strasse}, ${k.plz} ${k.ort}`,
        dropoffAdresse: "Krankenhaus Weilheim, Johann-Baptist-Ruf-Straße 30, 82362 Weilheim",
        geplanteAbfahrt: abfahrt,
        geplanteAnkunft: new Date(abfahrt.getTime() + 48 * 60000),
        status: AuftragStatus.DISPONIERT,
        preis: 47.5 + i * 3,
      }
    })
  }

  // 3 IN_AUSFUEHRUNG (heute unterwegs)
  for (let i = 0; i < 3; i++) {
    const k = kunden[8 + i]
    const f = fahrer[i]
    const fz = fahrzeuge[(i + 1) % 5]
    const abfahrt = new Date()
    abfahrt.setHours(10 + i, 15, 0, 0)

    await prisma.auftrag.create({
      data: {
        mandantId: mandant1.id,
        kundeId: k.id,
        fahrerId: f.id,
        fahrzeugId: fz.id,
        pickupAdresse: `${k.strasse}, ${k.plz} ${k.ort}`,
        dropoffAdresse: "MVZ Radiologie Starnberg, Possartstraße 4, 82319 Starnberg",
        geplanteAbfahrt: abfahrt,
        geplanteAnkunft: new Date(abfahrt.getTime() + 27 * 60000),
        tatsaechlicheAbfahrt: new Date(abfahrt.getTime() - 2 * 60000),
        status: AuftragStatus.IN_AUSFUEHRUNG,
        preis: 41.0,
      }
    })
  }

  // 6 GEPLANTE (nächste Tage)
  for (let i = 0; i < 6; i++) {
    const k = kunden[(i * 3) % 18]
    const abfahrt = addDays(heute, 2 + Math.floor(i / 2))
    abfahrt.setHours(7 + (i % 5), 45, 0, 0)

    await prisma.auftrag.create({
      data: {
        mandantId: mandant1.id,
        kundeId: k.id,
        pickupAdresse: `${k.strasse}, ${k.plz} ${k.ort}`,
        dropoffAdresse: "Klinikum Landsberg, Bgm.-Dr.-Hartl-Ring 1, 86899 Landsberg am Lech",
        geplanteAbfahrt: abfahrt,
        geplanteAnkunft: new Date(abfahrt.getTime() + 65 * 60000),
        status: AuftragStatus.GEPLANT,
        preis: 62 + i * 2.5,
      }
    })
  }

  console.log(`✅ Aufträge angelegt (~95 abgeschlossen + viele laufende + geplante über mehrere Wochen)`)

  console.log('\n🎉 Seed erfolgreich abgeschlossen!')
  console.log('   Starte mit: npm run dev')
  console.log('   Dann: npx prisma db push && npm run seed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
