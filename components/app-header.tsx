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
        {mitarbeiter && hatBerechtigung(mitarbeiter.rolle, "mitarbeiter_verwalten") ? (
          <Link href="/mitarbeiter">Mitarbeiter</Link>
        ) : null}
        {mitarbeiter && hatBerechtigung(mitarbeiter.rolle, "gastdaten_sehen") ? (
          <Link href="/gaeste">Gäste</Link>
        ) : null}
        {mitarbeiter ? (
          <form action={logoutMitarbeiterAction}>
            <button className="staff-session" type="submit">
              <span>{mitarbeiter.rolle}</span>
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
