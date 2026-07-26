"use client";
import { useActionState, useState } from "react";
import type { BestellungActionState } from "./actions";

type Option = { id: string; name: string; preisCent: number };
type Tisch = { id: string; nummer: number; kapazitaet: number };
type Reservierung = { id: string; datum: string; uhrzeitMinute: number; personenzahl: number; tischId: string; gast: { name: string } };
type Position = { gerichtId: string; menge: number; sonderwunsch: string };
type BestehendeBestellung = { id: string; tischId: string; reservierung: Omit<Reservierung, "tischId" | "gast"> | null; positionen: Position[] };

function zeit(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function BestellungForm({ action, tische, gerichte, reservierungen = [], bestellung }: { action: (state: BestellungActionState, data: FormData) => Promise<BestellungActionState>; tische: Tisch[]; gerichte: Option[]; reservierungen?: Reservierung[]; bestellung?: BestehendeBestellung }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [positionen, setPositionen] = useState<Position[]>(bestellung?.positionen ?? [{ gerichtId: gerichte[0]?.id ?? "", menge: 1, sonderwunsch: "" }]);
  const [tischId, setTischId] = useState(bestellung?.tischId ?? "");
  const [reservierungId, setReservierungId] = useState("");
  const passendeReservierungen = reservierungen.filter((reservierung) => reservierung.tischId === tischId);
  const istReservierungsbestellung = Boolean(bestellung?.reservierung);
  return <form action={formAction} className="order-form">
    {bestellung ? <input type="hidden" name="id" value={bestellung.id} /> : null}
    {istReservierungsbestellung ? <input type="hidden" name="tischId" value={tischId} /> : null}
    <label>Tisch<select name={istReservierungsbestellung ? undefined : "tischId"} required disabled={istReservierungsbestellung} value={tischId} onChange={(event) => { setTischId(event.target.value); setReservierungId(""); }}><option value="" disabled>Tisch auswählen</option>{tische.map((t) => <option key={t.id} value={t.id}>Tisch {t.nummer} · {t.kapazitaet} Plätze</option>)}</select></label>
    {!bestellung ? <label>Angekommene Reservierung (optional)<select name="reservierungId" value={reservierungId} disabled={!tischId || passendeReservierungen.length === 0} onChange={(event) => setReservierungId(event.target.value)}><option value="">{passendeReservierungen.length ? "Keine Reservierung · Laufkundschaft" : "Keine offene Reservierung für diesen Tisch"}</option>{passendeReservierungen.map((reservierung) => <option key={reservierung.id} value={reservierung.id}>{reservierung.gast.name} · {reservierung.datum} um {zeit(reservierung.uhrzeitMinute)} · {reservierung.personenzahl} Personen</option>)}</select></label> : null}
    {bestellung?.reservierung ? <><input type="hidden" name="reservierungId" value={bestellung.reservierung.id} /><p className="panel-hint">Reservierung vom {bestellung.reservierung.datum} um {zeit(bestellung.reservierung.uhrzeitMinute)} Uhr · {bestellung.reservierung.personenzahl} Personen</p></> : null}
    <label>Gast-Telefonnummer (optional)<input name="gastTelefon" type="tel" autoComplete="tel" placeholder={reservierungId ? "Gast wird aus der Reservierung übernommen" : "Nur bekannte Gäste"} disabled={Boolean(reservierungId) || istReservierungsbestellung} /></label>
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
