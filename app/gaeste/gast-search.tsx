"use client";

import { useActionState } from "react";
import { istBellaCardAktiv } from "@/lib/gast-status";
import {
  createGastAction,
  searchGastAction,
  type GastSearchState,
} from "./actions";
import { GastForm } from "./gast-form";

const initialState: GastSearchState = {};

export function GastSearch() {
  const [state, action, pending] = useActionState(
    searchGastAction,
    initialState,
  );

  return (
    <section className="guest-search" aria-labelledby="guest-search-title">
      <div>
        <h2 id="guest-search-title">Gast erkennen</h2>
        <p>Exakte Suche anhand der Telefonnummer.</p>
      </div>
      <form action={action}>
        <label className="sr-only" htmlFor="guest-phone-search">
          Telefonnummer
        </label>
        <input
          id="guest-phone-search"
          name="telefon"
          type="tel"
          defaultValue={state.telefon}
          placeholder="Telefonnummer eingeben"
          autoComplete="tel"
          required
        />
        <button type="submit" disabled={pending}>
          {pending ? "Sucht …" : "Suchen"}
        </button>
      </form>

      {state.error ? (
        <p className="form-message error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.searched && state.gast ? (
        <div className="guest-search-result found">
          <div>
            <span>Gast gefunden</span>
            <strong>{state.gast.name}</strong>
          </div>
          <p>{state.gast.telefon}</p>
          <p>{state.gast.besuchszaehler} Besuche</p>
          <p>
            Bella-Card {" "}
            {istBellaCardAktiv(state.gast.besuchszaehler) ? "aktiv" : "inaktiv"}
          </p>
          {state.gast.notizen ? <p>{state.gast.notizen}</p> : null}
        </div>
      ) : null}
      {state.searched && !state.gast ? (
        <div className="guest-search-result missing">
          <strong>Kein Gast gefunden</strong>
          <p>Lege mit dieser Telefonnummer direkt ein neues Profil an.</p>
          <GastForm
            action={createGastAction}
            submitLabel="Gast anlegen"
            defaultTelefon={state.telefon}
          />
        </div>
      ) : null}
    </section>
  );
}
