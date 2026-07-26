"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AppNavItem = { href: string; label: string; shortLabel?: string; icon: string };

export function AppNavigation({ items }: { items: AppNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="app-navigation" aria-label="Hauptnavigation">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return <Link href={item.href} key={item.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
          <span className="nav-short-label">{item.shortLabel ?? item.label}</span>
        </Link>;
      })}
    </nav>
  );
}
