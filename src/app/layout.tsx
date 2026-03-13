import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agua Gutis",
  description: "Sistema modular para la gestión operativa de Agua Gutis."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
