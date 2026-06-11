import type { Metadata } from "next";
import { Inter, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { TopicStrip } from "@/components/topic-strip";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SmartHumans — They said it. We tracked it.",
    template: "%s · SmartHumans",
  },
  description:
    "A public, sourced, community-verified record of predictions and promises — by public figures and everyone else — and whether they came true.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <TopicStrip />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
