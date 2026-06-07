import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { SafeShell } from "@/components/navigation/safe-shell";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Blue Star Beats: Binaural Frequency Studio",
  description:
    "Tune your mind like an instrument. Live binaural and isochronic tones from 0.1 to 40 Hz, sacred solfeggio carriers, guided journeys, and a community of tuned presets.",
  applicationName: "Blue Star Beats",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Blue Star Beats",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0912",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${cormorant.variable} antialiased`}>
        <RegisterServiceWorker />
        <SafeShell>{children}</SafeShell>
      </body>
    </html>
  );
}
