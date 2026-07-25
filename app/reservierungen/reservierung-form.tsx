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
}: {
  action: (
    state: ReservierungActionState,
    formData: FormData,
  ) => Promise<ReservierungActionState>;
  tische: TischOption[];
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="reservation-form">
      <label>
        Gastname
        <input
          name="gastName"
          maxLength={100}
          autoComplete="name"
          placeholder="Nur bei neuen Gästen nötig"
        />
      </label>
      <label>
        Gast-Telefonnummer
        <input name="gastTelefon" type="tel" required autoComplete="tel" />
      </label>
      <label>
        Tisch
        <select name="tischId" required defaultValue="">
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
        <input name="datum" type="date" required />
      </label>
      <label>
        Uhrzeit
        <input name="uhrzeit" type="time" required />
      </label>
      <label>
        Personen
        <input name="personenzahl" type="number" min={1} max={100} required />
      </label>
      <button type="submit" disabled={pending || tische.length === 0}>
        {pending ? "Speichert …" : "Reservierung anlegen"}
      </button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
      {state.success ? <p className="form-message success">{state.success}</p> : null}
    </form>
  );
}
