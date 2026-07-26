import Link from "next/link";
import { getAktiverMitarbeiter, hatBerechtigung } from "@/lib/berechtigungen";
import { getAktiverStandort } from "@/lib/standort";
import { logoutMitarbeiterAction } from "@/app/mitarbeiter-waehlen/actions";

export async function AppHeader() {
  const [standort, mitarbeiter] = await Promise.all([
    getAktiverStandort(),
    getAktiverMitarbeiter(),
  ]);

  return (
    <header className="app-header">
      <Link className="brand" href="/">
        Bella Vista
      </Link>
      <nav aria-label="Hauptnavigation">
        {mitarbeiter ? <Link href="/">Dashboard</Link> : null}
        {mitarbeiter && hatBerechtigung(mitarbeiter.rolle, "reservierungen_verwalten") ? (
          <Link className="header-primary-action" href="/reservierungen">Reservierungen</Link>
        ) : null}
        {mitarbeiter && hatBerechtigung(mitarbeiter.rolle, "bestellungen_aufnehmen") ? (
          <Link className="header-primary-action" href="/bestellungen">Bestellungen</Link>
        ) : null}
        {mitarbeiter && hatBerechtigung(mitarbeiter.rolle, "kueche_sehen") ? (
          <Link className="header-secondary" href="/kueche">Küche</Link>
        ) : null}
        {mitarbeiter && hatBerechtigung(mitarbeiter.rolle, "tischstatus_sehen") ? (
          <Link className="header-secondary" href="/tische">Tische</Link>
        ) : null}
        {mitarbeiter ? (
          <form action={logoutMitarbeiterAction}>
            <button className="staff-session" type="submit" title={`${mitarbeiter.name} abmelden`}>
              <span>Abmelden</span>
              <strong>{mitarbeiter.name}</strong>
            </button>
          </form>
        ) : standort ? (
          <Link href="/mitarbeiter-waehlen">Mitarbeiter wählen</Link>
        ) : null}
        <Link className="location-switch" href="/standort">
          <span>Standort</span>
          <strong>{standort?.name ?? "auswählen"}</strong>
        </Link>
      </nav>
    </header>
  );
}
