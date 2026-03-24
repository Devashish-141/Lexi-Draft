import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LexiDraft AI",
  description: "GenAI-powered legal document generator",
};

import { SessionIdentityProvider } from "@/hooks/useSessionIdentity";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased font-sans">
        <SessionIdentityProvider>
          {children}
        </SessionIdentityProvider>
      </body>
    </html>
  );
}
