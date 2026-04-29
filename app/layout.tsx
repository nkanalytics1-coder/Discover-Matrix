import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discover Matrix",
  description: "Generatore di og:title ottimizzati per Google Discover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
