"use client";

import { useActionState } from "react";
import type { MitarbeiterActionState } from "./actions";

type StandortOption = {
  id: string;
  name: string;
};

type MitarbeiterFormProps = {
  action: (
    state: MitarbeiterActionState,
    formData: FormData,
  ) => Promise<MitarbeiterActionState>;
  standorte: StandortOption[];
  submitLabel: string;
  defaultStandortId?: string;
  mitarbeiter?: {
    id: string;
    name: string;
    rolle: "bedienung" | "manager" | "inhaber";
    standortId: string;
  };
};

const initialState: MitarbeiterActionState = {};

export function MitarbeiterForm({
  action,
  standorte,
  submitLabel,
  defaultStandortId,
  mitarbeiter,
}: MitarbeiterFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="employee-form">
      {mitarbeiter ? <input type="hidden" name="id" value={mitarbeiter.id} /> : null}

      <label>
        Name
        <input
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={mitarbeiter?.name}
          autoComplete="off"
        />
      </label>

      <label>
        Standort
        <select
          name="standortId"
          required
          defaultValue={mitarbeiter?.standortId ?? defaultStandortId ?? ""}
        >
          <option value="" disabled>
            Standort auswählen
          </option>
          {standorte.map((standort) => (
            <option key={standort.id} value={standort.id}>
              {standort.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Rolle
        <select name="rolle" required defaultValue={mitarbeiter?.rolle ?? "bedienung"}>
          <option value="bedienung">Bedienung</option>
          <option value="manager">Manager</option>
          <option value="inhaber">Inhaber</option>
        </select>
      </label>

      <button type="submit" disabled={pending}>
        {pending ? "Speichert …" : submitLabel}
      </button>

      {state.error ? <p className="form-message error">{state.error}</p> : null}
      {state.success ? (
        <p className="form-message success">{state.success}</p>
      ) : null}
    </form>
  );
}
