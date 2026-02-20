"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/services/session-manager";
import { AuthApiService } from "@/lib/services/auth-api";
import { useAuth } from "@/lib/providers/auth-provider";
import { useCart } from "@/lib/store/cart-store";

export default function Page() {
  const router = useRouter();

  const { setSession, setUser } = useAuth();

  const { syncCartWithServerAfterLogin } = useCart();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the hash from the URL
      const rawHash = window.location.hash || ""; // "#access_token=..."
      const hashStr = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;

      // Parse hash like query string
      const params = new URLSearchParams(hashStr);
      const body = Object.fromEntries(params.entries());

      // Store session locally if access_token exists
      if (body["access_token"]) {
        const expiresIn = parseInt(body["expires_in"] || "0", 10);
        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

        const authResponse = await AuthApiService.getUserFromToken(
          body["access_token"],
          body["refresh_token"]
        );

        SessionManager.setSession({
          access_token: body["access_token"],
          refresh_token: body["refresh_token"] || "",
          expires_at: expiresAt * 1000, // convert to ms
          user: authResponse,
        });

        setSession({
          access_token: body["access_token"],
          refresh_token: body["refresh_token"] || "",
          expires_at: expiresAt * 1000, // convert to ms
          user: authResponse,
        });

        setUser(authResponse);
      }

      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      const loginSource = localStorage.getItem("loginSource");

      await syncCartWithServerAfterLogin();

      setTimeout(() => {
        if (redirectUrl && loginSource === "cart-checkout") {
          // Redirect back to cart with step parameter
          router.replace(redirectUrl);
        } else if (redirectUrl) {
          // General redirect
          router.replace(redirectUrl);
        } else {
          // Default redirect to home
          router.replace("/");
        }
      }, 500);
    };

    handleCallback();
  }, [router, setSession, setUser, syncCartWithServerAfterLogin]);

  return (
    <div className="flex h-screen items-center justify-center">
      Logging in...
    </div>
  );
}
