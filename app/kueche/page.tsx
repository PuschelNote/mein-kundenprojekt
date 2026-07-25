import { requireBerechtigung } from "@/lib/berechtigungen";
import { listBestellungen } from "@/lib/bestellungen";
import { requireAktiverStandort } from "@/lib/standort";
import { updateBestellungStatusAction } from "@/app/bestellungen/actions";
import { BestellungStatusForm } from "@/app/bestellungen/status-form";
import { KuechenRefresh } from "./kuechen-refresh";
export const dynamic = "force-dynamic";
export default async function KuechePage() {
  await requireBerechtigung("kueche_sehen", "/kueche");
  const standort = await requireAktiverStandort("/kueche");
  const bestellungen = await listBestellungen(standort.id, true);
  return <main className="admin-page kitchen-page"><KuechenRefresh /><header className="page-header"><div><p className="eyebrow">Phase 4 · BV-008</p><h1>Küche</h1><p>Offene Bestellungen für {standort.name}. Die Ansicht aktualisiert sich automatisch.</p></div></header><section className="kitchen-grid">{bestellungen.length === 0 ? <div className="empty-state">Keine offenen Küchenbestellungen.</div> : bestellungen.map((b) => <article className="kitchen-ticket" key={b.id}><div className="dish-heading"><h2>Tisch {b.tisch.nummer}</h2><time>{b.erstelltAm.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</time></div><ol>{b.positionen.map((p) => <li key={p.id}><strong>{p.menge}× {p.gericht.name}</strong>{p.sonderwunsch ? <p>{p.sonderwunsch}</p> : null}</li>)}</ol><p>Service: {b.aufgenommenVon.name}</p><BestellungStatusForm action={updateBestellungStatusAction} id={b.id} status="offen" /></article>)}</section></main>;
}
