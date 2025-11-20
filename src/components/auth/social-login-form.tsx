"use client";

import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";

export default function SocialLogin() {
  const { signIn } = useSignIn();

  const handleSocialLogin = async (
    strategy: "oauth_google" | "oauth_facebook"
  ) => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/after-social",
      });
    } catch (err) {
      console.error("Social login error:", err);
      toast.error("Social login failed");
    }
  };

  return (
    <div className="flex gap-3">
      <button
        className="rounded-md border px-4 py-2"
        onClick={() => handleSocialLogin("oauth_google")}
      >
        Google
      </button>
      <button
        className="rounded-md border px-4 py-2"
        onClick={() => handleSocialLogin("oauth_facebook")}
      >
        Facebook
      </button>
    </div>
  );
}
