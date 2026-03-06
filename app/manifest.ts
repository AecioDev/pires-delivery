import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pires Delivery",
    short_name: "Pires Delivery",
    description: "Peça seus salgados favoritos de forma rápida e fácil.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ea580c", // Orange-600 to match brand
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
