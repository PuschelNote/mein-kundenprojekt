# BV-014 — Offline-Kernabläufe

## Zielbild

Die Restaurant-App wird als installierbare PWA betrieben. Gäste,
Reservierungen, Tischstatus und Bestellungen bleiben ohne Verbindung nutzbar und
werden später idempotent synchronisiert; kritische Konflikte sind sichtbar.

## Erste Ausbaustufe

- Web-App-Manifest, Service-Worker-Registrierung und Offline-Fallback bilden die
  PWA-Hülle.
- Ein globaler Verbindungsstatus zeigt ausdrücklich, dass Offline-Schreiben noch
  nicht zur Verfügung steht.
- Der Service Worker cached keine authentifizierten Restaurantseiten und keine
  personenbezogenen Daten. Das verhindert Datenabfluss auf gemeinsam genutzten
  Geräten, solange Gerätekopplung und lokaler Schutz noch fehlen.

## Nächste Schritte

1. Geräteidentität und lokale, benutzergebundene verschlüsselte Datenhaltung.
2. Outbox mit stabilen Vorgangs-IDs und idempotenter Serverannahme (BV-043).
3. Entitätsspezifische Konfliktzustände und Auflösungsoberfläche (BV-044).
4. Kernabläufe schrittweise offline les- und schreibbar machen und erst danach
   BV-014 auf `done` setzen.
