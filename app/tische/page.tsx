import type { CSSProperties } from "react";
import { hatBerechtigung, requireBerechtigung } from "@/lib/berechtigungen";
import { listTische } from "@/lib/tische";
import {
  createTischAction,
  deleteTischAction,
  updateTischAction,
  updateTischStatusAction,
} from "./actions";
import { TischDeleteForm } from "./tisch-delete-form";
import { TischForm } from "./tisch-form";
import { TischStatusForm } from "./tisch-status-form";

export default async function TischePage() {
  const mitarbeiter = await requireBerechtigung("tischstatus_sehen", "/tische");
  const tische = await listTische(mitarbeiter.standortId);
  const darfStammdatenPflegen = hatBerechtigung(
    mitarbeiter.rolle,
    "tischstammdaten_verwalten",
  );
  const spalten = Math.max(4, ...tische.map((tisch) => tisch.rasterSpalte));

  return (
    <main className="admin-page tables-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Phase 2 · BV-003 · BV-028–BV-031</p>
          <h1>Tischübersicht</h1>
          <p>Schematischer Grundriss für {mitarbeiter.standort.name}.</p>
        </div>
      </header>

      <section className="floor-panel" aria-labelledby="floor-title">
        <div className="section-heading">
          <div>
            <h2 id="floor-title">Grundriss</h2>
            <p>Nicht maßstabsgetreue Übersicht</p>
          </div>
          <span>{tische.length}</span>
        </div>
        <div
          className="floor-grid"
          style={{ "--floor-columns": spalten } as CSSProperties}
          role="list"
        >
          {tische.map((tisch) => (
            <article
              className={`floor-table ${tisch.status} ${tisch.verfuegbar ? "" : "nicht-verfuegbar"}`}
              key={tisch.id}
              role="listitem"
              style={{
                gridRow: tisch.rasterZeile,
                gridColumn: tisch.rasterSpalte,
              }}
              aria-label={`Tisch ${tisch.nummer}, ${tisch.status}, ${tisch.kapazitaet} Plätze, ${tisch.bereich}`}
            >
              <strong>Tisch {tisch.nummer}</strong>
              <span>{tisch.status}</span>
              <small>{tisch.kapazitaet} Plätze · {tisch.bereich}</small>
              {!tisch.verfuegbar ? <em>Nicht verfügbar</em> : null}
            </article>
          ))}
        </div>
        <div className="floor-legend" aria-label="Statuslegende">
          <span className="frei">Frei</span>
          <span className="besetzt">Besetzt</span>
          <span className="reserviert">Reserviert</span>
          <span className="nicht-verfuegbar">Nicht verfügbar</span>
        </div>
      </section>

      {darfStammdatenPflegen ? (
        <section className="panel table-create-panel">
          <h2>Neuen Tisch anlegen</h2>
          <TischForm action={createTischAction} submitLabel="Tisch anlegen" />
        </section>
      ) : null}

      <section className="table-list" aria-labelledby="table-list-title">
        <div className="section-heading">
          <h2 id="table-list-title">Tischliste</h2>
          <span>{tische.length}</span>
        </div>
        {tische.map((tisch) => (
          <article className={`table-card ${tisch.status}`} key={tisch.id}>
            <div className="table-card-summary">
              <div>
                <h3>Tisch {tisch.nummer}</h3>
                <p>
                  {tisch.kapazitaet} Plätze · {tisch.bereich} · Position {tisch.rasterZeile}/{tisch.rasterSpalte}
                </p>
              </div>
              <div className="table-badges">
                <strong>{tisch.status}</strong>
                <span>{tisch.verfuegbar ? "verfügbar" : "nicht verfügbar"}</span>
                {tisch.vorlaeufig ? <span>vorläufig</span> : null}
              </div>
            </div>
            <TischStatusForm
              action={updateTischStatusAction}
              id={tisch.id}
              status={tisch.status}
            />
            {darfStammdatenPflegen ? (
              <details>
                <summary>Stammdaten bearbeiten</summary>
                <TischForm
                  action={updateTischAction}
                  submitLabel="Stammdaten speichern"
                  tisch={tisch}
                />
                <TischDeleteForm action={deleteTischAction} id={tisch.id} />
              </details>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
