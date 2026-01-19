import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ListOmania - Créez et partagez vos listes d'albums musicaux",
    template: "%s | ListOmania"
  },
  description: "Créez, organisez et partagez vos listes d'albums musicaux préférés. Importez depuis Discogs, classez vos albums par période et découvrez les listes de la communauté.",
  keywords: ["albums musicaux", "listes musicales", "classement albums", "discogs", "musique", "collection albums", "top albums"],
  authors: [{ name: "ListOmania" }],
  creator: "ListOmania",
  publisher: "ListOmania",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "ListOmania - Créez et partagez vos listes d'albums musicaux",
    description: "Créez, organisez et partagez vos listes d'albums musicaux préférés. Importez depuis Discogs, classez vos albums par période et découvrez les listes de la communauté.",
    siteName: "ListOmania",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ListOmania - Vos listes d'albums musicaux"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ListOmania - Créez et partagez vos listes d'albums musicaux",
    description: "Créez, organisez et partagez vos listes d'albums musicaux préférés.",
    images: ["/og-image.jpg"]
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
    // À compléter avec vos codes de vérification
    // google: 'votre-code-google',
    // yandex: 'votre-code-yandex',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
