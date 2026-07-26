"use client";

import { useState } from "react";

const WOCHENTAGE = ["sonntag", "montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag"] as const;
const KOPFZEILE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function istReservierungstagWaehbar(
  datum: string,
  minDatum: string,
  offeneWochentage: readonly string[],
) {
  if (datum < minDatum) return false;
  const index = new Date(`${datum}T12:00:00.000Z`).getUTCDay();
  return offeneWochentage.includes(WOCHENTAGE[index]);
}

function datumString(jahr: number, monat: number, tag: number) {
  return `${jahr}-${String(monat + 1).padStart(2, "0")}-${String(tag).padStart(2, "0")}`;
}

export function ReservierungsKalender({
  offeneWochentage,
  minDatum,
  initialDatum,
}: {
  offeneWochentage: readonly string[];
  minDatum: string;
  initialDatum?: string;
}) {
  const startDatum = initialDatum ?? minDatum;
  const [ausgewaehlt, setAusgewaehlt] = useState(initialDatum ?? "");
  const [sichtbarerMonat, setSichtbarerMonat] = useState(startDatum.slice(0, 7));
  const [jahr, monat] = sichtbarerMonat.split("-").map(Number);
  const tageImMonat = new Date(Date.UTC(jahr, monat, 0)).getUTCDate();
  const ersterWochentag = new Date(Date.UTC(jahr, monat - 1, 1)).getUTCDay();
  const leerfelder = (ersterWochentag + 6) % 7;
  const aktuellerMonat = minDatum.slice(0, 7);

  function verschiebeMonat(delta: number) {
    const ziel = new Date(Date.UTC(jahr, monat - 1 + delta, 1));
    setSichtbarerMonat(`${ziel.getUTCFullYear()}-${String(ziel.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  const monatsname = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(jahr, monat - 1, 1)));

  return (
    <div className="reservation-calendar">
      <input type="hidden" name="datum" value={ausgewaehlt} />
      <div className="calendar-navigation">
        <button type="button" onClick={() => verschiebeMonat(-1)} disabled={sichtbarerMonat <= aktuellerMonat} aria-label="Vorheriger Monat">‹</button>
        <strong aria-live="polite">{monatsname}</strong>
        <button type="button" onClick={() => verschiebeMonat(1)} aria-label="Nächster Monat">›</button>
      </div>
      <div className="calendar-grid" aria-label={`Reservierungsdatum im ${monatsname}`}>
        {KOPFZEILE.map((tag) => <span className="calendar-weekday" key={tag}>{tag}</span>)}
        {Array.from({ length: leerfelder }, (_, index) => <span key={`leer-${index}`} />)}
        {Array.from({ length: tageImMonat }, (_, index) => {
          const tag = index + 1;
          const datum = datumString(jahr, monat - 1, tag);
          const waehbar = istReservierungstagWaehbar(datum, minDatum, offeneWochentage);
          return (
            <button
              type="button"
              key={datum}
              disabled={!waehbar}
              aria-label={new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${datum}T12:00:00.000Z`))}
              aria-pressed={ausgewaehlt === datum}
              className={ausgewaehlt === datum ? "selected" : undefined}
              onClick={() => setAusgewaehlt(datum)}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <small>{ausgewaehlt ? `Ausgewählt: ${ausgewaehlt.split("-").reverse().join(".")}` : "Bitte einen geöffneten Tag auswählen."}</small>
    </div>
  );
}
