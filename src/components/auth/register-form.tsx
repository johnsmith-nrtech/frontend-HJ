"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  UserPlus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import Image from "next/image";

const RegisterPage = () => {
  const router = useRouter();
  const { signUp } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Show success message
      setSuccess(true);

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Variants for animations
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
        {/* Left side: Register Form */}
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
              Create an account
            </motion.h1>
            <motion.p className="text-sm text-gray-500" variants={itemVariants}>
              Get access to exclusive offers and faster checkout
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={itemVariants}
          >
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={isLoading}
                    required
                    className="focus:border-blue focus:ring-blue w-full rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="*************"
                    disabled={isLoading}
                    required
                    className="focus:border-blue focus:ring-blue w-full rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
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
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="*************"
                    disabled={isLoading}
                    required
                    className="focus:border-blue focus:ring-blue w-full rounded-md border border-gray-300 px-3 py-2 pl-10 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="text-blue accent-blue h-4 w-4 rounded border-gray-300 focus:ring-0"
                  style={{
                    accentColor: "#1b6db4",
                  }}
                  required
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-600"
                >
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="text-blue hover:text-dark-gray hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-blue hover:text-dark-gray hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {error && (
                <div className="mb-4 flex items-start rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <AlertCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-start rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                  <CheckCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    Account created successfully! Redirecting you to login...
                  </p>
                </div>
              )}

              <motion.div
                className="pt-2"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  disabled={isLoading || success}
                  type="submit"
                  className={`flex w-full items-center justify-center gap-2 rounded-md py-2.5 font-medium text-white ${isLoading || success ? "bg-blue/80" : "bg-blue hover:bg-blue/90"}`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating account...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Account Created
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          </motion.form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg
                  className="mr-2 h-5 w-5 text-black"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue hover:text-dark-gray font-medium hover:underline"
            >
              Sign in
            </a>
          </p>
        </motion.div>

        {/* Right side: Furniture Info */}
        <motion.div
          className="bg-light-blue hidden p-8 md:block md:w-1/2 lg:p-12"
          initial="hidden"
          animate="visible"
          variants={infoVariants}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              {/* Hero Image */}
              <div className="bg-blue relative mb-6 h-48 w-full overflow-hidden rounded-xl">
                <Image
                  src="/product-img.png"
                  alt="Exclusive Member Benefits"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <h2 className="font-bebas text-dark-gray mb-4 text-3xl leading-tight font-bold">
                Join the SOFA DEAL Family
              </h2>
              <p className="mb-8 leading-relaxed text-gray-700">
                Create your account today and unlock exclusive member benefits,
                personalized recommendations, and priority access to our latest
                collections.
              </p>

              <div className="mb-8 space-y-5">
                {/* <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full bg-white p-2.5 shadow-sm">
                    <svg
                      className="text-blue h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bebas text-dark-gray text-lg font-medium">
                      Exclusive Member Pricing
                    </h3>
                    <p className="text-sm text-gray-600">
                      Save up to 25% with member-only discounts and early access
                      to sales
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full bg-white p-2.5 shadow-sm">
                    <svg
                      className="text-blue h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bebas text-dark-gray text-lg font-medium">
                      Express Checkout
                    </h3>
                    <p className="text-sm text-gray-600">
                      One-click purchasing with saved payment methods and
                      addresses
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full bg-white p-2.5 shadow-sm">
                    <svg
                      className="text-blue h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bebas text-dark-gray text-lg font-medium">
                      Personal Wishlist
                    </h3>
                    <p className="text-sm text-gray-600">
                      Save favorites and get notified when items go on sale
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full bg-white p-2.5 shadow-sm">
                    <svg
                      className="text-blue h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bebas text-dark-gray text-lg font-medium">
                      Order Protection
                    </h3>
                    <p className="text-sm text-gray-600">
                      Real-time tracking and comprehensive purchase protection
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="mt-auto">
              <div className="rounded-xl border border-gray-100 bg-white/90 p-6 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="from-blue to-light-blue mb-4 rounded-full bg-gradient-to-br p-3">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bebas text-dark-gray mb-3 text-xl font-bold">
                    Your Privacy is Protected
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Bank-level security encryption protects your personal
                    information. We never share your data with third parties and
                    you maintain full control over your privacy settings.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
