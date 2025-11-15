"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, KeyRound, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/providers/auth-provider";

// Mock data - Replace with actual auth functions/router in your implementation
const LoginPage = () => {
  const router = useRouter();
  const { signIn, signInWithSocial } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSocialLogin = async (strategy: "google" | "facebook") => {
    try {
      setIsLoading(true);
      await signInWithSocial(strategy);
    } catch (err) {
      console.log(err);
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      // Success animation before redirect
      toast.success("Logged in successfully");

      // Check for redirect after login
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      const loginSource = localStorage.getItem("loginSource");

      // Small delay for smooth transition
      setTimeout(() => {
        if (redirectUrl && loginSource === "cart-checkout") {
          // Redirect back to cart with step parameter
          router.push(redirectUrl);
        } else if (redirectUrl) {
          // General redirect
          router.push(redirectUrl);
        } else {
          // Default redirect to home
          router.push("/");
        }
      }, 500);
    } catch {
      toast.error("Failed to log in");
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
        {/* Left side: Login Form */}
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
              Welcome back
            </motion.h1>
            <motion.p className="text-sm text-gray-500" variants={itemVariants}>
              Please sign in to your account
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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-blue hover:text-dark-gray text-xs font-medium hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
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
              </div>

              <motion.div
                className="pt-2"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  disabled={isLoading}
                  type="submit"
                  className={`flex w-full items-center justify-center gap-2 rounded-md py-2.5 font-medium text-white ${
                    isLoading
                      ? "bg-blue text-white"
                      : "bg-blue hover:bg-blue/90"
                  }`}
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
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
              <button
                onClick={() => handleSocialLogin("google")}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
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
              <button
                onClick={() => handleSocialLogin("facebook")}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
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
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-blue hover:text-dark-gray font-medium hover:underline"
            >
              Create an account
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
                  src="/hero-img.png"
                  alt="Premium Furniture Collection"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <h2 className="font-bebas text-dark-gray mb-4 text-3xl leading-tight font-bold">
                Transform Your Living Space
              </h2>
              <p className="mb-8 leading-relaxed text-gray-700">
                Discover premium furniture crafted for comfort, style, and
                durability. From luxurious sofas to elegant dining sets, create
                the home of your dreams with SOFA DEAL&apos;s curated
                collection.
              </p>

              <div className="mb-8 space-y-5">
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bebas text-dark-gray text-lg font-medium">
                      Free White Glove Delivery
                    </h3>
                    <p className="text-sm text-gray-600">
                      Professional delivery and setup service included with
                      every purchase
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bebas text-dark-gray text-lg font-medium">
                      365-Day Home Trial
                    </h3>
                    <p className="text-sm text-gray-600">
                      Experience your furniture at home for a full year with our
                      satisfaction guarantee
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bebas text-dark-gray text-lg font-medium">
                      Lifetime Warranty
                    </h3>
                    <p className="text-sm text-gray-600">
                      Comprehensive coverage on frame and construction for
                      complete peace of mind
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="mt-auto">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center">
                  <div className="from-blue to-light-blue mr-4 h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200">
                      <span className="font-bebas text-blue text-lg font-bold">
                        MR
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bebas text-dark-gray text-lg font-semibold">
                      Michael Rodriguez
                    </h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-4 w-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-xs text-gray-500">
                        Verified Purchase
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-600 italic">
                  &quot;Absolutely transformed our living room! The quality
                  exceeded expectations and the delivery team was incredibly
                  professional. SOFA DEAL made furniture shopping effortless and
                  enjoyable.&quot;
                </p>
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Add this to your global CSS or tailwind config

export default LoginPage;
