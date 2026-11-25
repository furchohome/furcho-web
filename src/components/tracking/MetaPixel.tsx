"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Meta Pixel Tracking Dispatcher
 * IMPORTANT: Submitting an order request does NOT automatically fire 'Purchase'.
 * Only fires 'Lead' on order request or enquiry submission.
 * 'Purchase' is reserved strictly for admin-confirmed paid orders.
 */
export function trackMetaEvent(
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Lead" | "Purchase",
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  }
}

export function MetaPixel({ pixelId }: { pixelId?: string }) {
  const pathname = usePathname();
  const activePixelId = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (activePixelId) {
      trackMetaEvent("PageView");
    }
  }, [pathname, activePixelId]);

  if (!activePixelId) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${activePixelId}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}
