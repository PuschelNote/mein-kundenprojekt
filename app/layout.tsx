import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
