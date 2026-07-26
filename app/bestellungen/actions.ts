"use server";
import { revalidatePath } from "next/cache";
import { requireBerechtigung } from "@/lib/berechtigungen";
import { BestellungValidationError, createBestellung, deleteBestellung, updateBestellung, updateBestellungStatus, validateBestellungInput } from "@/lib/bestellungen";
import { requireAktiverStandort } from "@/lib/standort";

export type BestellungActionState = { error?: string; success?: string };
function input(formData: FormData) {
  return validateBestellungInput({ tischId: formData.get("tischId"), reservierungId: formData.get("reservierungId"), gastTelefon: formData.get("gastTelefon"), gerichtIds: formData.getAll("gerichtId"), mengen: formData.getAll("menge"), sonderwuensche: formData.getAll("sonderwunsch") });
}
function result(error: unknown): BestellungActionState {
  if (error instanceof BestellungValidationError) return { error: error.message };
  console.error("Bestellung konnte nicht verarbeitet werden");
  return { error: "Bestellung konnte nicht verarbeitet werden." };
}
export async function createBestellungAction(_: BestellungActionState, formData: FormData) {
  try {
    const [mitarbeiter, standort] = await Promise.all([requireBerechtigung("bestellungen_aufnehmen", "/bestellungen"), requireAktiverStandort("/bestellungen")]);
    await createBestellung(mitarbeiter, standort.id, input(formData));
    revalidatePath("/bestellungen"); revalidatePath("/kueche");
    return { success: "Bestellung wurde aufgenommen und an die Küche übermittelt." };
  } catch (error) { return result(error); }
}
export async function updateBestellungAction(_: BestellungActionState, formData: FormData) {
  try {
    const [mitarbeiter, standort] = await Promise.all([requireBerechtigung("bestellungen_aufnehmen", "/bestellungen"), requireAktiverStandort("/bestellungen")]);
    await updateBestellung(mitarbeiter, standort.id, String(formData.get("id")), input(formData));
    revalidatePath("/bestellungen"); revalidatePath("/kueche");
    return { success: "Bestellung wurde aktualisiert." };
  } catch (error) { return result(error); }
}
export async function updateBestellungStatusAction(_: BestellungActionState, formData: FormData) {
  try {
    const [mitarbeiter, standort] = await Promise.all([requireBerechtigung("bestellungen_aufnehmen", "/bestellungen"), requireAktiverStandort("/bestellungen")]);
    await updateBestellungStatus(mitarbeiter, standort.id, String(formData.get("id")), formData.get("status"));
    revalidatePath("/bestellungen"); revalidatePath("/kueche");
    const status = formData.get("status");
    return { success: status === "bezahlt" ? "Rechnung wurde bezahlt und der Besuch abgeschlossen." : status === "zubereitet" ? "Die Bestellung ist zubereitet; der Service wurde informiert." : "Status wurde aktualisiert." };
  } catch (error) { return result(error); }
}

export async function deleteBestellungAction(_: BestellungActionState, formData: FormData) {
  try {
    const [mitarbeiter, standort] = await Promise.all([requireBerechtigung("bestellungen_aufnehmen", "/bestellungen"), requireAktiverStandort("/bestellungen")]);
    await deleteBestellung(mitarbeiter, standort.id, String(formData.get("id")));
    revalidatePath("/bestellungen"); revalidatePath("/kueche");
    return { success: "Stornierte Bestellung wurde gelöscht." };
  } catch (error) { return result(error); }
}
