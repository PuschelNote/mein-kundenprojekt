# Modus Operandi — Bella Vista Restaurant-App

_Projektspezifische Solo-Fassung, Stand: 23.07.2026_

## Leitidee

Das Repository ist das AI-lesbare Betriebssystem des Projekts. Dauerhafter
Kontext steht in versioniertem Markdown neben dem Code. Dokumentation dient der
Orientierung und Nachvollziehbarkeit, nicht der Erzeugung von Prozessaufwand.

## Artefakte

| Artefakt | Zweck | Aktualisierung |
|---|---|---|
| `AGENTS.md` | kurzer Einstieg und verbindliche Arbeitsregeln | bei neuen dauerhaften Konventionen |
| `docs/spec.md` | fachliches Was und Warum; ersetzt `prd.md` | bei bestätigten Scope- oder Regeländerungen |
| `docs/backlog.md` | Features, stabile IDs, Phasen und Status | bei Aufnahme und Statuswechseln |
| `docs/architecture.md` | technische Wahrheit und offene Architekturfragen | bei relevanten technischen Änderungen |
| `docs/decisions.md` | Gründe, Alternativen und Konsequenzen | bei dauerhaften Entscheidungen |
| `docs/concepts/` | Design komplexer Features vor der Umsetzung | nur wenn Vorabklärung echten Nutzen bringt |
| `docs/audit/` | datierte Security- und Codebase-Audits | vor Releases und regelmäßig im Projektverlauf |

Nicht Bestandteil dieses Solo-Setups sind `prd.md`, Team-/Mission-Dokumente,
`INBOX.md`, Meeting-Ordner und Results-Ordner.

## Lebenszyklus eines Features

```text
spec.md → backlog.md → optionales Konzept → Plan → Code + Tests
        → Doku-Sync → Commit → Review/Audit
```

1. **Kontext laden:** `AGENTS.md`, Spec und aufgabenrelevante Dokumente lesen.
2. **Aufgabe schneiden:** Backlog-ID, Scope, Nicht-Ziele und messbare
   Akzeptanzkriterien festhalten.
3. **Planen:** betroffene Dateien, Datenänderungen, Berechtigungen, Offline-Fälle
   und Tests bestimmen. Bei komplexen Features ein Konzept anlegen.
4. **Umsetzen:** kleinste vollständige Lösung bauen, bestehende Muster wahren.
5. **Prüfen:** Tests, Lint/Build und einen realistischen manuellen Ablauf prüfen.
6. **Synchronisieren:** Vor jedem Commit zwingend Entscheidungen in
   `docs/decisions.md` dokumentieren und betroffene Feature-Status in
   `docs/backlog.md` aktualisieren; gegebenenfalls Spec und Architektur nachziehen.
7. **Committen:** Erst nach dem Doku-Sync einen fokussierten Conventional Commit
   mit Feature-ID erstellen, sofern passend.

## Entscheidungsregel

- **Fachliche Änderung:** zuerst gegen `spec.md` prüfen; bestätigte Änderung dort
  und im Backlog nachziehen.
- **Technische Richtungsentscheidung:** Kontext, Entscheidung, Alternativen und
  Konsequenzen in `decisions.md` festhalten.
- **Unklare oder riskante Annahme:** nicht still implementieren; als offene Frage
  dokumentieren und klären.
- **Kleine reversible Detailentscheidung:** direkt umsetzen und durch Tests bzw.
  Code verständlich machen; kein ADR für Trivialitäten.

## Qualitäts- und Sicherheitsrhythmus

- Vor jedem Commit: Entscheidungen und Feature-Status synchronisieren, danach
  Diff, Tests und Secrets prüfen.
- Vor jedem Release: Kernabläufe beider Standorte, Rollenmatrix, Offline-/Online-
  Übergang und Datenmigration prüfen.
- Alle zwei bis vier Wochen bzw. vor größeren Releases: Security-Review; Bericht
  unter `docs/audit/security-YYYY-MM-DD.md`.
- Bei wachsender Codebasis etwa alle zwei Wochen: Codebase-Audit zu Fehlerbehandlung,
  Validierung, totem Code, inkonsistenten Mustern und fehlenden Tests.

## Prinzipien

1. Artefakte statt Gedächtnis.
2. Spec vor Implementierung.
3. Erst Ziel und Prüfung definieren, dann coden.
4. Kleine, nachvollziehbare Änderungen statt großer Umbauten.
5. Ergebnis und funktionierende Abläufe zählen mehr als Aktivität.
6. 80 % ausgeliefert ist besser als 100 % dauerhaft geplant — solange Sicherheit,
   Datenintegrität und Kerngeschäftsregeln nicht geopfert werden.
7. Dokumentation bleibt so knapp wie möglich und so vollständig wie nötig.
