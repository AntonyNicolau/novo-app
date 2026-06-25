import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "CartoDie — Orçamento de Cartonagem e Papelão Ondulado",
  description:
    "Plataforma Web-to-Die: reconhecimento FEFCO por IA, compensação de vinco, metragem de lâmina, preview 3D, DXF industrial e proposta em PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-inter antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
