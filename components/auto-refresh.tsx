"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoRefresh({ intervallMs = 10_000 }: { intervallMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), intervallMs);
    return () => window.clearInterval(interval);
  }, [intervallMs, router]);
  return null;
}
