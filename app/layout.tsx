import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { PwaBootstrap } from "@/components/pwa-bootstrap";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "Bella Vista",
  description: "Restaurantverwaltung für Bella Vista Berlin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <PwaBootstrap />
        <div className="app-shell">
          <AppHeader />
          <div className="app-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
