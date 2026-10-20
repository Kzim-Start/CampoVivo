import type { Metadata } from "next";
import "./globals.css";
import "./entrada.css";

export const metadata: Metadata = {
  title: "CampoVivo — Gestão rural inteligente",
  description: "Gerencie rebanho, sanidade, vacinas, despesas e combustível em um só lugar.",
  applicationName: "CampoVivo",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
