import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { FirebaseConfigBanner } from "@/components/FirebaseConfigBanner";

export const metadata: Metadata = {
  title: "FuelWise — Gestão de Combustível para Frotas",
  description:
    "Controle de abastecimento, consumo e alertas inteligentes para pequenas e médias frotas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-inter antialiased">
        <FirebaseConfigBanner />
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
