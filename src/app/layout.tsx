import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opal Contentful Sandbox",
  description: "Six fictional brands for demonstrating Optimizely Opal with a headless CMS.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Every page renders per request so the proxy's CSP nonce reaches Next.js scripts.
  await connection();
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
