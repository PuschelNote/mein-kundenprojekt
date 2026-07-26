import { requireBerechtigung } from "@/lib/berechtigungen";
import { berlinDatumUndMinute } from "@/lib/reservierungen";
import { formatiereMinute, listFeiertagsOeffnungszeiten } from "@/lib/oeffnungszeiten";
import { listStandorte } from "@/lib/mitarbeiter";
import { deleteFeiertagsOeffnungszeitAction, saveFeiertagsOeffnungszeitAction } from "./actions";
import { FeiertagsForm } from "./feiertags-form";
import { FeiertagDeleteForm } from "./delete-form";

export default async function OeffnungszeitenPage() {
  await requireBerechtigung("oeffnungszeiten_verwalten", "/oeffnungszeiten");
  const [standorte, eintraege] = await Promise.all([listStandorte(), listFeiertagsOeffnungszeiten(berlinDatumUndMinute(new Date()).datum)]);
  return <main className="admin-page"><header className="page-header"><div><p className="eyebrow">BV-016 · Inhaberverwaltung</p><h1>Feiertagsöffnungen</h1><p>Abweichende Öffnungszeiten oder Schließtage je Standort festlegen. Ohne Eintrag gelten automatisch die Standardzeiten.</p></div></header>
    <section className="panel"><h2>Override anlegen oder ersetzen</h2><p className="panel-hint">Ein erneutes Speichern für Standort und Datum ersetzt den vorhandenen Eintrag.</p><FeiertagsForm action={saveFeiertagsOeffnungszeitAction} standorte={standorte} /></section>
    <section className="holiday-list"><div className="section-heading"><h2>Kommende Overrides</h2><span>{eintraege.length}</span></div>{eintraege.length === 0 ? <div className="empty-state">Keine kommenden Feiertagsabweichungen hinterlegt.</div> : eintraege.map((e) => <article className="holiday-card" key={e.id}><div><strong>{e.standort.name}</strong><time dateTime={e.datum}>{e.datum.split("-").reverse().join(".")}</time></div><p>{e.geschlossen ? "Geschlossen" : `${formatiereMinute(e.oeffnetMinute!)}–${formatiereMinute(e.schliesstMinute!)} Uhr`}</p><FeiertagDeleteForm action={deleteFeiertagsOeffnungszeitAction} id={e.id} /></article>)}</section>
  </main>;
}
