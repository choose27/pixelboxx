import type { Metadata } from "next";
import { Archivo_Black, Outfit, Press_Start_2P } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const outfit = Outfit({
  weight: ["300", "400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "PixelBoxx - YOUR SPACE. YOUR RULES.",
  description:
    "The nostalgia of MySpace meets the power of modern chat. Create your PixelPage, join communities, and express yourself like it's 2006 — but better.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivoBlack.variable} ${outfit.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
