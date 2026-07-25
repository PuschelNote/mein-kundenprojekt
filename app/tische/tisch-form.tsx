"use client";

import { useActionState } from "react";
import type { TischActionState } from "./actions";

type TischWerte = {
  id: string;
  nummer: number;
  kapazitaet: number;
  bereich: "innen" | "terrasse";
  verfuegbar: boolean;
  rasterZeile: number;
  rasterSpalte: number;
};

export function TischForm({
  action,
  tisch,
  submitLabel,
}: {
  action: (
    state: TischActionState,
    formData: FormData,
  ) => Promise<TischActionState>;
  tisch?: TischWerte;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="table-form">
      {tisch ? <input type="hidden" name="id" value={tisch.id} /> : null}
      <label>
        Nummer
        <input name="nummer" type="number" min={1} max={999} required defaultValue={tisch?.nummer} />
      </label>
      <label>
        Kapazität
        <input name="kapazitaet" type="number" min={1} max={100} required defaultValue={tisch?.kapazitaet} />
      </label>
      <label>
        Bereich
        <select name="bereich" required defaultValue={tisch?.bereich ?? "innen"}>
          <option value="innen">Innen</option>
          <option value="terrasse">Terrasse</option>
        </select>
      </label>
      <label>
        Grundrisszeile
        <input name="rasterZeile" type="number" min={1} max={20} required defaultValue={tisch?.rasterZeile} />
      </label>
      <label>
        Grundrissspalte
        <input name="rasterSpalte" type="number" min={1} max={20} required defaultValue={tisch?.rasterSpalte} />
      </label>
      <label className="checkbox-field">
        <input name="verfuegbar" type="checkbox" defaultChecked={tisch?.verfuegbar ?? true} />
        Saisonal verfügbar
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Speichert …" : submitLabel}
      </button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
      {state.success ? <p className="form-message success">{state.success}</p> : null}
    </form>
  );
}
