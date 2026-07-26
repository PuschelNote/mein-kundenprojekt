# Backlog — Bella Vista Restaurant-App

_Stand: 26.07.2026_

## Konvention

- **ID-Schema:** `BV-NNN`
- **IDs:** stabil, fortlaufend und niemals wiederverwendet — auch nicht nach `killed`
- **Status:** `hypo`, `validated`, `in-progress`, `done`, `killed`
- **Quelle:** sofern nicht anders angegeben [`spec.md`](spec.md)
- **Phasen:** bilden fachlich nutzbare Ausbaustufen ab, keine festen Termine
- Die Spec bleibt die strategische Grundlage; hier lebt der operative Status.

## Phase 0 — Fundament: Standorte, Mitarbeiter und Rechte

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-001 | Mitarbeiter und Rollen verwalten | done | Mitarbeiter besitzen ID, Name und genau eine Rolle; Manager und Inhaber besitzen eine feste Standortzuordnung, Bedienungen dürfen standortoffen sein. CRUD unter `/mitarbeiter`; Validierungs- und Persistenztests sind grün. |
| BV-002 | Verbindlichen Standortkontext führen | done | Kreuzberg und Spandau besitzen eindeutige IDs; ein serverseitig validierter Cookie-Kontext erzwingt eine explizite Auswahl und wird global angezeigt. Die Inhabersitzung bleibt beim Wechsel zwischen beiden Standorten erhalten. |
| BV-020 | Standardöffnungszeiten hinterlegen | done | Kreuzberg ist Di–So 17–23 Uhr, Spandau Do–So 17–22 Uhr geöffnet; geschlossene Tage und Wochenpläne werden standortbezogen angezeigt. |
| BV-016 | Feiertags-Overrides verwalten | done | Ausschließlich der Inhaber kann pro Standort und Datum eine abweichende Öffnungszeit oder einen Schließtag setzen und wieder löschen. Exakte Overrides gewinnen vor Standardzeiten und steuern Reservierungskalender, serverseitige Reservierungsprüfung und Küchenannahmeschluss; ohne Override gilt der reguläre Wochenplan. |
| BV-021 | Mitarbeiter Standorten zuordnen | done | Giuseppe ist Manager in Kreuzberg und Renate in Spandau; bekannte Bedienungen ohne geklärten Einsatzort bleiben standortoffen und werden separat angezeigt. |
| BV-022 | Rollenbasierte Zugriffe erzwingen | done | Zentrale deny-by-default Capability-Matrix und serverseitige Guards setzen die Rollenrechte durch. Mitarbeiterwahl ist als Prototyp noch nicht durch PIN oder Passwort abgesichert. |
| BV-045 | Technisches Projektgrundgerüst einrichten | done | Next.js mit TypeScript, ESLint, Prisma und lokaler SQLite-Verbindung ist eingerichtet; Prisma-Generierung, Datenbankcheck, Lint und Production-Build laufen erfolgreich. |

## Phase 1 — Kern: Gäste und Reservierungen

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-005 | Gast anlegen und bearbeiten | done | Geschütztes CRUD unter `/gaeste` verwaltet Name, eindeutige normalisierte Telefonnummer, Besuchszähler, Notizen und abgeleiteten Bella-Card-Status. Gäste mit Reservierungs- oder Bestellhistorie werden nicht physisch gelöscht; die Oberfläche erklärt die Sperre ohne Serverfehler. |
| BV-023 | Gast über Telefonnummer erkennen | done | Geschützte exakte Suche erkennt vorhandene Gäste trotz üblicher Telefonnummern-Schreibweisen und liefert die stabile Gast-ID für spätere Reservierungen. |
| BV-024 | Gastpräferenzen und Allergien dokumentieren | done | Manager und Inhaber können Freitextnotizen mit Präferenzen und Allergien anlegen, ändern, leeren und einsehen; serverseitige Validierung und Persistenztests sichern das Feld ab. |
| BV-004 | Reservierung anlegen | done | Geschützte Anlage unter `/reservierungen` ordnet bekannte Gäste exakt per Telefonnummer zu oder legt unbekannte Gäste mit Name und Telefonnummer atomar mit der Reservierung an; Tisch, lokaler Termin, Personenzahl, Standort und Ersteller werden gespeichert. |
| BV-025 | Standort bei Reservierung erzwingen | done | Der validierte Standortkontext wird serverseitig übernommen; Mitarbeiter und Tisch müssen demselben Standort angehören, manipulierte Zuordnungen werden abgewiesen. |
| BV-026 | Reservierung einem Tisch zuweisen | done | Jede Reservierung referenziert genau einen Tisch desselben Standorts; die Personenzahl darf dessen Kapazität nicht überschreiten. |
| BV-027 | Reservierung ändern und stornieren | done | Berechtigte Mitarbeiter können standortgebundene Reservierungen vollständig neu validiert bearbeiten, stornieren und wieder öffnen; physisches Löschen findet nicht statt. |
| BV-013 | Reservierungsänderungen protokollieren | done | Ersteller und Erstellzeitpunkt bleiben unverändert; letzter Änderungszeitpunkt und ändernder Mitarbeiter werden bei Bearbeitung und Statuswechsel automatisch gespeichert und angezeigt. |
| BV-053 | Standort bei Reservierungsanlage explizit wählen | done | Das Anlageformular verlangt eine erneute Standortwahl und filtert die Tische unmittelbar danach; Standort, Tisch, Mitarbeiterberechtigung und aktiver Kontext werden serverseitig abgeglichen. Nach erfolgreicher Anlage zeigt die App den gewählten Standortkontext. |
| BV-054 | Gäste aus den Anekdoten bereitstellen | done | Herr Kellner und Herr Bergmann werden mit stabilen IDs, eindeutig erfundenen Telefonnummern und den belegten Hinweisen als nicht-destruktive Grunddaten angelegt; Herr Bergmann besitzt mit zehn Vorbesuchen bereits Bella-Card-Status. Wiederholtes Seeden erzeugt keine Duplikate und überschreibt keine spätere Pflege. |
| BV-061 | Demo-Gäste und anstehende Reservierungen bereitstellen | done | Zehn klar bezeichnete Demo-Gäste mit erfundenen Telefonnummern decken die Besuchszahlen 0 bis 9 lückenlos ab. Sechs anstehende Demo-Reservierungen verteilen sich auf Kreuzberg und Spandau; stabile IDs und nicht-destruktives Seeding verhindern Duplikate und überschreiben keine spätere Pflege. |
| BV-056 | Zweistündige Reservierungsfenster erzwingen | done | Reservierungen dauern exakt zwei Stunden, liegen vollständig in den regulären Öffnungszeiten und nicht in der Vergangenheit; offene Zeitfenster desselben Tischs dürfen sich nicht überschneiden, direkt anschließende Termine bleiben erlaubt. |
| BV-057 | Öffnungstage im Reservierungskalender anzeigen | done | Die Datumsauswahl zeigt einen standortabhängigen Monatskalender; vergangene Daten und laut Standardöffnungszeiten geschlossene Wochentage sind sichtbar ausgegraut und nicht auswählbar. Standortwechsel aktualisieren den Kalender, während die serverseitige Öffnungszeitenprüfung verbindlich bleibt. |

## Phase 2 — Kern: Tische und Restaurantübersicht

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-003 | Tische als Grundriss und Liste anzeigen | done | `/tische` zeigt pro Standort einen schematischen Rastergrundriss mit ausgeschriebenem Status und eine ergänzende responsive Liste für Details und Bedienung. |
| BV-028 | Tische standortbezogen verwalten | done | Manager und Inhaber können Tische des aktiven Standorts anlegen, bearbeiten und – ohne Reservierungsbezug – entfernen; Nummer und Rasterposition sind je Standort eindeutig. |
| BV-029 | Tischkapazität pflegen | done | Kapazitäten von 1 bis 100 Personen werden domänenseitig validiert, gespeichert und in Grundriss, Liste sowie Reservierungsauswahl angezeigt. |
| BV-030 | Tischbereich pflegen | done | Bereich ist `innen` oder `terrasse`; Terrassentische können ohne offene zukünftige Reservierung deaktiviert werden und stehen dann für neue Reservierungen nicht zur Auswahl. |
| BV-031 | Tischstatus führen | done | Alle Mitarbeiter können den standortbezogenen Status `frei`, `besetzt` oder `reserviert` serverseitig validiert ändern; Grundriss und Liste zeigen ihn als Text und Farbe. |
| BV-032 | Vorläufige Tischbestände nutzen | done | Idempotente, als vorläufig markierte Grunddaten stellen 16 Tische in Kreuzberg und 11 in Spandau mit stabilen IDs bereit. |

## Phase 3 — Kern: Standortbezogene Speisekarten

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-006 | Standortbezogene Speisekarten anzeigen | done | `/speisekarte` gruppiert ausschließlich Gerichte des explizit aktiven Standorts nach Kategorie; alle Mitarbeiterrollen besitzen Lesezugriff. |
| BV-033 | Gerichtsdaten führen | done | Name, Beschreibung, ganzzahliger Centpreis, feste Kategorie, Standort und Zeitstempel werden validiert persistiert; Namen sind je Standort normalisiert eindeutig. |
| BV-015 | Speisekarte und Preise pflegen | done | Ausschließlich der Inhaber kann Gerichte und Preise beider explizit gewählter Standortkarten in der App anlegen und bearbeiten; Manager und Bedienungen bleiben read-only. |
| BV-034 | Grillgerichte auf Kreuzberg beschränken | done | Domänenvalidierung verbietet Grill in Spandau; Spandauer Leseabfragen schließen Grill zusätzlich defensiv aus. |
| BV-035 | Tages- und Saisongerichte kennzeichnen | done | Tages- und Saisonkennzeichen sind am Gericht pflegbar und in der Karte sichtbar; Aktivierung und Terminplanung bleiben Scope von BV-018. |
| BV-050 | Typische Beispielkarten bereitstellen | done | Nicht-destruktive Grunddaten legen 10 typische Einträge für Kreuzberg und 9 für Spandau mit plausiblen Centpreisen an; ausschließlich Kreuzberg enthält Grillgerichte, Tests und lokaler Kartencheck sind grün. |

## Phase 4 — Kern: Bestellungen und Küche

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-007 | Bestellung aufnehmen | done | `/bestellungen` legt eine Bestellung atomar mit Standort, verfügbarem Tisch, optional per exakter Telefonnummer zugeordnetem bekannten Gast und aufnehmendem Mitarbeiter an. |
| BV-049 | Tisch bei Bestellaufnahme besetzen | done | Eine erfolgreich neu aufgenommene Bestellung setzt den zugehörigen Tisch innerhalb derselben Transaktion auf `besetzt`; abgewiesene Bestellungen verändern den Tischstatus nicht, Tests sind grün. |
| BV-051 | Reservierung bei Bestellaufnahme übernehmen | done | Nach der Tischauswahl können offene, noch ungenutzte Reservierungen des aktiven Standorts übernommen werden; Bestellung und Übersicht speichern den Reservierungsbezug, Gast und Tisch verbindlich. Standort- und Manipulationsschutz sowie Atomizität sind getestet. |
| BV-036 | Bestellpositionen verwalten | done | Offene Bestellungen enthalten mindestens eine validierte Position; Gerichte, Mengen von 1 bis 99 und optionale Sonderwünsche bis 300 Zeichen können bearbeitet werden. |
| BV-037 | Einzelpreis historisieren | done | Jede Position übernimmt bei ihrer erstmaligen Aufnahme den Centpreis des Gerichts; bestehende Positionen behalten ihn bei Karten- und Bestelländerungen. |
| BV-038 | Nur eine aktive Bestellung pro Tisch zulassen | done | Ein partieller eindeutiger Datenbankindex erlaubt je Tisch höchstens eine Bestellung im Status `offen`, `zubereitet` oder `serviert`, auch bei konkurrierenden Schreibzugriffen. |
| BV-008 | Bestellung an die Küche übermitteln | done | `/kueche` zeigt offene Bons des aktiven Standorts mit Positionen und Sonderwünschen und aktualisiert sich alle zehn Sekunden. Die Küche markiert fertige Bons als `zubereitet`; das endgültige Ausgabemedium bleibt offen. |
| BV-009 | Bestellstatus verwalten | done | Kontrollierte Übergänge führen von `offen` über `zubereitet` und `serviert` zu `bezahlt` oder aus aktiven Zuständen zu `storniert`. Die automatisch aktualisierte Bestellübersicht meldet dem Service abholbereite Essen; abgeschlossene Bestellungen sind unveränderlich. |
| BV-052 | Stornierte Bestellungen manuell löschen | done | Ausschließlich stornierte Bestellungen können nach Bestätigung am aktiven Standort dauerhaft gelöscht werden; Rollen- und Standortprüfung, Positionskaskade und Freigabe eines Reservierungsbezugs sind automatisiert getestet. |
| BV-055 | Tischstatus mit aktiver Bestellung konsistent halten | done | Tische mit offener, zubereiteter oder servierter Bestellung bleiben serverseitig zwingend `besetzt` und werden bei einer neuen Bestellaufnahme nicht angeboten; Integrationsprüfungen sichern Statusschutz und Auswahlliste ab. |
| BV-062 | Tisch nach Bezahlung automatisch freigeben | done | Der erfolgreiche Übergang einer servierten Bestellung zu `bezahlt` setzt den zugehörigen Tisch innerhalb derselben Transaktion auf `frei`. Fehlgeschlagene oder wiederholte Zahlungen und Stornierungen geben den Tisch nicht frei. |
| BV-039 | Aufnehmenden Mitarbeiter nachweisen | done | Jede Bestellung persistiert und zeigt den serverseitig validierten aufnehmenden Mitarbeiter und den Aufnahmezeitpunkt. |
| BV-012 | Küchenannahmeschluss erzwingen | done | Neue Bestellungen werden anhand Berliner Ortszeit außerhalb der regulären Öffnung sowie ab exakt 30 Minuten vor Standortschließung serverseitig abgewiesen. |

## Phase 5 — Kern: Abrechnung und Bella-Card

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-010 | Tischrechnung berechnen | done | Das System berechnet die Gesamtsumme in Cent aus Mengen und historisierten Einzelpreisen aller Bestellpositionen. |
| BV-040 | Besuch beim Bezahlen zählen | done | Beim erstmaligen Übergang einer Bestellung auf `bezahlt` steigt der Besuchszähler des verknüpften Gasts innerhalb derselben Transaktion automatisch genau einmal. |
| BV-011 | Digitale Bella-Card aktivieren | done | Ab zehn abgeschlossenen Besuchen wird der Bella-Card-Status eines Gasts aus dem Besuchszähler abgeleitet aktiv. |
| BV-041 | Bella-Card-Rabatt automatisch anwenden | done | Bei aktiver Bella-Card werden automatisch 15 % der Ausgangssumme kaufmännisch auf Cent gerundet abgezogen. |
| BV-042 | Rabattierte Abrechnung anzeigen | done | Vorschau und gespeicherte Abrechnung zeigen Ausgangssumme, Bella-Card-Rabatt und Gesamtsumme nachvollziehbar an; bezahlte Werte bleiben historisiert. |

## Querschnitt — Bedienführung

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-046 | Rollenbasiertes Arbeitsdashboard | done | Nach expliziter Standort- und Mitarbeiterwahl zeigt `/` den aktiven Kontext, priorisiert direkte Reservierungsanlage und Bestellaufnahme, bietet responsive operative Schnellzugriffe und blendet Verwaltungsaktionen capability-basiert ein. |
| BV-047 | Standortoffene Bedienungen | done | Sofia, Nico und Fatima werden idempotent ohne feste Standort-ID angelegt, sind nach expliziter Standortwahl an beiden Standorten verfügbar und handeln ausschließlich im aktiven Standortkontext. |
| BV-048 | Tische auswählen und Reservierungen erkennen | done | Der standortbezogene Grundriss macht jeden Tisch per Maus und Tastatur auswählbar, kennzeichnet offene zukünftige Reservierungen und zeigt für den ausgewählten Tisch Gast, Termin und Personenzahl; Tests und lokaler Standortcheck sind grün. |
| BV-058 | Einheitliche App-Oberfläche bereitstellen | done | Eine responsive App-Shell strukturiert alle bestehenden Arbeitsbereiche mit rollenabhängiger Seiten- beziehungsweise Mobilnavigation, aktivem Navigationszustand und sichtbarem Mitarbeiter-/Standortkontext. Einheitliche Seitenköpfe, Formulare, Karten, Statusanzeigen, Fokuszustände und Leerzustände verbessern die Bedienung, ohne Funktionen oder Geschäftsregeln zu verändern. |
| BV-059 | Veröffentlichungsreifes italienisches Erscheinungsbild | done | Eine separat nachgeladene Theme-Schicht verleiht der unveränderten App eine offizielle Bella-Vista-Markenwirkung mit italienisch inspirierter Farbwelt und Typografie. Flexible Grids, definierte Umbruchregeln und abgestufte Breakpoints verhindern Text- und Bedienelementüberlagerungen auf Desktop, Tablet und Mobilgeräten; interne Phasen- und Backlog-IDs werden in der Produktoberfläche nicht angezeigt. |
| BV-060 | Sichere Mitarbeiteranmeldung | in-progress | Zufällige, nur gehasht persistierte und auf zwölf Stunden begrenzte Serversessions ersetzen die fälschbare Mitarbeiter-ID im Cookie. Der lokale Start aktualisiert Prisma-Client und Migrationen vor dem Serverstart. PIN-Hashing ist implementiert und getestet; PIN-Vergabe, Login-Prüfung, Fehlversuchsbegrenzung und sicherer Inhaber-Bootstrap fehlen noch. |

## Phase 6 — Betriebsreife: Offline und Datenintegrität

_Nächste aktive Phase. Die lokale Einzelgeräte-Persistenz ist vorhanden, erfüllt
aber noch keine Offline-Synchronisation zwischen mehreren Geräten._

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-014 | Kernabläufe offline bereitstellen | in-progress | PWA-Manifest, Service Worker, sicherer statischer Offline-Fallback und sichtbarer Verbindungsstatus sind vorhanden. Offline-Schreiben für Gäste, Reservierungen, Tischstatus und Bestellungen fehlt noch. |
| BV-043 | Offline-Änderungen synchronisieren | validated | Lokal vorgenommene Änderungen werden nach Wiederherstellung der Verbindung ohne Duplikate synchronisiert. |
| BV-044 | Synchronisationskonflikte sichtbar behandeln | validated | Kritische Konflikte bei Reservierungen, Bestellungen und Zahlungen werden nicht still überschrieben, sondern nachvollziehbar gelöst. |

## Spätere Ausbaustufen

| ID | Phase | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|---|
| BV-017 | Später | Getrennte Zahlung pro Person | hypo | Positionen einer Tischbestellung können mehreren Einzelabrechnungen zugeordnet werden. |
| BV-018 | Später | Tageskarten direkt pflegen | hypo | Wechselnde Tages- und Saisongerichte lassen sich pro Standort direkt in der App anlegen, ändern und deaktivieren. |
| BV-019 | Später | Catering-Aufträge verwalten | done | Manager und Inhaber verwalten unter `/catering` standortgetrennte Aufträge mit Kundenname, Datum, Beschreibung, positiver Angebotssumme in Cent, kontrolliertem Status und verantwortlichem Mitarbeiter; Rollen-, Validierungs- und Standorttests sind grün. |

## Noch zu klärende Anforderungen

Diese Punkte widersprechen sich in der Spec oder sind für eine eindeutige
Implementierung noch nicht präzise genug:

| Thema | Klärungsbedarf | Betroffene IDs |
|---|---|---|
| Gastnotizen | Die Rollenmatrix erlaubt Gastdaten nur Manager/Inhaber; die Anekdote sagt, jeder Mitarbeiter solle Vorlieben sehen. | BV-022, BV-024 |
| Küchenausgabe | Display, Drucker oder anderes Ziel sowie Quittierung und Offline-Verhalten sind noch festzulegen. | BV-008 |
| Gast an Bestellung | Die Bestellung enthält eine Gast-ID, aber es ist nicht festgelegt, ob sie Pflicht oder optional ist. | BV-007, BV-040 |
| Stornierung | Rechte, Gründe und Auswirkungen einer Stornierung auf Tischstatus, Küche und Abrechnung fehlen. | BV-027, BV-009 |
| Steuern und Belege | Steuerlogik, Trinkgeldbuchung sowie rechtliche und technische Beleganforderungen sind nicht beschrieben. Euro-Anzeige und Cent-Rundung sind für die einfache interne Abrechnung entschieden. | BV-010, BV-042 |

## Lieferstand und nächste Umsetzungsreihenfolge

1. **Abgeschlossen:** Phasen 0–5 bilden den lokalen Kernablauf von Identität,
   Standortwahl und Reservierung über Tische, Karte und Küche bis zur Abrechnung
   mit Bella-Card vollständig ab.
2. **Als Nächstes:** Phase 6 macht diese Kernabläufe offline- und
   synchronisationsfähig. Vor der Implementierung sind Zielplattform,
   Authentifizierung im Offline-Betrieb, Synchronisationsmodell und Konfliktregeln
   in einem Konzept festzulegen.
3. **Danach:** Validierte spätere Features werden nach fachlicher Priorität
   umgesetzt; hypothetische Features benötigen zuvor eine Validierung.

Der initiale Technologie-Stack ist umgesetzt. Die für Phase 6 noch offenen
Architekturfragen stehen in [`architecture.md`](architecture.md).
