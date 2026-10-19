import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampoVivo — Gestão rural inteligente",
  description: "Gerencie rebanho, sanidade, vacinas, despesas e combustível em um só lugar.",
  applicationName: "CampoVivo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
