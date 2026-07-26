import Link from "next/link";
import { logoutMitarbeiterAction } from "@/app/mitarbeiter-waehlen/actions";
import { OpeningHours } from "@/components/opening-hours";
import { hatBerechtigung, requireAktiverMitarbeiter } from "@/lib/berechtigungen";
import { getStandardOeffnungszeiten } from "@/lib/oeffnungszeiten";
import { requireAktiverStandort } from "@/lib/standort";

const rollenLabel = {
  bedienung: "Bedienung",
  manager: "Manager",
  inhaber: "Inhaber",
};

export default async function Home() {
  const standort = await requireAktiverStandort("/");
  const [mitarbeiter, oeffnungszeiten] = await Promise.all([
    requireAktiverMitarbeiter("/"),
    getStandardOeffnungszeiten(standort.id),
  ]);
  const kannGaesteSehen = hatBerechtigung(mitarbeiter.rolle, "gastdaten_sehen");
  const kannMitarbeiterVerwalten = hatBerechtigung(mitarbeiter.rolle, "mitarbeiter_verwalten");

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">{standort.name} · {rollenLabel[mitarbeiter.rolle]}</p>
          <h1>Hallo, {mitarbeiter.name}.</h1>
          <p>Was möchtest du als Nächstes tun?</p>
        </div>
        <div className="dashboard-context" aria-label="Aktiver Arbeitskontext">
          <span>Angemeldet als</span>
          <strong>{mitarbeiter.name}</strong>
          <small>{rollenLabel[mitarbeiter.rolle]} · {standort.name}</small>
          <div className="dashboard-session-actions">
            <Link href="/mitarbeiter-waehlen">Wechseln</Link>
            <form action={logoutMitarbeiterAction}><button type="submit">Abmelden</button></form>
          </div>
        </div>
      </section>

      <section aria-labelledby="hauptaktionen">
        <div className="dashboard-section-heading">
          <div><p className="eyebrow">Schnell starten</p><h2 id="hauptaktionen">Neuen Vorgang beginnen</h2></div>
          <span className="flow-hint">1. Gastanfrage → 2. Vorgang erfassen → 3. Betrieb</span>
        </div>
        <div className="dashboard-primary-actions">
          <Link className="dashboard-action-card reservation-action" href="/reservierungen#neue-reservierung">
            <span className="action-number">01</span>
            <div><strong>Reservierung anlegen</strong><p>Gast, Termin und Tisch für {standort.name} erfassen.</p></div>
            <span className="action-arrow">Weiter →</span>
          </Link>
          <Link className="dashboard-action-card order-action" href="/bestellungen#neue-bestellung">
            <span className="action-number">02</span>
            <div><strong>Bestellung aufnehmen</strong><p>Tisch wählen, Gerichte hinzufügen und an die Küche senden.</p></div>
            <span className="action-arrow">Weiter →</span>
          </Link>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Weitere Arbeitsbereiche">
        <div className="dashboard-work-panel">
          <div className="dashboard-section-heading"><div><p className="eyebrow">Im Betrieb</p><h2>Weiterarbeiten</h2></div></div>
          <div className="dashboard-quick-links">
            <Link href="/tische"><span>Tische</span><small>Status und Grundriss</small></Link>
            <Link href="/kueche"><span>Küche</span><small>Offene Bons</small></Link>
            <Link href="/reservierungen"><span>Reservierungen</span><small>Termine verwalten</small></Link>
            <Link href="/bestellungen"><span>Bestellungen</span><small>Abrechnung und Status</small></Link>
            <Link href="/speisekarte"><span>Speisekarte</span><small>Gerichte ansehen</small></Link>
          </div>

          {kannGaesteSehen || kannMitarbeiterVerwalten ? <>
            <div className="dashboard-section-heading dashboard-admin-heading"><div><p className="eyebrow">Verwaltung</p><h2>Stammdaten</h2></div></div>
            <div className="dashboard-quick-links admin-links">
              {kannGaesteSehen ? <Link href="/gaeste"><span>Gäste</span><small>Profile und Bella-Card</small></Link> : null}
              {kannMitarbeiterVerwalten ? <Link href="/mitarbeiter"><span>Mitarbeiter</span><small>Rollen und Zugänge</small></Link> : null}
            </div>
          </> : null}
        </div>

        <aside className="dashboard-hours">
          <p className="eyebrow">Betriebszeiten</p>
          <OpeningHours zeiten={oeffnungszeiten} />
          <Link className="dashboard-location-link" href="/standort">Standort wechseln →</Link>
        </aside>
      </section>
    </main>
  );
}
