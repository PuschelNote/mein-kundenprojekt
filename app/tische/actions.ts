"use server";

import { revalidatePath } from "next/cache";
import { requireBerechtigung } from "@/lib/berechtigungen";
import {
  createTisch,
  deleteTisch,
  TischValidationError,
  updateTisch,
  updateTischStatus,
  validateTischInput,
} from "@/lib/tische";
import { requireAktiverStandort } from "@/lib/standort";

export type TischActionState = { error?: string; success?: string };

export async function createTischAction(
  _state: TischActionState,
  formData: FormData,
): Promise<TischActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("tischstammdaten_verwalten", "/tische"),
      requireAktiverStandort("/tische"),
    ]);
    await createTisch(
      mitarbeiter,
      standort.id,
      inputFromFormData(formData),
    );
    revalidatePath("/tische");
    revalidatePath("/reservierungen");
    return { success: "Tisch wurde angelegt." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateTischAction(
  _state: TischActionState,
  formData: FormData,
): Promise<TischActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("tischstammdaten_verwalten", "/tische"),
      requireAktiverStandort("/tische"),
    ]);
    await updateTisch(
      String(formData.get("id") ?? ""),
      mitarbeiter,
      standort.id,
      inputFromFormData(formData),
    );
    revalidatePath("/tische");
    revalidatePath("/reservierungen");
    return { success: "Tisch wurde aktualisiert." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateTischStatusAction(
  _state: TischActionState,
  formData: FormData,
): Promise<TischActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("tischstatus_verwalten", "/tische"),
      requireAktiverStandort("/tische"),
    ]);
    await updateTischStatus(
      String(formData.get("id") ?? ""),
      formData.get("status"),
      mitarbeiter,
      standort.id,
    );
    revalidatePath("/tische");
    return { success: "Tischstatus wurde aktualisiert." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteTischAction(
  _state: TischActionState,
  formData: FormData,
): Promise<TischActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("tischstammdaten_verwalten", "/tische"),
      requireAktiverStandort("/tische"),
    ]);
    await deleteTisch(
      String(formData.get("id") ?? ""),
      mitarbeiter,
      standort.id,
    );
    revalidatePath("/tische");
    revalidatePath("/reservierungen");
    return { success: "Tisch wurde entfernt." };
  } catch (error) {
    return actionError(error);
  }
}

function inputFromFormData(formData: FormData) {
  return validateTischInput({
    nummer: formData.get("nummer"),
    kapazitaet: formData.get("kapazitaet"),
    bereich: formData.get("bereich"),
    verfuegbar: formData.get("verfuegbar"),
    rasterZeile: formData.get("rasterZeile"),
    rasterSpalte: formData.get("rasterSpalte"),
  });
}

function actionError(error: unknown): TischActionState {
  if (error instanceof TischValidationError) {
    return { error: error.message };
  }
  console.error("Tischoperation fehlgeschlagen");
  return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
}
