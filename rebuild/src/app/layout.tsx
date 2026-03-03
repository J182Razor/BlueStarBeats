import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SafeShell } from "@/components/navigation/safe-shell";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlueStarBeats",
  description: "Mobile-first brainwave entrainment studio.",
  applicationName: "BlueStarBeats",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BlueStarBeats",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f1d",
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
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <RegisterServiceWorker />
        <SafeShell>{children}</SafeShell>
      </body>
    </html>
  );
}
