"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./providers/auth-provider";
import { Loader } from "@/components/ui/loader";

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = "/login"
) {
  return function WithAuth(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader />
        </div>
      );
    }

    if (!user) {
      router.push(redirectTo);
      return null;
    }

    return <Component {...props} />;
  };
}
