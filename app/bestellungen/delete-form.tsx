"use client";

import { useActionState } from "react";
import type { BestellungActionState } from "./actions";

export function BestellungDeleteForm({ action, id }: { action: (state: BestellungActionState, data: FormData) => Promise<BestellungActionState>; id: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="status-actions" onSubmit={(event) => {
    if (!window.confirm("Stornierte Bestellung dauerhaft löschen?")) event.preventDefault();
  }}>
    <input type="hidden" name="id" value={id} />
    <button className="danger-button" type="submit" disabled={pending}>{pending ? "Wird gelöscht …" : "Bestellung löschen"}</button>
    {state.error ? <p className="form-message error">{state.error}</p> : null}
  </form>;
}
