import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";
import { CookieBanner } from '@/components/cookie-banner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PcAnalys - Analyse PC Gratuite et Intelligente",
  description: "Analysez votre configuration PC gratuitement et obtenez des recommandations personnalisées pour optimiser vos performances.",
  keywords: ["analyse PC", "diagnostic ordinateur", "recommandations hardware", "performance PC"],
  authors: [{ name: "PcAnalys Team" }],
  openGraph: {
    title: "PcAnalys - Analyse PC Gratuite et Intelligente",
    description: "Analysez votre configuration PC gratuitement et obtenez des recommandations personnalisées.",
    type: "website",
    url: "https://pcanalys.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "PcAnalys - Analyse PC Gratuite et Intelligente",
    description: "Analysez votre configuration PC gratuitement et obtenez des recommandations personnalisées.",
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <div className="min-h-screen bg-background">
              {children}
            </div>
            <Toaster />
            <CookieBanner />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
