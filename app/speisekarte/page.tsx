import { hatBerechtigung, requireBerechtigung } from "@/lib/berechtigungen";
import {
  formatierePreis,
  listGerichte,
} from "@/lib/gerichte";
import {
  GERICHT_KATEGORIEN,
  GERICHT_KATEGORIE_LABELS,
} from "@/lib/gericht-kategorien";
import { requireAktiverStandort } from "@/lib/standort";
import { createGerichtAction, updateGerichtAction } from "./actions";
import { GerichtForm } from "./gericht-form";

export default async function SpeisekartePage() {
  const [mitarbeiter, standort] = await Promise.all([
    requireBerechtigung("speisekarte_sehen", "/speisekarte"),
    requireAktiverStandort("/speisekarte"),
  ]);
  const gerichte = await listGerichte(standort.id);
  const darfPflegen = hatBerechtigung(
    mitarbeiter.rolle,
    "speisekarte_preise_bearbeiten",
  );

  return (
    <main className="admin-page menu-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Phase 3 · BV-006 · BV-015 · BV-033–BV-035</p>
          <h1>Speisekarte</h1>
          <p>Standortkarte für {standort.name}.</p>
        </div>
      </header>

      {darfPflegen ? (
        <section className="panel menu-create-panel">
          <h2>Neues Gericht</h2>
          <GerichtForm
            action={createGerichtAction}
            standortId={standort.id}
            submitLabel="Gericht anlegen"
          />
        </section>
      ) : null}

      {gerichte.length === 0 ? (
        <div className="empty-state menu-empty">
          Für {standort.name} wurden noch keine Gerichte angelegt.
        </div>
      ) : (
        <div className="menu-categories">
          {GERICHT_KATEGORIEN.map((kategorie) => {
            const kategorieGerichte = gerichte.filter(
              (gericht) => gericht.kategorie === kategorie,
            );
            if (kategorieGerichte.length === 0) return null;
            return (
              <section className="menu-category" key={kategorie}>
                <h2>{GERICHT_KATEGORIE_LABELS[kategorie]}</h2>
                <div className="dish-list">
                  {kategorieGerichte.map((gericht) => (
                    <article className="dish-card" key={gericht.id}>
                      <div className="dish-heading">
                        <h3>{gericht.name}</h3>
                        <strong>{formatierePreis(gericht.preisCent)}</strong>
                      </div>
                      <p>{gericht.beschreibung}</p>
                      <div className="dish-badges">
                        {gericht.istTagesgericht ? <span>Tagesgericht</span> : null}
                        {gericht.istSaisongericht ? <span>Saisongericht</span> : null}
                      </div>
                      {darfPflegen ? (
                        <details>
                          <summary>Gericht bearbeiten</summary>
                          <GerichtForm
                            action={updateGerichtAction}
                            standortId={standort.id}
                            gericht={gericht}
                            submitLabel="Änderungen speichern"
                          />
                        </details>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
