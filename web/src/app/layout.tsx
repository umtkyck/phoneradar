import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://phoneradar.vercel.app'),
  title: {
    default: "PhoneRadar - FLIR One Benzeri BLE Radar",
    template: "%s | PhoneRadar",
  },
  description: "Telefona takılan BLE radar cihazı - FLIR One benzeri termal ve radar görüntüleme. Web, iOS ve Android desteği.",
  keywords: [
    "radar",
    "thermal imaging",
    "BLE",
    "bluetooth",
    "FLIR One",
    "PhoneRadar",
    "termal kamera",
    "radar cihazı",
    "mobile",
    "web bluetooth",
  ],
  authors: [{ name: "PhoneRadar Team" }],
  creator: "PhoneRadar",
  publisher: "PhoneRadar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://phoneradar.vercel.app",
    title: "PhoneRadar - FLIR One Benzeri BLE Radar",
    description: "Telefona takılan BLE radar cihazı - Gerçek zamanlı termal ve radar görüntüleme",
    siteName: "PhoneRadar",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PhoneRadar - BLE Radar & Thermal Imaging",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PhoneRadar - FLIR One Benzeri BLE Radar",
    description: "Telefona takılan BLE radar cihazı - Gerçek zamanlı termal ve radar görüntüleme",
    images: ["/twitter-image"],
    creator: "@phoneradar",
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
  icons: {
    icon: [
      { url: "/icon" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon" },
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PhoneRadar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
