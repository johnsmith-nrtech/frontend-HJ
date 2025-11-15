"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Split layout Forgot Password page that preserves your original reset password functionality
 */
function ForgotPasswordForm() {
  // Keep your original form functionality
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast.error(error.message);
        return;
      }
      setIsSuccess(true);
      toast.success("Password reset link sent to your email");
    } catch {
      toast.error("Failed to send reset link");
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

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Left side: Forgot Password Form */}
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
              Reset your password
            </motion.h1>
            <motion.p className="text-sm text-gray-500" variants={itemVariants}>
              Enter your email and we&apos;ll send you a link to reset your
              password
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                className="flex flex-col items-center space-y-6 py-8 text-center"
                variants={successVariants}
                initial="hidden"
                animate="visible"
                key="success"
              >
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="space-y-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    We&apos;ve sent a password reset link to your email.
                  </p>
                  <p className="text-sm">
                    Check your email and follow the instructions to reset your
                    password.
                  </p>
                  <Link
                    href="/login"
                    className="text-primary inline-flex items-center hover:underline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -10 }}
                variants={formVariants}
                className="grid gap-6"
              >
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          disabled={isLoading}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        disabled={isLoading}
                        type="submit"
                        className="bg-blue hover:bg-blue/90 w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader size="sm" className="mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Send Reset Link
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
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right side: Helper Info */}
        <motion.div
          className="hidden bg-[#E6F2FC] p-8 md:block md:w-1/2 lg:p-12"
          initial="hidden"
          animate="visible"
          variants={infoVariants}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <h2 className="font-bebas text-dark-gray mb-6 text-2xl font-bold">
                Password Recovery Help
              </h2>

              <div className="mb-8 space-y-6">
                <div className="rounded-lg bg-white/80 p-6">
                  <h3 className="font-bebas text-dark-gray mb-3 text-lg font-medium">
                    Password Reset Instructions
                  </h3>
                  <ol className="list-inside list-decimal space-y-3 text-gray-700">
                    <li>Enter your registered email address</li>
                    <li>Check your inbox for the reset link</li>
                    <li>Click the link in the email</li>
                    <li>Create a new secure password</li>
                  </ol>
                </div>

                <div className="rounded-lg bg-white/80 p-6">
                  <h3 className="font-bebas text-dark-gray mb-3 text-lg font-medium">
                    Trouble Receiving the Email?
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Check your spam or junk folder</span>
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Make sure the email address is correct</span>
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Wait a few minutes &ndash; emails may be delayed
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="rounded-lg bg-white/60 p-6">
                <div className="mb-4 flex items-center">
                  <svg
                    className="text-dark-gray mr-3 h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-bebas text-dark-gray font-semibold">
                      Need Additional Help?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Our customer support team is available 7 days a week
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-blue text-blue hover:bg-blue hover:text-dark-gray w-full"
                  asChild
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
