import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ActivityProvider } from "@/components/activity/activity-provider";
import { CompareProvider } from "@/components/compare/compare-provider";
import { CompareTray } from "@/components/compare/compare-tray";
import { ConnectionStatus } from "@/components/layout/connection-status";
import { SiteOnly } from "@/components/layout/site-only";
import { Toaster } from "@/components/ui/toast";
import { LocaleProvider } from "@/i18n/client";
import { getI18n } from "@/i18n/server";

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
  const { d } = await getI18n();
  return {
    title: { default: d.meta.title, template: "%s · Nest" },
    description: d.meta.description,
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
