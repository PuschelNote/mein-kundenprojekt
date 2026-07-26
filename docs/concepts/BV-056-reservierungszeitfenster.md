# BV-056 — Reservierungszeitfenster validieren

## Ziel

Reservierungen sollen einen Tisch planbar und ohne Doppelbelegung für exakt zwei
Stunden blockieren.

## Regeln

- Eine Reservierung dauert 120 Minuten; direkt anschließende Zeitfenster sind erlaubt.
- Offene Reservierungen desselben Tischs und Datums dürfen sich nicht überschneiden.
- Das vollständige Zeitfenster muss in den regulären Öffnungszeiten des Standorts liegen.
- Geschlossene Wochentage und Reservierungsbeginn in der Vergangenheit sind unzulässig.
- Die Personenzahl darf die Tischkapazität nicht überschreiten.
- Anlage und Bearbeitung validieren alle Regeln serverseitig und standortbezogen.
- Stornierte Reservierungen blockieren kein Zeitfenster.
- Feiertagsabweichungen bleiben bis BV-016 außerhalb dieser Validierung.

## Grenzfälle

Bei 18:00–20:00 Uhr ist 19:59 Uhr eine Überschneidung, 20:00 Uhr dagegen ein
zulässiger direkt anschließender Beginn. Für eine Schließzeit um 23:00 Uhr ist
21:00 Uhr der späteste mögliche Reservierungsbeginn.
