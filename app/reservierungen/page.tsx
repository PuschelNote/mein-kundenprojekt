import { requireBerechtigung } from "@/lib/berechtigungen";
import {
  formatiereUhrzeit,
  listReservierungen,
  listTischeFuerReservierung,
} from "@/lib/reservierungen";
import {
  createReservierungAction,
  updateReservierungAction,
  updateReservierungStatusAction,
} from "./actions";
import { ReservierungForm } from "./reservierung-form";
import { ReservierungStatusForm } from "./reservierung-status-form";
import { requireAktiverStandort } from "@/lib/standort";

export default async function ReservierungenPage() {
  const [, standort] = await Promise.all([
    requireBerechtigung("reservierungen_verwalten", "/reservierungen"),
    requireAktiverStandort("/reservierungen"),
  ]);
  const [tische, reservierungen] = await Promise.all([
    listTischeFuerReservierung(standort.id),
    listReservierungen(standort.id),
  ]);

  return (
    <main className="admin-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Phase 1 · BV-004</p>
          <h1>Reservierungen</h1>
          <p>Reservierungen für {standort.name} anlegen.</p>
        </div>
      </header>

      <section className="panel" id="neue-reservierung">
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
            <article
              className={`reservation-card ${reservierung.status}`}
              key={reservierung.id}
            >
              <div>
                <h3>{reservierung.gast.name}</h3>
                <span className="reservation-status">{reservierung.status}</span>
              </div>
              <dl>
                <div><dt>Termin</dt><dd>{reservierung.datum} · {formatiereUhrzeit(reservierung.uhrzeitMinute)} Uhr</dd></div>
                <div><dt>Tisch</dt><dd>{reservierung.tisch.nummer}</dd></div>
                <div><dt>Personen</dt><dd>{reservierung.personenzahl}</dd></div>
                <div><dt>Erfasst von</dt><dd>{reservierung.erstelltVon.name}</dd></div>
              </dl>
              <p className="reservation-audit">
                Erstellt {reservierung.erstelltAm.toLocaleString("de-DE")}
                {reservierung.geaendertVon
                  ? ` · zuletzt geändert von ${reservierung.geaendertVon.name} am ${reservierung.geaendertAm.toLocaleString("de-DE")}`
                  : " · noch nicht geändert"}
              </p>
              <details>
                <summary>Bearbeiten</summary>
                <p className="panel-hint">
                  Gastfelder leer lassen, um den zugeordneten Gast beizubehalten.
                </p>
                <ReservierungForm
                  action={updateReservierungAction}
                  tische={tische}
                  submitLabel="Änderungen speichern"
                  reservierung={{
                    id: reservierung.id,
                    tischId: reservierung.tischId,
                    datum: reservierung.datum,
                    uhrzeit: formatiereUhrzeit(reservierung.uhrzeitMinute),
                    personenzahl: reservierung.personenzahl,
                  }}
                />
              </details>
              <ReservierungStatusForm
                action={updateReservierungStatusAction}
                id={reservierung.id}
                status={reservierung.status}
              />
            </article>
          ))
        )}
      </section>
    </main>
  );
}
