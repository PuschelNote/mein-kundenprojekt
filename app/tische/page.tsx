import type { CSSProperties } from "react";
import Link from "next/link";
import { hatBerechtigung, requireBerechtigung } from "@/lib/berechtigungen";
import { formatiereUhrzeit } from "@/lib/reservierungen";
import { requireAktiverStandort } from "@/lib/standort";
import { listTische } from "@/lib/tische";
import { createTischAction, deleteTischAction, updateTischAction, updateTischStatusAction } from "./actions";
import { TischDeleteForm } from "./tisch-delete-form";
import { TischForm } from "./tisch-form";
import { TischStatusForm } from "./tisch-status-form";

type PageProps = { searchParams: Promise<{ tisch?: string }> };

export default async function TischePage({ searchParams }: PageProps) {
  const [{ tisch: ausgewaehlteId }, mitarbeiter, standort] = await Promise.all([
    searchParams,
    requireBerechtigung("tischstatus_sehen", "/tische"),
    requireAktiverStandort("/tische"),
  ]);
  const tische = await listTische(standort.id);
  const ausgewaehlterTisch = tische.find((tisch) => tisch.id === ausgewaehlteId) ?? null;
  const darfStammdatenPflegen = hatBerechtigung(mitarbeiter.rolle, "tischstammdaten_verwalten");
  const spalten = Math.max(4, ...tische.map((tisch) => tisch.rasterSpalte));

  return <main className="admin-page tables-page">
    <header className="page-header"><div><p className="eyebrow">Phase 2 · BV-003 · BV-048</p><h1>Tischübersicht</h1><p>Tisch auswählen und Reservierungen für {standort.name} einsehen.</p></div></header>

    <section className="floor-panel" aria-labelledby="floor-title">
      <div className="section-heading"><div><h2 id="floor-title">Grundriss</h2><p>Nicht maßstabsgetreue Übersicht · Tisch für Details auswählen</p></div><span>{tische.length}</span></div>
      <div className="floor-grid" style={{ "--floor-columns": spalten } as CSSProperties} role="list">
        {tische.map((tisch) => {
          const naechsteReservierung = tisch.reservierungen[0];
          const ausgewaehlt = tisch.id === ausgewaehlterTisch?.id;
          return <Link
            className={`floor-table selectable ${tisch.status} ${tisch.verfuegbar ? "" : "nicht-verfuegbar"} ${ausgewaehlt ? "selected" : ""}`}
            href={`/tische?tisch=${encodeURIComponent(tisch.id)}#tisch-details`}
            key={tisch.id}
            role="listitem"
            style={{ gridRow: tisch.rasterZeile, gridColumn: tisch.rasterSpalte }}
            aria-current={ausgewaehlt ? "true" : undefined}
            aria-label={`Tisch ${tisch.nummer}, ${tisch.status}, ${tisch.kapazitaet} Plätze, ${tisch.reservierungen.length} offene zukünftige Reservierungen`}
          >
            <strong>Tisch {tisch.nummer}</strong>
            <span>{tisch.status}</span>
            <small>{tisch.kapazitaet} Plätze · {tisch.bereich}</small>
            {naechsteReservierung ? <em className="reservation-indicator">{tisch.reservierungen.length} {tisch.reservierungen.length === 1 ? "Reservierung" : "Reservierungen"}<small>Nächste: {formatiereDatum(naechsteReservierung.datum)} · {formatiereUhrzeit(naechsteReservierung.uhrzeitMinute)}</small></em> : <em className="no-reservation">Keine Reservierung</em>}
            {!tisch.verfuegbar ? <em>Nicht verfügbar</em> : null}
          </Link>;
        })}
      </div>
      <div className="floor-legend" aria-label="Statuslegende"><span className="frei">Frei</span><span className="besetzt">Besetzt</span><span className="reserviert">Reserviert</span><span className="reservation-indicator">Reservierung hinterlegt</span><span className="nicht-verfuegbar">Nicht verfügbar</span></div>
    </section>

    <section className={`table-selection-panel ${ausgewaehlterTisch ? "has-selection" : ""}`} id="tisch-details" aria-live="polite">
      {ausgewaehlterTisch ? <>
        <div className="section-heading"><div><p className="eyebrow">Ausgewählter Tisch</p><h2>Tisch {ausgewaehlterTisch.nummer}</h2><p>{ausgewaehlterTisch.kapazitaet} Plätze · {ausgewaehlterTisch.bereich} · Status {ausgewaehlterTisch.status}</p></div><Link href="/tische">Auswahl schließen</Link></div>
        <h3>Offene zukünftige Reservierungen</h3>
        {ausgewaehlterTisch.reservierungen.length > 0 ? <div className="table-reservations">{ausgewaehlterTisch.reservierungen.map((reservierung) => <article key={reservierung.id}><div><strong>{reservierung.gast.name}</strong><span>{reservierung.personenzahl} Personen</span></div><time dateTime={`${reservierung.datum}T${formatiereUhrzeit(reservierung.uhrzeitMinute)}`}>{formatiereDatum(reservierung.datum)} · {formatiereUhrzeit(reservierung.uhrzeitMinute)} Uhr</time></article>)}</div> : <p className="empty-selection">Für diesen Tisch sind keine offenen zukünftigen Reservierungen hinterlegt.</p>}
        <Link className="primary-link" href="/reservierungen">Reservierungen verwalten</Link>
      </> : <div className="empty-selection"><strong>Noch kein Tisch ausgewählt</strong><p>Wähle einen Tisch im Grundriss, um seine Reservierungen und Details zu sehen.</p></div>}
    </section>

    {darfStammdatenPflegen ? <section className="panel table-create-panel"><h2>Neuen Tisch anlegen</h2><TischForm action={createTischAction} submitLabel="Tisch anlegen" /></section> : null}

    <section className="table-list" aria-labelledby="table-list-title">
      <div className="section-heading"><h2 id="table-list-title">Tischliste</h2><span>{tische.length}</span></div>
      {tische.map((tisch) => <article className={`table-card ${tisch.status}`} key={tisch.id}>
        <div className="table-card-summary"><div><h3>Tisch {tisch.nummer}</h3><p>{tisch.kapazitaet} Plätze · {tisch.bereich} · Position {tisch.rasterZeile}/{tisch.rasterSpalte}</p></div><div className="table-badges"><strong>{tisch.status}</strong><span>{tisch.verfuegbar ? "verfügbar" : "nicht verfügbar"}</span>{tisch.reservierungen.length > 0 ? <Link href={`/tische?tisch=${encodeURIComponent(tisch.id)}#tisch-details`}>{tisch.reservierungen.length} {tisch.reservierungen.length === 1 ? "Reservierung" : "Reservierungen"}</Link> : <span>keine Reservierung</span>}{tisch.vorlaeufig ? <span>vorläufig</span> : null}</div></div>
        <TischStatusForm action={updateTischStatusAction} id={tisch.id} status={tisch.status} />
        {darfStammdatenPflegen ? <details><summary>Stammdaten bearbeiten</summary><TischForm action={updateTischAction} submitLabel="Stammdaten speichern" tisch={tisch} /><TischDeleteForm action={deleteTischAction} id={tisch.id} /></details> : null}
      </article>)}
    </section>
  </main>;
}

function formatiereDatum(datum: string) {
  const [jahr, monat, tag] = datum.split("-");
  return `${tag}.${monat}.${jahr}`;
}
