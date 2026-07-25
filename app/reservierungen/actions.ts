"use server";

import { revalidatePath } from "next/cache";
import { requireBerechtigung } from "@/lib/berechtigungen";
import {
  createReservierung,
  ReservierungValidationError,
  validateReservierungInput,
} from "@/lib/reservierungen";

export type ReservierungActionState = {
  error?: string;
  success?: string;
};

export async function createReservierungAction(
  _state: ReservierungActionState,
  formData: FormData,
): Promise<ReservierungActionState> {
  try {
    const mitarbeiter = await requireBerechtigung(
      "reservierungen_verwalten",
      "/reservierungen",
    );
    const input = validateReservierungInput({
      tischId: formData.get("tischId"),
      gastName: formData.get("gastName"),
      gastTelefon: formData.get("gastTelefon"),
      datum: formData.get("datum"),
      uhrzeit: formData.get("uhrzeit"),
      personenzahl: formData.get("personenzahl"),
    });
    await createReservierung(mitarbeiter, mitarbeiter.standortId, input);
    revalidatePath("/reservierungen");
    return { success: "Reservierung wurde angelegt." };
  } catch (error) {
    if (error instanceof ReservierungValidationError) {
      return { error: error.message };
    }
    console.error("Reservierung konnte nicht gespeichert werden");
    return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }
}
