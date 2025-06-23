import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farlinker - Better Farcaster Link Previews",
  description: "Get better link previews for Farcaster posts when sharing on social media",
  openGraph: {
    title: "Farlinker - Better Farcaster Link Previews",
    description: "Get better link previews for Farcaster posts when sharing on social media",
    url: "https://farlinker.xyz",
    siteName: "Farlinker",
    images: [
      {
        url: "/apple_messages_farlinker.png",
        width: 800,
        height: 600,
        alt: "Farlinker preview example",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farlinker - Better Farcaster Link Previews",
    description: "Get better link previews for Farcaster posts when sharing on social media",
    images: ["/apple_messages_farlinker.png"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/farlinker.png', type: 'image/png' }
    ],
    apple: '/farlinker.png',
    other: [
      {
        rel: 'icon',
        url: '/farlinker.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
