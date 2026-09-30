import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

// This route is the redirect target after Google OAuth consent.
// Supabase sends the user here with a code in the URL.
// We exchange that code for a session, then redirect to the dashboard.
export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Listen for the auth state change (triggered automatically when Supabase parses the URL)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || session) {
        navigate({ to: "/", replace: true });
      }
    });

    // 2. Check for explicit errors in the URL (e.g. from Google OAuth misconfiguration)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    
    if (hashParams.get("error") || searchParams.get("error")) {
      const errorDescription = 
        hashParams.get("error_description") || 
        searchParams.get("error_description") || 
        "Unknown error";
      console.error("Auth error from provider:", errorDescription);
      navigate({ to: "/sign-up", replace: true });
      return;
    }

    // 3. Fallback: give Supabase a few seconds to process before giving up
    const timeoutId = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.error("Auth timeout: No session established after 3 seconds.");
        navigate({ to: "/sign-up", replace: true });
      }
    }, 3000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
