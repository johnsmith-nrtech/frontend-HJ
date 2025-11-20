"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Linkedin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);

    // Show success animation
    setIsSubscribed(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setEmail("");
      setIsSubscribed(false);
    }, 3000);
  };

  return (
    <footer>
      {/* Newsletter Section */}
      <div className="bg-light-blue relative z-40 mx-auto mt-10 mb-[-60px] min-h-[300px] w-[95%] min-w-[95%] overflow-hidden rounded-xl px-4 py-8 md:mb-[-100px] md:h-[425px] md:rounded-4xl md:px-8 md:py-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/footer-img.png"
            alt="Footer Background"
            fill
            className="rounded-xl object-cover md:rounded-4xl"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h1 className="font-bebas text-dark-gray mb-4 text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            SUBSCRIBE TO GET OUR
            <br />
            LATEST DEALS
          </h1>
          <p className="font-open-sans text-gray mb-6 px-4 text-sm md:mb-8 md:px-0 md:text-base">
            Sign up today and be the first to grab our latest offers, give
            customized orders, special discounts, and exclusive sofa steals
            before anyone else.
          </p>

          {/* Email Subscription Form */}
          <form
            onSubmit={handleSubmit}
            className="relative z-20 mx-auto max-w-sm md:max-w-md"
          >
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="focus:border-blue font-open-sans relative z-30 w-full rounded-full border border-[#222222] bg-[#DDE9F4] px-4 py-3 pr-14 text-sm focus:outline-none md:px-6 md:py-4 md:pr-16 md:text-base"
                required
                disabled={isSubscribed}
              />
              <AnimatePresence mode="wait">
                {!isSubscribed && (
                  <motion.button
                    type="submit"
                    className="bg-blue hover:bg-blue/90 absolute top-1 right-1 z-40 flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors md:top-2 md:right-2 md:h-10 md:w-10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {isSubscribed && (
              <motion.div
                className="font-open-sans absolute inset-0 z-30 flex items-center justify-center rounded-full bg-green-500 font-medium text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                ✓ Subscribed Successfully!
              </motion.div>
            )}
          </form>
        </div>
      </div>
      {/* Main Footer Section */}
      <div className="bg-blue relative min-h-[450px] py-8 text-white md:py-12 2xl:h-[450px]">
        <div className="px-[32px] pt-16 md:pt-24 lg:absolute lg:right-0 lg:bottom-4 lg:left-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4 md:space-y-6">
              <Link href="/" className="inline-block">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-24 md:h-10 md:w-32">
                    <Image
                      src="/logo.png"
                      alt="Sofa Deal"
                      fill
                      className="object-cover brightness-0 invert filter"
                      priority
                    />
                  </div>
                </div>
              </Link>

              <p className="font-open-sans text-sm leading-relaxed text-white/80">
                Relax, shop, and save with Sofa Deal. Your go-to store for
                unbeatable sofa offers. Quality, comfort, and value delivered
                right to your door.
              </p>
            </div>

            <div className="flex justify-between">
              {/* Links Column */}
              <div>
                <h3 className="font-open-sans mb-4 text-lg font-semibold tracking-wider text-white uppercase md:mb-6 md:text-xl">
                  LINKS
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/products"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Sofa Type
                  </Link>
                  <Link
                    href="/products"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Sofa Size
                  </Link>
                  <Link
                    href="/products"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Materials
                  </Link>
                  <Link
                    href="/products"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    All Products
                  </Link>
                </div>
              </div>

              {/* Resources Column */}
              <div>
                <h3 className="font-open-sans mb-4 text-lg font-semibold tracking-wider text-white uppercase md:mb-6 md:text-xl">
                  RESOURCES
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/terms"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Terms & Conditions
                  </Link>
                  <Link
                    href="/privacy"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/returns"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Return & Refund Policy
                  </Link>
                  <Link
                    href="/cookies"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Cookies Policy
                  </Link>
                  <Link
                    href="/legal-advisory"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Legal Advisory
                  </Link>
                  <Link
                    href="/user-data-protection"
                    className="font-open-sans block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    User Data Protection
                  </Link>
                </div>
              </div>
            </div>

            {/* Get In Touch Column */}
            <div>
              <h3 className="font-open-sans mb-4 text-lg font-semibold tracking-wider text-white uppercase md:mb-6 md:text-xl">
                GET IN TOUCH
              </h3>
              <p className="font-open-sans mb-6 text-sm text-white/80">
                You&apos;ll Find Your Next Marketing Value You Prefer.
              </p>

              {/* Social Media Icons */}
              <div className="flex space-x-3">
                <motion.a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-white/90"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Facebook size={18} />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-white/90"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter size={18} />
                </motion.a>
                <motion.a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-white/90"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin size={18} />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="col-span-1 mt-8 border-t border-white/20 pt-6 text-center sm:col-span-2 md:mt-12 md:pt-8 lg:col-span-4">
            <p className="font-open-sans text-xs text-white/60 md:text-sm">
              Copyright 2025. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
