# BV-051 — Reservierung bei Bestellaufnahme übernehmen

## Ziel

Kommt ein reservierter Gast an, wählt das Servicepersonal nach dem Tisch die
offene Reservierung aus. Die neue Bestellung übernimmt den Gast und speichert
den Reservierungsbezug dauerhaft.

## Fachliche Regeln

- Angeboten werden nur offene, noch nicht verwendete Reservierungen ab dem
  aktuellen Berliner Kalendertag für den aktiven Standort und gewählten Tisch.
- Der Server prüft Reservierung, Tisch und Standort erneut. Clientwerte sind
  nicht vertrauenswürdig.
- Gast und Tisch stammen bei einer Reservierungsbestellung verbindlich aus der
  Reservierung; eine zusätzliche Telefonnummer ist unzulässig.
- Eine Reservierung kann höchstens einer Bestellung zugeordnet werden.
- Die Reservierung bleibt `offen`, weil kein Status „angekommen“ definiert ist.
- Bestellung und Tischstatus `besetzt` werden weiterhin atomar geschrieben.
- Bei späterer Positionsbearbeitung bleiben Reservierung, Gast und Tisch fest.

## Akzeptanzkriterien

- Nach der Tischauswahl sind passende Reservierungen mit Gast, Termin und
  Personenzahl auswählbar.
- Die Übersicht kennzeichnet reservierungsbezogene Bestellungen.
- Standortfremde, stornierte, tischfremde oder bereits verwendete
  Reservierungen werden serverseitig abgewiesen beziehungsweise nicht angeboten.
- Automatisierte Tests decken Übernahme, Manipulationsschutz und Atomizität ab.

## Offline-Hinweis

Die Verknüpfung besitzt eine stabile Reservierungs-ID und einen eindeutigen
Datenbank-Constraint. Die spätere Offline-Synchronisation muss Konflikte bei
konkurrierender Nutzung sichtbar behandeln; sie wird in BV-043/BV-044 umgesetzt.
