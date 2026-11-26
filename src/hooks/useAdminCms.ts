"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banner, Category, Product, SiteSettings } from "@/types/database";

export interface AdminCmsResponse {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  site_settings: SiteSettings | null;
}

export const ADMIN_CMS_QUERY_KEY = ["admin-cms"] as const;

export function useAdminCms() {
  const queryClient = useQueryClient();

  const query = useQuery<AdminCmsResponse>({
    queryKey: ADMIN_CMS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/admin/cms");
      if (res.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(`Failed to load CMS data: ${res.statusText}`);
      }
      return res.json();
    },
    staleTime: 60 * 1000, // 60s fresh in cache for instant tab transitions
  });

  const invalidate = async () => {
    return queryClient.invalidateQueries({ queryKey: ADMIN_CMS_QUERY_KEY });
  };

  return {
    ...query,
    invalidate,
    banners: query.data?.banners || [],
    products: query.data?.products || [],
    categories: query.data?.categories || [],
    settings: query.data?.site_settings || null,
  };
}
