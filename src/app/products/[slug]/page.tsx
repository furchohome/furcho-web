import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getSiteSettings } from "@/lib/db";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { paiseToRupees } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product Not Found | FURCHO®" };
  }

  const primaryImage =
    product.images.find((i) => i.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    "/images/products/ironing-table-hero.jpg";

  return {
    title: `${product.name} — ₹${paiseToRupees(product.selling_price_paise).toLocaleString("en-IN")}`,
    description: product.short_description || product.description,
    openGraph: {
      title: `${product.name} | FURCHO®`,
      description: product.short_description,
      images: [{ url: primaryImage }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, product] = await Promise.all([
    getSiteSettings(),
    getProductBySlug(slug),
  ]);

  if (!product) {
    notFound();
  }

  const allSectionProducts = await getProducts({ section: product.store_section });
  const relatedProducts = allSectionProducts.filter((p) => p.id !== product.id);

  // JSON-LD Structured Data for Google & Meta Ads Catalog
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: product.images.map((i) => i.image_url),
    brand: {
      "@type": "Brand",
      name: "FURCHO",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: paiseToRupees(product.selling_price_paise),
      availability:
        product.availability_status === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header settings={settings} variant={product.store_section} />
      <main className="flex-1">
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
          settings={settings}
        />
      </main>
      <Footer settings={settings} variant={product.store_section} />
    </div>
  );
}
