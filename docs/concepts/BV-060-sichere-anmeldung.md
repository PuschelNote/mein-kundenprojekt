# BV-060 — Sichere Mitarbeiteranmeldung

## Ziel

Die frei fälschbare Mitarbeiter-ID im Cookie wird durch eine serverseitige,
zeitlich begrenzte Sitzung ersetzt. Die persönliche Anmeldung wird anschließend
mit sechsstelligen PINs abgeschlossen.

## Erste Ausbaustufe

- Der Browser erhält einen zufälligen 256-Bit-Sessiontoken als HttpOnly-Cookie.
- In der Datenbank liegt ausschließlich dessen SHA-256-Hash mit Ablaufzeit und
  Mitarbeiterbezug; Abmelden widerruft den Datensatz.
- PINs werden mit zufälligem Salt und `scrypt` gehasht; Klartext-PINs und
  Standard-PINs werden weder gespeichert noch geseedet.
- Das Schema besitzt bereits `pinHash`, die Auswahloberfläche nutzt die PIN aber
  noch nicht. Diese Übergangsgrenze wird sichtbar dokumentiert.

## Noch offen bis `done`

Ein einmaliger sicherer Inhaber-Bootstrap, PIN-Vergabe/-Wechsel, Login-Prüfung,
Fehlversuchsbegrenzung, Sessionbereinigung und Offline-Authentifizierung.
