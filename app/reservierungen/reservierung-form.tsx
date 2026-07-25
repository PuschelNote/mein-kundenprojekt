"use client";

import { useActionState } from "react";
import type { ReservierungActionState } from "./actions";

type TischOption = {
  id: string;
  nummer: number;
  kapazitaet: number;
  bereich: "innen" | "terrasse";
  vorlaeufig: boolean;
};

export function ReservierungForm({
  action,
  tische,
  reservierung,
  submitLabel = "Reservierung anlegen",
}: {
  action: (
    state: ReservierungActionState,
    formData: FormData,
  ) => Promise<ReservierungActionState>;
  tische: TischOption[];
  reservierung?: {
    id: string;
    tischId: string;
    datum: string;
    uhrzeit: string;
    personenzahl: number;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="reservation-form">
      {reservierung ? <input type="hidden" name="id" value={reservierung.id} /> : null}
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
        <select name="tischId" required defaultValue={reservierung?.tischId ?? ""}>
          <option value="" disabled>Tisch auswählen</option>
          {tische.map((tisch) => (
            <option value={tisch.id} key={tisch.id}>
              Tisch {tisch.nummer} · {tisch.kapazitaet} Plätze · {tisch.bereich}
              {tisch.vorlaeufig ? " · vorläufig" : ""}
            </option>
          ))}
        </select>
      </label>
      <label>
        Datum
        <input name="datum" type="date" required defaultValue={reservierung?.datum} />
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
      <button type="submit" disabled={pending || tische.length === 0}>
        {pending ? "Speichert …" : submitLabel}
      </button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
      {state.success ? <p className="form-message success">{state.success}</p> : null}
    </form>
  );
}
