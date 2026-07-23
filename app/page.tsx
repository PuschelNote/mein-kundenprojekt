import { OpeningHours } from "@/components/opening-hours";
import { getStandardOeffnungszeiten } from "@/lib/oeffnungszeiten";
import { requireAktiverStandort } from "@/lib/standort";
import { requireAktiverMitarbeiter } from "@/lib/berechtigungen";

export default async function Home() {
  const standort = await requireAktiverStandort("/");
  const [oeffnungszeiten, mitarbeiter] = await Promise.all([
    getStandardOeffnungszeiten(standort.id),
    requireAktiverMitarbeiter("/"),
  ]);

  return (
    <main className="home-page">
      <div className="home-intro">
        <p className="eyebrow">Bella Vista Berlin</p>
        <h1>Restaurantverwaltung</h1>
        <p>
          Aktiver Standort: <strong>{standort.name}</strong>. Mitarbeiter, Gäste
          und betriebliche Vorgänge werden diesem Kontext eindeutig zugeordnet.
        </p>
        <p>
          Angemeldet als <strong>{mitarbeiter.name}</strong> ({mitarbeiter.rolle}).
        </p>
      </div>
      <OpeningHours zeiten={oeffnungszeiten} />
    </main>
  );
}
