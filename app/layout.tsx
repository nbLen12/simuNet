import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "simuNet FSM Portal",
  description: "Multi-portal field service workflow for maintenance and small works",
  applicationName: "simuNet FSM",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
