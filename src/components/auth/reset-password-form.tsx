"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Split layout Reset Password page that preserves your original functionality
 */
function ResetPasswordForm() {
  // Keep your original form functionality
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we have a hash in the URL, which means the user came from a password reset email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");

    if (type !== "recovery") {
      toast.error("Invalid reset link");
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const infoVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.3,
      },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Left side: Reset Password Form */}
        <motion.div
          className="w-full p-8 md:w-1/2 lg:p-12"
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="mb-10">
            <motion.div variants={itemVariants} className="flex justify-start">
              <div className="mb-6 flex items-center">
                <div className="relative mr-2 h-10 w-32">
                  <Image
                    src="/logo.png"
                    alt="Sofa Deal"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>

            <motion.h1 className="mb-2 text-2xl" variants={itemVariants}>
              Create new password
            </motion.h1>
            <motion.p className="text-sm text-gray-500" variants={itemVariants}>
              Enter a strong password for your account
            </motion.p>
          </div>

          <motion.div variants={formVariants} className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2"
                >
                  <Button
                    disabled={isLoading}
                    type="submit"
                    className="bg-blue hover:bg-blue/90 w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue hover:text-dark-gray hover:underline"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side: Password Helper */}
        <motion.div
          className="hidden bg-[#E6F2FC] p-8 md:block md:w-1/2 lg:p-12"
          initial="hidden"
          animate="visible"
          variants={infoVariants}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <h2 className="font-bebas text-dark-gray mb-6 text-2xl font-bold">
                Strong Password Guidelines
              </h2>

              <div className="mb-8 space-y-6">
                <div className="rounded-lg bg-white/80 p-6">
                  <h3 className="font-bebas text-dark-gray mb-3 text-lg font-medium">
                    Create a secure password
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg
                        className="text-blue mt-0.5 mr-2 h-5 w-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Use at least 8 characters</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="text-blue mt-0.5 mr-2 h-5 w-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Include uppercase and lowercase letters</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="text-blue mt-0.5 mr-2 h-5 w-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Add numbers and special characters</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="text-blue mt-0.5 mr-2 h-5 w-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Avoid common words or phrases</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-white/80 p-6">
                  <h3 className="font-bebas text-dark-gray mb-3 text-lg font-medium">
                    Password strength example
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-red-600">
                          Weak
                        </span>
                        <span className="text-sm text-gray-500">
                          example123
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                        <div
                          className="h-1.5 rounded-full bg-red-500"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-yellow-600">
                          Medium
                        </span>
                        <span className="text-sm text-gray-500">
                          Example123!
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                        <div
                          className="h-1.5 rounded-full bg-yellow-500"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-600">
                          Strong
                        </span>
                        <span className="text-sm text-gray-500">
                          Ex@mple123!$
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                        <div
                          className="h-1.5 rounded-full bg-green-500"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="rounded-lg bg-white/60 p-6">
                <div className="flex items-center">
                  <LockKeyhole className="text-dark-gray mr-3 h-8 w-8" />
                  <div>
                    <h4 className="font-bebas text-dark-gray font-semibold">
                      Your security matters
                    </h4>
                    <p className="text-sm text-gray-600">
                      A strong password helps protect your personal information
                      and ensures only you can access your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
