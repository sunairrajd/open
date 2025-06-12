import type { Metadata } from "next";
import { Geist, Lexend } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react"

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-lexend',
});

export const metadata: Metadata = {
  title: 'Open Property',
  description: 'Find your dream home in Bangalore',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${lexend.variable} antialiased h-[100dvh]`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={`${geist.className} h-[100dvh] overflow-hidden`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
