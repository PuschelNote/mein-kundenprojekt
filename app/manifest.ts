import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bella Vista Restaurant App",
    short_name: "Bella Vista",
    description: "Restaurantverwaltung für Bella Vista Berlin",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1e6",
    theme_color: "#8b2f23",
    lang: "de",
  };
}
