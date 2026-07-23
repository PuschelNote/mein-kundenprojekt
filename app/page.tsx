import Link from "next/link";
import { OpeningHours } from "@/components/opening-hours";
import { getStandardOeffnungszeiten } from "@/lib/oeffnungszeiten";
import { requireAktiverStandort } from "@/lib/standort";

export default async function Home() {
  const standort = await requireAktiverStandort("/");
  const oeffnungszeiten = await getStandardOeffnungszeiten(standort.id);

  return (
    <main className="home-page">
      <div className="home-intro">
        <p className="eyebrow">Bella Vista Berlin</p>
        <h1>Restaurantverwaltung</h1>
        <p>
          Aktiver Standort: <strong>{standort.name}</strong>. Mitarbeiter, Gäste
          und betriebliche Vorgänge werden diesem Kontext eindeutig zugeordnet.
        </p>
        <Link className="primary-link" href="/mitarbeiter">
          Mitarbeiter verwalten
        </Link>
      </div>
      <OpeningHours zeiten={oeffnungszeiten} />
    </main>
  );
}
