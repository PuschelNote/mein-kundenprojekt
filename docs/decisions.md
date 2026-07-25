# Entscheidungen — Bella Vista Restaurant-App

_Chronologisch. Neue Einträge unten ergänzen; bestehende Entscheidungen nicht
lautlos umschreiben._

## 2026-07-23 — `docs/spec.md` ersetzt das PRD

- **Status:** angenommen
- **Kontext:** Für das Projekt existiert bereits eine detaillierte fachliche Spec.
- **Entscheidung:** Es wird keine `prd.md` geführt. `docs/spec.md` ist die
  fachliche Single Source of Truth und übernimmt die strategische Rolle des PRD.
- **Konsequenz:** Arbeitsanweisungen und Dokumente verweisen auf `spec.md`.

## 2026-07-23 — Solo-Dokumentationsmodell

- **Status:** angenommen
- **Kontext:** Das Projekt wird von einer Person mit AI-Unterstützung umgesetzt.
- **Entscheidung:** Es gibt keine Team-Missionen, Meeting-Ordner, Results-Ordner
  oder INBOX. Status und Arbeitsfluss leben in Spec, Backlog, Konzepten,
  Architektur, Entscheidungen und Git-Historie.
- **Konsequenz:** Zusätzliche Koordinationsartefakte werden erst eingeführt, wenn
  ein reales Problem sie rechtfertigt.

## 2026-07-23 — Standort ist eine harte Datengrenze

- **Status:** angenommen
- **Kontext:** Fehlende Standortangaben verursachten bereits eine Doppelbuchung;
  außerdem unterscheiden sich Karten, Tische und Öffnungszeiten.
- **Entscheidung:** Jede standortgebundene Operation und Entität trägt eine
  explizite Standort-ID. Sichtbare Tischnummern sind nur innerhalb eines
  Standorts eindeutig.
- **Konsequenz:** Datenmodell, Abfragen, Tests und Oberfläche behandeln den
  Standort nicht als optionalen Filter.

## 2026-07-23 — Preise werden auf Bestellpositionen historisiert

- **Status:** angenommen
- **Kontext:** Kartenpreise können sich ändern, abgeschlossene Abrechnungen
  müssen jedoch reproduzierbar bleiben.
- **Entscheidung:** Jede Bestellposition speichert den beim Hinzufügen gültigen
  Einzelpreis; spätere Kartenänderungen verändern bestehende Bestellungen nicht.
- **Konsequenz:** Summen werden aus Positionspreisen berechnet, nicht aus dem
  aktuellen Gerichtspreis.

## 2026-07-23 — Offline-Fähigkeit ist Architekturvorgabe

- **Status:** angenommen
- **Kontext:** Die App darf bei einem Internetausfall im Restaurant nicht
  zusammenbrechen.
- **Entscheidung:** Kernabläufe werden offline-first geplant. Schreibvorgänge
  benötigen stabile IDs, lokale Persistenz, idempotente Synchronisation und
  explizite Konfliktregeln.
- **Konsequenz:** Ein reiner Online-Client ohne lokale Schreibfähigkeit erfüllt
  die Spec nicht.

## 2026-07-23 — Next.js, Prisma und SQLite als initialer Stack

- **Status:** angenommen
- **Kontext:** Das Projekt benötigt ein schlankes, typsicheres Grundgerüst für
  Oberfläche, serverseitige Geschäftslogik und lokale relationale Persistenz.
- **Entscheidung:** Die Anwendung verwendet Next.js 16 mit App Router, React 19,
  TypeScript 6 im Strict Mode, Prisma ORM 7 und lokales SQLite über den offiziellen
  `@prisma/adapter-better-sqlite3`. ESLint 9 übernimmt die statische Prüfung.
- **Alternativen:** Ein getrenntes Frontend/Backend und eine zentrale PostgreSQL-
  Datenbank wurden für den Projektstart nicht gewählt, weil sie zusätzliche
  Betriebs- und Deployment-Komplexität erzeugen.
- **Konsequenz:** Prisma-Schema und Migrationen sind die versionierte Datenbank-
  Wahrheit. Lokale `.env`- und Datenbankdateien werden nicht committed. SQLite
  erfüllt allein noch keine Mehrgeräte-Synchronisation; dafür bleibt eine eigene
  Architekturentscheidung erforderlich.

## 2026-07-23 — Dokumentation ist verpflichtender Pre-Commit-Schritt

- **Status:** angenommen
- **Kontext:** Code, Entscheidungen und operativer Feature-Status sollen nicht
  auseinanderlaufen.
- **Entscheidung:** Vor jedem Commit werden relevante Entscheidungen in dieser
  Datei ergänzt und die betroffenen Feature-Status in `backlog.md` aktualisiert.
- **Konsequenz:** Ein Commit ist erst bereit, wenn Implementierung und
  Projektdokumentation denselben Stand abbilden.

## 2026-07-23 — Mitarbeiter als standortgebundene Entität

- **Status:** angenommen
- **Kontext:** `BV-001` verlangt für jeden Mitarbeiter ID, Name, Standort und
  genau eine der drei Rollen. Das vollständige Standortfeature `BV-002` folgt
  erst anschließend, die Relation ist jedoch bereits für `BV-001` erforderlich.
- **Entscheidung:** `Mitarbeiter` referenziert verpflichtend einen minimalen
  `Standort`-Datensatz. Kreuzberg und Spandau werden idempotent als Grunddaten
  angelegt. Rollen werden als Prisma-Enum `bedienung`, `manager` und `inhaber`
  gespeichert.
- **Konsequenz:** Die Datenbank verhindert Mitarbeiter ohne gültigen Standort
  oder Rolle. Der globale Standortkontext und weitere Standortlogik bleiben
  weiterhin Scope von `BV-002`.

## 2026-07-23 — Mitarbeiterverwaltung nutzt Server Actions

- **Status:** angenommen
- **Kontext:** Das erste CRUD-Feature soll ohne zusätzliche API-Schicht klein und
  serverseitig validiert bleiben.
- **Entscheidung:** `/mitarbeiter` verwendet Next.js Server Components und Server
  Actions. Validierung und Prisma-Zugriffe liegen unabhängig von der UI in
  `lib/mitarbeiter.ts`. Mitarbeiter können angelegt, bearbeitet und gelöscht
  werden; Standortlöschung bleibt durch die Datenbankrelation eingeschränkt.
- **Konsequenz:** Die Oberfläche ist kein Sicherheitsperimeter. Authentifizierung
  und Autorisierung werden später mit `BV-022` an der serverseitigen
  Anwendungsgrenze ergänzt.

## 2026-07-23 — Lokale CRUD-Integrationstests gegen SQLite

- **Status:** angenommen
- **Kontext:** Validierung allein beweist nicht, dass Prisma-Schema, Adapter und
  CRUD-Logik gemeinsam funktionieren.
- **Entscheidung:** Der eingebaute Node-Test-Runner wird über `tsx` ausgeführt.
  Tests prüfen Validierung und einen vollständigen Anlegen–Ändern–Löschen-Ablauf
  gegen die lokale SQLite-Datenbank. Testdatensätze tragen eindeutige Namen und
  werden wieder entfernt.
- **Konsequenz:** `npm test` setzt eine migrierte lokale Datenbank voraus, lässt
  aber keine Mitarbeiter-Testdaten zurück.

## 2026-07-23 — Expliziter Standortkontext im HTTP-only Cookie

- **Status:** angenommen
- **Kontext:** Fehlende oder implizite Standortannahmen haben im realen Betrieb
  bereits eine Doppelbuchung zwischen Kreuzberg und Spandau verursacht.
- **Entscheidung:** Der aktive Standort wird erst nach ausdrücklicher Auswahl in
  einem HTTP-only Cookie `bella-vista-standort` gespeichert. Ohne gültigen Cookie
  leiten standortgebundene Seiten nach `/standort` um. Zulässig sind nur die IDs
  `kreuzberg` und `spandau`, zusätzlich validiert gegen die Datenbank.
- **Alternativen:** Ein stiller Standardstandort und eine rein clientseitige
  Auswahl wurden verworfen, weil beide falsche oder manipulierbare Zuordnungen
  ermöglichen.
- **Konsequenz:** Künftige standortgebundene Server Actions müssen den zentralen
  Helper in `lib/standort.ts` verwenden. Das Cookie erleichtert Kontextführung,
  ersetzt aber weder Anmeldung noch Berechtigungsprüfung aus `BV-022`.

## 2026-07-23 — Standortwechsel erlaubt nur interne Rücksprungziele

- **Status:** angenommen
- **Kontext:** Nach der Standortwahl soll zur ursprünglich angeforderten Seite
  zurückgesprungen werden, ohne eine Open-Redirect-Schwachstelle einzuführen.
- **Entscheidung:** `returnTo` akzeptiert ausschließlich absolute interne Pfade,
  die mit genau einem `/` beginnen. Externe URLs, protokollrelative URLs und
  ungültige Werte fallen auf `/` zurück.
- **Konsequenz:** Standortauswahl bleibt komfortabel und kann nicht als
  Weiterleitung auf fremde Domains missbraucht werden.

## 2026-07-23 — Standardöffnungszeiten als Minuten seit Mitternacht

- **Status:** angenommen
- **Kontext:** Standardzeiten müssen angezeigt und später für Reservierungen und
  den Küchenannahmeschluss zuverlässig verglichen werden können. SQLite besitzt
  keinen eigenständigen Uhrzeittyp.
- **Entscheidung:** Pro Standort und geöffnetem Wochentag existiert genau ein
  `StandardOeffnungszeit`-Datensatz. Öffnungs- und Schließzeit werden als ganze
  Minuten seit Mitternacht gespeichert. Ein fehlender Wochentag bedeutet
  „geschlossen“.
- **Alternativen:** Freie Uhrzeitstrings und explizite Datensätze mit
  `geschlossen=true` wurden verworfen, weil sie zusätzliche Format- bzw.
  Konsistenzzustände erlauben würden.
- **Konsequenz:** Zeitfenster sind eindeutig vergleichbar. Die Domänenlogik
  validiert `0 <= Öffnung < Schließung <= 1440`; die Schließminute selbst gilt
  bereits als geschlossen.

## 2026-07-23 — Standardzeiten sind feste Grunddaten

- **Status:** angenommen
- **Kontext:** Die Spec nennt feste reguläre Zeiten; veränderliche Feiertage sind
  getrennt als `BV-016` vorgesehen.
- **Entscheidung:** Kreuzberg Di–So 17–23 Uhr und Spandau Do–So 17–22 Uhr werden
  idempotent über den Seed gepflegt und zunächst nur angezeigt.
- **Konsequenz:** `BV-020` enthält keine Bearbeitungsoberfläche. Feiertags-
  Overrides oder sonstige Ausnahmen verändern die Standarddatensätze später
  nicht, sondern überlagern sie datumsbezogen.

## 2026-07-23 — Stabile IDs für bekannte Standortmanager

- **Status:** angenommen
- **Kontext:** Die Spec benennt Giuseppe für Kreuzberg und Renate für Spandau.
  Wiederholtes Seeding bei Setup und Tests darf keine Duplikate erzeugen.
- **Entscheidung:** Beide Manager erhalten stabile technische IDs
  `manager-kreuzberg-giuseppe` und `manager-spandau-renate`. Das zentrale
  Grunddaten-Seeding verwendet Upserts mit leerem Update-Zweig.
- **Alternativen:** Namen als natürliche Schlüssel und ein Seed, der Datensätze
  bei jedem Lauf vollständig überschreibt, wurden verworfen. Namen sind nicht
  garantiert eindeutig; destruktive Updates würden bewusste Änderungen
  unbemerkt zurücksetzen.
- **Konsequenz:** Fehlende Manager werden reproduzierbar angelegt, vorhandene
  Datensätze aber nicht durch `npm test` oder `db:seed` überschrieben. Änderungen
  und Löschungen bleiben bis zur Berechtigungsumsetzung in `BV-022` möglich.

## 2026-07-23 — Standortfilterung erfolgt in Prisma-Abfragen

- **Status:** angenommen
- **Kontext:** Spätere Reservierungs- und Bestellabläufe dürfen keine Mitarbeiter
  eines anderen Standorts als Auswahl anbieten.
- **Entscheidung:** `lib/mitarbeiter.ts` stellt explizite Abfragen für Mitarbeiter
  und Manager eines Standorts bereit; der Filter wird als `where: { standortId }`
  an SQLite übergeben.
- **Konsequenz:** Künftige standortgebundene Formulare nutzen diese Abfragen mit
  dem validierten Standortkontext. Die administrative Mitarbeiterseite darf
  weiterhin beide Standorte zeigen und gruppiert sie serverseitig.

## 2026-07-23 — Rollen werden über zentrale Capabilities autorisiert

- **Status:** angenommen
- **Kontext:** Verteilte Prüfungen wie `rolle === "manager"` würden bei neuen
  Funktionen leicht auseinanderlaufen oder vergessen werden.
- **Entscheidung:** `lib/berechtigungen.ts` definiert eine deny-by-default
  Capability-Matrix. Bedienung erhält Reservierungen, Bestellaufnahme und
  Tischstatus. Manager erhält zusätzlich Gastdaten, Bella-Card-Rabatt und die
  administrative Mitarbeiterverwaltung. Der Inhaber erhält alle Capabilities,
  insbesondere Karten- und Preisänderungen.
- **Konsequenz:** Seiten und Server Actions prüfen Capabilities serverseitig vor
  dem Datenzugriff. UI-Ausblendung ist nur ergänzend. Neue sensible Funktionen
  benötigen eine explizite Capability-Zuordnung.

## 2026-07-23 — Mitarbeiterwahl ist nur eine Prototyp-Session

- **Status:** angenommen mit Sicherheitsvorbehalt
- **Kontext:** Für Rollenprüfungen muss die Anwendung einen handelnden
  Mitarbeiter kennen. Die Spec definiert jedoch noch keine PIN-, Passwort- oder
  Geräteanmeldung.
- **Entscheidung:** Der aktive Mitarbeiter wird nach expliziter Auswahl in einem
  zwölf Stunden gültigen HTTP-only Cookie gespeichert und bei jedem Zugriff
  gegen Datenbank und aktiven Standort validiert. Ein Standortwechsel löscht die
  Session. Es werden keine Zugangsdaten erfunden.
- **Konsequenz:** Die Rollenprüfung und Standortbindung funktionieren, aber die
  Identität ist nicht produktionssicher nachgewiesen: Eine Person am Gerät kann
  einen anderen Mitarbeiter wählen. Vor Produktion ist eine eigene Entscheidung
  zu persönlicher PIN oder einem anderen Authentifizierungsverfahren Pflicht.

## 2026-07-23 — Schutz des letzten Inhabers

- **Status:** angenommen
- **Kontext:** Ohne Inhaber wäre keine Rolle mehr vorhanden, die sämtliche
  administrativen Rechte besitzt.
- **Entscheidung:** Der letzte Inhaber kann weder gelöscht noch zu einer anderen
  Rolle herabgestuft werden. Der aktive Mitarbeiter kann sich außerdem nicht
  selbst löschen.
- **Konsequenz:** Administrative Änderungen können das System nicht vollständig
  ohne Inhaber zurücklassen. Marco wird mit stabiler ID als Inhaber am
  Hauptstandort Kreuzberg angelegt; diese Standortzuordnung ist eine
  Projektannahme, bis die Spec sie konkretisiert.

## 2026-07-23 — Telefonnummern erhalten einen eindeutigen Normalwert

- **Status:** angenommen
- **Kontext:** Telefonnummern sind laut Spec das Erkennungsmerkmal eines Gasts.
  Schreibweisen mit Leerzeichen, Klammern, Bindestrichen oder `00` dürfen nicht
  zu doppelten Gastprofilen führen.
- **Entscheidung:** Das Gastmodell speichert die eingegebene Anzeigeform und einen
  eindeutigen Normalwert. Trennzeichen werden entfernt, ein Präfix `00` wird zu
  `+`, anschließend sind 7–15 Ziffern erlaubt. Die Datenbank erzwingt Eindeutigkeit
  auf `telefonNormalisiert`.
- **Konsequenz:** Verschiedene Schreibweisen derselben Nummer werden als Duplikat
  abgewiesen. Telefonnummern erscheinen nicht in technischen Serverlogs. Eine
  aktive Such- und Erkennungsoberfläche folgt getrennt in `BV-023`.

## 2026-07-23 — Bella-Card-Status wird nicht redundant gespeichert

- **Status:** angenommen
- **Kontext:** Die Spec beschreibt die Bella-Card als aktiv ab zehn Besuchen. Ein
  separates Statusfeld könnte vom Besuchszähler abweichen.
- **Entscheidung:** `Gast.besuchszaehler` startet bei null; `Bella-Card aktiv`
  wird ausschließlich als `besuchszaehler >= 10` abgeleitet.
- **Konsequenz:** Es kann keinen widersprüchlichen Treuestatus geben. Das freie
  Bearbeiten des Besuchszählers ist in `BV-005` nicht vorgesehen; die automatische
  Erhöhung folgt in `BV-040`.

## 2026-07-23 — Gäste sind vorerst standortübergreifend

- **Status:** angenommen
- **Kontext:** Die Spec ordnet Reservierungen und Bestellungen einem Standort zu,
  das Gastprofil selbst jedoch nicht. Stammgäste können beide Restaurants nutzen.
- **Entscheidung:** `Gast` besitzt keine `standortId`. Manager und Inhaber können
  dieselbe Gastliste aus beiden Standortkontexten verwalten.
- **Konsequenz:** Gastidentität und Besuchszähler sind standortübergreifend. Für
  Gastdaten gilt bis zur Klärung des dokumentierten Widerspruchs weiterhin die
  restriktivere Rollenmatrix: Bedienungen erhalten keinen Zugriff.

## 2026-07-23 — Gast-Erkennung sucht exakt nach normalisierter Telefonnummer

- **Status:** angenommen
- **Kontext:** Die Telefonnummer ist das eindeutige Erkennungsmerkmal. Eine
  unscharfe oder teilweise Suche könnte mehrere fremde Gastprofile offenlegen
  und falsche Verknüpfungen erzeugen.
- **Entscheidung:** `findGastByTelefon()` normalisiert die vollständige Eingabe
  mit derselben Funktion wie das Gast-CRUD und fragt anschließend exakt auf dem
  eindeutigen Feld `telefonNormalisiert` ab. Das Ergebnis ist genau ein Gast oder
  `null`; Teiltreffer werden nicht unterstützt.
- **Konsequenz:** Schreibvarianten mit Leerzeichen, Klammern, Bindestrichen oder
  `00` statt `+` führen zuverlässig zum selben Profil. Reservierungen verwenden
  später die zurückgegebene stabile Gast-ID.

## 2026-07-23 — Telefonnummernsuche verwendet eine Server Action statt GET

- **Status:** angenommen
- **Kontext:** Ein GET-Suchformular würde die personenbezogene Telefonnummer in
  URL, Browserhistorie und möglicherweise Zugriffslogs schreiben.
- **Entscheidung:** Die Gastseite sendet die Suche als geschützte Server Action.
  Suchzustand und Ergebnis werden im React-Action-State gehalten; bei Nicht-
  Treffer kann dieselbe Telefonnummer direkt in ein neues Gastformular
  übernommen werden.
- **Konsequenz:** Telefonnummern erscheinen nicht in der URL. Die Server Action
  prüft `gastdaten_sehen` erneut, sodass ein manipulierter Direktaufruf keine
  Autorisierung umgeht.

## 2026-07-25 — Gastpräferenzen und Allergien bleiben Freitext

- **Status:** angenommen
- **Kontext:** `BV-024` verlangt Notizen zu Allergien und Präferenzen, definiert
  jedoch keine strukturierten Kategorien. Das Gastmodell aus `BV-005` besitzt
  bereits ein optionales Notizfeld.
- **Entscheidung:** Präferenzen und Allergien werden gemeinsam als optionaler,
  getrimmter Freitext mit höchstens 1000 Zeichen gespeichert. Eine leere Eingabe
  wird als `null` persistiert. Bis zur Klärung des dokumentierten Rollenwiderspruchs
  bleibt der Zugriff gemäß der restriktiveren Rollenmatrix auf Manager und Inhaber
  beschränkt.
- **Konsequenz:** Es ist keine Datenbankmigration erforderlich. Strukturierte
  Allergieklassifikation und Zugriff für Bedienungen sind nicht Teil von `BV-024`.

## 2026-07-25 — Reservierungen verwenden lokale Datums- und Zeitwerte

- **Status:** angenommen
- **Kontext:** Reservierungen gelten an einem Berliner Restaurantstandort. Ein
  UTC-Zeitstempel würde für eine fachlich lokale Uhrzeit unnötige Zeitzonen- und
  Sommerzeitumrechnung einführen.
- **Entscheidung:** Das Datum wird als validierter ISO-Kalendertag `YYYY-MM-DD`
  und die Uhrzeit als Minuten seit Mitternacht gespeichert. Die Reservierungs-ID
  wird bereits beim Schreibvorgang als UUID erzeugt. Standort, Tisch, Gast und
  Ersteller sind verpflichtende Relationen.
- **Konsequenz:** Sortierung und Anzeige sind ohne Zeitzonenumrechnung stabil.
  Zeitüberschneidungen, Öffnungszeiten und Kapazitätsüberschreitungen werden in
  `BV-004` nicht abgewiesen, solange die fachlichen Regeln dazu offen sind.

## 2026-07-25 — Vorläufige Tischbestände sind stabile Grunddaten

- **Status:** angenommen
- **Kontext:** Reservierungen benötigen eine Tischrelation, die finale Tischliste
  des Inhabers liegt aber noch nicht vor. Die Spec nennt nur Größenordnungen.
- **Entscheidung:** Das Seed legt idempotent 16 vorläufige Tische für Kreuzberg
  und 11 für Spandau mit stabilen technischen IDs, sichtbaren Nummern, Bereich
  und plausiblen Platzhalterkapazitäten an. Vorläufigkeit wird explizit gespeichert
  und in der Reservierungsauswahl angezeigt.
- **Konsequenz:** `BV-004` kann standortgetreu genutzt werden. Die Werte dürfen
  nicht als finale Bestandsaufnahme behandelt werden; Pflege und fachliche
  Saisonregeln bleiben Scope der Tischfeatures.

## 2026-07-25 — Gastauflösung und Neuanlage im Reservierungsablauf

- **Status:** angenommen
- **Kontext:** Alle Mitarbeiterrollen dürfen Reservierungen verwalten, die
  allgemeine Gastverwaltung ist laut Rollenmatrix jedoch Manager und Inhaber
  vorbehalten.
- **Entscheidung:** Im Reservierungsformular geben Mitarbeiter die vollständige
  Telefonnummer und bei neuen Gästen zusätzlich den Namen ein. Die Serverlogik
  normalisiert die Nummer und verknüpft exakt einen vorhandenen Gast. Ist die
  Nummer unbekannt, werden Gast und Reservierung gemeinsam in einer Transaktion
  angelegt. Es werden keine Suchtrefferliste, Notizen, Treuedaten oder gespeicherten
  Telefonnummern aus Gastprofilen an Bedienungen ausgegeben.
- **Konsequenz:** Bedienungen können den erlaubten Reservierungsablauf ausführen,
  ohne Zugriff auf die allgemeine Gastverwaltung zu erhalten. Bei einem Fehler
  bleibt weder ein unvollständiger neuer Gast noch eine Reservierung zurück;
  bekannte Telefonnummern erzeugen keine doppelten Gastprofile.

## 2026-07-25 — Reservierungsstornierung ist ein reversibler Statuswechsel

- **Status:** angenommen
- **Kontext:** Die Spec definiert für Reservierungen ausschließlich `offen` und
  `storniert`. Stornierungsgründe sowie Auswirkungen auf spätere Tischstatus-,
  Bestell- oder Abrechnungsabläufe sind noch nicht festgelegt.
- **Entscheidung:** `BV-027` löscht Reservierungen nicht physisch. Alle Rollen mit
  `reservierungen_verwalten` dürfen Reservierungen ihres aktiven Standorts auf
  `storniert` setzen und bei einer Fehlbedienung wieder auf `offen` stellen. Ein
  Stornierungsgrund wird ohne fachliche Vorgabe nicht erfunden.
- **Konsequenz:** Reservierungen bleiben nachvollziehbar. Folgeeffekte auf noch
  nicht implementierte Module werden erst nach fachlicher Klärung ergänzt.

## 2026-07-25 — Reservierungsänderungen speichern den letzten Bearbeiter

- **Status:** angenommen
- **Kontext:** `BV-013` verlangt neben unveränderlichem Ersteller und
  Erstellzeitpunkt auch Zeitpunkt und Mitarbeiter der letzten Änderung.
- **Entscheidung:** `geaendertAm` wird durch Prisma bei jeder Bearbeitung und jedem
  Statuswechsel aktualisiert; `geaendertVonId` referenziert den serverseitig
  autorisierten Mitarbeiter. Bestehende Reservierungen dürfen bis zu ihrer ersten
  Änderung noch keinen letzten Bearbeiter besitzen.
- **Konsequenz:** Die Reservierungsliste zeigt Ersteller sowie letzte Änderung.
  Standortfremde Datensätze können weder bearbeitet noch im Status verändert werden.

## 2026-07-25 — Tischübersicht kombiniert schematischen Grundriss und Liste

- **Status:** angenommen
- **Kontext:** Ein exakter baulicher Grundriss liegt nicht vor. Für den operativen
  Restaurantbetrieb soll trotzdem auf einen Blick erkennbar sein, welche Tische
  frei, besetzt oder reserviert sind.
- **Entscheidung:** Jeder Tisch erhält eine feste Position in einem einfachen
  standortbezogenen Raster. `/tische` visualisiert dieses Raster als schematischen,
  nicht maßstabsgetreuen Grundriss. Nummer und ausgeschriebener Status sind direkt
  sichtbar; Farbe dient nur als zusätzliche Kennzeichnung. Eine semantische Liste
  bleibt für Details, kleine Bildschirme und Stammdatenpflege erhalten.
- **Konsequenz:** Phase 2 benötigt Positionsfelder und eindeutige Positionen je
  Standort. Ein Drag-and-drop-Editor, bauliche Genauigkeit und freie Planerstellung
  bleiben außerhalb des Scopes.

## 2026-07-25 — Manager pflegen Tischstammdaten ihres Standorts

- **Status:** angenommen
- **Kontext:** Die Spec erlaubt allen Rollen, Tischstatus zu sehen, nennt aber
  keine Rolle für Nummern, Kapazitäten, Bereiche und saisonale Verfügbarkeit.
  Der Inhaber ist im aktuellen Mitarbeitermodell Kreuzberg zugeordnet und könnte
  im Spandauer Standortkontext keine Stammdaten pflegen.
- **Entscheidung:** Alle Mitarbeiter dürfen den operativen Tischstatus ändern.
  Manager und Inhaber erhalten zusätzlich `tischstammdaten_verwalten`; die
  serverseitige Mitarbeiter- und Standortprüfung bleibt für jede Operation Pflicht.
- **Konsequenz:** Giuseppe kann Kreuzberg und Renate Spandau pflegen. Bedienungen
  können den Betriebsstatus führen, aber weder Stammdaten noch Grundriss ändern.

## 2026-07-25 — Terrassenverfügbarkeit ist explizit und reservierungssicher

- **Status:** angenommen
- **Kontext:** Terrassenplätze sind laut Spec nur saisonal verfügbar; Kalender,
  Wettersteuerung und Umgang mit bestehenden Reservierungen sind nicht vorgegeben.
- **Entscheidung:** Terrassentische besitzen einen manuell pflegbaren
  Verfügbarkeitsstatus. Innentische bleiben immer verfügbar. Eine Deaktivierung
  wird blockiert, solange ab dem aktuellen Berliner Kalendertag offene
  Reservierungen bestehen. Nicht verfügbare Tische bleiben sichtbar, sind aber
  für neue Reservierungen serverseitig gesperrt.
- **Konsequenz:** Bestehende Reservierungen werden nie still verändert oder
  gelöscht. Automatische Saison- und Wetterlogik bleibt außerhalb des Scopes.

## 2026-07-25 — SQLite-Integrationstests laufen dateiweise

- **Status:** angenommen
- **Kontext:** Reservierungs- und Tischtests schreiben in dieselbe lokale
  SQLite-Testdatenbank. Parallele Testdateien können konkurrierende
  Schreibtransaktionen starten und dadurch Lock-Timeouts erzeugen.
- **Entscheidung:** Der eingebaute Node-Test-Runner wird für dieses lokale
  SQLite-Setup mit `--test-concurrency=1` ausgeführt. Einzelne Testabläufe und
  Domänenoperationen bleiben unverändert.
- **Konsequenz:** Die Testsuite ist deterministisch und etwas langsamer. Bei einer
  späteren isolierten Datenbank pro Testdatei kann die Parallelität wieder erhöht werden.

## 2026-07-25 — Inhaber-Session gilt standortübergreifend

- **Status:** angenommen
- **Kontext:** Nur der Inhaber darf laut Spec Speisekarten und Preise ändern. Der
  vorhandene Inhaber-Datensatz ist Kreuzberg zugeordnet, muss aber auch die
  Spandauer Karte nach expliziter Standortwahl pflegen können.
- **Entscheidung:** Eine aktive Inhaber-Session bleibt beim bewussten
  Standortwechsel erhalten und ist unabhängig von der Mitarbeiter-Standortrelation
  gültig. Bedienungs- und Manager-Sessions werden weiterhin beim Wechsel gelöscht
  und ausschließlich für ihren Mitarbeiterstandort akzeptiert.
- **Konsequenz:** Kartenpflege beider Standorte ist ohne doppelten Inhaber-Datensatz
  möglich. Jede Operation verwendet weiterhin den expliziten Standortkontext und
  prüft die Inhaber-Capability serverseitig.

## 2026-07-25 — Speisekartenpreise werden in Cent gespeichert

- **Status:** angenommen
- **Kontext:** Binäre Fließkommazahlen können Geldwerte ungenau darstellen;
  spätere Bestellpositionen müssen den gültigen Preis exakt historisieren.
- **Entscheidung:** `Gericht.preisCent` ist eine positive ganze Zahl. Formulare
  akzeptieren Komma oder Punkt mit höchstens zwei Nachkommastellen und wandeln
  exakt in Cent um. Gerichte besitzen außerdem einen normalisierten, je Standort
  eindeutigen Namen.
- **Konsequenz:** Anzeige und spätere Preisübernahme sind reproduzierbar. Steuer-,
  Rundungs- und Belegregeln bleiben bis zur fachlichen Klärung außerhalb des Scopes.

## 2026-07-25 — Grillverbot wird beim Schreiben und Lesen erzwungen

- **Status:** angenommen
- **Kontext:** Spandau besitzt baulich keinen Grill. Ein UI-Verbot allein würde
  manipulierte Serveraufrufe oder fehlerhafte Bestandsdaten nicht absichern.
- **Entscheidung:** Die Domänenlogik lehnt Kategorie `grill` für jeden Standort
  außer Kreuzberg ab. Spandauer Kartenabfragen filtern Grill zusätzlich aus.
- **Konsequenz:** Grillgerichte können in Spandau weder angelegt, geändert noch
  angezeigt werden. Die gleiche Regel kann Phase 4 für Bestellpositionen verwenden.
