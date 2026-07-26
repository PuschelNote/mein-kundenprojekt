# BV-019 — Catering-Aufträge

## Ziel

Manager und Inhaber verwalten Catering-Anfragen je Standort mit Kundenname,
Datum, Beschreibung, Angebotssumme und kontrolliertem Status.

## Akzeptanzkriterien

- Jeder Auftrag besitzt zwingend eine Standort-ID und ist nur dort sichtbar.
- Kundenname, Datum, Beschreibung, positiver Centbetrag und Status werden
  serverseitig validiert.
- Manager dürfen ausschließlich ihren Standort verwalten; der Inhaber den
  explizit aktiven Standort. Bedienungen erhalten keinen Zugriff.
- Anlage und Änderung speichern den verantwortlichen Mitarbeiter sowie
  Zeitstempel.
- Statuswerte sind `angefragt`, `angebot`, `bestaetigt`, `abgeschlossen` und
  `storniert`; physisches Löschen ist nicht Teil dieses Features.

## Prüfung

Domänentests decken Validierung, Centpersistenz, Rollen und Standorttrennung ab.
Die geschützte Oberfläche liegt unter `/catering`.
