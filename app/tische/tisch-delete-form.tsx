"use client";

import { useActionState } from "react";
import type { TischActionState } from "./actions";

export function TischDeleteForm({
  action,
  id,
}: {
  action: (state: TischActionState, formData: FormData) => Promise<TischActionState>;
  id: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="table-delete-form">
      <input type="hidden" name="id" value={id} />
      <button className="danger-button" type="submit" disabled={pending}>
        {pending ? "Entfernt …" : "Tisch entfernen"}
      </button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
    </form>
  );
}
