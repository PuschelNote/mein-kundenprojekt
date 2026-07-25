"use client";

import { useActionState } from "react";
import type { ReservierungActionState } from "./actions";

export function ReservierungStatusForm({
  action,
  id,
  status,
}: {
  action: (
    state: ReservierungActionState,
    formData: FormData,
  ) => Promise<ReservierungActionState>;
  id: string;
  status: "offen" | "storniert";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const zielstatus = status === "offen" ? "storniert" : "offen";

  return (
    <form action={formAction} className="reservation-status-form">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={zielstatus} />
      <button type="submit" disabled={pending}>
        {pending
          ? "Speichert …"
          : status === "offen"
            ? "Reservierung stornieren"
            : "Reservierung wieder öffnen"}
      </button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
      {state.success ? <p className="form-message success">{state.success}</p> : null}
    </form>
  );
}
