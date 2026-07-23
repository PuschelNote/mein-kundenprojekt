import { listMitarbeiterFuerStandort } from "@/lib/mitarbeiter";
import { requireAktiverStandort, safeReturnTo } from "@/lib/standort";
import { selectMitarbeiterAction } from "./actions";

type PageProps = {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
};

const rollenLabel = {
  bedienung: "Bedienung",
  manager: "Manager",
  inhaber: "Inhaber",
};

export default async function MitarbeiterWaehlenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const standort = await requireAktiverStandort("/mitarbeiter-waehlen");
  const mitarbeiter = await listMitarbeiterFuerStandort(standort.id);
  const returnTo = safeReturnTo(params.returnTo);

  return (
    <main className="staff-picker-page">
      <div>
        <p className="eyebrow">{standort.name}</p>
        <h1>Wer arbeitet gerade?</h1>
        <p>
          Wähle deinen Mitarbeiterzugang. Diese Auswahl ist im Prototyp noch
          nicht durch eine persönliche PIN geschützt.
        </p>
      </div>

      {params.error ? (
        <p className="form-message error" role="alert">
          Dieser Mitarbeiter gehört nicht zum aktiven Standort.
        </p>
      ) : null}

      <div className="staff-picker-grid">
        {mitarbeiter.map((person) => (
          <form action={selectMitarbeiterAction} key={person.id}>
            <input type="hidden" name="mitarbeiterId" value={person.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <button type="submit">
              <strong>{person.name}</strong>
              <span>{rollenLabel[person.rolle]}</span>
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
