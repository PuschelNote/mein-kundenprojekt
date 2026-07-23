"use server";

import { revalidatePath } from "next/cache";
import { requireBerechtigung } from "@/lib/berechtigungen";
import {
  createGast,
  deleteGast,
  GastValidationError,
  updateGast,
  validateGastInput,
} from "@/lib/gaeste";

export type GastActionState = { error?: string; success?: string };

export async function createGastAction(
  _state: GastActionState,
  formData: FormData,
): Promise<GastActionState> {
  try {
    await requireBerechtigung("gastdaten_sehen", "/gaeste");
    const input = inputFromFormData(formData);
    await createGast(input);
    revalidatePath("/gaeste");
    return { success: `${input.name} wurde angelegt.` };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateGastAction(
  _state: GastActionState,
  formData: FormData,
): Promise<GastActionState> {
  try {
    await requireBerechtigung("gastdaten_sehen", "/gaeste");
    const id = String(formData.get("id") ?? "");
    const input = inputFromFormData(formData);
    await updateGast(id, input);
    revalidatePath("/gaeste");
    return { success: `${input.name} wurde aktualisiert.` };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteGastAction(formData: FormData) {
  await requireBerechtigung("gastdaten_sehen", "/gaeste");
  await deleteGast(String(formData.get("id") ?? ""));
  revalidatePath("/gaeste");
}

function inputFromFormData(formData: FormData) {
  return validateGastInput({
    name: formData.get("name"),
    telefon: formData.get("telefon"),
    notizen: formData.get("notizen"),
  });
}

function actionError(error: unknown): GastActionState {
  if (error instanceof GastValidationError) {
    return { error: error.message };
  }
  console.error("Gast konnte nicht gespeichert werden");
  return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
}
