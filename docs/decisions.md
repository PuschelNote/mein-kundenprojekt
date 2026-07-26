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

## 2026-07-25 — Interne Webansicht ist die vorläufige Küchenausgabe

- **Status:** angenommen mit offenem Integrationspunkt
- **Kontext:** Die direkte Küchenübergabe ist verbindlich, das endgültige Medium
  aus Display, Drucker oder beidem sowie ein Quittierungsprotokoll sind noch offen.
- **Entscheidung:** `/kueche` zeigt die offenen Bestellungen des aktiven Standorts
  als Bons, aktualisiert sich alle zehn Sekunden und erlaubt den Übergang zu
  `serviert`. Es wird keine externe Hardware-Schnittstelle erfunden.
- **Konsequenz:** Der Ablauf ist innerhalb der App vollständig nutzbar. Medium,
  Quittierung und Offline-Übertragung bleiben bewusste spätere Entscheidungen.

## 2026-07-25 — Aktive Tischbestellungen werden datenbankseitig eindeutig

- **Status:** angenommen
- **Kontext:** Eine vorgelagerte Existenzprüfung allein verhindert bei zwei
  gleichzeitigen Requests keine doppelte aktive Bestellung am selben Tisch.
- **Entscheidung:** Ein partieller eindeutiger SQLite-Index umfasst pro Tisch die
  Zustände `offen` und `serviert`. `bezahlt` und `storniert` geben den Tisch frei.
  Der erlaubte Statusfluss ist offen zu serviert zu bezahlt; aus aktiven Zuständen
  darf storniert werden, abgeschlossene Zustände bleiben unveränderlich.
- **Konsequenz:** Die zentrale Invariante gilt auch bei konkurrierenden Requests.
  Finanzielle Nebenwirkungen des Bezahlens folgen gesammelt in Phase 5.

## 2026-07-25 — Bestehende Bestellpositionen behalten ihren Aufnahmepreis

- **Status:** angenommen
- **Kontext:** Eine offene Bestellung kann bearbeitet werden, nachdem der
  Kartenpreis eines enthaltenen Gerichts geändert wurde.
- **Entscheidung:** Beim Bearbeiten behält jedes bereits enthaltene Gericht den
  zuvor historisierten Einzelpreis. Erst neu hinzugefügte Gerichte übernehmen
  ihren dann aktuellen Kartenpreis.
- **Konsequenz:** Karten- und Bestelländerungen schreiben historische Preise nicht
  rückwirkend um; die Abrechnung in Phase 5 bleibt reproduzierbar.

## 2026-07-26 — Bezahlte Rechnungen werden als unveränderlicher Snapshot gespeichert

- **Status:** angenommen
- **Kontext:** Kartenpreise und Besuchszähler können sich nach einer Abrechnung
  ändern. Eine spätere dynamische Neuberechnung könnte deshalb andere Werte als
  beim Bezahlvorgang anzeigen.
- **Entscheidung:** Beim Übergang `serviert → bezahlt` speichert die Bestellung
  Ausgangssumme, Rabatt, Endsumme und Abrechnungszeitpunkt. Die Ausgangssumme
  verwendet ausschließlich historisierte Positionspreise. Ein Rabatt von 15
  Prozent wird kaufmännisch auf ganze Cent gerundet.
- **Konsequenz:** Bezahlte Rechnungen bleiben reproduzierbar und unveränderlich.
  Steuer-, Beleg- und getrennte Zahlungsregeln bleiben außerhalb von Phase 5.

## 2026-07-26 — Rabatt und Besuchszählung sind Teil derselben Bezahltransaktion

- **Status:** angenommen
- **Kontext:** Ein wiederholter oder teilweise fehlgeschlagener Bezahlvorgang darf
  weder einen Besuch doppelt zählen noch Rechnung und Gaststatus auseinanderlaufen
  lassen.
- **Entscheidung:** Rabattberechnung, Rechnungssnapshot, Statuswechsel und die
  optionale Erhöhung des Besuchszählers laufen atomar in einer Transaktion. Die
  Rabattberechtigung verwendet die vor dem Bezahlen bereits abgeschlossenen
  Besuche; der zehnte Besuch aktiviert die Bella-Card für die folgende Rechnung.
  Der Rabatt wird gemäß Spec automatisch angewendet und nicht manuell vergeben.
- **Konsequenz:** Wiederholte Bezahlversuche werden abgewiesen. Bedienungen können
  den Bestellablauf abschließen, ohne zusätzliche Gastprofil- oder Besuchsdaten
  zu erhalten; eine manuelle Rabattoberfläche ist nicht erforderlich.

## 2026-07-26 — Die einfache interne Abrechnung verwendet Euro und Cent

- **Status:** angenommen
- **Kontext:** Die App wird für zwei Berliner Restaurants entwickelt. Phase 5
  benötigt eine eindeutige Geldanzeige und Rundungsregel, während Steuerlogik,
  Trinkgeldbuchung und rechtliche Beleganforderungen noch nicht spezifiziert sind.
- **Entscheidung:** Kartenpreise, historische Positionspreise und Rechnungswerte
  werden als ganzzahlige Centbeträge gespeichert und in der Oberfläche als Euro
  im deutschen Zahlenformat dargestellt. Der automatische Bella-Card-Rabatt wird
  kaufmännisch auf ganze Cent gerundet. Diese Entscheidung präzisiert die in der
  Entscheidung „Speisekartenpreise werden in Cent gespeichert“ noch offen
  gelassene Rundungsfrage.
- **Konsequenz:** `BV-010`, `BV-041` und `BV-042` besitzen eine reproduzierbare
  interne Geldberechnung. Die Anzeige ist noch kein steuerlicher oder rechtlicher
  Zahlungsbeleg; Steuer-, Trinkgeld- und Belegregeln bleiben ausdrücklich offen.

## 2026-07-26 — Phasen 0 bis 5 bilden den lokalen Kernbetrieb ab

- **Status:** angenommen als Lieferstand
- **Kontext:** Standort- und Mitarbeiterkontext, Gäste, Reservierungen, Tische,
  Speisekarten, Bestellungen, Küchenansicht, Abrechnung und Bella-Card sind
  implementiert und durch die gemeinsame Testsuite abgesichert.
- **Entscheidung:** Die zugehörigen Backlog-IDs der Phasen 0 bis 5 gelten als
  `done`. Der nächste zusammenhängende Umsetzungsschwerpunkt ist Phase 6 mit
  Offline-Betrieb, Synchronisation und sichtbarer Konfliktbehandlung.
- **Konsequenz:** Der aktuelle Stand ist ein lokal nutzbarer Einzelgeräte-Prototyp,
  aber noch kein betriebsreifes Mehrgeräte- oder Offline-Synchronisationssystem.
  Vor Phase 6 sind Zielplattform, Offline-Authentifizierung, Synchronisationsmodell
  und Konfliktregeln konzeptionell festzulegen.

## 2026-07-26 — Das Dashboard ist aufgaben- und rollenorientiert

- **Status:** angenommen
- **Kontext:** Die bisherige Startseite zeigte nur Standort, Mitarbeiter und
  Öffnungszeiten. Die vollständige Modulnavigation zwang Mitarbeitende dazu,
  technische Bereiche selbst dem nächsten Arbeitsschritt zuzuordnen.
- **Entscheidung:** Nach expliziter Standort- und Mitarbeiterwahl dient `/` als
  Arbeitsdashboard. Neue Reservierung und neue Bestellung sind die dominanten
  Einstiege und springen direkt zum jeweiligen Formular. Laufende operative
  Bereiche und Verwaltung sind nachgeordnet; Verwaltungslinks werden aus der
  zentralen Capability-Matrix abgeleitet. Die Kopfzeile bleibt als reduzierte
  Direktnavigation und sichtbarer Sessionkontext erhalten.
- **Konsequenz:** Der typische Ablauf beginnt bei der Aufgabe statt beim Modul.
  Das Dashboard ist weiterhin kein Sicherheitsperimeter; Zielseiten und
  Schreiboperationen prüfen Rolle und Standort serverseitig. Die Mitarbeiterwahl
  bleibt bis zu einer eigenen Authentifizierungsentscheidung ein Prototyp ohne PIN.

## 2026-07-26 — Bedienungen dürfen ohne festen Standort geführt werden

- **Status:** angenommen; ersetzt die verpflichtende Mitarbeiter-Standortrelation
  aus der Entscheidung „Mitarbeiter als standortgebundene Entität“ für die Rolle
  `bedienung`
- **Kontext:** Sofia, Nico und Fatima sind als Bedienungen bekannt, es ist aber
  nicht geklärt, an welchem Standort sie regelmäßig arbeiten. Eine erfundene
  Zuordnung würde Personalplanung mit fachlich ungesicherten Daten festschreiben.
- **Entscheidung:** `Mitarbeiter.standortId` wird optional. Nur Bedienungen dürfen
  ohne Standort gespeichert werden; Manager und Inhaber benötigen weiterhin eine
  feste Relation. Standortoffene Bedienungen werden nach der expliziten
  Standortwahl an beiden Standorten angeboten. Reservierungen, Tische,
  Bestellungen und alle anderen betrieblichen Daten behalten ihre verpflichtende
  Standort-ID und verwenden serverseitig den aktiven Standortkontext.
- **Konsequenz:** Sofia, Nico und Fatima werden mit stabilen IDs als
  standortoffene Grunddaten angelegt. Ihre Rolle erhält keine zusätzlichen Rechte.
  Manager eines anderen Standorts bleiben ungültig; ein Standortwechsel darf die
  Session einer standortoffenen Bedienung erhalten.

## 2026-07-26 — Reservierungshinweis und Tischstatus bleiben getrennte Signale

- **Status:** angenommen
- **Kontext:** Mitarbeitende müssen im Grundriss erkennen, ob für einen Tisch
  Reservierungen hinterlegt sind. Die Spec definiert jedoch keine Dauer einer
  Reservierung und damit keinen Zeitpunkt, zu dem der manuelle Tischstatus
  automatisch `reserviert` werden müsste.
- **Entscheidung:** Der auswählbare Grundriss zeigt offene Reservierungen ab dem
  aktuellen Berliner Kalendertag als zusätzliches Textsignal mit Anzahl und
  nächstem Termin. Die Detailauswahl zeigt Gast, Termin und Personenzahl. Der
  operative Status `frei`, `besetzt` oder `reserviert` wird dadurch nicht
  automatisch verändert.
- **Konsequenz:** Reservierungen sind sichtbar, ohne eine nicht spezifizierte
  zeitliche Statusautomatik einzuführen. Nach Festlegung von Reservierungsdauer
  und Überschneidungsregeln kann die Beziehung gezielt erweitert werden.

## 2026-07-26 — Bestellaufnahme setzt den Tisch atomar auf besetzt

- **Status:** angenommen
- **Kontext:** Sobald Servicepersonal eine Bestellung für einen Tisch aufnimmt,
  wird dieser Tisch tatsächlich bedient. Ein weiterhin als `frei` angezeigter
  Tisch wäre operativ irreführend.
- **Entscheidung:** Die Anlage einer Bestellung und der Statuswechsel des
  zugehörigen Tischs auf `besetzt` laufen in derselben Datenbanktransaktion. Jede
  Validierung von Mitarbeiter, Standort, Tisch, Gast und Gerichten findet vor dem
  Statuswechsel statt. Bezahlen oder Stornieren setzt den Tisch mangels
  bestätigter Abräum-/Freigaberegel nicht automatisch auf `frei`.
- **Konsequenz:** Es gibt weder eine erfolgreich aufgenommene Bestellung mit
  weiterhin freiem Tisch noch einen durch eine fehlgeschlagene Bestellung
  fälschlich besetzten Tisch. Die Freigabe bleibt vorerst ein bewusster manueller
  Tischstatus-Vorgang.

## 2026-07-26 — Beispielkarten sind nicht-destruktive Grunddaten

- **Status:** angenommen
- **Kontext:** Beide Standorte benötigen für den lokalen Prototyp eine direkt
  nutzbare, typische Speisekarte. Gleichzeitig darf ein erneuter Seed spätere
  Preis- oder Textänderungen des Inhabers nicht zurücksetzen.
- **Entscheidung:** `seedGrunddaten()` legt pro Standort eine kleine erfundene
  italienische Karte mit stabilen technischen IDs, normalisierten Namen und
  ganzzahligen Centpreisen an. Vorhandene Gerichte werden über Standort und
  normalisierten Namen erkannt und nicht aktualisiert. Kreuzberg erhält Bistecca
  und Salsiccia in der Kategorie `grill`; Spandau enthält keine Grillkategorie.
- **Konsequenz:** Beide Karten sind sofort demonstrier- und bestellbar und bleiben
  dennoch über die Inhaberoberfläche veränderbar. Wiederholtes Seeden ergänzt nur
  fehlende Grundgerichte; die serverseitige Grillregel bleibt zusätzlich beim
  Schreiben und Lesen aktiv.

## 2026-07-26 — Reservierungen werden optional und eindeutig mit Bestellungen verknüpft

- **Status:** angenommen
- **Kontext:** Bei Ankunft eines reservierten Gasts muss das Servicepersonal den
  Gast nicht erneut per Telefonnummer zuordnen. Gleichzeitig darf eine
  manipulierte oder doppelt verwendete Reservierung keine falsche Bestellung
  erzeugen. Ein Reservierungsstatus „angekommen“ ist nicht definiert.
- **Entscheidung:** Nach der Tischauswahl bietet die Bestellaufnahme ausschließlich
  offene, zukünftige beziehungsweise heutige und noch ungenutzte Reservierungen
  dieses Tischs im aktiven Standort an. Der Server validiert die Kombination und
  übernimmt Gast-ID, Tisch-ID und Reservierungs-ID atomar in die Bestellung. Ein
  eindeutiger Datenbank-Constraint erlaubt jede Reservierung höchstens einmal.
  Reservierungsbezug, Gast und Tisch sind anschließend unveränderlich; die
  Reservierung bleibt im Status `offen`.
- **Konsequenz:** Reservierte Gäste gelangen ohne erneute Gastdateneingabe in den
  Bestell- und späteren Bella-Card-Ablauf. Bestellung und Reservierung bleiben
  nachvollziehbar verbunden. Ein eigener Ankunftsstatus sowie die Konfliktlösung
  bei Offline-Mehrfachnutzung bleiben spätere, explizite Erweiterungen.

## 2026-07-26 — Nur stornierte Bestellungen dürfen manuell gelöscht werden

- **Status:** angenommen
- **Kontext:** Stornierte Fehl- oder Testbestellungen sollen die operative
  Bestellübersicht nicht dauerhaft füllen. Offene, servierte und insbesondere
  bezahlte Bestellungen dürfen nicht versehentlich entfernt werden.
- **Entscheidung:** Mitarbeiter mit der bestehenden Berechtigung zur
  Bestellaufnahme dürfen nach einer manuellen Bestätigung ausschließlich
  Bestellungen im Status `storniert` ihres aktiven Standorts dauerhaft löschen.
  Status, Standort, Rolle und Mitarbeiterkontext werden an der schreibenden
  Systemgrenze erneut geprüft. Bestellpositionen werden kaskadierend entfernt;
  Tischstatus und Reservierung bleiben unverändert.
- **Konsequenz:** Die Übersicht kann gezielt bereinigt werden, ohne aktive oder
  abgerechnete Daten zu gefährden. Eine zuvor verknüpfte offene Reservierung kann
  anschließend erneut für eine Bestellung verwendet werden. Der Tisch bleibt bis
  zur bewussten manuellen Freigabe in seinem bestehenden Status.
