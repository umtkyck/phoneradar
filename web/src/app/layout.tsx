import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhoneRadar - FLIR One Radar Card",
  description: "BLE bağlantılı radar cihazı arayüzü",
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
