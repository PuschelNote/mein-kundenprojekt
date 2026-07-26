"use client";
import { useActionState } from "react";
import type { OeffnungszeitActionState } from "./actions";
export function FeiertagDeleteForm({ action, id }: { action: (state: OeffnungszeitActionState, data: FormData) => Promise<OeffnungszeitActionState>; id: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="holiday-delete-form"><input type="hidden" name="id" value={id} /><button className="danger-button" disabled={pending}>Override löschen</button>{state.error ? <p className="form-message error">{state.error}</p> : null}</form>;
}
