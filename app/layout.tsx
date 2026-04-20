import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://eden.jstech-inc.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Eden Chat";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${SITE_NAME} — Senior Living Lead Assistant`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "AI-powered chat assistant for Eden Senior Care communities. Lead capture, tour scheduling, and admissions support built for the way families actually search.",
  applicationName: SITE_NAME,
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: `${SITE_NAME} — Senior Living Lead Assistant`,
    description:
      "AI-powered chat assistant for Eden Senior Care communities. Lead capture, tour scheduling, and admissions support.",
    url: APP_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
