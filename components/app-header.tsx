import Link from "next/link";
import { getAktiverMitarbeiter, hatBerechtigung } from "@/lib/berechtigungen";
import { getAktiverStandort } from "@/lib/standort";
import { logoutMitarbeiterAction } from "@/app/mitarbeiter-waehlen/actions";
import { AppNavigation, type AppNavItem } from "@/components/app-navigation";

export async function AppHeader() {
  const [standort, mitarbeiter] = await Promise.all([
    getAktiverStandort(),
    getAktiverMitarbeiter(),
  ]);

  if (!mitarbeiter) {
    return <header className="onboarding-header">
      <Link className="brand" href="/"><span className="brand-mark">BV</span><span>Bella Vista<small>Restaurant App</small></span></Link>
      <div className="onboarding-context">
        {standort ? <Link href="/mitarbeiter-waehlen">Mitarbeiter wählen</Link> : null}
        <Link className="location-switch" href="/standort"><span>Standort</span><strong>{standort?.name ?? "auswählen"}</strong></Link>
      </div>
    </header>;
  }

  const navigation: AppNavItem[] = [
    { href: "/", label: "Dashboard", icon: "⌂" },
    ...(hatBerechtigung(mitarbeiter.rolle, "reservierungen_verwalten") ? [{ href: "/reservierungen", label: "Reservierungen", shortLabel: "Reservieren", icon: "□" }] : []),
    ...(hatBerechtigung(mitarbeiter.rolle, "bestellungen_aufnehmen") ? [{ href: "/bestellungen", label: "Bestellungen", shortLabel: "Bestellen", icon: "+" }] : []),
    ...(hatBerechtigung(mitarbeiter.rolle, "tischstatus_sehen") ? [{ href: "/tische", label: "Tischübersicht", shortLabel: "Tische", icon: "▦" }] : []),
    ...(hatBerechtigung(mitarbeiter.rolle, "kueche_sehen") ? [{ href: "/kueche", label: "Küche", icon: "≋" }] : []),
    { href: "/speisekarte", label: "Speisekarte", shortLabel: "Karte", icon: "≡" },
    ...(hatBerechtigung(mitarbeiter.rolle, "gastdaten_sehen") ? [{ href: "/gaeste", label: "Gäste", icon: "○" }] : []),
    ...(hatBerechtigung(mitarbeiter.rolle, "catering_verwalten") ? [{ href: "/catering", label: "Catering", icon: "C" }] : []),
    ...(hatBerechtigung(mitarbeiter.rolle, "mitarbeiter_verwalten") ? [{ href: "/mitarbeiter", label: "Mitarbeiter", shortLabel: "Team", icon: "◇" }] : []),
    ...(hatBerechtigung(mitarbeiter.rolle, "oeffnungszeiten_verwalten") ? [{ href: "/oeffnungszeiten", label: "Öffnungszeiten", shortLabel: "Zeiten", icon: "◷" }] : []),
  ];

  return <aside className="app-sidebar">
    <Link className="brand" href="/"><span className="brand-mark">BV</span><span>Bella Vista<small>Restaurant App</small></span></Link>
    <AppNavigation items={navigation} />
    <div className="sidebar-context">
      <Link className="location-switch" href="/standort"><span>Aktiver Standort</span><strong>{standort?.name ?? "auswählen"}</strong></Link>
      <div className="staff-context"><span className="staff-avatar" aria-hidden="true">{mitarbeiter.name.slice(0, 1).toUpperCase()}</span><div><strong>{mitarbeiter.name}</strong><Link href="/mitarbeiter-waehlen">Zugang wechseln</Link></div></div>
      <form action={logoutMitarbeiterAction}><button className="logout-button" type="submit">Abmelden</button></form>
    </div>
  </aside>;
}
