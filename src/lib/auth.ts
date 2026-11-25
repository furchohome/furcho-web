import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/client";

const ADMIN_COOKIE_NAME = "furcho_admin_session";

export interface AdminUserSession {
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
  authProvider: "SUPABASE" | "LOCAL_ENV";
}

export async function getAdminSession(): Promise<AdminUserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (sessionToken) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf-8"));
      if (decoded?.email && decoded?.role) {
        return decoded as AdminUserSession;
      }
    } catch {
      // Invalid token
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          return {
            email: user.email,
            name: user.user_metadata?.full_name || "Furcho Administrator",
            role: "ADMIN",
            authProvider: "SUPABASE",
          };
        }
      }
    } catch {
      // Ignore auth check errors
    }
  }

  return null;
}

export async function setAdminSessionCookie(session: AdminUserSession) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(session), "utf-8").toString("base64");
  cookieStore.set(ADMIN_COOKIE_NAME, encoded, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
