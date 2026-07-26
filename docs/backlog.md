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
| BV-002 | Verbindlichen Standortkontext führen | done | Kreuzberg und Spandau besitzen eindeutige IDs; ein serverseitig validierter Cookie-Kontext erzwingt eine explizite Auswahl und wird global angezeigt. |
| BV-020 | Standardöffnungszeiten hinterlegen | done | Kreuzberg ist Di–So 17–23 Uhr, Spandau Do–So 17–22 Uhr geöffnet; geschlossene Tage und Wochenpläne werden standortbezogen angezeigt. |
| BV-021 | Mitarbeiter Standorten zuordnen | done | Giuseppe ist Manager in Kreuzberg und Renate in Spandau; bekannte Bedienungen ohne geklärten Einsatzort bleiben standortoffen und werden separat angezeigt. |
| BV-022 | Rollenbasierte Zugriffe erzwingen | done | Zentrale deny-by-default Capability-Matrix und serverseitige Guards setzen die Rollenrechte durch. Mitarbeiterwahl ist als Prototyp noch nicht durch PIN oder Passwort abgesichert. |
| BV-045 | Technisches Projektgrundgerüst einrichten | done | Next.js mit TypeScript, ESLint, Prisma und lokaler SQLite-Verbindung ist eingerichtet; Prisma-Generierung, Datenbankcheck, Lint und Production-Build laufen erfolgreich. |

## Phase 1 — Kern: Gäste und Reservierungen

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-005 | Gast anlegen und bearbeiten | done | Geschütztes CRUD unter `/gaeste` verwaltet Name, eindeutige normalisierte Telefonnummer, Besuchszähler, Notizen und abgeleiteten Bella-Card-Status. |
| BV-023 | Gast über Telefonnummer erkennen | done | Geschützte exakte Suche erkennt vorhandene Gäste trotz üblicher Telefonnummern-Schreibweisen und liefert die stabile Gast-ID für spätere Reservierungen. |
| BV-024 | Gastpräferenzen und Allergien dokumentieren | done | Manager und Inhaber können Freitextnotizen mit Präferenzen und Allergien anlegen, ändern, leeren und einsehen; serverseitige Validierung und Persistenztests sichern das Feld ab. |
| BV-004 | Reservierung anlegen | done | Geschützte Anlage unter `/reservierungen` ordnet bekannte Gäste exakt per Telefonnummer zu oder legt unbekannte Gäste mit Name und Telefonnummer atomar mit der Reservierung an; Tisch, lokaler Termin, Personenzahl, Standort und Ersteller werden gespeichert. |
| BV-025 | Standort bei Reservierung erzwingen | done | Der validierte Standortkontext wird serverseitig übernommen; Mitarbeiter und Tisch müssen demselben Standort angehören, manipulierte Zuordnungen werden abgewiesen. |
| BV-026 | Reservierung einem Tisch zuweisen | done | Jede Reservierung referenziert genau einen Tisch desselben Standorts; mehrere Termine pro Tisch bleiben möglich, solange Überschneidungsregeln ungeklärt sind. |
| BV-027 | Reservierung ändern und stornieren | done | Berechtigte Mitarbeiter können standortgebundene Reservierungen vollständig neu validiert bearbeiten, stornieren und wieder öffnen; physisches Löschen findet nicht statt. |
| BV-013 | Reservierungsänderungen protokollieren | done | Ersteller und Erstellzeitpunkt bleiben unverändert; letzter Änderungszeitpunkt und ändernder Mitarbeiter werden bei Bearbeitung und Statuswechsel automatisch gespeichert und angezeigt. |
| BV-053 | Standort bei Reservierungsanlage explizit wählen | done | Das Anlageformular verlangt eine erneute Standortwahl und filtert die Tische unmittelbar danach; Standort, Tisch, Mitarbeiterberechtigung und aktiver Kontext werden serverseitig abgeglichen. Nach erfolgreicher Anlage zeigt die App den gewählten Standortkontext. |
| BV-054 | Gäste aus den Anekdoten bereitstellen | done | Herr Kellner und Herr Bergmann werden mit stabilen IDs, eindeutig erfundenen Telefonnummern und den belegten Hinweisen als nicht-destruktive Grunddaten angelegt; Herr Bergmann besitzt mit zehn Vorbesuchen bereits Bella-Card-Status. Wiederholtes Seeden erzeugt keine Duplikate und überschreibt keine spätere Pflege. |

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
| BV-038 | Nur eine aktive Bestellung pro Tisch zulassen | done | Ein partieller eindeutiger Datenbankindex erlaubt je Tisch höchstens eine Bestellung im Status `offen` oder `serviert`, auch bei konkurrierenden Schreibzugriffen. |
| BV-008 | Bestellung an die Küche übermitteln | done | `/kueche` zeigt offene Bons des aktiven Standorts mit Positionen und Sonderwünschen und aktualisiert sich alle zehn Sekunden; das endgültige Ausgabemedium bleibt offen. |
| BV-009 | Bestellstatus verwalten | done | Kontrollierte Übergänge führen von `offen` über `serviert` zu `bezahlt` oder aus aktiven Zuständen zu `storniert`; abgeschlossene Bestellungen sind unveränderlich. |
| BV-052 | Stornierte Bestellungen manuell löschen | done | Ausschließlich stornierte Bestellungen können nach Bestätigung am aktiven Standort dauerhaft gelöscht werden; Rollen- und Standortprüfung, Positionskaskade und Freigabe eines Reservierungsbezugs sind automatisiert getestet. |
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

## Phase 6 — Betriebsreife: Offline und Datenintegrität

_Nächste aktive Phase. Die lokale Einzelgeräte-Persistenz ist vorhanden, erfüllt
aber noch keine Offline-Synchronisation zwischen mehreren Geräten._

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-014 | Kernabläufe offline bereitstellen | validated | Gäste, Reservierungen, Tischstatus und Bestellungen bleiben bei Internetausfall nutzbar; die App bricht nicht zusammen. |
| BV-043 | Offline-Änderungen synchronisieren | validated | Lokal vorgenommene Änderungen werden nach Wiederherstellung der Verbindung ohne Duplikate synchronisiert. |
| BV-044 | Synchronisationskonflikte sichtbar behandeln | validated | Kritische Konflikte bei Reservierungen, Bestellungen und Zahlungen werden nicht still überschrieben, sondern nachvollziehbar gelöst. |

## Spätere Ausbaustufen

| ID | Phase | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|---|
| BV-016 | Später | Feiertags-Overrides | validated | Der Inhaber kann Öffnungszeiten pro Standort und Datum überschreiben; ohne Override gelten die Standardzeiten. |
| BV-017 | Später | Getrennte Zahlung pro Person | hypo | Positionen einer Tischbestellung können mehreren Einzelabrechnungen zugeordnet werden. |
| BV-018 | Später | Tageskarten direkt pflegen | hypo | Wechselnde Tages- und Saisongerichte lassen sich pro Standort direkt in der App anlegen, ändern und deaktivieren. |
| BV-019 | Später | Catering-Aufträge verwalten | hypo | Ein Auftrag besitzt Kundenname, Datum, Beschreibung, Angebotssumme und Status. |

## Noch zu klärende Anforderungen

Diese Punkte widersprechen sich in der Spec oder sind für eine eindeutige
Implementierung noch nicht präzise genug:

| Thema | Klärungsbedarf | Betroffene IDs |
|---|---|---|
| Gastnotizen | Die Rollenmatrix erlaubt Gastdaten nur Manager/Inhaber; die Anekdote sagt, jeder Mitarbeiter solle Vorlieben sehen. | BV-022, BV-024 |
| Reservierungsüberschneidung | Dauer einer Reservierung, Überlappungsregeln und Verhalten bei zu großer Personenzahl fehlen. | BV-004, BV-026 |
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
