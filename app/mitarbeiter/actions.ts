"use server";

import { revalidatePath } from "next/cache";
import {
  createMitarbeiter,
  deleteMitarbeiter,
  MitarbeiterValidationError,
  updateMitarbeiter,
  validateMitarbeiterInput,
} from "@/lib/mitarbeiter";

export type MitarbeiterActionState = {
  error?: string;
  success?: string;
};

export async function createMitarbeiterAction(
  _state: MitarbeiterActionState,
  formData: FormData,
): Promise<MitarbeiterActionState> {
  try {
    const input = inputFromFormData(formData);
    await createMitarbeiter(input);
    revalidatePath("/mitarbeiter");
    return { success: `${input.name} wurde angelegt.` };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateMitarbeiterAction(
  _state: MitarbeiterActionState,
  formData: FormData,
): Promise<MitarbeiterActionState> {
  try {
    const id = String(formData.get("id") ?? "");
    const input = inputFromFormData(formData);
    await updateMitarbeiter(id, input);
    revalidatePath("/mitarbeiter");
    return { success: `${input.name} wurde aktualisiert.` };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteMitarbeiterAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await deleteMitarbeiter(id);
  revalidatePath("/mitarbeiter");
}

function inputFromFormData(formData: FormData) {
  return validateMitarbeiterInput({
    name: formData.get("name"),
    rolle: formData.get("rolle"),
    standortId: formData.get("standortId"),
  });
}

function actionError(error: unknown): MitarbeiterActionState {
  if (error instanceof MitarbeiterValidationError) {
    return { error: error.message };
  }

  console.error("Mitarbeiter konnte nicht gespeichert werden", error);
  return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
}
