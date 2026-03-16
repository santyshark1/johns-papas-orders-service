import "../styles/index.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/shared/providers/AppProviders";

export const metadata: Metadata = {
  title: "John's Papas",
  description: "Frontend en Next.js"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
