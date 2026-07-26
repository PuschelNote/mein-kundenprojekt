"use client";

import { useActionState, useState } from "react";
import type { OeffnungszeitActionState } from "./actions";

export function FeiertagsForm({ action, standorte }: { action: (state: OeffnungszeitActionState, data: FormData) => Promise<OeffnungszeitActionState>; standorte: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [geschlossen, setGeschlossen] = useState(false);
  return <form action={formAction} className="holiday-form">
    <label>Standort<select name="standortId" required defaultValue=""><option value="" disabled>Standort auswählen</option>{standorte.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
    <label>Datum<input name="datum" type="date" required /></label>
    <label className="checkbox-field"><input name="geschlossen" type="checkbox" checked={geschlossen} onChange={(e) => setGeschlossen(e.target.checked)} /> An diesem Tag geschlossen</label>
    <label>Öffnet<input name="oeffnet" type="time" required={!geschlossen} disabled={geschlossen} /></label>
    <label>Schließt<input name="schliesst" type="time" required={!geschlossen} disabled={geschlossen} /></label>
    <button type="submit" disabled={pending}>{pending ? "Speichert …" : "Override speichern"}</button>
    {state.error ? <p className="form-message error">{state.error}</p> : null}{state.success ? <p className="form-message success">{state.success}</p> : null}
  </form>;
}
