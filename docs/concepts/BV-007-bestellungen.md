# BV-007 — Bestellungen und Küchenausgabe

## Ziel

Mitarbeiter nehmen standortgebundene Tischbestellungen mit mindestens einer
Position auf. Die Küche sieht neue Bestellungen unmittelbar in einer internen,
automatisch aktualisierten Warteschlange.

## Fachlicher Schnitt

- Eine Bestellung referenziert Standort, Tisch, optional einen bekannten Gast
  und zwingend den aufnehmenden Mitarbeiter.
- Positionen speichern Gericht, Menge, optionalen Sonderwunsch und den Preis zum
  Zeitpunkt ihrer erstmaligen Aufnahme.
- `offen` und `serviert` gelten als aktiv. Ein partieller eindeutiger SQLite-Index
  verhindert mehrere aktive Bestellungen für denselben Tisch.
- Der Statusfluss lautet `offen → serviert → bezahlt`; aus einem aktiven Status
  kann storniert werden. Abgeschlossene Bestellungen sind unveränderlich.
- Neue Bestellungen sind nur zwischen Öffnung und 30 Minuten vor regulärer
  Schließung zulässig. Feiertags-Overrides sind erst Scope von BV-016.

## Küchenausgabe

`/kueche` ist die vorläufige interne Ausgabe. Sie zeigt offene Bons des aktiven
Standorts, aktualisiert sich alle zehn Sekunden und kann sie als serviert
markieren. Drucker, externe Displays, Quittierungsprotokoll und Offline-Sync
bleiben offen beziehungsweise Phase 6 vorbehalten.

## Sicherheit und Integrität

Serverseitige Transaktionen prüfen Capability, Mitarbeiter, Standort, Tisch,
Gast und jedes Gericht. Grill wird in Spandau erneut defensiv abgewiesen. UUIDs
und unveränderliche Positionspreise bereiten eine spätere idempotente
Synchronisation vor, implementieren sie aber noch nicht.
