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

export type TischActionState = { error?: string; success?: string };

export async function createTischAction(
  _state: TischActionState,
  formData: FormData,
): Promise<TischActionState> {
  try {
    const mitarbeiter = await requireBerechtigung(
      "tischstammdaten_verwalten",
      "/tische",
    );
    await createTisch(
      mitarbeiter,
      mitarbeiter.standortId,
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
    const mitarbeiter = await requireBerechtigung(
      "tischstammdaten_verwalten",
      "/tische",
    );
    await updateTisch(
      String(formData.get("id") ?? ""),
      mitarbeiter,
      mitarbeiter.standortId,
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
    const mitarbeiter = await requireBerechtigung(
      "tischstatus_verwalten",
      "/tische",
    );
    await updateTischStatus(
      String(formData.get("id") ?? ""),
      formData.get("status"),
      mitarbeiter,
      mitarbeiter.standortId,
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
    const mitarbeiter = await requireBerechtigung(
      "tischstammdaten_verwalten",
      "/tische",
    );
    await deleteTisch(
      String(formData.get("id") ?? ""),
      mitarbeiter,
      mitarbeiter.standortId,
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
