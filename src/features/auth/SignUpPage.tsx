import { Scale } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";

// Google's official brand color SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo + branding */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              jurisAssist
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              AI Legal Intelligence Platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">Sign in to your workspace</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Continue with your Google account to access your cases, documents,
            and AI tools.
          </p>

          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            variant="outline"
            className="w-full gap-3"
            id="google-sign-in-btn"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to jurisAssist&apos;s terms of service.
        </p>
      </div>
    </div>
  );
}
