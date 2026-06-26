# Product Backlog - Bella Vista Restaurant-App

Quelle: `docs/SPEC_Marco Ferretti Bella Vista.md`

## F001 - Standortmodell

- **Feature-ID:** F001
- **Titel:** Standortmodell
- **Beschreibung:** Die App bildet die beiden Standorte Kreuzberg und Spandau mit eigenen Standardoeffnungszeiten und hart codiertem Kuechenschluss 30 Minuten vor Restaurantschluss ab.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Kreuzberg ist mit Di-So, 17-23 Uhr hinterlegt.
  - Spandau ist mit Do-So, 17-22 Uhr hinterlegt.
  - Der Kuechenschluss wird automatisch 30 Minuten vor Restaurantschluss berechnet.
  - Jeder Tisch, jede Reservierung, jedes Gericht und jede Bestellung ist einem Standort zugeordnet.

## F002 - Tischverwaltung

- **Feature-ID:** F002
- **Titel:** Tischverwaltung
- **Beschreibung:** Tische werden pro Standort mit Nummer, Kapazitaet, Bereich und Status verwaltet.
- **Benutzerrolle:** Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Jeder Tisch besitzt eine eindeutige ID.
  - Tischnummern sind pro Standort getrennt, sodass Tisch 4 Kreuzberg und Tisch 4 Spandau unterschiedliche Tische sind.
  - Fuer jeden Tisch sind Kapazitaet, Bereich und Status gespeichert.
  - Der Status kann `frei`, `besetzt` oder `reserviert` sein.

## F003 - Tischstatus-Uebersicht

- **Feature-ID:** F003
- **Titel:** Tischstatus-Uebersicht
- **Beschreibung:** Mitarbeitende sehen eine einfache Listenansicht aller Tische pro Standort mit aktuellem Status.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Die Tischuebersicht kann nach Standort gefiltert werden.
  - Zu jedem Tisch werden Nummer, Kapazitaet, Bereich und Status angezeigt.
  - Es wird kein fester Raumplan benoetigt.
  - Statusaenderungen sind in der Uebersicht sichtbar.

## F004 - Reservierung erstellen

- **Feature-ID:** F004
- **Titel:** Reservierung erstellen
- **Beschreibung:** Mitarbeitende koennen Reservierungen mit Standort, Tisch, Datum, Uhrzeit, Personenzahl und Gast erfassen.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Eine Reservierung kann nur durch Mitarbeitende erstellt werden.
  - Eine Reservierung enthaelt Standort, Tisch, Datum, Uhrzeit und Personenzahl.
  - Eine Reservierung ist mit einem Gast verknuepft.
  - Der Status einer neuen Reservierung ist `offen`.

## F005 - Standortpflicht bei Reservierungen

- **Feature-ID:** F005
- **Titel:** Standortpflicht bei Reservierungen
- **Beschreibung:** Reservierungen ohne explizite Standortauswahl werden verhindert, um Verwechslungen zwischen Kreuzberg und Spandau zu vermeiden.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Das Standortfeld ist beim Erstellen einer Reservierung verpflichtend.
  - Ohne Standort kann eine Reservierung nicht gespeichert werden.
  - Die Fehlermeldung weist auf die erforderliche Standortauswahl hin.
  - Der ausgewaehlte Standort bleibt in der Reservierungsansicht sichtbar.

## F006 - Reservierung aendern oder stornieren

- **Feature-ID:** F006
- **Titel:** Reservierung aendern oder stornieren
- **Beschreibung:** Mitarbeitende koennen bestehende Reservierungen bearbeiten oder stornieren.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Offene Reservierungen koennen geaendert werden.
  - Eine Reservierung kann auf den Status `storniert` gesetzt werden.
  - Stornierte Reservierungen werden nicht als aktive Tischbelegung behandelt.
  - Geaenderte Reservierungsdaten werden dauerhaft gespeichert.

## F007 - Reservierungsprotokoll

- **Feature-ID:** F007
- **Titel:** Reservierungsprotokoll
- **Beschreibung:** Aenderungen an Reservierungen werden automatisch mit Mitarbeiter-ID und Zeitstempel protokolliert.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Beim Erstellen wird `erstellt von` gespeichert.
  - Beim Erstellen wird `erstellt am` gespeichert.
  - Bei jeder Aenderung wird `geaendert am` aktualisiert.
  - Bei jeder Aenderung wird die verantwortliche Mitarbeiter-ID gespeichert.

## F008 - Gastprofil

- **Feature-ID:** F008
- **Titel:** Gastprofil
- **Beschreibung:** Gaeste werden mit Name, Telefonnummer, Besuchszaehler und Notizen verwaltet.
- **Benutzerrolle:** Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Ein Gastprofil enthaelt Name und Telefonnummer.
  - Die Telefonnummer dient als Erkennungsmerkmal.
  - Besuchszaehler und Notizen koennen gespeichert werden.
  - Notizen koennen Vorlieben, Allergien oder Sonderwuensche enthalten.

## F009 - Bella-Card-Status

- **Feature-ID:** F009
- **Titel:** Bella-Card-Status
- **Beschreibung:** Der Bella-Card-Status wird digital ueber den Besuchszaehler ermittelt und ab 10 Besuchen aktiviert.
- **Benutzerrolle:** Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Gaeste mit weniger als 10 Besuchen haben keinen aktiven Bella-Card-Status.
  - Gaeste mit 10 oder mehr Besuchen haben einen aktiven Bella-Card-Status.
  - Der Status wird aus dem Besuchszaehler abgeleitet.
  - Der Status ist im Gastprofil sichtbar.

## F010 - Automatischer Bella-Card-Rabatt

- **Feature-ID:** F010
- **Titel:** Automatischer Bella-Card-Rabatt
- **Beschreibung:** Bei der Abrechnung wird fuer Gaeste mit aktiver Bella-Card automatisch ein Rabatt von 15 Prozent auf die Gesamtsumme angewendet.
- **Benutzerrolle:** Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Bei aktiver Bella-Card wird automatisch 15 Prozent Rabatt berechnet.
  - Der Rabatt wird auf die gesamte Bestellung angewendet.
  - Die reduzierte Gesamtsumme wird in der Abrechnung angezeigt.
  - Bei inaktiver Bella-Card wird kein Rabatt angewendet.

## F011 - Speisekarte pro Standort

- **Feature-ID:** F011
- **Titel:** Speisekarte pro Standort
- **Beschreibung:** Jeder Standort besitzt eine eigene Speisekarte mit Gerichten, Beschreibungen, Preisen und Kategorien.
- **Benutzerrolle:** Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Jedes Gericht ist genau einem Standort zugeordnet.
  - Jedes Gericht enthaelt Name, Beschreibung, Preis und Kategorie.
  - Die Speisekarte kann nach Standort angezeigt werden.
  - Kategorien wie Antipasti, Pasta, Risotto, Dessert, Getraenke und Grill werden unterstuetzt.

## F012 - Grill-Sperre Spandau

- **Feature-ID:** F012
- **Titel:** Grill-Sperre Spandau
- **Beschreibung:** Gerichte der Kategorie Grill duerfen nur fuer Kreuzberg angezeigt und bestellt werden.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Grillgerichte sind in Spandau nicht bestellbar.
  - Grillgerichte werden in der Spandauer Speisekarte nicht angezeigt.
  - Grillgerichte koennen Kreuzberg zugeordnet werden.
  - Ein Versuch, ein Grillgericht fuer Spandau zu speichern oder zu bestellen, wird verhindert.

## F013 - Preisbearbeitung schuetzen

- **Feature-ID:** F013
- **Titel:** Preisbearbeitung schuetzen
- **Beschreibung:** Speisekarten- und Preisaenderungen sind ausschliesslich dem Inhaber vorbehalten.
- **Benutzerrolle:** Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Bedienungen koennen keine Speisekarten bearbeiten.
  - Manager koennen keine Preise aendern.
  - Nur Inhaber koennen Gerichte und Preise bearbeiten.
  - Unberechtigte Bearbeitungsversuche werden blockiert.

## F014 - Bestellung aufnehmen

- **Feature-ID:** F014
- **Titel:** Bestellung aufnehmen
- **Beschreibung:** Mitarbeitende koennen pro Tisch eine Bestellung aufnehmen und sie dem aufnehmenden Mitarbeiter zuordnen.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Eine Bestellung ist einem Tisch und einem Standort zugeordnet.
  - Eine Bestellung kann einem Gast zugeordnet werden.
  - Die aufnehmende Mitarbeiter-ID wird gespeichert.
  - Ein Tisch hat maximal eine aktive Bestellung gleichzeitig.

## F015 - Bestellpositionen

- **Feature-ID:** F015
- **Titel:** Bestellpositionen
- **Beschreibung:** Bestellungen bestehen aus Positionen mit Gericht, Menge, Sonderwunsch und Einzelpreis zum Zeitpunkt der Bestellung.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Jede Bestellposition verweist auf ein Gericht.
  - Pro Position wird eine Menge gespeichert.
  - Pro Position kann ein Sonderwunsch gespeichert werden.
  - Der Einzelpreis wird beim Bestellen gespeichert und bleibt bei spaeteren Preisaenderungen unveraendert.

## F016 - Kuechenschluss pruefen

- **Feature-ID:** F016
- **Titel:** Kuechenschluss pruefen
- **Beschreibung:** Neue Bestellungen werden blockiert, wenn die aktuelle Uhrzeit weniger als 30 Minuten vor Restaurantschluss liegt.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Fuer Kreuzberg sind neue Bestellungen nach 22:30 Uhr nicht mehr moeglich.
  - Fuer Spandau sind neue Bestellungen nach 21:30 Uhr nicht mehr moeglich.
  - Die Pruefung basiert auf dem Standort der Bestellung.
  - Bestehende Bestellungen koennen weiterhin angezeigt werden.

## F017 - Bestellstatus

- **Feature-ID:** F017
- **Titel:** Bestellstatus
- **Beschreibung:** Bestellungen durchlaufen die Status `offen`, `serviert`, `bezahlt` oder `storniert`.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Eine neue Bestellung startet im Status `offen`.
  - Eine Bestellung kann auf `serviert` gesetzt werden.
  - Eine servierte Bestellung gilt noch nicht als abgeschlossen.
  - Erst der Status `bezahlt` schliesst eine Bestellung ab.

## F018 - Besuchszaehler erhoehen

- **Feature-ID:** F018
- **Titel:** Besuchszaehler erhoehen
- **Beschreibung:** Wenn eine Bestellung bezahlt wird, wird der Besuchszaehler des zugeordneten Gasts automatisch um 1 erhoeht.
- **Benutzerrolle:** Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Der Besuchszaehler wird beim Wechsel auf `bezahlt` erhoeht.
  - Der Besuchszaehler wird pro bezahlter Bestellung nur einmal erhoeht.
  - Stornierte Bestellungen erhoehen den Besuchszaehler nicht.
  - Bestellungen ohne zugeordneten Gast veraendern keinen Gastdatensatz.

## F019 - Tischabrechnung

- **Feature-ID:** F019
- **Titel:** Tischabrechnung
- **Beschreibung:** Die App berechnet die Gesamtsumme einer Bestellung pro Tisch und ermoeglicht den Zahlungsabschluss.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Die Gesamtsumme wird aus allen Bestellpositionen berechnet.
  - Mengen werden bei der Summenberechnung beruecksichtigt.
  - Ein moeglicher Bella-Card-Rabatt wird in der Gesamtsumme beruecksichtigt.
  - Nach Zahlung wird die Bestellung auf `bezahlt` gesetzt.

## F020 - Mitarbeiterverwaltung

- **Feature-ID:** F020
- **Titel:** Mitarbeiterverwaltung
- **Beschreibung:** Mitarbeitende werden mit Name, Standort und Rolle verwaltet.
- **Benutzerrolle:** Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Jeder Mitarbeiter besitzt eine eindeutige ID.
  - Jeder Mitarbeiter hat einen Namen.
  - Jeder Mitarbeiter ist einem Standort zugeordnet.
  - Jeder Mitarbeiter hat eine Rolle: `bedienung`, `manager` oder `inhaber`.

## F021 - Rollenbasierte Rechte

- **Feature-ID:** F021
- **Titel:** Rollenbasierte Rechte
- **Beschreibung:** Funktionen werden gemaess der Rollen Bedienung, Manager und Inhaber freigeschaltet oder gesperrt.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Bedienungen koennen Reservierungen und Bestellungen bearbeiten sowie Tischstatus sehen.
  - Manager koennen zusaetzlich Stammgastdaten und Bella-Card-Informationen sehen.
  - Inhaber koennen zusaetzlich Speisekarten und Preise bearbeiten.
  - Nicht erlaubte Funktionen sind fuer die jeweilige Rolle gesperrt.

## F022 - Mitarbeiter-Tracking

- **Feature-ID:** F022
- **Titel:** Mitarbeiter-Tracking
- **Beschreibung:** Reservierungen und Bestellungen speichern, welcher Mitarbeiter sie erstellt oder aufgenommen hat.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Jede Reservierung speichert den erstellenden Mitarbeiter.
  - Jede Bestellung speichert den aufnehmenden Mitarbeiter.
  - Die Zuordnung bleibt fuer spaetere Auswertungen erhalten.
  - Das Tracking kann fuer Trinkgeld-Aufteilung verwendet werden.

## F023 - Offline-Verfuegbarkeit

- **Feature-ID:** F023
- **Titel:** Offline-Verfuegbarkeit
- **Beschreibung:** Die App bleibt bei Internetausfall nutzbar, damit der Restaurantbetrieb nicht zusammenbricht.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** High
- **Phase:** MVP
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Wichtige Arbeitsablaeufe sind ohne aktive Internetverbindung nutzbar.
  - Reservierungen, Tischstatus und Bestellungen koennen offline eingesehen werden.
  - Neue operative Daten koennen lokal erfasst werden.
  - Die App zeigt erkennbar an, wenn sie offline arbeitet.

## F024 - Tageskarte

- **Feature-ID:** F024
- **Titel:** Tageskarte
- **Beschreibung:** Wechselnde Tages- und Saisonangebote koennen pro Standort in der App gepflegt werden.
- **Benutzerrolle:** Inhaber
- **Prioritaet:** Medium
- **Phase:** Future
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Tagesgerichte koennen pro Standort angelegt werden.
  - Tagesgerichte koennen aktiviert und deaktiviert werden.
  - Tagesgerichte koennen Name, Beschreibung, Preis und Kategorie enthalten.
  - Tagesgerichte erscheinen nur am zugeordneten Standort.

## F025 - Feiertagsoeffnungszeiten

- **Feature-ID:** F025
- **Titel:** Feiertagsoeffnungszeiten
- **Beschreibung:** Der Inhaber kann Oeffnungszeiten pro Standort und Datum manuell ueberschreiben.
- **Benutzerrolle:** Inhaber
- **Prioritaet:** Medium
- **Phase:** Future
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Fuer einen Standort und ein Datum kann ein Override gepflegt werden.
  - Wenn ein Override existiert, ersetzt er die Standardoeffnungszeiten.
  - Wenn kein Override existiert, gelten die Standardoeffnungszeiten.
  - Die Reservierungs- und Bestelllogik beruecksichtigt Overrides.

## F026 - Getrennte Zahlung

- **Feature-ID:** F026
- **Titel:** Getrennte Zahlung
- **Beschreibung:** Eine Tischrechnung kann spaeter pro Person oder Teilgruppe aufgeteilt werden.
- **Benutzerrolle:** Bedienung, Manager, Inhaber
- **Prioritaet:** Medium
- **Phase:** Future
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Bestellpositionen koennen einzelnen Zahlungen zugeordnet werden.
  - Teilzahlungen ergeben zusammen die Gesamtsumme.
  - Bella-Card-Rabatte werden bei Teilzahlungen nachvollziehbar beruecksichtigt.
  - Nach vollstaendiger Zahlung wird die Bestellung abgeschlossen.

## F027 - Catering-Auftraege

- **Feature-ID:** F027
- **Titel:** Catering-Auftraege
- **Beschreibung:** Catering-Auftraege koennen mit Kundendaten, Datum, Beschreibung, Angebotssumme und Status verwaltet werden.
- **Benutzerrolle:** Manager, Inhaber
- **Prioritaet:** Low
- **Phase:** Future
- **Status:** Todo
- **Akzeptanzkriterien:**
  - Ein Catering-Auftrag enthaelt Kundenname, Datum und Beschreibung.
  - Eine Angebotssumme kann gespeichert werden.
  - Ein Status kann gepflegt werden.
  - Catering-Auftraege sind getrennt vom Restaurant-Tagesbetrieb verwaltbar.
