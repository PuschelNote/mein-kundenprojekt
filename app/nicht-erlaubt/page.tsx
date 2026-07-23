import Link from "next/link";

export default function NichtErlaubtPage() {
  return (
    <main className="access-denied-page">
      <p className="eyebrow">Zugriff verweigert</p>
      <h1>Nicht erlaubt</h1>
      <p>Deine aktuelle Rolle besitzt die erforderliche Berechtigung nicht.</p>
      <Link className="primary-link" href="/">
        Zur Startseite
      </Link>
    </main>
  );
}
