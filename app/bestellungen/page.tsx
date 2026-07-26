import { requireBerechtigung } from "@/lib/berechtigungen";
import { berechneRechnung, listBestelloptionen, listBestellungen } from "@/lib/bestellungen";
import { istBellaCardAktiv } from "@/lib/gast-status";
import { formatierePreis } from "@/lib/gerichte";
import { requireAktiverStandort } from "@/lib/standort";
import { createBestellungAction, deleteBestellungAction, updateBestellungAction, updateBestellungStatusAction } from "./actions";
import { BestellungForm } from "./bestellung-form";
import { BestellungDeleteForm } from "./delete-form";
import { BestellungStatusForm } from "./status-form";

export default async function BestellungenPage() {
  const [, standort] = await Promise.all([
    requireBerechtigung("bestellungen_aufnehmen", "/bestellungen"),
    requireAktiverStandort("/bestellungen"),
  ]);
  const [{ tische, gerichte, reservierungen }, bestellungen] = await Promise.all([
    listBestelloptionen(standort.id),
    listBestellungen(standort.id),
  ]);

  return <main className="admin-page">
    <header className="page-header"><div><p className="eyebrow">Phase 4–5 · Bestellungen und Abrechnung</p><h1>Bestellungen</h1><p>Tischbestellungen und Abrechnung für {standort.name}.</p></div></header>
    <section className="panel" id="neue-bestellung"><h2>Neue Bestellung</h2><p className="panel-hint">Wähle nach dem Tisch die angekommene Reservierung aus. Gast und Tisch werden dann verbindlich übernommen.</p><BestellungForm action={createBestellungAction} tische={tische} gerichte={gerichte} reservierungen={reservierungen} /></section>
    <section className="order-list">
      <div className="section-heading"><h2>Bestellübersicht</h2><span>{bestellungen.length}</span></div>
      {bestellungen.length === 0 ? <div className="empty-state">Noch keine Bestellungen vorhanden.</div> : bestellungen.map((bestellung) => {
        const vorschau = berechneRechnung(bestellung.positionen, istBellaCardAktiv(bestellung.gast?.besuchszaehler ?? 0));
        const rechnung = bestellung.status === "bezahlt" && bestellung.ausgangssummeCent !== null && bestellung.rabattCent !== null && bestellung.gesamtsummeCent !== null
          ? { ausgangssummeCent: bestellung.ausgangssummeCent, rabattCent: bestellung.rabattCent, gesamtsummeCent: bestellung.gesamtsummeCent }
          : vorschau;
        return <article className={`order-card ${bestellung.status}`} key={bestellung.id}>
          <div className="dish-heading"><h3>Tisch {bestellung.tisch.nummer}</h3><span className="reservation-status">{bestellung.status}</span></div>
          <p>{bestellung.gast ? `Gast: ${bestellung.gast.name} · ` : ""}Aufgenommen von {bestellung.aufgenommenVon.name} · {bestellung.erstelltAm.toLocaleString("de-DE")}</p>
          {bestellung.reservierung ? <p className="panel-hint">Aus Reservierung vom {bestellung.reservierung.datum} um {String(Math.floor(bestellung.reservierung.uhrzeitMinute / 60)).padStart(2, "0")}:{String(bestellung.reservierung.uhrzeitMinute % 60).padStart(2, "0")} Uhr · {bestellung.reservierung.personenzahl} Personen</p> : null}
          <ul>{bestellung.positionen.map((position) => <li key={position.id}><strong>{position.menge}× {position.gericht.name}</strong> · {formatierePreis(position.einzelpreisCent)}{position.sonderwunsch ? <span> · {position.sonderwunsch}</span> : null}</li>)}</ul>
          <dl className="invoice-summary">
            <div><dt>Ausgangssumme</dt><dd>{formatierePreis(rechnung.ausgangssummeCent)}</dd></div>
            {rechnung.rabattCent > 0 ? <div className="invoice-discount"><dt>Bella-Card-Rabatt (15 %)</dt><dd>− {formatierePreis(rechnung.rabattCent)}</dd></div> : null}
            <div className="invoice-total"><dt>{bestellung.status === "bezahlt" ? "Bezahlt" : "Rechnungssumme"}</dt><dd>{formatierePreis(rechnung.gesamtsummeCent)}</dd></div>
          </dl>
          {bestellung.status === "bezahlt" && bestellung.abgerechnetAm ? <p className="panel-hint">Abgerechnet am {bestellung.abgerechnetAm.toLocaleString("de-DE")}</p> : null}
          {bestellung.status === "offen" ? <details><summary>Positionen bearbeiten</summary><BestellungForm action={updateBestellungAction} tische={tische} gerichte={gerichte} bestellung={{ id: bestellung.id, tischId: bestellung.tischId, reservierung: bestellung.reservierung, positionen: bestellung.positionen.map((position) => ({ gerichtId: position.gerichtId, menge: position.menge, sonderwunsch: position.sonderwunsch ?? "" })) }} /></details> : null}
          {bestellung.status === "offen" || bestellung.status === "serviert" ? <BestellungStatusForm action={updateBestellungStatusAction} id={bestellung.id} status={bestellung.status} /> : null}
          {bestellung.status === "storniert" ? <BestellungDeleteForm action={deleteBestellungAction} id={bestellung.id} /> : null}
        </article>;
      })}
    </section>
  </main>;
}
