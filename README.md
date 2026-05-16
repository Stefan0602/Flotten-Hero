# TransportPro – Flottenmanagement-System

Professionelles Flottenmanagement für mittelständische Transportdienstleister  
(50+ Mitarbeiter, 25 Fahrzeuge, 30+ Fahrer, 1.000 Kunden)

> **Detaillierte Installationsanleitung und vollständige Dokumentation:**  
> Siehe Datei **[DOKUMENTATION.md](./DOKUMENTATION.md)**

## Kernfunktionen

- **Kundenverwaltung** – Stammdaten, Vertragsarten, Rechnungsintervalle
- **Fahrer-Onboarding** – Qualifikationen (Rollstuhl, Trage, Intensiv), Verfügbarkeit, Status
- **Fahrzeugflotte & Wartung** – Reinigung, Inspektion, Verschleißteile mit Historie und Folgekosten
- **Vollständiger Prozess**:
  1. Beauftragung (neuer Auftrag)
  2. Disposition (Fahrer + Fahrzeug zuweisen)
  3. Ausführung (Ist-Zeiten, km, Abweichungen)
  4. Settlement & Abrechnung
- **FIBU-Export**: Professionelle PDF-Sammelrechnungen
- **Lohnbuchhaltung-Export**: CSV pro Fahrer (DATEV-kompatibel)
- **Investitionsmetriken**: Kosten/km, Auslastung, Deckungsbeitrag pro Fahrzeug

## Schnellstart (Windows)

### 1. Node.js installieren (falls noch nicht vorhanden)

Laden Sie die aktuelle LTS-Version herunter:  
https://nodejs.org (empfohlen: 20.x oder 22.x LTS)

Nach der Installation prüfen Sie in der Kommandozeile:
```cmd
node --version
npm --version
```

### 2. Projekt einrichten

```cmd
cd "C:\Users\stfis\Desktop\Diverse\Grok Build"

npm install
```

### 3. Datenbank initialisieren + Demo-Daten laden

```cmd
npx prisma db push
npm run seed
```

### 4. Anwendung starten

```cmd
npm run dev
```

Öffnen Sie im Browser: **http://localhost:3000**

> **Screenshots** zur besseren Veranschaulichung findest du im Ordner `screenshots/` sowie in der [DOKUMENTATION.md](./DOKUMENTATION.md).

---

## Demo-Zugangsdaten / Hinweise

Die Anwendung startet im **Demo-Modus** mit realistischen Testdaten:
- 25 Kunden (Seniorenresidenzen, Kliniken, Privatpersonen)
- 8 Fahrer mit unterschiedlichen Qualifikationen
- 6 Fahrzeuge mit Wartungshistorie
- 40+ Aufträge in verschiedenen Status

**Wichtige Seiten:**
- **Dashboard** – KPIs und Schnellzugriff
- **Disposition** – Herzstück: offene Aufträge zuweisen
- **Abrechnung** – PDF-Rechnungen + Lohn-CSV-Export
- **Berichte** – Investitionsmetriken

---

## Technologie-Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + **SQLite** (einfach migrierbar auf PostgreSQL)
- **Tailwind CSS** + modernes Business-Design
- **jsPDF** für Rechnungserstellung
- Vollständig auf Deutsch

---

## Multi-Tenant & Rollen (neu hinzugefügt)

Die Anwendung ist jetzt **multi-tenant-fähig** und unterstützt rollenbasierte Zugriffsrechte:

### Verfügbare Rollen
- **Leitung** → Voller Zugriff auf alle Funktionen
- **Sachbearbeiter – Disposition** → Beauftragung, Disposition, Ausführung, Abweichungen
- **Sachbearbeiter – Stammdaten** → Kunden, Fahrer, Fahrzeuge + Wartung
- **Sachbearbeiter – FIBU & Lohn** → Abrechnung, Rechnungen (PDF), Lohnexport (CSV), Berichte
- **Fahrer** → Eigene Aufträge + persönliche Lohnübersicht

### Demo-Logins
- `leitung@demo.de` / `demo123`
- `dispo@demo.de` / `demo123`
- `fibu@demo.de` / `demo123`
- `fahrer@demo.de` / `demo123`

Nach dem Login passt sich die Navigation automatisch an die Rolle an. Alle Daten sind mandantenspezifisch (Multi-Tenant).

---

## Nächste Schritte / Erweiterungsmöglichkeiten

- Mobile PWA für Fahrer (Status-Updates vom Handy)
- Echte Routenoptimierung
- DATEV / SAP Export-Schnittstelle
- Live-Tracking

---

**Erstellt für:** mittelständisches Transportunternehmen (Spezialverkehr, Patiententransporte, Altenpflege)  
**Stand:** April 2026

Bei Fragen oder Anpassungswünschen einfach melden.
