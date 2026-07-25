import { requireBerechtigung } from "@/lib/berechtigungen";
import {
  formatiereUhrzeit,
  listReservierungen,
  listTischeFuerReservierung,
} from "@/lib/reservierungen";
import { createReservierungAction } from "./actions";
import { ReservierungForm } from "./reservierung-form";

export default async function ReservierungenPage() {
  const mitarbeiter = await requireBerechtigung(
    "reservierungen_verwalten",
    "/reservierungen",
  );
  const [tische, reservierungen] = await Promise.all([
    listTischeFuerReservierung(mitarbeiter.standortId),
    listReservierungen(mitarbeiter.standortId),
  ]);

  return (
    <main className="admin-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Phase 1 · BV-004</p>
          <h1>Reservierungen</h1>
          <p>Reservierungen für {mitarbeiter.standort.name} anlegen.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Neue Reservierung</h2>
        <p className="panel-hint">
          Bekannte Gäste werden über ihre Telefonnummer zugeordnet. Ist die
          Nummer neu, wird der Gast mit dem eingegebenen Namen zusammen mit der
          Reservierung angelegt.
        </p>
        <ReservierungForm action={createReservierungAction} tische={tische} />
      </section>

      <section className="reservation-list" aria-labelledby="reservation-list-title">
        <div className="section-heading">
          <h2 id="reservation-list-title">Reservierungsliste</h2>
          <span>{reservierungen.length}</span>
        </div>
        {reservierungen.length === 0 ? (
          <div className="empty-state">Noch keine Reservierungen vorhanden.</div>
        ) : (
          reservierungen.map((reservierung) => (
            <article className="reservation-card" key={reservierung.id}>
              <div>
                <h3>{reservierung.gast.name}</h3>
              </div>
              <dl>
                <div><dt>Termin</dt><dd>{reservierung.datum} · {formatiereUhrzeit(reservierung.uhrzeitMinute)} Uhr</dd></div>
                <div><dt>Tisch</dt><dd>{reservierung.tisch.nummer}</dd></div>
                <div><dt>Personen</dt><dd>{reservierung.personenzahl}</dd></div>
                <div><dt>Erfasst von</dt><dd>{reservierung.erstelltVon.name}</dd></div>
              </dl>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
