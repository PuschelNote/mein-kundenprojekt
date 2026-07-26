import { updateBestellungStatusAction } from "@/app/bestellungen/actions";
import { BestellungStatusForm } from "@/app/bestellungen/status-form";
import { requireBerechtigung } from "@/lib/berechtigungen";
import { listBestellungen } from "@/lib/bestellungen";
import { requireAktiverStandort } from "@/lib/standort";
import { AutoRefresh } from "@/components/auto-refresh";

export const dynamic = "force-dynamic";

export default async function KuechePage() {
  await requireBerechtigung("kueche_sehen", "/kueche");
  const standort = await requireAktiverStandort("/kueche");
  const bestellungen = await listBestellungen(standort.id, true);
  return <main className="admin-page kitchen-page">
    <AutoRefresh />
    <header className="page-header"><div><h1>Küche</h1><p>Offene Bestellungen für {standort.name}. Die Ansicht aktualisiert sich automatisch.</p></div></header>
    <section className="kitchen-grid">
      {bestellungen.length === 0 ? <div className="empty-state">Keine offenen Küchenbestellungen.</div> : bestellungen.map((bestellung) => <article className="kitchen-ticket" key={bestellung.id}>
        <div className="dish-heading"><h2>Tisch {bestellung.tisch.nummer}</h2><time>{bestellung.erstelltAm.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</time></div>
        <ol>{bestellung.positionen.map((position) => <li key={position.id}><strong>{position.menge}× {position.gericht.name}</strong>{position.sonderwunsch ? <p>{position.sonderwunsch}</p> : null}</li>)}</ol>
        <p>Service: {bestellung.aufgenommenVon.name}</p>
        <BestellungStatusForm action={updateBestellungStatusAction} id={bestellung.id} status="offen" bereich="kueche" />
      </article>)}
    </section>
  </main>;
}
