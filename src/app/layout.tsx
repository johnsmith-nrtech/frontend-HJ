"use client";

import { Bebas_Neue, Open_Sans } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/providers/query-provider";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/landing-page/footer";
import { usePathname } from "next/navigation";
import { SearchInitializer } from "@/components/search/search-initializer";
import { DynamicHead } from "@/components/dynamic-head";
import { CartSuccessModal } from "@/components/modal";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

// The metadata needs to be in a separate file since this is now a client component
// You can create a separate file for metadata or use a different approach

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);

  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <head>
        {/* Favicon links */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Basic SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Sofa Deal" />
        <meta
          name="description"
          content="Premium furniture and sofas with exceptional quality and design. Shop our collection of modern and classic furniture pieces."
        />
        <meta
          name="keywords"
          content="furniture, sofas, home decor, premium furniture, modern sofas, classic furniture"
        />

        {/* Open Graph meta tags */}
        <meta property="og:site_name" content="Sofa Deal" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sofadeal" />

        {/* Additional SEO tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${openSans.variable} ${bebasNeue.variable} ${openSans.className}`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          <AuthProvider>
            <DynamicHead />
            <SearchInitializer />
            {!isAuthPage && !isAdminPage && <Navbar />}
            {children}
            {!isAuthPage && !isAdminPage && <FloatingWhatsAppButton />}
            {!isAuthPage && !isAdminPage && <Footer />}
            <Toaster richColors />
          </AuthProvider>
        </ReactQueryProvider>
        <CartSuccessModal />
      </body>
    </html>
  );
}
