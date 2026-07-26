"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBerechtigung } from "@/lib/berechtigungen";
import { createCateringAuftrag, updateCateringAuftrag, validateCateringInput } from "@/lib/catering";
import { requireAktiverStandort } from "@/lib/standort";

function input(formData: FormData) {
  return validateCateringInput(Object.fromEntries(formData.entries()));
}

export async function createCateringAction(formData: FormData) {
  const [mitarbeiter, standort] = await Promise.all([requireBerechtigung("catering_verwalten", "/catering"), requireAktiverStandort("/catering")]);
  await createCateringAuftrag(mitarbeiter, standort.id, input(formData));
  revalidatePath("/catering");
  redirect("/catering?gespeichert=1");
}

export async function updateCateringAction(formData: FormData) {
  const [mitarbeiter, standort] = await Promise.all([requireBerechtigung("catering_verwalten", "/catering"), requireAktiverStandort("/catering")]);
  await updateCateringAuftrag(String(formData.get("id") ?? ""), mitarbeiter, standort.id, input(formData));
  revalidatePath("/catering");
  redirect("/catering?gespeichert=1");
}
