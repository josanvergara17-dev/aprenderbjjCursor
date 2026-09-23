import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "No-Gi Lab",
  description: "Mapa conceptual de Brazilian Jiu-Jitsu No-Gi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("dark h-full", inter.variable, oswald.variable)}>
      <body className="h-full bg-[#05080f] text-[#e6edf3] antialiased">{children}</body>
    </html>
  );
}
