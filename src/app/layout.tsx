import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import AuthProvider from "@/components/AuthProvider";
import Background from "@/components/Background";


const montserrat = Montserrat({ subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });

export const metadata: Metadata = {
  title: "Indomath - Aprende Matemáticas Online",
  description: "Plataforma de aprendizaje de matemáticas online con cursos de alta calidad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={montserrat.className}>
        <AuthProvider>
          <Background />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <ChatButton />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
