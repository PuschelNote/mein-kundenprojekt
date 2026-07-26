"use client";

import { useActionState, useState } from "react";
import type { ReservierungActionState } from "./actions";
import { ReservierungsKalender } from "./reservierungs-kalender";

type TischOption = {
  id: string;
  nummer: number;
  kapazitaet: number;
  bereich: "innen" | "terrasse";
  verfuegbar: boolean;
  vorlaeufig: boolean;
  standortId: string;
};

type StandortOption = { id: string; name: string };

export function ReservierungForm({
  action,
  standorte,
  aktiverStandortId,
  tische,
  oeffnungstage,
  minDatum,
  feiertage,
  reservierung,
  submitLabel = "Reservierung anlegen",
}: {
  action: (
    state: ReservierungActionState,
    formData: FormData,
  ) => Promise<ReservierungActionState>;
  standorte: StandortOption[];
  aktiverStandortId: string;
  tische: TischOption[];
  oeffnungstage: Record<string, string[]>;
  minDatum: string;
  feiertage: Record<string, Record<string, boolean>>;
  reservierung?: {
    id: string;
    standortId: string;
    tischId: string;
    datum: string;
    uhrzeit: string;
    personenzahl: number;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [standortId, setStandortId] = useState(reservierung?.standortId ?? aktiverStandortId);
  const [tischId, setTischId] = useState(reservierung?.tischId ?? "");
  const passendeTische = tische.filter((tisch) => tisch.standortId === standortId);

  return (
    <form action={formAction} className="reservation-form">
      {reservierung ? <input type="hidden" name="id" value={reservierung.id} /> : null}
      {reservierung ? <input type="hidden" name="standortId" value={standortId} /> : null}
      <label>
        Standort
        <select name={reservierung ? undefined : "standortId"} required disabled={Boolean(reservierung)} value={standortId} onChange={(event) => { setStandortId(event.target.value); setTischId(""); }}>
          <option value="" disabled>Standort auswählen</option>
          {standorte.map((standort) => <option key={standort.id} value={standort.id}>{standort.name}</option>)}
        </select>
      </label>
      <label>
        Gastname
        <input
          name="gastName"
          maxLength={100}
          autoComplete="name"
          placeholder={reservierung ? "Nur bei Gastwechsel nötig" : "Nur bei neuen Gästen nötig"}
        />
      </label>
      <label>
        {reservierung ? "Neue Gast-Telefonnummer" : "Gast-Telefonnummer"}
        <input
          name="gastTelefon"
          type="tel"
          required={!reservierung}
          autoComplete="tel"
          placeholder={reservierung ? "Leer lassen, um Gast beizubehalten" : undefined}
        />
      </label>
      <label>
        Tisch
        <select name="tischId" required value={tischId} onChange={(event) => setTischId(event.target.value)}>
          <option value="" disabled>Tisch auswählen</option>
          {passendeTische.map((tisch) => (
            <option
              value={tisch.id}
              key={tisch.id}
              disabled={!tisch.verfuegbar && reservierung?.tischId !== tisch.id}
            >
              Tisch {tisch.nummer} · {tisch.kapazitaet} Plätze · {tisch.bereich}
              {tisch.vorlaeufig ? " · vorläufig" : ""}
              {!tisch.verfuegbar ? " · nicht verfügbar" : ""}
            </option>
          ))}
        </select>
      </label>
      <label>
        Datum
        <ReservierungsKalender
          key={standortId}
          offeneWochentage={oeffnungstage[standortId] ?? []}
          minDatum={minDatum}
          initialDatum={reservierung?.datum}
          feiertage={feiertage[standortId] ?? {}}
        />
      </label>
      <label>
        Uhrzeit
        <input name="uhrzeit" type="time" required defaultValue={reservierung?.uhrzeit} />
      </label>
      <label>
        Personen
        <input
          name="personenzahl"
          type="number"
          min={1}
          max={100}
          required
          defaultValue={reservierung?.personenzahl}
        />
      </label>
      <button type="submit" disabled={pending || passendeTische.length === 0}>
        {pending ? "Speichert …" : submitLabel}
      </button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
      {state.success ? <p className="form-message success">{state.success}</p> : null}
    </form>
  );
}
