"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Package } from "lucide-react";
import { Button } from "@/components/button-custom";

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // const floatingVariants = {
  //   animate: {
  //     y: [-10, 10, -10],
  //     transition: {
  //       duration: 3,
  //       repeat: Infinity,
  //       ease: "easeInOut",
  //     },
  //   },
  // };

  return (
    <div className="from-background via-secondary/20 to-background mt-10 flex min-h-screen items-center justify-center bg-gradient-to-br px-4 py-12 lg:mt-0">
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8">
          <Link href="/" className="inline-block">
            <div className="relative mx-auto h-12 w-40">
              <Image
                src="/logo.png"
                alt="Sofa Deal"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </motion.div>

        {/* Floating Sofa Icon */}
        {/* <motion.div
          variants={floatingVariants}
          animate="animate"
          className="mb-8"
        >
          <div className="bg-primary/10 relative mx-auto flex h-32 w-32 items-center justify-center rounded-full">
            <Sofa className="text-primary h-16 w-16" />
          </div>
        </motion.div> */}

        {/* 404 Text */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="font-bebas text-primary text-8xl leading-none md:text-9xl lg:text-[12rem]">
            404
          </h1>
        </motion.div>

        {/* Main Message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="font-bebas text-foreground mb-4 text-3xl md:text-4xl lg:text-5xl">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
            It looks like the page you&apos;re looking for has been moved,
            deleted, or doesn&apos;t exist. Don&apos;t worry, let&apos;s get you
            back to finding the perfect furniture for your home.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            href="/"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            icon={<Home className="h-5 w-5" />}
            iconPosition="left"
          >
            Back to Home
          </Button>

          <Button
            href="/products"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            icon={<Package className="h-5 w-5" />}
            iconPosition="left"
          >
            Browse Products
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          variants={itemVariants}
          className="border-border border-t pt-8"
        >
          <p className="text-muted-foreground mb-4 font-medium">
            Or try one of these popular sections:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              All Products
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/about-us"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              About Us
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/contact-us"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              Contact Us
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/cart"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              Shopping Cart
            </Link>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/5 absolute top-1/4 left-1/4 h-32 w-32 rounded-full blur-xl"></div>
          <div className="bg-secondary/30 absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full blur-2xl"></div>
          <div className="bg-accent/20 absolute top-3/4 left-1/3 h-24 w-24 rounded-full blur-lg"></div>
        </div>
      </motion.div>
    </div>
  );
}
