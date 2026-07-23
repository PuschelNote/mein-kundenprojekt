import { listStandorte } from "@/lib/mitarbeiter";
import { safeReturnTo } from "@/lib/standort";
import { selectStandortAction } from "./actions";

type StandortPageProps = {
  searchParams: Promise<{
    error?: string;
    returnTo?: string;
  }>;
};

export default async function StandortPage({ searchParams }: StandortPageProps) {
  const [{ error, returnTo }, standorte] = await Promise.all([
    searchParams,
    listStandorte(),
  ]);
  const safeTarget = safeReturnTo(returnTo);

  return (
    <main className="location-page">
      <div className="location-intro">
        <p className="eyebrow">Bella Vista Berlin</p>
        <h1>Standort wählen</h1>
        <p>
          Wähle den Standort ausdrücklich aus. Alle folgenden betrieblichen
          Vorgänge verwenden diesen Kontext.
        </p>
      </div>

      {error ? (
        <p className="form-message error" role="alert">
          Der angeforderte Standort ist ungültig. Bitte erneut auswählen.
        </p>
      ) : null}

      <div className="location-grid">
        {standorte.map((standort) => (
          <form action={selectStandortAction} key={standort.id}>
            <input type="hidden" name="standortId" value={standort.id} />
            <input type="hidden" name="returnTo" value={safeTarget} />
            <button className="location-card" type="submit">
              <span>Restaurant</span>
              <strong>{standort.name}</strong>
              <small>Auswählen →</small>
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
