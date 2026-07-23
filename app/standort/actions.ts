"use server";

import { redirect } from "next/navigation";
import { safeReturnTo, setAktiverStandort } from "@/lib/standort";

export async function selectStandortAction(formData: FormData) {
  const returnTo = safeReturnTo(formData.get("returnTo"));
  const standort = await setAktiverStandort(formData.get("standortId"));

  if (!standort) {
    redirect(
      `/standort?error=ungueltiger-standort&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  redirect(returnTo);
}
