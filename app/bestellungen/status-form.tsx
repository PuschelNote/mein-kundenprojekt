"use client";
import { useActionState } from "react";
import type { BestellungActionState } from "./actions";
export function BestellungStatusForm({ action, id, status }: { action: (state: BestellungActionState, data: FormData) => Promise<BestellungActionState>; id: string; status: "offen" | "serviert" }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="status-actions"><input type="hidden" name="id" value={id} />
    {status === "offen" ? <button name="status" value="serviert" disabled={pending}>Als serviert markieren</button> : <button name="status" value="bezahlt" disabled={pending}>{pending ? "Wird abgerechnet …" : "Rechnung bezahlen"}</button>}
    <button className="danger-button" name="status" value="storniert" disabled={pending}>Stornieren</button>{state.error ? <p className="form-message error">{state.error}</p> : null}
  </form>;
}
