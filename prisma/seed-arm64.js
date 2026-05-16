#!/usr/bin/env node
/**
 * ARM64-kompatibler Seed Runner für TransportPro
 * Verwendet sql.js (reines WebAssembly) — funktioniert auf jedem System,
 * inklusive Windows ARM64, ohne native .node-Module.
 *
 * Nutzung:
 *   node prisma/seed-arm64.js
 * oder
 *   npm run seed:arm64
 */

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'dev.db');
const SQL_PATH = path.join(__dirname, 'seed.sql');

async function main() {
  console.log('🌱 ARM64-kompatibler Seed für TransportPro wird ausgeführt...\n');

  // 1. sql.js initialisieren (WASM-basiert, keine nativen Abhängigkeiten)
  const SQL = await initSqlJs({
    // sql.js sucht automatisch nach sql-wasm.wasm im selben Verzeichnis oder node_modules
    locateFile: (file) => require.resolve(`sql.js/dist/${file}`),
  });

  // 2. Bestehende Datenbank laden oder neue erzeugen
  let dbBuffer;
  if (fs.existsSync(DB_PATH)) {
    console.log('📦 Bestehende dev.db gefunden — wird überschrieben...');
    dbBuffer = fs.readFileSync(DB_PATH);
  } else {
    console.log('📦 Neue SQLite-Datenbank wird angelegt...');
    dbBuffer = null;
  }

  const db = new SQL.Database(dbBuffer ? new Uint8Array(dbBuffer) : undefined);

  // 3. Seed-SQL einlesen
  if (!fs.existsSync(SQL_PATH)) {
    console.error('❌ prisma/seed.sql nicht gefunden!');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(SQL_PATH, 'utf8');
  console.log('📄 seed.sql geladen (' + sqlContent.length + ' Zeichen)\n');

  // 4. SQL ausführen (Transaktion für Geschwindigkeit + Sicherheit)
  try {
    db.run('BEGIN TRANSACTION;');
    db.run(sqlContent);
    db.run('COMMIT;');
    console.log('✅ SQL-Seed erfolgreich ausgeführt!\n');
  } catch (err) {
    db.run('ROLLBACK;');
    console.error('❌ Fehler beim Ausführen des Seeds:');
    console.error(err.message);
    process.exit(1);
  }

  // 5. Datenbank zurückschreiben
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);

  // 6. Kurze Statistik
  const stats = {
    mandanten: db.exec("SELECT COUNT(*) as c FROM Mandant")[0].values[0][0],
    users: db.exec("SELECT COUNT(*) as c FROM User")[0].values[0][0],
    kunden: db.exec("SELECT COUNT(*) as c FROM Kunde")[0].values[0][0],
    fahrer: db.exec("SELECT COUNT(*) as c FROM Fahrer")[0].values[0][0],
    fahrzeuge: db.exec("SELECT COUNT(*) as c FROM Fahrzeug")[0].values[0][0],
    auftraege: db.exec("SELECT COUNT(*) as c FROM Auftrag")[0].values[0][0],
    abweichungen: db.exec("SELECT COUNT(*) as c FROM Abweichung")[0].values[0][0],
  };

  console.log('📊 Angelegte Datensätze:');
  console.log(`   • Mandanten:     ${stats.mandanten}`);
  console.log(`   • Benutzer:      ${stats.users}`);
  console.log(`   • Kunden:        ${stats.kunden}`);
  console.log(`   • Fahrer:        ${stats.fahrer}`);
  console.log(`   • Fahrzeuge:     ${stats.fahrzeuge}`);
  console.log(`   • Aufträge:      ${stats.auftraege}`);
  console.log(`   • Abweichungen:  ${stats.abweichungen}\n`);

  console.log('✅ Seed abgeschlossen!');
  console.log('   Du kannst jetzt `npm run dev` starten und dich mit folgenden Zugängen anmelden:\n');
  console.log('   admin@demo.de     / demo123   (ADMIN)');
  console.log('   leitung@demo.de   / demo123   (LEITUNG)');
  console.log('   dispo@demo.de     / demo123   (Disposition)');
  console.log('   fibu@demo.de      / demo123   (FIBU & Abrechnung)');
  console.log('   fahrer@demo.de    / demo123   (Fahrer)\n');

  db.close();
}

main().catch((e) => {
  console.error('Unerwarteter Fehler:', e);
  process.exit(1);
});