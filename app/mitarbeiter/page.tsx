import Link from "next/link";
import { listMitarbeiter, listStandorte } from "@/lib/mitarbeiter";
import { requireAktiverStandort } from "@/lib/standort";
import {
  createMitarbeiterAction,
  deleteMitarbeiterAction,
  updateMitarbeiterAction,
} from "./actions";
import { MitarbeiterForm } from "./mitarbeiter-form";

const rollenLabel = {
  bedienung: "Bedienung",
  manager: "Manager",
  inhaber: "Inhaber",
};

export default async function MitarbeiterPage() {
  const [mitarbeiter, standorte, aktiverStandort] = await Promise.all([
    listMitarbeiter(),
    listStandorte(),
    requireAktiverStandort("/mitarbeiter"),
  ]);

  return (
    <main className="admin-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Phase 0 · BV-001</p>
          <h1>Mitarbeiter</h1>
          <p>
            Teammitglieder zentral verwalten. Aktiver Standort: {" "}
            <strong>{aktiverStandort.name}</strong>.
          </p>
        </div>
        <Link href="/">Zur Startseite</Link>
      </header>

      <section className="panel">
        <h2>Neuen Mitarbeiter anlegen</h2>
        <MitarbeiterForm
          action={createMitarbeiterAction}
          standorte={standorte}
          submitLabel="Mitarbeiter anlegen"
          defaultStandortId={aktiverStandort.id}
        />
      </section>

      <section className="employee-list" aria-labelledby="employee-list-title">
        <div className="section-heading">
          <h2 id="employee-list-title">Mitarbeiterliste</h2>
          <span>{mitarbeiter.length}</span>
        </div>

        {mitarbeiter.length === 0 ? (
          <div className="empty-state">
            Noch keine Mitarbeiter vorhanden. Lege oben den ersten Eintrag an.
          </div>
        ) : (
          mitarbeiter.map((person) => (
            <article className="employee-card" key={person.id}>
              <div>
                <h3>{person.name}</h3>
                <p>
                  {person.standort.name} · {rollenLabel[person.rolle]}
                </p>
              </div>

              <details>
                <summary>Bearbeiten</summary>
                <MitarbeiterForm
                  action={updateMitarbeiterAction}
                  standorte={standorte}
                  submitLabel="Änderungen speichern"
                  mitarbeiter={person}
                />
              </details>

              <form action={deleteMitarbeiterAction}>
                <input type="hidden" name="id" value={person.id} />
                <button className="danger-button" type="submit">
                  Löschen
                </button>
              </form>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
