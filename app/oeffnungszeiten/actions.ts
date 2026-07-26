"use server";

import { revalidatePath } from "next/cache";
import { requireBerechtigung } from "@/lib/berechtigungen";
import { deleteFeiertagsOeffnungszeit, OeffnungszeitValidationError, upsertFeiertagsOeffnungszeit, validateFeiertagsOeffnungszeitInput } from "@/lib/oeffnungszeiten";

export type OeffnungszeitActionState = { error?: string; success?: string };

export async function saveFeiertagsOeffnungszeitAction(_: OeffnungszeitActionState, formData: FormData): Promise<OeffnungszeitActionState> {
  try {
    const mitarbeiter = await requireBerechtigung("oeffnungszeiten_verwalten", "/oeffnungszeiten");
    await upsertFeiertagsOeffnungszeit(mitarbeiter, validateFeiertagsOeffnungszeitInput({ standortId: formData.get("standortId"), datum: formData.get("datum"), geschlossen: formData.get("geschlossen"), oeffnet: formData.get("oeffnet"), schliesst: formData.get("schliesst") }));
    revalidatePath("/oeffnungszeiten"); revalidatePath("/reservierungen"); revalidatePath("/");
    return { success: "Feiertagsöffnung wurde gespeichert." };
  } catch (error) {
    if (error instanceof OeffnungszeitValidationError) return { error: error.message };
    return { error: "Feiertagsöffnung konnte nicht gespeichert werden." };
  }
}

export async function deleteFeiertagsOeffnungszeitAction(_: OeffnungszeitActionState, formData: FormData): Promise<OeffnungszeitActionState> {
  try {
    const mitarbeiter = await requireBerechtigung("oeffnungszeiten_verwalten", "/oeffnungszeiten");
    await deleteFeiertagsOeffnungszeit(String(formData.get("id") ?? ""), mitarbeiter);
    revalidatePath("/oeffnungszeiten"); revalidatePath("/reservierungen"); revalidatePath("/");
    return { success: "Override wurde gelöscht; die Standardzeit gilt wieder." };
  } catch (error) {
    if (error instanceof OeffnungszeitValidationError) return { error: error.message };
    return { error: "Override konnte nicht gelöscht werden." };
  }
}
