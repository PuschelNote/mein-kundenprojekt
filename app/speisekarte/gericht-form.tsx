"use client";

import { useActionState } from "react";
import {
  GERICHT_KATEGORIEN,
  GERICHT_KATEGORIE_LABELS,
} from "@/lib/gericht-kategorien";
import type { GerichtActionState } from "./actions";

type GerichtWerte = {
  id: string;
  name: string;
  beschreibung: string;
  preisCent: number;
  kategorie: "antipasti" | "pasta" | "risotto" | "dessert" | "getraenke" | "grill";
  istTagesgericht: boolean;
  istSaisongericht: boolean;
};

export function GerichtForm({
  action,
  standortId,
  gericht,
  submitLabel,
}: {
  action: (
    state: GerichtActionState,
    formData: FormData,
  ) => Promise<GerichtActionState>;
  standortId: string;
  gericht?: GerichtWerte;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const kategorien = GERICHT_KATEGORIEN.filter(
    (kategorie) => standortId === "kreuzberg" || kategorie !== "grill",
  );

  return (
    <form action={formAction} className="dish-form">
      {gericht ? <input type="hidden" name="id" value={gericht.id} /> : null}
      <label>
        Name
        <input name="name" required minLength={2} maxLength={100} defaultValue={gericht?.name} />
      </label>
      <label className="dish-description-field">
        Beschreibung
        <textarea name="beschreibung" required minLength={2} maxLength={500} rows={3} defaultValue={gericht?.beschreibung} />
      </label>
      <label>
        Preis in Euro
        <input
          name="preis"
          required
          inputMode="decimal"
          placeholder="12,90"
          defaultValue={gericht ? (gericht.preisCent / 100).toFixed(2).replace(".", ",") : undefined}
        />
      </label>
      <label>
        Kategorie
        <select name="kategorie" required defaultValue={gericht?.kategorie ?? kategorien[0]}>
          {kategorien.map((kategorie) => (
            <option value={kategorie} key={kategorie}>
              {GERICHT_KATEGORIE_LABELS[kategorie]}
            </option>
          ))}
        </select>
      </label>
      <label className="checkbox-field">
        <input name="istTagesgericht" type="checkbox" defaultChecked={gericht?.istTagesgericht} />
        Tagesgericht
      </label>
      <label className="checkbox-field">
        <input name="istSaisongericht" type="checkbox" defaultChecked={gericht?.istSaisongericht} />
        Saisongericht
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Speichert …" : submitLabel}
      </button>
      {state.error ? <p className="form-message error">{state.error}</p> : null}
      {state.success ? <p className="form-message success">{state.success}</p> : null}
    </form>
  );
}
