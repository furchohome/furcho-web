import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://furcho.in";
  const products = await getProducts();

  const staticRoutes = [
    "",
    "/kitchen",
    "/bedroom",
    "/home-accessories",
    "/cart",
    "/checkout",
    "/premium",
    "/premium/bedroom",
    "/premium/dining",
    "/premium/sit-out",
    "/premium/custom-enquiry",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/shipping-policy",
    "/return-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" || route === "/premium" ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: p.is_featured ? 0.95 : 0.75,
  }));

  return [...staticRoutes, ...productRoutes];
}
