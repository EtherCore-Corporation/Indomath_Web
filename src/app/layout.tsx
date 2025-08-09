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
  description: "Plataforma de aprendizaje de matemáticas online con cursos de alta calidad para 2º Bachillerato. Ciencias y CCSS.",
  keywords: "matemáticas, bachillerato, cursos online, ciencias, ccss, aprender matemáticas",
  authors: [{ name: "Indomath" }],
  creator: "Indomath",
  publisher: "Indomath",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://indomath.es'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Indomath - Aprende Matemáticas Online",
    description: "Plataforma de aprendizaje de matemáticas online con cursos de alta calidad para 2º Bachillerato.",
    url: '/',
    siteName: 'Indomath',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Indomath - Aprende Matemáticas Online",
    description: "Plataforma de aprendizaje de matemáticas online con cursos de alta calidad.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Agregar cuando tengas el código de Google Search Console
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://iuntmgotfksbmgzwnwsw.supabase.co" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
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
