import { requireBerechtigung } from "@/lib/berechtigungen";
import { listBestelloptionen, listBestellungen } from "@/lib/bestellungen";
import { formatierePreis } from "@/lib/gerichte";
import { requireAktiverStandort } from "@/lib/standort";
import { createBestellungAction, updateBestellungAction, updateBestellungStatusAction } from "./actions";
import { BestellungForm } from "./bestellung-form";
import { BestellungStatusForm } from "./status-form";
export default async function BestellungenPage() {
  const [, standort] = await Promise.all([requireBerechtigung("bestellungen_aufnehmen", "/bestellungen"), requireAktiverStandort("/bestellungen")]);
  const [{ tische, gerichte }, bestellungen] = await Promise.all([listBestelloptionen(standort.id), listBestellungen(standort.id)]);
  return <main className="admin-page"><header className="page-header"><div><p className="eyebrow">Phase 4 · BV-007 · BV-036–BV-039</p><h1>Bestellungen</h1><p>Tischbestellungen für {standort.name}.</p></div></header>
    <section className="panel"><h2>Neue Bestellung</h2><p className="panel-hint">Optional kann ein bereits angelegter Gast per Telefonnummer zugeordnet werden.</p><BestellungForm action={createBestellungAction} tische={tische} gerichte={gerichte} /></section>
    <section className="order-list"><div className="section-heading"><h2>Bestellübersicht</h2><span>{bestellungen.length}</span></div>{bestellungen.length === 0 ? <div className="empty-state">Noch keine Bestellungen vorhanden.</div> : bestellungen.map((b) => <article className={`order-card ${b.status}`} key={b.id}><div className="dish-heading"><h3>Tisch {b.tisch.nummer}</h3><span className="reservation-status">{b.status}</span></div><p>{b.gast ? `Gast: ${b.gast.name} · ` : ""}Aufgenommen von {b.aufgenommenVon.name} · {b.erstelltAm.toLocaleString("de-DE")}</p><ul>{b.positionen.map((p) => <li key={p.id}><strong>{p.menge}× {p.gericht.name}</strong> · {formatierePreis(p.einzelpreisCent)}{p.sonderwunsch ? <span> · {p.sonderwunsch}</span> : null}</li>)}</ul>
      {b.status === "offen" ? <details><summary>Positionen bearbeiten</summary><BestellungForm action={updateBestellungAction} tische={tische} gerichte={gerichte} bestellung={{ id: b.id, tischId: b.tischId, positionen: b.positionen.map((p) => ({ gerichtId: p.gerichtId, menge: p.menge, sonderwunsch: p.sonderwunsch ?? "" })) }} /></details> : null}
      {b.status === "offen" || b.status === "serviert" ? <BestellungStatusForm action={updateBestellungStatusAction} id={b.id} status={b.status} /> : null}</article>)}</section>
  </main>;
}
