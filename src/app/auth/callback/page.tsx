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
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-4 w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          {/* Success icon with animation */}
          <div className="relative mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-r from-green-400 to-blue-500 shadow-lg">
              <svg
                className="h-10 w-10 animate-bounce text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="absolute -inset-2">
              <div className="mx-auto h-24 w-24 animate-spin rounded-full border-4 border-green-200 border-t-green-500"></div>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Authentication Successful!
            </h1>
            <p className="text-gray-600">
              We are securely logging you in and setting up your session.
            </p>

            {/* Loading steps */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-3 text-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-gray-700">Verifying credentials</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-sm">
                <div
                  className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <span className="text-gray-700">Syncing your cart</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-sm">
                <div
                  className="h-2 w-2 animate-pulse rounded-full bg-purple-500"
                  style={{ animationDelay: "0.6s" }}
                ></div>
                <span className="text-gray-700">Redirecting you</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-full animate-pulse rounded-full bg-linear-to-r from-green-500 to-blue-500"></div>
              </div>
            </div>

            {/* Loading animation */}
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-1">
                <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
                <div
                  className="h-3 w-3 animate-bounce rounded-full bg-blue-500"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="h-3 w-3 animate-bounce rounded-full bg-blue-500"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Footer message */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500">
              Please wait while we complete the login process...
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 h-20 w-20 animate-ping rounded-full bg-blue-200 opacity-20"></div>
        <div
          className="absolute right-10 bottom-10 h-16 w-16 animate-ping rounded-full bg-purple-200 opacity-20"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
}
