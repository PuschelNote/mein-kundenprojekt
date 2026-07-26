# SPEC.md – Bella Vista Restaurant-App

## Kontext

Bella Vista ist ein italienisches Restaurant mit zwei Standorten in Berlin:
- **Kreuzberg** (Hauptstandort, größer)
- **Spandau** (seit 2018, kleiner, ruhiger)

Beide Standorte laufen aktuell komplett auf Papier: Zettel, Notizbücher, Taschenrechner. Die App soll das ersetzen.

---

## Entitäten

### Standort
- Standort-ID, Name (Kreuzberg / Spandau)
- Öffnungszeiten (pro Standort unterschiedlich)
  - Kreuzberg: Di–So, 17–23 Uhr
  - Spandau: Do–So, 17–22 Uhr
- Küchenschluss = 30 Minuten vor Restaurantschluss (hart codieren!)
- Tische (nummeriert, pro Standort getrennt – Tisch 4 Kreuzberg ≠ Tisch 4 Spandau)

### Tisch
- Tisch-ID, Nummer, Standort
- Kapazität (Personenzahl)
- Status: `frei` | `besetzt` | `reserviert`
- Bereich: `innen`| `terrasse` (nur im Sommerverfügbar)

**Bekannte Größenordnung:**
- Kreuzberg: ca. 15–18 Tische, ca. 80 Plätze (Zweiertische am Fenster, Vier- und Sechsertische in der Mitte, Terrasse im Sommer)
- Spandau: ca. 10–12 Tische, ca. 50 Plätze (2 Außentische bei gutem Wetter)
- Exakte Liste folgt noch vom Inhaber – Platzhalter
- Kein exakter Grundriss vorhanden → schematische Grundrissübersicht mit fester
  Tischanordnung und deutlich sichtbarem Status; keine maßstabsgetreue Raumplanung.
  Eine ergänzende Liste bleibt für Details, Bedienbarkeit und Stammdatenpflege erhalten.
- Tische im Grundriss sind auswählbar. Offene Reservierungen ab dem aktuellen Tag
  werden am jeweiligen Tisch sichtbar; die Auswahl zeigt Gast, Termin und
  Personenzahl, ohne den manuell geführten Tischstatus automatisch zu verändern.

### Speisekarte
- Pro Standort eigene Karte (Standort-ID)
- Gericht: Name, Beschreibung, Preis, Kategorie (Antipasti / Pasta / Risotto / Dessert / Getränke / Grill)
- **Wichtig:** Spandau hat keinen Grill (kein Bistecca, kein Salsiccia, kein Mixed-Grill) – bauliche Einschränkung, keine Abzugsanlage
- Tageskarte und Saisonales: ja/nein, wechselnde Gerichte, manuell änderbar, pro Standort
- Für den lokalen Start werden kleine typische Beispielkarten mit plausiblen
  Europreisen bereitgestellt. Sie bleiben pro Standort getrennt und dürfen durch
  erneutes Seeden keine späteren Änderungen des Inhabers überschreiben.

### Gast
- Gast-ID, Name, Telefonnummer (Erkennungsmerkmal!)
- Besuchszähler
- Notizen (z.B. "kein Knoblauch", "sitzt lieber draußen", Allergien)
- Bella-Card-Status (aktiv ab 10 Besuchen)

### Bella-Card (Treueprogramm)
- Aktuell: Stempelkarte aus Papier → wird oft verloren
- Logik: nach 10 Besuchen → 15% Rabatt auf alles
- Erkennung über Telefonnummer bei Reservierung
- Rabatt wird automatisch bei Abrechnung abgezogen

### Reservierung
- Reservierungs-ID, Standort-ID, Tisch-ID, 
- Datum, Uhrzeit, Personenzahl
- Gast (verknüpft über Telefonnummer)
- Erstellt von (welcher Mitarbeiter), erstellt-am, geändert-am
- Status: `offen` | `storniert`
- nur durch Mitarbeiter durchführbar, keine eigenständige Reservierung durch Gäste möglich

### Bestellung
- Bestell-ID, Tisch-ID, Standort-ID, Gast-ID
- Positionen: Gericht + Menge
- Aufgenommen von (welcher Mitarbeiter) → wichtig für Trinkgeld-Aufteilung!
- Status: `offen` | `serviert` | `bezahlt` | `storniert`
- Gesamtsumme (inkl. automatischem Bella-Card-Rabatt falls zutreffend)
- Bei erfolgreicher Aufnahme einer neuen Bestellung wird der zugehörige Tisch
  atomar auf `besetzt` gesetzt. Bezahlen und Stornieren ändern den Tischstatus
  vorerst nicht automatisch.

### Bestellposition *(Verbindungsentität Bestellung ↔ Gericht)*
- Bestell-ID, Gericht-ID
- Menge
- Sonderwunsch (z.B. "ohne Knoblauch")
- Einzelpreis zum Zeitpunkt der Bestellung (Preis kann sich ändern)

### Mitarbeiter
- Mitarbeiter-ID, Name, optionale Standort-ID, Rolle
- Rolle: `bedienung`| `manager`| `inhaber`
- Manager sind fest einem Standort zugeordnet. Bedienungen dürfen ohne feste
  Standortzuordnung geführt werden, wenn ihr Einsatzort noch nicht bekannt ist;
  jeder betriebliche Vorgang verwendet trotzdem zwingend den explizit aktiven
  Standort.

### Catering-Auftrag (optional ?)
- Kundenname (z.B. "TechCorp"), Datum, Beschreibung, Angebotssumme, Status

---

## Beziehungen

| Beziehung | Kardinalität | Erklärung |
|---|---|---|
| Standort **hat** Tische | (1,1) — (1,n) | Jeder Tisch gehört zu genau einem Standort. Ein Standort hat mindestens einen Tisch. |
| Standort **bietet an** Gericht | (1,1) — (1,n) | Jedes Gericht gehört zu genau einem Standort. Ein Standort hat mehrere Gerichte. |
| Gast **macht** Reservierung | (0,1) — (0,n) | Ein Gast kann viele Reservierungen machen. Eine Reservierung gehört zu genau einem Gast. |
| Reservierung **belegt** Tisch | (1,1) — (0,n) | Eine Reservierung belegt genau einen Tisch. Ein Tisch kann viele Reservierungen haben (zu verschiedenen Zeiten). |
| Mitarbeiter **erstellt** Reservierung | (1,1) — (0,n) | Jede Reservierung wird von genau einem Mitarbeiter erstellt. Ein Mitarbeiter kann viele Reservierungen erstellen. |
| Tisch **hat** Bestellung | (0,1) — (0,1) | Ein Tisch hat maximal eine aktive Bestellung gleichzeitig. |
| Mitarbeiter **nimmt auf** Bestellung | (1,1) — (0,n) | Jede Bestellung wird von genau einem Mitarbeiter aufgenommen. |
| Bestellung **enthält** Gericht *(n:m)* | (1,n) — (1,n) | Eine Bestellung enthält mehrere Gerichte. Ein Gericht steht auf vielen Bestellungen. → Verbindungsentität: **Bestellposition** (Attribute: Menge, Sonderwunsch, Einzelpreis) |

---

## Rollen & Berechtigungen

| Funktion | Bedienung | Manager | Inhaber (Marco) |
|---|---|---|---|
| Reservierungen eintragen/ändern | x | x | x |
| Bestellungen aufnehmen | x | x | x |
| Tischstatus sehen | x | x | x |
| Stammgast-Daten/Bella-Card sehen | - | x | x |
| Bella-Card-Rabatt vergeben | - | x | x |
| Speisekarte bearbeiten / Preise ändern | - | - | x |

**Manager pro Standort:**
- Kreuzberg: Giuseppe
- Spandau: Renate

**Standortoffene Bedienungen:**
- Sofia
- Nico
- Fatima

> Hintergrund: Einmal wurde ein Preis in der Excel-Tabelle versehentlich überschrieben – wurde erst Wochen später bemerkt. Deshalb sind Preisänderungen dem Inhaber vorbehalten.

---

## Geschäftsregeln

1. Wenn eine Reservierung erstellt wird, dann ist die Angabe des Standorts Pflicht – keine Reservierung ohne explizite Standortwahl.
2. Wenn die aktuelle Uhrzeit weniger als 30 Minuten vor Restaurantschluss liegt, dann ist keine neue Bestellung mehr möglich.
3. Wenn ein Gast einen Besuch abschließt (Bestellung = bezahlt), dann wird sein Besuchszähler automatisch um 1 erhöht.
4. Wenn der Besuchszähler eines Gastes 10 oder mehr beträgt, dann wird bei der Abrechnung automatisch 15% Rabatt auf die Gesamtsumme angewendet.
5. Wenn ein Mitarbeiter die Rolle "Bedienung" hat, dann darf er keine Preise oder Speisekarte bearbeiten.
6. Wenn ein Gericht der Kategorie "Grill" zugewiesen ist, dann darf es nur für Standort Kreuzberg angezeigt und bestellt werden.
7. Wenn eine Reservierung geändert wird, dann wird Zeitstempel und Mitarbeiter-ID automatisch geloggt.
8. Wenn eine Bestellung den Status "serviert" hat, dann gilt sie noch nicht als abgeschlossen – erst Status "bezahlt" schließt sie ab.
9. App muss auch Offline verfügbar sein, sodass das System bei Internetausfall nicht zusammenbricht

**Präzisierung zur Abrechnung:** Für die Rabattprüfung zählen die bereits vor der
Abrechnung abgeschlossenen Besuche. Der zehnte bezahlte Besuch aktiviert die
Bella-Card daher für die folgende Rechnung. Geldbeträge werden in Cent berechnet;
der Rabatt wird kaufmännisch auf einen vollen Cent gerundet. Beim Bezahlen werden
Ausgangssumme, Rabatt und Endsumme dauerhaft an der Bestellung historisiert.

---

## Prioritäten (wichtig vs. später)

### v1-v2 – muss rein
- Reservierungsverwaltung (beide Standorte, getrennt)
- Tischstatus-Übersicht pro Standort (frei / besetzt / reserviert)
- Digitale Bestellaufnahme → direkt in die Küche
- Speisekartenverwaltung (pro Standort separat)
- Gastprofil mit Telefonnummer + Besuchszähler + Notizfeld
- Bella-Card-Logik (automatischer Rabatt)
- Einfache Abrechnung pro Tisch (Gesamtsumme)
- Mitarbeiter-Tracking bei Reservierungen und Bestellungen
- Rollenbasierte Zugriffskontrolle (Bedienung / Manager / Inhaber)

### Später
- Getrennte Zahlung pro Person am Tisch
- Tageskarten-Verwaltung direkt in der App
- Catering-Auftragsverwaltung
- Öffnungszeiten flexibel für Feiertage anpassen

---

## Widersprüche & offene Punkte

**Widerspruch 2: Öffnungszeiten an Feiertagen**
Der Inhaber sagte, die App soll die Öffnungszeiten kennen (für Reservierungslogik). Gleichzeitig: "An Feiertagen variiert das, das würde ich nicht fest einbauen wollen."
→ **Auflösung:** Die Standardöffnungszeiten sind fest hinterlegt. Für Feiertage gibt es ein manuelles Override-Feld pro Standort und Datum, das der Inhaber selbst setzen kann. Wenn kein Override gesetzt ist, gelten die Standardzeiten.

**Widerspruch 2: "Alles auf Papier" – aber Excel für Preise**
Der Inhaber Marco beschreibt den Betrieb durchgehend als Zettelwirtschaft: Zettel, Notizbuch, kein System. Gleichzeitig erwähnt er, dass jemand "einen Preis in der Excel-Tabelle überschrieben" hat – es gibt also doch ein digitales Werkzeug, zumindest für die Speisekarte/Preise.
→ **Auflösung:** Die App ersetzt diese Excel vollständig – Preise und Gerichte werden ausschließlich dort gepflegt, mit Zugriff nur für den Inhaber.

---

## Anekdoten

> Diese Geschichten zeigen warum bestimmte Features so gebaut werden müssen wie sie sind.

**Doppelbuchung Kreuzberg/Spandau:**
Stammgast "Herr Kellner" reservierte für 8 Personen freitagabends. Mitarbeiterin Sofia notierte keinen Standort. Gast dachte Kreuzberg, Sofia dachte Spandau. Die 8 Personen standen abends in Kreuzberg – kein Tisch frei, in Spandau stand ein leerer reservierter Tisch. Inhaber musste selbst rausgehen und erklären.
→ **Konsequenz:** Standort ist Pflichtfeld bei jeder Reservierung. Keine Reservierung ohne explizite Standortwahl.

**Bistecca in Spandau:**
Eine Gruppe reservierte in Spandau und fragte beim Telefonat explizit nach der Bistecca. Bedienung sagte "ja, ja" ohne nachzuprüfen. Abends: Gericht gibt's in Spandau nicht.
→ **Konsequenz:** Speisekarte ist pro Standort gesperrt. Grillgerichte dürfen in Spandau nicht bestellbar sein.

**Stammgast Herr Bergmann:**
Kommt fast jede Woche. Will immer Tisch 7, immer Tagliatelle al ragù. Inhaber kennt ihn, neues Personal nicht.
→ **Konsequenz:** Gastprofil mit Notizfeld und Stammgast-Erkennung über Telefonnummer. Jeder Mitarbeiter sieht die Vorlieben.

**Preis-Versehen in Excel:**
Jemand hat versehentlich einen Preis in der gemeinsamen Excel-Tabelle überschrieben. Wurde erst Wochen später bemerkt.
→ **Konsequenz:** Preisänderungen nur für Inhaber (und explizit berechtigte Personen). Keine freie Bearbeitung durch Bedienung.

**Bella-Card aus Papier:**
Karten gehen verloren, Gäste vergessen sie, Personal erkennt Stammgäste nicht wenn Inhaber nicht da ist. Rabatte gehen dadurch verloren.
→ **Konsequenz:** Bella-Card ist digital, verknüpft mit Telefonnummer. Kein physischer Nachweis nötig.

**Trinkgeld-Aufteilung:**
Am Ende des Abends wird Trinkgeld unter dem Servicepersonal aufgeteilt. Dafür muss nachvollziehbar sein, wer welche Bestellung aufgenommen hat.
→ **Konsequenz:** Bestellung speichert immer den aufnehmenden Mitarbeiter.
