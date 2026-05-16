-- ============================================================================
-- ARM64-kompatibler Seed für TransportPro (SQLite)
-- Funktioniert ohne native Prisma-Engine (reines SQL + sql.js)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1. MANDANTEN
-- ------------------------------------------------------------
INSERT OR REPLACE INTO Mandant (id, name, strasse, plz, ort, telefon, email, logoUrl, primaryColor, secondaryColor, createdAt) VALUES
('mandant_demo', 'Demo Transport GmbH', 'Gewerbepark 12', '82319', 'Starnberg', '08151 998877', 'info@demo-transport.de', NULL, '#2563eb', '#1e40af', datetime('now')),
('mandant_muster', 'Muster Spedition Süd', 'Industriestraße 44', '86899', 'Landsberg am Lech', '08191 556600', 'kontakt@muster-spedition.de', NULL, '#059669', '#047857', datetime('now'));

-- ------------------------------------------------------------
-- 2. BENUTZER (Passwort für alle: demo123)
-- Hash erzeugt mit bcryptjs cost 10
-- ------------------------------------------------------------
INSERT OR REPLACE INTO User (id, email, name, passwordHash, role, mandantId, createdAt, lastLogin) VALUES
-- Mandant 1: Demo Transport GmbH
('user_admin1',  'admin@demo.de',      'Admin Demo',           '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'ADMIN',                     'mandant_demo', datetime('now'), datetime('now')),
('user_admin2',  'admin2@demo.de',     'Julia Schneider',      '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'ADMIN',                     'mandant_demo', datetime('now'), datetime('now')),
('user_leitung', 'leitung@demo.de',    'Anna Berger',          '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'LEITUNG',                   'mandant_demo', datetime('now'), datetime('now')),
('user_dispo',   'dispo@demo.de',      'Thomas Klein',         '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'SACHBEARBEITER_DISPO',      'mandant_demo', datetime('now'), datetime('now')),
('user_stamm',   'stammdaten@demo.de', 'Laura Weber',          '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'SACHBEARBEITER_STAMMDATEN', 'mandant_demo', datetime('now'), datetime('now')),
('user_fibu',    'fibu@demo.de',       'Markus Hoffmann',      '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'SACHBEARBEITER_FIBU',       'mandant_demo', datetime('now'), datetime('now')),
('user_fahrer',  'fahrer@demo.de',     'Michael Schmidt',      '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'FAHRER',                    'mandant_demo', datetime('now'), datetime('now')),

-- Mandant 2
('user_muster_leitung', 'leitung@muster.de', 'Sabine Roth',    '$2b$10$EYVPt1cmmscCO/Q15h1b1.01FqHGP8/yx/SOobcG8yv7CLjvu1Ye2', 'LEITUNG', 'mandant_muster', datetime('now'), datetime('now'));

-- ------------------------------------------------------------
-- 3. KUNDEN (8 Stück für Mandant 1)
-- ------------------------------------------------------------
INSERT OR REPLACE INTO Kunde (id, mandantId, name, strasse, plz, ort, telefon, email, vertragsart, rechnungsintervall, notizen, angelegtAm) VALUES
('k1', 'mandant_demo', 'Seniorenresidenz Sonnenhof', 'Am Park 12', '82319', 'Starnberg', '08151 98765', 'verwaltung@sonnenhof.de', 'Pflegeheim', 'monatlich', NULL, datetime('now')),
('k2', 'mandant_demo', 'Krankenhaus München-Süd', 'Thalkirchner Str. 48', '81371', 'München', '089 123456', 'transport@kh-muenchen-sued.de', 'Klinik', 'monatlich', NULL, datetime('now')),
('k3', 'mandant_demo', 'Frau Maria Huber', 'Lindenstraße 7', '82347', 'Penzberg', '0172 3344556', 'm.huber@web.de', 'Privat', 'monatlich', NULL, datetime('now')),
('k4', 'mandant_demo', 'Pflegeheim Haus am See', 'Seestraße 22', '82418', 'Murnau', '08841 556677', 'info@hausamsee-pflege.de', 'Pflegeheim', 'monatlich', NULL, datetime('now')),
('k5', 'mandant_demo', 'Rollstuhl-Transporte GmbH', 'Industriestraße 5', '82110', 'Germering', '089 998877', 'auftraege@rollstuhl-transporte.de', 'Firma', 'wöchentlich', NULL, datetime('now')),
('k6', 'mandant_demo', 'Klinikum Landsberg', 'Bgm.-Dr.-Hartl-Ring 1', '86899', 'Landsberg am Lech', '08191 333000', 'patiententransport@klinikum-landsberg.de', 'Klinik', 'monatlich', NULL, datetime('now')),
('k7', 'mandant_demo', 'Herr Josef Maier', 'Bahnhofstraße 44', '82362', 'Weilheim', '0176 11223344', 'j.maier@t-online.de', 'Privat', 'monatlich', NULL, datetime('now')),
('k8', 'mandant_demo', 'Caritas Sozialstation', 'Rathausplatz 3', '82343', 'Pöcking', '08157 889900', 'fahrten@caritas-starnberg.de', 'Pflegeheim', 'monatlich', NULL, datetime('now'));

-- ------------------------------------------------------------
-- 4. FAHRER (5 Stück)
-- ------------------------------------------------------------
INSERT OR REPLACE INTO Fahrer (id, mandantId, vorname, nachname, fuehrerscheinKlasse, qualifikationen, stundenlohn, status, verfuegbarVon, verfuegbarBis, createdAt) VALUES
('f1', 'mandant_demo', 'Michael', 'Schmidt', 'B, BE', '["Rollstuhl","Trage"]', 24.50, 'AKTIV', NULL, NULL, datetime('now')),
('f2', 'mandant_demo', 'Sandra', 'Weber', 'B', '["Rollstuhl"]', 22.80, 'AKTIV', NULL, NULL, datetime('now')),
('f3', 'mandant_demo', 'Thomas', 'Bauer', 'B, BE, C1', '["Trage","Intensiv"]', 26.00, 'AKTIV', NULL, NULL, datetime('now')),
('f4', 'mandant_demo', 'Laura', 'Müller', 'B', '["Rollstuhl","Trage"]', 23.50, 'URLAUB', NULL, NULL, datetime('now')),
('f5', 'mandant_demo', 'Markus', 'Hoffmann', 'B, BE', '["Trage"]', 25.00, 'KRANK', NULL, NULL, datetime('now'));

-- ------------------------------------------------------------
-- 5. FAHRZEUGE (4 Stück)
-- ------------------------------------------------------------
INSERT OR REPLACE INTO Fahrzeug (id, mandantId, kennzeichen, modell, baujahr, kmStand, anschaffungskosten, status) VALUES
('fz1', 'mandant_demo', 'STA-AB 1234', 'Mercedes-Benz Vito Tourer', 2022, 87450, 48500, 'VERFUEGBAR'),
('fz2', 'mandant_demo', 'STA-CD 5678', 'Volkswagen Crafter', 2021, 124300, 52900, 'VERFUEGBAR'),
('fz3', 'mandant_demo', 'WM-EF 9012', 'Mercedes-Benz Sprinter', 2020, 187600, 46700, 'IN_WARTUNG'),
('fz4', 'mandant_demo', 'STA-GH 3456', 'Skoda Octavia Combi', 2023, 39200, 31200, 'VERFUEGBAR');

-- ------------------------------------------------------------
-- 6. WARTUNGEN
-- ------------------------------------------------------------
INSERT OR REPLACE INTO Wartung (id, mandantId, fahrzeugId, typ, datum, kmStand, kosten, beschreibung, naechsteFaelligkeitDatum, naechsteFaelligkeitKm) VALUES
('w1', 'mandant_demo', 'fz1', 'REINIGUNG', datetime('now', '-4 days'), 86950, 85, 'Innen- und Außenreinigung, Desinfektion', datetime('now', '+26 days'), NULL),
('w2', 'mandant_demo', 'fz1', 'INSPEKTION', datetime('now', '-92 days'), 81200, 420, 'Große Inspektion, Ölwechsel, Filter', NULL, 95000),
('w3', 'mandant_demo', 'fz3', 'BREMSEN', datetime('now', '-9 days'), 186200, 680, 'Bremsbeläge vorne + hinten erneuert', datetime('now', '+180 days'), NULL),
('w4', 'mandant_demo', 'fz2', 'REIFEN', datetime('now', '-18 days'), 124000, 920, '4x Winterreifen montiert + Auswuchten', datetime('now', '+160 days'), NULL);

-- ------------------------------------------------------------
-- 7. AUFTRÄGE (12 Stück - guter Mix)
-- ------------------------------------------------------------

-- ABGESCHLOSSENE Aufträge (letzte Tage)
INSERT OR REPLACE INTO Auftrag (id, mandantId, kundeId, fahrerId, fahrzeugId, pickupAdresse, dropoffAdresse, geplanteAbfahrt, geplanteAnkunft, tatsaechlicheAbfahrt, tatsaechlicheAnkunft, km, status, preis, notizen, createdAt) VALUES
('a1', 'mandant_demo', 'k1', 'f1', 'fz1', 'Am Park 12, 82319 Starnberg', 'Krankenhaus Starnberg, Osswaldstraße 1, 82319 Starnberg', datetime('now', '-2 days', 'start of day', '+8 hours'), datetime('now', '-2 days', 'start of day', '+9 hours'), datetime('now', '-2 days', 'start of day', '+8 hours', '+2 minutes'), datetime('now', '-2 days', 'start of day', '+9 hours', '+7 minutes'), 19, 'ABGESCHLOSSEN', 52.40, 'Patient mit Rollstuhl', datetime('now', '-3 days')),
('a2', 'mandant_demo', 'k2', 'f2', 'fz2', 'Thalkirchner Str. 48, 81371 München', 'Klinikum München-Großhadern, Marchioninistr. 15, 81377 München', datetime('now', '-1 day', 'start of day', '+9 hours'), datetime('now', '-1 day', 'start of day', '+10 hours'), datetime('now', '-1 day', 'start of day', '+9 hours', '-4 minutes'), datetime('now', '-1 day', 'start of day', '+10 hours', '+3 minutes'), 27, 'ABGESCHLOSSEN', 61.80, NULL, datetime('now', '-2 days')),
('a3', 'mandant_demo', 'k3', 'f1', 'fz4', 'Lindenstraße 7, 82347 Penzberg', 'Krankenhaus Starnberg, Osswaldstraße 1, 82319 Starnberg', datetime('now', '-3 days', 'start of day', '+7 hours'), datetime('now', '-3 days', 'start of day', '+8 hours'), datetime('now', '-3 days', 'start of day', '+7 hours', '+11 minutes'), datetime('now', '-3 days', 'start of day', '+8 hours', '+19 minutes'), 34, 'ABGESCHLOSSEN', 48.90, 'Begleitperson', datetime('now', '-4 days'));

-- DISPONIERTE Aufträge (heute + morgen)
INSERT OR REPLACE INTO Auftrag (id, mandantId, kundeId, fahrerId, fahrzeugId, pickupAdresse, dropoffAdresse, geplanteAbfahrt, geplanteAnkunft, status, preis, createdAt) VALUES
('a10', 'mandant_demo', 'k1', 'f1', 'fz1', 'Am Park 12, 82319 Starnberg', 'Krankenhaus Weilheim, Johann-Baptist-Ruf-Straße 30, 82362 Weilheim', datetime('now', 'start of day', '+9 hours'), datetime('now', 'start of day', '+10 hours'), 'DISPONIERT', 51.00, datetime('now', '-1 day')),
('a11', 'mandant_demo', 'k4', 'f3', 'fz2', 'Seestraße 22, 82418 Murnau', 'Klinikum Landsberg, Bgm.-Dr.-Hartl-Ring 1, 86899 Landsberg am Lech', datetime('now', '+1 day', 'start of day', '+10 hours'), datetime('now', '+1 day', 'start of day', '+11 hours'), 'DISPONIERT', 67.50, datetime('now')),
('a12', 'mandant_demo', 'k5', 'f2', 'fz4', 'Industriestraße 5, 82110 Germering', 'Krankenhaus München-Süd, Thalkirchner Str. 48, 81371 München', datetime('now', '+1 day', 'start of day', '+8 hours'), datetime('now', '+1 day', 'start of day', '+9 hours'), 'DISPONIERT', 44.00, datetime('now'));

-- IN_AUSFUEHRUNG (eine aktive Fahrt)
INSERT OR REPLACE INTO Auftrag (id, mandantId, kundeId, fahrerId, fahrzeugId, pickupAdresse, dropoffAdresse, geplanteAbfahrt, geplanteAnkunft, tatsaechlicheAbfahrt, status, preis, createdAt) VALUES
('a20', 'mandant_demo', 'k2', 'f3', 'fz3', 'Thalkirchner Str. 48, 81371 München', 'Klinikum München-Großhadern, Marchioninistr. 15, 81377 München', datetime('now', 'start of day', '+7 hours'), datetime('now', 'start of day', '+8 hours'), datetime('now', 'start of day', '+7 hours', '+5 minutes'), 'IN_AUSFUEHRUNG', 58.00, datetime('now', '-1 day'));

-- ------------------------------------------------------------
-- 8. ABWEICHUNGEN (für ein paar abgeschlossene Aufträge)
-- ------------------------------------------------------------
INSERT OR REPLACE INTO Abweichung (id, mandantId, auftragId, typ, beschreibung, zeitpunkt, auswirkungMinuten) VALUES
('abw1', 'mandant_demo', 'a1', 'Stau', 'Starker Berufsverkehr auf B2, +11 Minuten', datetime('now', '-2 days', '+9 hours'), 11),
('abw2', 'mandant_demo', 'a3', 'Verspätung', 'Patient war noch nicht fertig, 8 Min Wartezeit', datetime('now', '-3 days', '+7 hours'), 8);

-- ============================================================================
-- FERTIG
-- ============================================================================
-- Nach dem Ausführen sollten folgende Datensätze vorhanden sein:
-- - 2 Mandanten
-- - 8 Benutzer (inkl. 2 Admins)
-- - 8 Kunden
-- - 5 Fahrer
-- - 4 Fahrzeuge + 4 Wartungen
-- - 6+ Aufträge in verschiedenen Status
-- - 2 Abweichungen
--
-- Login: admin@demo.de / demo123  (oder leitung@demo.de, dispo@demo.de, etc.)
-- ============================================================================