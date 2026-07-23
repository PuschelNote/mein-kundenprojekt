"use client";

import { useActionState } from "react";
import type { GastActionState } from "./actions";

type GastFormProps = {
  action: (
    state: GastActionState,
    formData: FormData,
  ) => Promise<GastActionState>;
  submitLabel: string;
  gast?: {
    id: string;
    name: string;
    telefon: string;
    notizen: string | null;
  };
};

export function GastForm({ action, submitLabel, gast }: GastFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="guest-form">
      {gast ? <input type="hidden" name="id" value={gast.id} /> : null}
      <label>
        Name
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={gast?.name}
          autoComplete="name"
        />
      </label>
      <label>
        Telefonnummer
        <input
          name="telefon"
          type="tel"
          required
          defaultValue={gast?.telefon}
          autoComplete="tel"
        />
      </label>
      <label className="guest-notes-field">
        Notizen
        <textarea
          name="notizen"
          maxLength={1000}
          rows={3}
          defaultValue={gast?.notizen ?? ""}
          placeholder="Zum Beispiel Allergien oder Sitzplatzwünsche"
        />
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
