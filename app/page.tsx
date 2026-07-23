import Link from "next/link";
import { requireAktiverStandort } from "@/lib/standort";

export default async function Home() {
  const standort = await requireAktiverStandort("/");

  return (
    <main>
      <p className="eyebrow">Bella Vista Berlin</p>
      <h1>Restaurantverwaltung</h1>
      <p>
        Aktiver Standort: <strong>{standort.name}</strong>. Mitarbeiter, Gäste
        und betriebliche Vorgänge werden diesem Kontext eindeutig zugeordnet.
      </p>
      <Link className="primary-link" href="/mitarbeiter">
        Mitarbeiter verwalten
      </Link>
    </main>
  );
}
