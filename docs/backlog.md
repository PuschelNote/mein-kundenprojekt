# Backlog — Bella Vista Restaurant-App

_Stand: 23.07.2026_

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
| BV-001 | Mitarbeiter und Rollen verwalten | done | Mitarbeiter besitzen ID, Name, Standort und genau eine Rolle: `bedienung`, `manager` oder `inhaber`. CRUD unter `/mitarbeiter`; Validierungs- und Persistenztests sind grün. |
| BV-002 | Verbindlichen Standortkontext führen | validated | Kreuzberg und Spandau besitzen eindeutige IDs; jede standortgebundene Entität referenziert genau einen Standort. |
| BV-020 | Standardöffnungszeiten hinterlegen | validated | Kreuzberg ist Di–So 17–23 Uhr, Spandau Do–So 17–22 Uhr geöffnet. |
| BV-021 | Mitarbeiter Standorten zuordnen | validated | Mitarbeiter sind einem Standort zugeordnet; Giuseppe ist Manager in Kreuzberg und Renate in Spandau. |
| BV-022 | Rollenbasierte Zugriffe erzwingen | validated | Reservierungen, Bestellungen und Tischstatus sind für alle Rollen erlaubt; Gast-/Bella-Card-Daten nur für Manager und Inhaber; Karten- und Preisänderungen nur für den Inhaber. |
| BV-045 | Technisches Projektgrundgerüst einrichten | done | Next.js mit TypeScript, ESLint, Prisma und lokaler SQLite-Verbindung ist eingerichtet; Prisma-Generierung, Datenbankcheck, Lint und Production-Build laufen erfolgreich. |

## Phase 1 — Kern: Gäste und Reservierungen

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-005 | Gast anlegen und bearbeiten | validated | Ein Gast besitzt Gast-ID, Name, Telefonnummer, Besuchszähler, Notizen und Bella-Card-Status. |
| BV-023 | Gast über Telefonnummer erkennen | validated | Bei einer Reservierung kann ein vorhandener Gast eindeutig über seine Telefonnummer gefunden und verknüpft werden. |
| BV-024 | Gastpräferenzen und Allergien dokumentieren | validated | Freitextnotizen speichern beispielsweise Allergien, „kein Knoblauch“ oder bevorzugte Sitzbereiche. |
| BV-004 | Reservierung anlegen | validated | Nur Mitarbeiter können eine Reservierung mit Standort, Tisch, Datum, Uhrzeit, Personenzahl und Gast anlegen; Selbstreservierung durch Gäste ist ausgeschlossen. |
| BV-025 | Standort bei Reservierung erzwingen | validated | Ohne explizite Auswahl von Kreuzberg oder Spandau kann keine Reservierung gespeichert werden. |
| BV-026 | Reservierung einem Tisch zuweisen | validated | Jede Reservierung belegt genau einen Tisch; ein Tisch kann zu unterschiedlichen Zeiten mehrere Reservierungen besitzen. |
| BV-027 | Reservierung ändern und stornieren | validated | Mitarbeiter können bestehende Reservierungen ändern; der Status ist `offen` oder `storniert`. |
| BV-013 | Reservierungsänderungen protokollieren | validated | Ersteller, Erstellzeitpunkt, letzter Änderungszeitpunkt und ändernder Mitarbeiter werden automatisch gespeichert. |

## Phase 2 — Kern: Tische und Restaurantübersicht

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-003 | Tische als Liste anzeigen | validated | Pro Standort erscheint eine einfache Tischliste; ein grafischer Raumplan ist ausdrücklich nicht erforderlich. |
| BV-028 | Tische standortbezogen verwalten | validated | Jeder Tisch besitzt ID, sichtbare Nummer und Standort; dieselbe Nummer darf an beiden Standorten vorkommen. |
| BV-029 | Tischkapazität pflegen | validated | Für jeden Tisch wird die maximale Personenzahl gespeichert und angezeigt. |
| BV-030 | Tischbereich pflegen | validated | Ein Tisch gehört zu `innen` oder `terrasse`; Terrassenplätze können saisonal verfügbar sein. |
| BV-031 | Tischstatus führen | validated | Der Status eines Tisches ist `frei`, `besetzt` oder `reserviert` und wird standortbezogen angezeigt. |
| BV-032 | Vorläufige Tischbestände nutzen | validated | Bis zur finalen Liste des Inhabers unterstützt das System Platzhalter für ca. 15–18 Tische in Kreuzberg und 10–12 in Spandau. |

## Phase 3 — Kern: Standortbezogene Speisekarten

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-006 | Standortbezogene Speisekarten anzeigen | validated | Jeder Standort besitzt eine eigene Karte; Gerichte anderer Standorte werden nicht angeboten. |
| BV-033 | Gerichtsdaten führen | validated | Ein Gericht besitzt Name, Beschreibung, Preis und eine Kategorie: Antipasti, Pasta, Risotto, Dessert, Getränke oder Grill. |
| BV-015 | Speisekarte und Preise pflegen | validated | Der Inhaber kann Gerichte und Preise ausschließlich in der App anlegen und ändern; die bisherige Excel-Liste wird ersetzt. |
| BV-034 | Grillgerichte auf Kreuzberg beschränken | validated | Gerichte der Kategorie `Grill` sind in Spandau weder sichtbar noch bestellbar. |
| BV-035 | Tages- und Saisongerichte kennzeichnen | validated | Gerichte können pro Standort als Tagesgericht oder saisonal markiert werden. Die direkte Pflege wechselnder Karten folgt in BV-018. |

## Phase 4 — Kern: Bestellungen und Küche

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-007 | Bestellung aufnehmen | validated | Eine Bestellung besitzt ID, Tisch, Standort, optional verknüpften Gast und den aufnehmenden Mitarbeiter. |
| BV-036 | Bestellpositionen verwalten | validated | Eine Bestellung enthält mindestens eine Position mit Gericht, Menge und optionalem Sonderwunsch. |
| BV-037 | Einzelpreis historisieren | validated | Jede Bestellposition speichert den gültigen Einzelpreis zum Bestellzeitpunkt; spätere Preisänderungen verändern sie nicht. |
| BV-038 | Nur eine aktive Bestellung pro Tisch zulassen | validated | Ein Tisch besitzt gleichzeitig höchstens eine Bestellung, die noch nicht bezahlt oder storniert ist. |
| BV-008 | Bestellung an die Küche übermitteln | validated | Aufgenommene Bestellungen werden direkt an die noch festzulegende Küchenausgabe übertragen. |
| BV-009 | Bestellstatus verwalten | validated | Zulässige Status sind `offen`, `serviert`, `bezahlt` und `storniert`; `serviert` beendet die Bestellung noch nicht. |
| BV-039 | Aufnehmenden Mitarbeiter nachweisen | validated | Jede Bestellung speichert den verantwortlichen Mitarbeiter für die spätere Trinkgeld-Aufteilung. |
| BV-012 | Küchenannahmeschluss erzwingen | validated | Ab 30 Minuten vor der regulären Schließzeit des gewählten Standorts kann keine neue Bestellung angelegt werden. |

## Phase 5 — Kern: Abrechnung und Bella-Card

| ID | Feature | Status | Anforderung / Akzeptanzkern |
|---|---|---|---|
| BV-010 | Tischrechnung berechnen | validated | Das System berechnet eine Gesamtsumme aus Mengen und historisierten Einzelpreisen aller Bestellpositionen. |
| BV-040 | Besuch beim Bezahlen zählen | validated | Beim erstmaligen Übergang einer Bestellung auf `bezahlt` steigt der Besuchszähler des verknüpften Gasts automatisch genau einmal. |
| BV-011 | Digitale Bella-Card aktivieren | validated | Ab zehn abgeschlossenen Besuchen wird der Bella-Card-Status eines Gasts aktiv. |
| BV-041 | Bella-Card-Rabatt automatisch anwenden | validated | Bei aktiver Bella-Card werden automatisch 15 % von der gesamten Rechnung abgezogen. |
| BV-042 | Rabattierte Abrechnung anzeigen | validated | Rechnung und Bestellsumme zeigen Ausgangssumme, Bella-Card-Rabatt und rabattierte Gesamtsumme nachvollziehbar an. |

## Phase 6 — Betriebsreife: Offline und Datenintegrität

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
| Bella-Card-Rabatt | Die Geschäftsregel verlangt automatische 15 %, die Rollenmatrix spricht zusätzlich von „Rabatt vergeben“ durch Manager/Inhaber. Ist eine manuelle Freigabe oder Ausnahme vorgesehen? | BV-022, BV-041 |
| Reservierungsüberschneidung | Dauer einer Reservierung, Überlappungsregeln und Verhalten bei zu großer Personenzahl fehlen. | BV-004, BV-026 |
| Terrassensaison | Wer Terrassenplätze wann aktiviert und was mit bestehenden Reservierungen geschieht, ist offen. | BV-030 |
| Küchenausgabe | Display, Drucker oder anderes Ziel sowie Quittierung und Offline-Verhalten sind noch festzulegen. | BV-008 |
| Gast an Bestellung | Die Bestellung enthält eine Gast-ID, aber es ist nicht festgelegt, ob sie Pflicht oder optional ist. | BV-007, BV-040 |
| Stornierung | Rechte, Gründe und Auswirkungen einer Stornierung auf Tischstatus, Küche und Abrechnung fehlen. | BV-027, BV-009 |
| Geld und Belege | Währung, Rundung, Steuern, Trinkgeldbuchung und Beleganforderungen sind nicht beschrieben. | BV-010, BV-042 |

## Empfohlene Umsetzungsreihenfolge

1. Phase 0 schafft Identität, Standorttrennung und Berechtigungen.
2. Phase 1 liefert mit Gästen und Reservierungen den ersten eigenständig nutzbaren
   Kernablauf und verhindert die bekannte Standort-Doppelbuchung.
3. Phase 2 ergänzt die operative Tischübersicht.
4. Phasen 3 und 4 digitalisieren Karte, Bestellaufnahme und Küchenübergabe.
5. Phase 5 schließt den Ablauf mit Abrechnung und Treueprogramm.
6. Phase 6 macht die Kernabläufe robust für den Restaurantbetrieb.

Vor der Implementierung sind außerdem Zielplattform, Technologie-Stack und die
offenen Architekturfragen aus [`architecture.md`](architecture.md) zu entscheiden.
