"use server";

import { revalidatePath } from "next/cache";
import { requireBerechtigung } from "@/lib/berechtigungen";
import {
  createGericht,
  GerichtValidationError,
  updateGericht,
  validateGerichtInput,
} from "@/lib/gerichte";
import { requireAktiverStandort } from "@/lib/standort";

export type GerichtActionState = { error?: string; success?: string };

export async function createGerichtAction(
  _state: GerichtActionState,
  formData: FormData,
): Promise<GerichtActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("speisekarte_preise_bearbeiten", "/speisekarte"),
      requireAktiverStandort("/speisekarte"),
    ]);
    await createGericht(mitarbeiter, standort.id, inputFromFormData(formData));
    revalidatePath("/speisekarte");
    return { success: "Gericht wurde angelegt." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateGerichtAction(
  _state: GerichtActionState,
  formData: FormData,
): Promise<GerichtActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("speisekarte_preise_bearbeiten", "/speisekarte"),
      requireAktiverStandort("/speisekarte"),
    ]);
    await updateGericht(
      String(formData.get("id") ?? ""),
      mitarbeiter,
      standort.id,
      inputFromFormData(formData),
    );
    revalidatePath("/speisekarte");
    return { success: "Gericht wurde aktualisiert." };
  } catch (error) {
    return actionError(error);
  }
}

function inputFromFormData(formData: FormData) {
  return validateGerichtInput({
    name: formData.get("name"),
    beschreibung: formData.get("beschreibung"),
    preis: formData.get("preis"),
    kategorie: formData.get("kategorie"),
    istTagesgericht: formData.get("istTagesgericht"),
    istSaisongericht: formData.get("istSaisongericht"),
  });
}

function actionError(error: unknown): GerichtActionState {
  if (error instanceof GerichtValidationError) {
    return { error: error.message };
  }
  console.error("Gericht konnte nicht gespeichert werden");
  return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
}
