# TransportPro – Dokumentation & Installationsanleitung

**Version:** 1.0 (April 2026)  
**Zweck:** Professionelles Flottenmanagement-System für mittelständische Transportunternehmen mit Multi-Tenant- und White-Label-Fähigkeit.

---

## 1. Systemvoraussetzungen

- Node.js **20.x oder höher** (LTS empfohlen)
- npm oder pnpm
- (Optional) PostgreSQL für den Produktiveinsatz (aktuell SQLite für lokale Demos)

---

## 2. Installation & Start (lokale Entwicklung)

### Schritt 1: Repository klonen / herunterladen

```bash
cd "C:\Users\stfis\Desktop\Diverse\Grok Build"
```

### Schritt 2: Abhängigkeiten installieren

```bash
npm install
```

### Schritt 3: Umgebungsvariablen anlegen

Kopiere die Beispiel-Datei:

```bash
cp .env.example .env
```

Oder erstelle manuell eine Datei `.env` im Projekt-Root mit folgendem Inhalt:

```env
# Datenbank (SQLite für lokale Entwicklung)
DATABASE_URL="file:./prisma/dev.db"

# Geheimer Schlüssel für JWT-Sessions (bitte ändern!)
AUTH_SECRET="transportpro-super-secret-key-please-change-in-production-2026"

# Node-Umgebung
NODE_ENV="development"
```

### Schritt 4: Datenbank initialisieren

```bash
npx prisma db push
```

### Schritt 5: Demo-Daten laden (empfohlen)

```bash
npm run seed
```

Dadurch werden angelegt:
- 2 Mandanten (Unternehmen)
- Mehrere Benutzer mit unterschiedlichen Rollen
- Kunden, Fahrer, Fahrzeuge, Aufträge, Wartungen etc.

### Schritt 6: Anwendung starten

```bash
npm run dev
```

Die App ist dann unter folgender Adresse erreichbar:

**http://localhost:3000**

---

## 3. Demo-Zugangsdaten

| Rolle                        | E-Mail                | Passwort   | Hinweis |
|-----------------------------|-----------------------|------------|---------|
| **Administrator**           | admin@demo.de         | demo123    | Vollzugriff + Benutzerverwaltung |
| **Administrator 2**         | admin2@demo.de        | demo123    | Zweiter Admin (Sicherheit) |
| **Geschäftsleitung**        | leitung@demo.de       | demo123    | Voller operativer Zugriff |
| **Sachbearbeiter Disposition** | dispo@demo.de      | demo123    | Beauftragung & Disposition |
| **Sachbearbeiter Stammdaten** | stammdaten@demo.de  | demo123    | Kunden, Fahrer, Fahrzeuge |
| **Sachbearbeiter FIBU**     | fibu@demo.de          | demo123    | Abrechnung, Rechnungen, Lohn |
| **Fahrer**                  | fahrer@demo.de        | demo123    | Eigene Aufträge + Lohn |

> **Wichtig:** Es gibt immer mindestens 2 Administratoren pro Mandant. Das System verhindert, dass der letzte oder vorletzte Admin gelöscht oder herabgestuft wird.

---

## 4. Rollen & Berechtigungen

| Rolle                              | Benutzerverwaltung | Meine Firma | Disposition | Stammdaten | FIBU & Lohn | Eigene Aufträge |
|------------------------------------|--------------------|-------------|-------------|------------|-------------|-----------------|
| **ADMIN**                          | Ja                 | Ja          | Ja          | Ja         | Ja          | Ja              |
| **LEITUNG**                        | Nein               | Nein        | Ja          | Ja         | Ja          | Ja              |
| **SACHBEARBEITER_DISPO**           | Nein               | Nein        | Ja          | Nein       | Nein        | Nein            |
| **SACHBEARBEITER_STAMMDATEN**      | Nein               | Nein        | Nein        | Ja         | Nein        | Nein            |
| **SACHBEARBEITER_FIBU**            | Nein               | Nein        | Nein        | Nein       | Ja          | Nein            |
| **FAHRER**                         | Nein               | Nein        | Nein        | Nein       | Nein        | Ja              |

---

## 5. Wichtige Funktionen

### 5.1 Prozesskette
- **Beauftragung** → Neuer Auftrag anlegen
- **Disposition** → Fahrer + Fahrzeug zuweisen + Fahrt starten
- **Ausführung** → Fahrt abschließen mit tatsächlichen Zeiten und Abweichungen
- **Settlement** → PDF-Rechnungen + Lohn-CSV-Export

### 5.2 White-Label / Branding
Unter **Admin → Meine Firma** können folgende Einstellungen vorgenommen werden:
- Firmenname
- Adresse & Kontaktdaten
- Logo-URL
- Primärfarbe
- Sekundärfarbe

Die Farben werden automatisch im gesamten System angewendet (Buttons, Akzente).

### 5.3 Benutzerverwaltung (nur Admin)
- Benutzer anlegen
- Rollen ändern
- Passwörter zurücksetzen
- Benutzer löschen (mit Schutz vor zu wenigen Admins)

---

## 6. Datenbank

- **Entwicklung:** SQLite (`prisma/dev.db`)
- **Produktion:** Empfohlen wird PostgreSQL

Migration auf PostgreSQL:
1. `DATABASE_URL` in `.env` auf PostgreSQL anpassen
2. `npx prisma db push` ausführen

---

## 7. Bekannte Einschränkungen (MVP-Stand)

- Keine echte Datei-Upload-Funktion für Logos (nur URL)
- Kein E-Mail-Versand (Rechnungen nur als PDF-Download)
- Keine Live-Tracking / GPS-Funktion
- Keine Route-Optimierung
- Audit-Log ist nur im Backend aktiv (keine eigene Ansichtsseite)

---

## 8. Nützliche Befehle

| Befehl                    | Beschreibung                          |
|---------------------------|---------------------------------------|
| `npm run dev`             | Entwicklungsserver starten            |
| `npm run seed`            | Demo-Daten neu laden                  |
| `npx prisma studio`       | Datenbank-Explorer öffnen             |
| `npx prisma db push`      | Schema-Änderungen anwenden            |
| `npm run build`           | Produktions-Build erstellen           |

---

## 9. Support & Weiterentwicklung

Bei Fragen oder Anpassungswünschen bitte die folgenden Punkte angeben:
- Gewünschte Rolle
- Betroffener Mandant
- Gewünschtes Verhalten

---

**Stand der Dokumentation:** April 2026  
**Entwickelt als Multi-Tenant- und White-Label-fähiges Flottenmanagement-System.**

---

## 10. Screenshots

Im Folgenden findest du empfohlene Screenshots zur Veranschaulichung der Anwendung.  
Die Bilder liegen im Ordner `/screenshots`.

### Empfohlene Screenshots

| Nr. | Dateiname                  | Beschreibung                                                                 | Wichtigkeit |
|-----|----------------------------|-------------------------------------------------------------------------------|-------------|
| 1   | `01-login.png`             | Login-Seite mit Hinweis auf Demo-Zugänge                                      | Hoch        |
| 2   | `02-dashboard.png`         | Dashboard nach Login (mit Firmenname und KPIs)                                | Hoch        |
| 3   | `03-disposition.png`       | Disposition-Ansicht mit offenen Aufträgen und Verfügbarkeitsübersicht         | Hoch        |
| 4   | `04-fahrt-abschliessen.png`| Modal „Fahrt abschließen“ mit Abweichungserfassung                            | Hoch        |
| 5   | `05-benutzerverwaltung.png`| Benutzerverwaltung (Admin) mit Aktionen (Rolle ändern, Passwort, Löschen)     | Mittel      |
| 6   | `06-meine-firma.png`       | „Meine Firma“-Seite mit Branding-Farbauswahl und Logo-URL                     | Mittel      |
| 7   | `07-abrechnung.png`        | Abrechnungsseite mit Auswahl für PDF-Rechnung und Lohn-CSV-Export             | Mittel      |
| 8   | `08-sidebar-admin.png`     | Sidebar-Ansicht als Administrator (Benutzerverwaltung + Meine Firma sichtbar) | Niedrig     |
| 9   | `09-sidebar-fahrer.png`    | Sidebar-Ansicht als Fahrer (nur „Meine Aufträge“ und „Lohn“)                  | Niedrig     |

### Hinweise zum Erstellen der Screenshots

- Nutze am besten eine Auflösung von **1920×1080** oder höher.
- Blende die Browser-Leiste aus (Fullscreen-Modus oder DevTools).
- Verwende die Demo-Daten nach `npm run seed`.
- Für das Login-Screenshot: Markiere kurz die Demo-Accounts.
- Für das Branding-Screenshot: Ändere die Primärfarbe auf ein auffälliges Rot oder Grün, damit der Effekt deutlich wird.

### Beispiel Markdown-Einbindung

```markdown
### Login-Seite

![Login-Seite](screenshots/01-login.png)
```

---

## 11. Kontakt & Weiterentwicklung

Bei Fragen oder Anpassungswünschen bitte die folgenden Punkte angeben:
- Gewünschte Rolle
- Betroffener Mandant
- Gewünschtes Verhalten

---

**Stand der Dokumentation:** April 2026  
**Entwickelt als Multi-Tenant- und White-Label-fähiges Flottenmanagement-System.**
