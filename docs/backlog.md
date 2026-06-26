# Product Backlog - Bella Vista Restaurant-App

Quelle: `docs/SPEC_Marco Ferretti Bella Vista.md`

Statuswerte:

- `Todo`: noch nicht umgesetzt
- `In Progress`: in Umsetzung
- `Done`: umgesetzt und geprueft

## Phase: Kern

### F001 - Standortmodell

- **Feature-ID:** F001
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Die App bildet die Standorte Kreuzberg und Spandau getrennt mit eigenen Stammdaten ab.
- **Akzeptanzkriterien:**
  - Kreuzberg und Spandau sind als getrennte Standorte vorhanden.
  - Standortdaten enthalten Standort-ID und Name.
  - Jeder Tisch, jede Reservierung, jedes Gericht und jede Bestellung ist einem Standort zugeordnet.
  - Standortgrenzen duerfen in operativen Workflows nicht vermischt werden.

### F002 - Standardoeffnungszeiten und Kuechenschluss

- **Feature-ID:** F002
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Standardoeffnungszeiten und Kuechenschluss werden pro Standort abgebildet.
- **Akzeptanzkriterien:**
  - Kreuzberg ist Di-So von 17-23 Uhr geoeffnet.
  - Spandau ist Do-So von 17-22 Uhr geoeffnet.
  - Der Kuechenschluss liegt immer 30 Minuten vor Restaurantschluss.
  - Der Kuechenschluss wird bei Bestellungen standortbezogen geprueft.

### F003 - Tischverwaltung pro Standort

- **Feature-ID:** F003
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Tische werden pro Standort mit Nummer, Kapazitaet, Bereich und Status verwaltet.
- **Akzeptanzkriterien:**
  - Jeder Tisch besitzt Tisch-ID, Nummer, Standort und Kapazitaet.
  - Tischnummern sind nur innerhalb eines Standorts eindeutig.
  - Tisch 4 Kreuzberg und Tisch 4 Spandau sind unterschiedliche Tische.
  - Der Bereich ist `innen` oder `terrasse`.
  - Terrassenplaetze koennen saisonal verfuegbar oder nicht verfuegbar sein.

### F004 - Tischstatus-Uebersicht

- **Feature-ID:** F004
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Mitarbeitende sehen pro Standort eine einfache Tischliste mit aktuellem Status.
- **Akzeptanzkriterien:**
  - Die Uebersicht ist nach Standort getrennt.
  - Jeder Tisch zeigt Nummer, Kapazitaet, Bereich und Status.
  - Statuswerte sind nur `frei`, `besetzt` oder `reserviert`.
  - Es wird kein fester Raumplan vorausgesetzt.

### F005 - Reservierung erstellen

- **Feature-ID:** F005
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Mitarbeitende koennen Reservierungen fuer einen Standort und Tisch erfassen.
- **Akzeptanzkriterien:**
  - Reservierungen enthalten Reservierungs-ID, Standort-ID, Tisch-ID, Datum, Uhrzeit und Personenzahl.
  - Reservierungen sind mit einem Gast ueber Telefonnummer verknuepft.
  - Reservierungen werden nur durch Mitarbeitende erstellt.
  - Gaeste koennen keine eigenstaendige Reservierung in der App anlegen.
  - Neue Reservierungen starten im Status `offen`.

### F006 - Standortpflicht bei Reservierungen

- **Feature-ID:** F006
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Eine Reservierung darf nie ohne expliziten Standort gespeichert werden.
- **Akzeptanzkriterien:**
  - Das Standortfeld ist beim Erstellen verpflichtend.
  - Ohne Standort wird das Speichern verhindert.
  - Die Fehlermeldung nennt die fehlende Standortauswahl.
  - Der Standort bleibt in Detail- und Listenansichten sichtbar.

### F007 - Reservierung aendern und stornieren

- **Feature-ID:** F007
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Mitarbeitende koennen Reservierungen bearbeiten oder stornieren.
- **Akzeptanzkriterien:**
  - Offene Reservierungen koennen geaendert werden.
  - Reservierungen koennen auf `storniert` gesetzt werden.
  - Nur `offen` und `storniert` sind gueltige Reservierungsstatus.
  - Stornierte Reservierungen zaehlen nicht als aktive Tischbelegung.

### F008 - Reservierungsprotokoll

- **Feature-ID:** F008
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Erstellung und Aenderung von Reservierungen werden nachvollziehbar protokolliert.
- **Akzeptanzkriterien:**
  - Beim Erstellen werden Mitarbeiter-ID und Erstellzeitpunkt gespeichert.
  - Bei jeder Aenderung werden Mitarbeiter-ID und Aenderungszeitpunkt gespeichert.
  - Protokolldaten werden nicht durch spaetere Aenderungen ueberschrieben.
  - Die verantwortliche Person bleibt nachvollziehbar.

### F009 - Gastprofil

- **Feature-ID:** F009
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Gaeste werden mit Telefonnummer, Besuchszaehler und Notizen gepflegt.
- **Akzeptanzkriterien:**
  - Gastprofile enthalten Gast-ID, Name und Telefonnummer.
  - Die Telefonnummer dient als Erkennungsmerkmal.
  - Besuchszaehler werden pro Gast gespeichert.
  - Notizen koennen Vorlieben, Allergien und Sonderwuensche enthalten.

### F010 - Bella-Card-Status

- **Feature-ID:** F010
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Der Bella-Card-Status wird digital anhand des Besuchszaehlers ermittelt.
- **Akzeptanzkriterien:**
  - Unter 10 Besuchen ist die Bella-Card nicht aktiv.
  - Ab 10 Besuchen ist die Bella-Card aktiv.
  - Der Status wird aus dem Besuchszaehler abgeleitet.
  - Der Status ist fuer berechtigte Rollen sichtbar.

### F011 - Automatischer Bella-Card-Rabatt

- **Feature-ID:** F011
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Bei aktiver Bella-Card wird automatisch 15 Prozent Rabatt auf die Gesamtsumme angewendet.
- **Akzeptanzkriterien:**
  - Der Rabatt wird bei der Abrechnung automatisch berechnet.
  - Der Rabatt gilt auf die gesamte Bestellung.
  - Ohne aktive Bella-Card wird kein Rabatt angewendet.
  - Die Rabattberechnung ist in der Abrechnung nachvollziehbar.

### F012 - Besuchszaehler bei bezahlter Bestellung

- **Feature-ID:** F012
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Der Besuchszaehler wird erst erhoeht, wenn eine Bestellung bezahlt ist.
- **Akzeptanzkriterien:**
  - Der Besuchszaehler wird beim Wechsel auf `bezahlt` um 1 erhoeht.
  - Der Besuchszaehler wird pro Bestellung nur einmal erhoeht.
  - `serviert` erhoeht den Besuchszaehler nicht.
  - `storniert` erhoeht den Besuchszaehler nicht.

### F013 - Speisekarte pro Standort

- **Feature-ID:** F013
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Jeder Standort besitzt eine eigene Speisekarte mit Gerichten, Preisen und Kategorien.
- **Akzeptanzkriterien:**
  - Jedes Gericht ist genau einem Standort zugeordnet.
  - Gerichte enthalten Name, Beschreibung, Preis und Kategorie.
  - Unterstuetzte Kategorien sind Antipasti, Pasta, Risotto, Dessert, Getraenke und Grill.
  - Speisekarten koennen pro Standort angezeigt werden.

### F014 - Grill-Sperre fuer Spandau

- **Feature-ID:** F014
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Grillgerichte duerfen nur fuer Kreuzberg angezeigt und bestellt werden.
- **Akzeptanzkriterien:**
  - Gerichte der Kategorie `Grill` koennen Spandau nicht zugeordnet werden.
  - Grillgerichte werden in Spandau nicht angezeigt.
  - Grillgerichte sind in Spandau nicht bestellbar.
  - Bistecca, Salsiccia und Mixed-Grill sind fuer Spandau ausgeschlossen.

### F015 - Speisekarten- und Preisbearbeitung

- **Feature-ID:** F015
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Speisekarten- und Preisaenderungen sind dem Inhaber vorbehalten.
- **Akzeptanzkriterien:**
  - Bedienungen koennen keine Speisekarten bearbeiten.
  - Manager koennen keine Preise aendern.
  - Nur der Inhaber kann Gerichte und Preise bearbeiten.
  - Unberechtigte Bearbeitungsversuche werden blockiert.

### F016 - Bestellung aufnehmen

- **Feature-ID:** F016
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Mitarbeitende koennen digitale Bestellungen pro Tisch aufnehmen.
- **Akzeptanzkriterien:**
  - Bestellungen enthalten Bestell-ID, Tisch-ID, Standort-ID und optional Gast-ID.
  - Jede Bestellung speichert den aufnehmenden Mitarbeiter.
  - Ein Tisch hat maximal eine aktive Bestellung gleichzeitig.
  - Bestellungen koennen zur Kuechenbearbeitung bereitgestellt werden.

### F017 - Bestellpositionen

- **Feature-ID:** F017
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Bestellungen bestehen aus einzelnen Positionen mit Gericht, Menge, Sonderwunsch und historischem Einzelpreis.
- **Akzeptanzkriterien:**
  - Jede Position verweist auf ein Gericht.
  - Jede Position speichert eine Menge.
  - Jede Position kann einen Sonderwunsch enthalten.
  - Der Einzelpreis wird zum Zeitpunkt der Bestellung gespeichert.
  - Spaetere Preisaenderungen veraendern historische Bestellpositionen nicht.

### F018 - Bestellstatus

- **Feature-ID:** F018
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Bestellungen durchlaufen klar definierte Statuswerte.
- **Akzeptanzkriterien:**
  - Gueltige Statuswerte sind `offen`, `serviert`, `bezahlt` und `storniert`.
  - Neue Bestellungen starten im Status `offen`.
  - `serviert` ist noch kein Abschluss.
  - Erst `bezahlt` schliesst eine Bestellung ab.

### F019 - Kuechenschluss bei Bestellungen pruefen

- **Feature-ID:** F019
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Neue Bestellungen werden kurz vor Restaurantschluss blockiert.
- **Akzeptanzkriterien:**
  - Kreuzberg nimmt nach 22:30 Uhr keine neuen Bestellungen mehr an.
  - Spandau nimmt nach 21:30 Uhr keine neuen Bestellungen mehr an.
  - Die Pruefung basiert auf dem Standort der Bestellung.
  - Bestehende Bestellungen bleiben weiterhin sichtbar und abrechenbar.

### F020 - Tischabrechnung

- **Feature-ID:** F020
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Pro Tisch kann eine einfache Abrechnung mit Gesamtsumme erstellt werden.
- **Akzeptanzkriterien:**
  - Die Gesamtsumme wird aus Bestellpositionen und Mengen berechnet.
  - Historische Einzelpreise werden fuer die Berechnung verwendet.
  - Bella-Card-Rabatte werden automatisch beruecksichtigt.
  - Nach Zahlung wird die Bestellung auf `bezahlt` gesetzt.

### F021 - Mitarbeiterverwaltung

- **Feature-ID:** F021
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Mitarbeitende werden mit Standort und Rolle verwaltet.
- **Akzeptanzkriterien:**
  - Mitarbeitende haben Mitarbeiter-ID, Name, Standort-ID und Rolle.
  - Gueltige Rollen sind `bedienung`, `manager` und `inhaber`.
  - Giuseppe ist Manager fuer Kreuzberg.
  - Renate ist Managerin fuer Spandau.

### F022 - Rollenbasierte Berechtigungen

- **Feature-ID:** F022
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Funktionen werden anhand der Rollen Bedienung, Manager und Inhaber freigeschaltet.
- **Akzeptanzkriterien:**
  - Bedienungen koennen Reservierungen bearbeiten, Bestellungen aufnehmen und Tischstatus sehen.
  - Manager koennen zusaetzlich Stammgastdaten und Bella-Card-Informationen sehen.
  - Manager und Inhaber koennen Bella-Card-Rabatte nachvollziehen.
  - Inhaber koennen zusaetzlich Speisekarten und Preise bearbeiten.
  - Nicht erlaubte Funktionen werden gesperrt.

### F023 - Mitarbeiter-Tracking

- **Feature-ID:** F023
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Reservierungen und Bestellungen speichern die verantwortlichen Mitarbeitenden.
- **Akzeptanzkriterien:**
  - Jede Reservierung speichert den erstellenden Mitarbeiter.
  - Jede Bestellung speichert den aufnehmenden Mitarbeiter.
  - Die Zuordnung bleibt fuer spaetere Auswertungen erhalten.
  - Das Tracking kann fuer Trinkgeld-Aufteilung verwendet werden.

### F024 - Offline-Verfuegbarkeit

- **Feature-ID:** F024
- **Phase:** Kern
- **Status:** Todo
- **Anforderung:** Die App bleibt bei Internetausfall fuer den Restaurantbetrieb nutzbar.
- **Akzeptanzkriterien:**
  - Reservierungen, Tischstatus und Bestellungen sind offline einsehbar.
  - Operative Daten koennen offline erfasst werden.
  - Die App zeigt erkennbar an, wenn sie offline arbeitet.
  - Architekturentscheidungen beruecksichtigen Offline-Nutzung.

## Phase: Spaeter

### F025 - Getrennte Zahlung

- **Feature-ID:** F025
- **Phase:** Spaeter
- **Status:** Todo
- **Anforderung:** Eine Tischrechnung kann pro Person oder Teilgruppe aufgeteilt werden.
- **Akzeptanzkriterien:**
  - Bestellpositionen koennen einzelnen Zahlungen zugeordnet werden.
  - Teilzahlungen ergeben zusammen die Gesamtsumme.
  - Bella-Card-Rabatte werden nachvollziehbar beruecksichtigt.
  - Nach vollstaendiger Zahlung ist die Bestellung abgeschlossen.

### F026 - Tageskarte und Saisonangebote

- **Feature-ID:** F026
- **Phase:** Spaeter
- **Status:** Todo
- **Anforderung:** Tages- und Saisonangebote koennen pro Standort in der App gepflegt werden.
- **Akzeptanzkriterien:**
  - Tagesgerichte koennen pro Standort angelegt werden.
  - Tagesgerichte koennen aktiviert und deaktiviert werden.
  - Tagesgerichte enthalten Name, Beschreibung, Preis und Kategorie.
  - Tagesgerichte erscheinen nur am zugeordneten Standort.

### F027 - Catering-Auftraege

- **Feature-ID:** F027
- **Phase:** Spaeter
- **Status:** Todo
- **Anforderung:** Catering-Auftraege koennen getrennt vom Restaurantbetrieb verwaltet werden.
- **Akzeptanzkriterien:**
  - Catering-Auftraege enthalten Kundenname, Datum und Beschreibung.
  - Eine Angebotssumme kann gespeichert werden.
  - Ein Status kann gepflegt werden.
  - Catering-Auftraege sind vom normalen Tischbetrieb getrennt.

### F028 - Feiertagsoeffnungszeiten

- **Feature-ID:** F028
- **Phase:** Spaeter
- **Status:** Todo
- **Anforderung:** Der Inhaber kann Oeffnungszeiten pro Standort und Datum manuell ueberschreiben.
- **Akzeptanzkriterien:**
  - Fuer Standort und Datum kann ein Override gepflegt werden.
  - Overrides ersetzen die Standardoeffnungszeiten.
  - Ohne Override gelten die Standardoeffnungszeiten.
  - Reservierungs- und Bestelllogik beruecksichtigen Overrides.
