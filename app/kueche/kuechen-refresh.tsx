"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export function KuechenRefresh() {
  const router = useRouter();
  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 10_000);
    return () => window.clearInterval(interval);
  }, [router]);
  return null;
}
