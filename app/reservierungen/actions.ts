"use server";

import { revalidatePath } from "next/cache";
import { requireBerechtigung } from "@/lib/berechtigungen";
import {
  createReservierung,
  ReservierungValidationError,
  updateReservierung,
  updateReservierungStatus,
  validateReservierungInput,
} from "@/lib/reservierungen";
import { requireAktiverStandort } from "@/lib/standort";

export type ReservierungActionState = {
  error?: string;
  success?: string;
};

export async function createReservierungAction(
  _state: ReservierungActionState,
  formData: FormData,
): Promise<ReservierungActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("reservierungen_verwalten", "/reservierungen"),
      requireAktiverStandort("/reservierungen"),
    ]);
    const input = inputFromFormData(formData);
    await createReservierung(mitarbeiter, standort.id, input);
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

export async function updateReservierungAction(
  _state: ReservierungActionState,
  formData: FormData,
): Promise<ReservierungActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("reservierungen_verwalten", "/reservierungen"),
      requireAktiverStandort("/reservierungen"),
    ]);
    const id = String(formData.get("id") ?? "");
    const input = inputFromFormData(formData, true);
    await updateReservierung(id, mitarbeiter, standort.id, input);
    revalidatePath("/reservierungen");
    return { success: "Reservierung wurde aktualisiert." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateReservierungStatusAction(
  _state: ReservierungActionState,
  formData: FormData,
): Promise<ReservierungActionState> {
  try {
    const [mitarbeiter, standort] = await Promise.all([
      requireBerechtigung("reservierungen_verwalten", "/reservierungen"),
      requireAktiverStandort("/reservierungen"),
    ]);
    await updateReservierungStatus(
      String(formData.get("id") ?? ""),
      formData.get("status"),
      mitarbeiter,
      standort.id,
    );
    revalidatePath("/reservierungen");
    return { success: "Reservierungsstatus wurde aktualisiert." };
  } catch (error) {
    return actionError(error);
  }
}

function inputFromFormData(formData: FormData, gastTelefonOptional = false) {
  return validateReservierungInput({
    tischId: formData.get("tischId"),
    gastName: formData.get("gastName"),
    gastTelefon: formData.get("gastTelefon"),
    datum: formData.get("datum"),
    uhrzeit: formData.get("uhrzeit"),
    personenzahl: formData.get("personenzahl"),
    gastTelefonOptional,
  });
}

function actionError(error: unknown): ReservierungActionState {
  if (error instanceof ReservierungValidationError) {
    return { error: error.message };
  }
  console.error("Reservierung konnte nicht gespeichert werden");
  return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
}
