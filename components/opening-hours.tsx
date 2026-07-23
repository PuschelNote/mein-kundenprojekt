import {
  formatiereMinute,
  sortiereOeffnungszeiten,
  WOCHENTAGE,
  WOCHENTAG_LABEL,
  type Zeitfenster,
} from "@/lib/oeffnungszeiten";

export function OpeningHours({ zeiten }: { zeiten: Zeitfenster[] }) {
  const nachWochentag = new Map(
    sortiereOeffnungszeiten(zeiten).map((zeit) => [zeit.wochentag, zeit]),
  );

  return (
    <section className="opening-hours" aria-labelledby="opening-hours-title">
      <h2 id="opening-hours-title">Standardöffnungszeiten</h2>
      <dl>
        {WOCHENTAGE.map((wochentag) => {
          const zeit = nachWochentag.get(wochentag);
          return (
            <div key={wochentag}>
              <dt>{WOCHENTAG_LABEL[wochentag]}</dt>
              <dd>
                {zeit
                  ? `${formatiereMinute(zeit.oeffnetMinute)}–${formatiereMinute(zeit.schliesstMinute)} Uhr`
                  : "geschlossen"}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
