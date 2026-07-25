import { GerichtKategorie } from "@/generated/prisma/enums";

export const GERICHT_KATEGORIEN = [
  GerichtKategorie.antipasti,
  GerichtKategorie.pasta,
  GerichtKategorie.risotto,
  GerichtKategorie.dessert,
  GerichtKategorie.getraenke,
  GerichtKategorie.grill,
] as const;

export const GERICHT_KATEGORIE_LABELS: Record<GerichtKategorie, string> = {
  antipasti: "Antipasti",
  pasta: "Pasta",
  risotto: "Risotto",
  dessert: "Dessert",
  getraenke: "Getränke",
  grill: "Grill",
};
