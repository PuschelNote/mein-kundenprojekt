"use client";

import { useActionState } from "react";
import type { TischActionState } from "./actions";

export function TischStatusForm({
  action,
  id,
  status,
}: {
  action: (state: TischActionState, formData: FormData) => Promise<TischActionState>;
  id: string;
  status: "frei" | "besetzt" | "reserviert";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="table-status-form">
      <input type="hidden" name="id" value={id} />
      <label>
        <span className="sr-only">Status ändern</span>
        <select name="status" defaultValue={status} disabled={pending}>
          <option value="frei">Frei</option>
          <option value="besetzt">Besetzt</option>
          <option value="reserviert">Reserviert</option>
        </select>
      </label>
      <button type="submit" disabled={pending}>Status speichern</button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
    </form>
  );
}
