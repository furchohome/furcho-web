import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie, getAdminSession, setAdminSessionCookie } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({ session });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data.user) {
          const sessionData = {
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || "Furcho Admin",
            role: "ADMIN" as const,
            authProvider: "SUPABASE" as const,
          };
          await setAdminSessionCookie(sessionData);
          return NextResponse.json({ session: sessionData });
        }
      }
    }

    // 2. Verify against configured Admin Environment Credentials
    const expectedEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@furcho.in";
    const expectedPassword = process.env.ADMIN_DEFAULT_PASSWORD || "FurchoAdmin@2026";

    if (
      email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
      password === expectedPassword
    ) {
      const sessionData = {
        email: expectedEmail,
        name: "Furcho Store Administrator",
        role: "ADMIN" as const,
        authProvider: "LOCAL_ENV" as const,
      };
      await setAdminSessionCookie(sessionData);
      return NextResponse.json({ session: sessionData });
    }

    return NextResponse.json(
      { error: "Invalid administrator email or password." },
      { status: 401 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
