import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { getSiteSettings } from "@/lib/db";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Headings, navigation, buttons, product titles & prices
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Body text, descriptions, labels & general content
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://furcho.in"),
  title: {
    default: "FURCHO® — Furniture For A Better Living | Kerala, India",
    template: "%s | FURCHO® Kerala",
  },
  description:
    "Thoughtful furniture and smart home solutions for modern living in Kerala. Shop Everyday Living space-saving furniture including the Foldable Wall-Mounted Ironing Table at ₹2,999, or explore Premium Living bespoke wooden furniture.",
  keywords: [
    "Furcho",
    "Furcho Kerala",
    "Foldable Wall-Mounted Ironing Table",
    "Space saving furniture Kerala",
    "Solid wood furniture Kozhikode",
    "Custom furniture Kerala",
    "Restaurant furniture Kerala",
  ],
  openGraph: {
    title: "FURCHO® — Furniture For A Better Living",
    description:
      "Launch Offer: Foldable Wall-Mounted Ironing Table at ₹2,999. Explore Everyday Living & Premium Living furniture across Kerala.",
    url: "https://furcho.in",
    siteName: "FURCHO",
    images: [
      {
        url: "/images/products/ironing-table-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Furcho Foldable Wall-Mounted Ironing Table",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-sans bg-[#FAF5ED] text-[#29221D] antialiased selection:bg-[#633719] selection:text-white">
        <MetaPixel pixelId={settings.meta_pixel_id} />
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
