"use client";
import { useActionState, useState } from "react";
import type { BestellungActionState } from "./actions";

type Option = { id: string; name: string; preisCent: number };
type Tisch = { id: string; nummer: number; kapazitaet: number };
type Position = { gerichtId: string; menge: number; sonderwunsch: string };
export function BestellungForm({ action, tische, gerichte, bestellung }: { action: (state: BestellungActionState, data: FormData) => Promise<BestellungActionState>; tische: Tisch[]; gerichte: Option[]; bestellung?: { id: string; tischId: string; positionen: Position[] } }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [positionen, setPositionen] = useState<Position[]>(bestellung?.positionen ?? [{ gerichtId: gerichte[0]?.id ?? "", menge: 1, sonderwunsch: "" }]);
  return <form action={formAction} className="order-form">
    {bestellung ? <input type="hidden" name="id" value={bestellung.id} /> : null}
    <label>Tisch<select name="tischId" required defaultValue={bestellung?.tischId ?? ""}><option value="" disabled>Tisch auswählen</option>{tische.map((t) => <option key={t.id} value={t.id}>Tisch {t.nummer} · {t.kapazitaet} Plätze</option>)}</select></label>
    <label>Gast-Telefonnummer (optional)<input name="gastTelefon" type="tel" autoComplete="tel" placeholder="Nur bekannte Gäste" /></label>
    <fieldset><legend>Positionen</legend>{positionen.map((position, index) => <div className="order-position" key={index}>
      <select name="gerichtId" required value={position.gerichtId} onChange={(e) => setPositionen((all) => all.map((p, i) => i === index ? { ...p, gerichtId: e.target.value } : p))}>{gerichte.map((g) => <option key={g.id} value={g.id}>{g.name} · {(g.preisCent / 100).toFixed(2).replace(".", ",")} €</option>)}</select>
      <input aria-label="Menge" name="menge" type="number" min={1} max={99} required value={position.menge} onChange={(e) => setPositionen((all) => all.map((p, i) => i === index ? { ...p, menge: Number(e.target.value) } : p))} />
      <input aria-label="Sonderwunsch" name="sonderwunsch" maxLength={300} placeholder="Sonderwunsch (optional)" value={position.sonderwunsch} onChange={(e) => setPositionen((all) => all.map((p, i) => i === index ? { ...p, sonderwunsch: e.target.value } : p))} />
      <button type="button" disabled={positionen.length === 1} onClick={() => setPositionen((all) => all.filter((_, i) => i !== index))}>Entfernen</button>
    </div>)}</fieldset>
    <button type="button" disabled={!gerichte.length} onClick={() => setPositionen((all) => [...all, { gerichtId: gerichte[0]?.id ?? "", menge: 1, sonderwunsch: "" }])}>Position ergänzen</button>
    <button type="submit" disabled={pending || !gerichte.length}>{pending ? "Speichert …" : bestellung ? "Änderungen speichern" : "Bestellung aufnehmen"}</button>
    {state.error ? <p className="form-message error">{state.error}</p> : null}{state.success ? <p className="form-message success">{state.success}</p> : null}
  </form>;
}
