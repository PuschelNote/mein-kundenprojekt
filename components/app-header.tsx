import Link from "next/link";
import { getAktiverStandort } from "@/lib/standort";

export async function AppHeader() {
  const standort = await getAktiverStandort();

  return (
    <header className="app-header">
      <Link className="brand" href="/">
        Bella Vista
      </Link>
      <nav aria-label="Hauptnavigation">
        {standort ? <Link href="/mitarbeiter">Mitarbeiter</Link> : null}
        <Link className="location-switch" href="/standort">
          <span>Standort</span>
          <strong>{standort?.name ?? "auswählen"}</strong>
        </Link>
      </nav>
    </header>
  );
}
