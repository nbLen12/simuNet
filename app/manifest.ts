import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "simuNet FSM Portal",
    short_name: "simuFSM",
    description: "Field service management portal with admin, tech, and client workspaces",
    start_url: "/tech",
    display: "standalone",
    background_color: "#0d241d",
    theme_color: "#0d6b4f",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml"
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml"
      }
    ]
  };
}
