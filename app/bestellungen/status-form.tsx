"use client";

import { useActionState } from "react";
import type { BestellungActionState } from "./actions";

type Status = "offen" | "zubereitet" | "serviert";

export function BestellungStatusForm({ action, id, status, bereich = "service" }: {
  action: (state: BestellungActionState, data: FormData) => Promise<BestellungActionState>;
  id: string;
  status: Status;
  bereich?: "kueche" | "service";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="status-actions">
    <input type="hidden" name="id" value={id} />
    {bereich === "kueche" && status === "offen" ? <button name="status" value="zubereitet" disabled={pending}>Als zubereitet markieren</button> : null}
    {bereich === "service" && status === "zubereitet" ? <button name="status" value="serviert" disabled={pending}>Als serviert markieren</button> : null}
    {bereich === "service" && status === "serviert" ? <button name="status" value="bezahlt" disabled={pending}>{pending ? "Wird abgerechnet …" : "Rechnung bezahlen"}</button> : null}
    <button className="danger-button" name="status" value="storniert" disabled={pending}>Stornieren</button>
    {state.error ? <p className="form-message error">{state.error}</p> : null}
  </form>;
}
