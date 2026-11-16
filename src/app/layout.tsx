import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/theme-provider";
import { Navbar } from "@/shared/layout/navbar";
import { Footer } from "@/shared/layout/footer";
import { ActivityProvider } from "@/features/renter/components/activity-provider";
import { CompareProvider } from "@/features/compare/components/compare-provider";
import { CompareTray } from "@/features/compare/components/compare-tray";
import { ConnectionStatus } from "@/shared/layout/connection-status";
import { SiteOnly } from "@/shared/layout/site-only";
import { Toaster } from "@/shared/ui/toast";
import { LocaleProvider } from "@/i18n/client";
import { getI18n } from "@/i18n/server";
import { SITE_NAME, SITE_URL } from "@/shared/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Geist and Fraunces have no Khmer glyphs; Kantumruy Pro covers Khmer script and
// is listed after them in the font stacks so Latin text keeps its look.
const kantumruy = Kantumruy_Pro({
  variable: "--font-khmer",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { d, locale } = await getI18n();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.meta.title, template: `%s · ${SITE_NAME}` },
    description: d.meta.description,
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: d.meta.title,
      description: d.meta.description,
      locale: locale === "km" ? "km_KH" : "en_US",
    },
    twitter: { card: "summary_large_image", title: d.meta.title, description: d.meta.description },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getI18n();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${kantumruy.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LocaleProvider initialLocale={locale}>
            <ActivityProvider>
              <CompareProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <SiteOnly>
                  <Footer />
                  <CompareTray />
                </SiteOnly>
                <Toaster />
                <ConnectionStatus />
              </CompareProvider>
            </ActivityProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
