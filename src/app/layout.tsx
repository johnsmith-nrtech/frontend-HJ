"use client";

import { Bebas_Neue, Open_Sans } from "next/font/google";
import { ReferralTracker } from "@/components/referral-tracker";
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
import Script from "next/script";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

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
        <meta property="og:site_name" content="Sofa Deal" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sofadeal" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <Script id="meta-pixel" strategy="afterInteractive">
  {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '2511714169307241');
    fbq('track', 'PageView');
  `}
</Script>
        <noscript>
  <img
    height="1"
    width="1"
    style={{ display: "none" }}
    src="https://www.facebook.com/tr?id=2511714169307241&ev=PageView&noscript=1"
  />
</noscript>
      </head>
      <body
        className={`${openSans.variable} ${bebasNeue.variable} ${openSans.className}`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          <AuthProvider>
            <DynamicHead />
            <SearchInitializer />
            <ReferralTracker />
            {!isAuthPage && !isAdminPage && <Navbar />}
            {children}

            {!isAuthPage && !isAdminPage && (
              <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 9999 }}>
                <FloatingWhatsAppButton />
              </div>
            )}

            {!isAuthPage && !isAdminPage && (
              <>
                <Script
                  src="https://unpkg.com/@elevenlabs/convai-widget-embed"
                  strategy="afterInteractive"
                  type="text/javascript"
                />
                <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
                  <elevenlabs-convai agent-id="agent_1701kvxae4z5e9bazdc1fsjgz51q"></elevenlabs-convai>
                </div>
              </>
            )}

            {!isAuthPage && !isAdminPage && <Footer />}
            <Toaster richColors />
          </AuthProvider>
        </ReactQueryProvider>
        <CartSuccessModal />
      </body>
    </html>
  );
}
