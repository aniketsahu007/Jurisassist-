import { createFileRoute, redirect } from "@tanstack/react-router";
import SignUpPage from "@/features/auth/SignUpPage";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/sign-up")({
  // If already authenticated, bounce to dashboard
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: SignUpPage,
});
