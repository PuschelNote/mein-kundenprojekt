"use server";

import { redirect } from "next/navigation";
import {
  clearAktiverMitarbeiter,
  setAktiverMitarbeiter,
} from "@/lib/berechtigungen";
import { safeReturnTo } from "@/lib/standort";

export async function selectMitarbeiterAction(formData: FormData) {
  const returnTo = safeReturnTo(formData.get("returnTo"));
  const mitarbeiter = await setAktiverMitarbeiter(formData.get("mitarbeiterId"));
  if (!mitarbeiter) {
    redirect(
      `/mitarbeiter-waehlen?error=ungueltiger-mitarbeiter&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }
  redirect(returnTo);
}

export async function logoutMitarbeiterAction() {
  await clearAktiverMitarbeiter();
  redirect("/mitarbeiter-waehlen");
}
