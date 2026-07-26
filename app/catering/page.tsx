import Link from "next/link";
import { createCateringAction, updateCateringAction } from "./actions";
import { requireBerechtigung } from "@/lib/berechtigungen";
import { CATERING_STATUS, listCateringAuftraege } from "@/lib/catering";
import { formatierePreis } from "@/lib/gerichte";
import { requireAktiverStandort } from "@/lib/standort";

const labels = { angefragt: "Angefragt", angebot: "Angebot erstellt", bestaetigt: "Bestätigt", abgeschlossen: "Abgeschlossen", storniert: "Storniert" } as const;

function Felder({ auftrag }: { auftrag?: { id: string; kundenname: string; datum: string; beschreibung: string; angebotssummeCent: number; status: keyof typeof labels } }) {
  return <>
    {auftrag ? <input type="hidden" name="id" value={auftrag.id} /> : null}
    <label>Kundenname<input name="kundenname" required minLength={2} maxLength={120} defaultValue={auftrag?.kundenname} /></label>
    <label>Datum<input type="date" name="datum" required defaultValue={auftrag?.datum} /></label>
    <label>Angebotssumme in Euro<input name="angebotssumme" inputMode="decimal" required defaultValue={auftrag ? (auftrag.angebotssummeCent / 100).toFixed(2).replace(".", ",") : ""} placeholder="1250,00" /></label>
    <label>Status<select name="status" defaultValue={auftrag?.status ?? "angefragt"}>{CATERING_STATUS.map((status) => <option key={status} value={status}>{labels[status]}</option>)}</select></label>
    <label className="full-width">Beschreibung<textarea name="beschreibung" required minLength={2} maxLength={2000} rows={4} defaultValue={auftrag?.beschreibung} /></label>
  </>;
}

export default async function CateringPage({ searchParams }: { searchParams: Promise<{ gespeichert?: string }> }) {
  const [standort] = await Promise.all([requireAktiverStandort("/catering"), requireBerechtigung("catering_verwalten", "/catering")]);
  const [auftraege, params] = await Promise.all([listCateringAuftraege(standort.id), searchParams]);
  return <main className="admin-page">
    <header className="page-header"><div><p className="eyebrow">{standort.name}</p><h1>Catering-Aufträge</h1><p>Anfragen, Angebote und bestätigte Veranstaltungen übersichtlich verwalten.</p></div><Link href="/">Zur Startseite</Link></header>
    {params.gespeichert ? <p className="success-message" role="status">Der Catering-Auftrag wurde gespeichert.</p> : null}
    <section className="panel" id="neuer-catering-auftrag"><h2>Neuen Auftrag anlegen</h2><form action={createCateringAction} className="admin-form"><Felder /><button type="submit">Auftrag speichern</button></form></section>
    <section className="employee-list"><div className="section-heading"><h2>Aufträge</h2><span>{auftraege.length}</span></div>
      {auftraege.length === 0 ? <div className="empty-state">Für diesen Standort sind noch keine Catering-Aufträge erfasst.</div> : auftraege.map((auftrag) => <article className="employee-card" key={auftrag.id}>
        <div><h3>{auftrag.kundenname}</h3><p>{auftrag.datum.split("-").reverse().join(".")} · {formatierePreis(auftrag.angebotssummeCent)} · {labels[auftrag.status]}</p><p>{auftrag.beschreibung}</p><small>Zuletzt bearbeitet von {auftrag.bearbeitetVon.name}</small></div>
        <details><summary>Bearbeiten</summary><form action={updateCateringAction} className="admin-form"><Felder auftrag={auftrag} /><button type="submit">Änderungen speichern</button></form></details>
      </article>)}
    </section>
  </main>;
}
