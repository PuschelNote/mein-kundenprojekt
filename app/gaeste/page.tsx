import { requireBerechtigung } from "@/lib/berechtigungen";
import { istBellaCardAktiv, listGaeste } from "@/lib/gaeste";
import {
  createGastAction,
  deleteGastAction,
  updateGastAction,
} from "./actions";
import { GastForm } from "./gast-form";
import { GastSearch } from "./gast-search";

export default async function GaestePage({ searchParams }: { searchParams: Promise<{ loeschfehler?: string }> }) {
  await requireBerechtigung("gastdaten_sehen", "/gaeste");
  const [gaeste, params] = await Promise.all([listGaeste(), searchParams]);

  return (
    <main className="admin-page">
      <header className="page-header">
        <div>
          <h1>Gäste</h1>
          <p>Gastprofile, Präferenzen, Allergien und Treuestatus verwalten.</p>
        </div>
      </header>

      {params.loeschfehler ? <p className="form-message error" role="alert">Der Gast kann nicht gelöscht werden, solange Reservierungen oder Bestellungen mit ihm verknüpft sind.</p> : null}

      <GastSearch />

      <section className="panel">
        <h2>Neuen Gast anlegen</h2>
        <GastForm action={createGastAction} submitLabel="Gast anlegen" />
      </section>

      <section className="guest-list" aria-labelledby="guest-list-title">
        <div className="section-heading">
          <h2 id="guest-list-title">Gastliste</h2>
          <span>{gaeste.length}</span>
        </div>
        {gaeste.length === 0 ? (
          <div className="empty-state">Noch keine Gäste vorhanden.</div>
        ) : (
          gaeste.map((gast) => (
            <article className="guest-card" key={gast.id}>
              <div className="guest-summary">
                <div>
                  <h3>{gast.name}</h3>
                  <p>{gast.telefon}</p>
                </div>
                <div className="guest-status">
                  <span>{gast.besuchszaehler} Besuche</span>
                  <strong className={istBellaCardAktiv(gast.besuchszaehler) ? "active" : ""}>
                    Bella-Card {istBellaCardAktiv(gast.besuchszaehler) ? "aktiv" : "inaktiv"}
                  </strong>
                </div>
              </div>
              {gast.notizen ? <p className="guest-notes">{gast.notizen}</p> : null}
              <details>
                <summary>Bearbeiten</summary>
                <GastForm
                  action={updateGastAction}
                  submitLabel="Änderungen speichern"
                  gast={gast}
                />
              </details>
              {gast._count.reservierungen === 0 && gast._count.bestellungen === 0 ? <form action={deleteGastAction}>
                <input type="hidden" name="id" value={gast.id} />
                <button className="danger-button" type="submit">
                  Löschen
                </button>
              </form> : <p className="guest-delete-hint">Löschen nicht möglich: {gast._count.reservierungen} Reservierung(en) und {gast._count.bestellungen} Bestellung(en) sind verknüpft.</p>}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
