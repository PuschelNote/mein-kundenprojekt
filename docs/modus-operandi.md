# Modus Operandi - Bella Vista SOLO-Projekt

Stand: 2026-06-26

Dieses Projekt folgt einer projektspezifischen SOLO-Variante der Methodik aus
`github.com/jacekzawisza/modus-operandi`.

## Prinzip

Markdown im Git-Repo ist die Single Source of Truth. Neue Produkt-,
Architektur- und Prozessentscheidungen werden in den passenden Artefakten
dokumentiert, damit Menschen und Coding-Agenten denselben Kontext lesen.

## Artefakte

| Artefakt | Zweck | Pflege |
|----------|-------|--------|
| `CLAUDE.md` | Einstiegskontext fuer AI-Coding-Sessions | Bei neuen Konventionen oder Strukturwechsel |
| `AGENTS.md` | Agentenregeln fuer dieses Repo | Bei Prozess- oder Projektregel-Aenderungen |
| `docs/SPEC_Marco Ferretti Bella Vista.md` | Was und warum gebaut wird; fachliche Rohspezifikation | Nur bei neuen fachlichen Erkenntnissen |
| `docs/backlog.md` | Feature-Registry mit stabilen IDs, Phase und Status | Bei Feature- oder Statusaenderungen |
| `docs/architecture.md` | Technische Struktur, Datenmodell, Tests | Bei Architektur- oder Strukturentscheidungen |
| `docs/decisions.md` | ADR-Log fuer Entscheidungen | Bei relevanten Produkt-/Architekturentscheidungen |
| `docs/concepts/` | Konzepte vor komplexen Features | Nach Bedarf vor Implementierung |
| `docs/audit/` | Codebase- und Security-Audits | Regelmaessig oder vor groesseren Releases |

Keine `docs/INBOX.md` im Default: Als SOLO-Projekt ohne parallele
Doc-Worktrees ist sie nicht noetig. Bei paralleler Arbeit auf mehreren
Maschinen kann sie spaeter eingefuehrt werden.

## Projekt-Lebenszyklus

```text
SPEC_Marco Ferretti Bella Vista.md
  -> architecture.md
  -> backlog.md
  -> docs/concepts/[feature].md
  -> Implementation + Tests
  -> decisions.md
```

## Session-Workflow

1. Kontext laden: `CLAUDE.md`, `docs/SPEC_Marco Ferretti Bella Vista.md`, `docs/backlog.md`,
   `docs/architecture.md`, `docs/decisions.md` und relevante Dateien.
2. Aufgabe auf Feature-ID oder klare neue Anforderung beziehen.
3. Bei groesseren Aenderungen Plan mit betroffenen Dateien und Risiken
   erstellen.
4. Implementieren, dabei nur notwendige Dateien anfassen.
5. Tests oder passende Pruefschritte ausfuehren.
6. Doku synchronisieren: Backlog-Status, ADRs, Architecture oder Concepts nach Bedarf.
7. Commit als Conventional Commit vorbereiten, idealerweise mit Feature-ID.

## Backlog-Konvention

- ID-Schema: `FNNN`, z. B. `F006`.
- IDs bleiben stabil und werden nicht umnummeriert.
- Statuswerte bleiben `Todo`, `In Progress`, `Done`.
- Phasen bleiben `Kern` und `Spaeter`, bis eine neue Phase bewusst in
  Spezifikation und `docs/backlog.md` eingefuehrt wird.
- Commits und Konzepte referenzieren die Feature-ID.

## Entscheidungsregeln

Eine neue ADR in `docs/decisions.md` ist erforderlich bei:

- Stack-Wechsel oder neuer Infrastruktur.
- Aenderung von Datenmodell, Rollen, Berechtigungen oder Offline-Strategie.
- Abweichung von Spezifikation oder Backlog.
- Verwerfen eines Features.
- Security- oder Datenschutzentscheidung.

## Audit-Rhythmus

- Nach groesseren Feature-Bloecken: Codebase-Audit in `docs/audit/`.
- Vor Deployment oder Demo: Security- und Datenvalidierungscheck.
- Audit-Funde werden als Backlog-Features oder konkrete Aufgaben dokumentiert.
