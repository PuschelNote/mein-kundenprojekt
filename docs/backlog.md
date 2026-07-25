# Backlog — Bella Vista Restaurant-App

_Stand: 25.07.2026_

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
| BV-002 | Verbindlichen Standortkontext führen | done | Kreuzberg und Spandau besitzen eindeutige IDs; ein serverseitig validierter Cookie-Kontext erzwingt eine explizite Auswahl und wird global angezeigt. |
| BV-020 | Standardöffnungszeiten hinterlegen | done | Kreuzberg ist Di–So 17–23 Uhr, Spandau Do–So 17–22 Uhr geöffnet; geschlossene Tage und Wochenpläne werden standortbezogen angezeigt. |
| BV-021 | Mitarbeiter Standorten zuordnen | done | Mitarbeiter sind einem Standort zugeordnet; Giuseppe ist Manager in Kreuzberg und Renate in Spandau. Die Übersicht ist nach Standort gruppiert und priorisiert den aktiven Kontext. |
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
