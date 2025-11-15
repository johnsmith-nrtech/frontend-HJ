"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "custom-order"
    | "ghost"
    | "destructive"
    | "main";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = "right",
  rounded = "md",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-open-sans font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent";

  const variants = {
    primary: "bg-blue text-white hover:bg-blue/90 focus:ring-blue shadow-sm",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border-gray-300",
    outline:
      "!border-1 !border-[#1B6DB4] hover:border-[#222222] text-[#1B6DB4] bg-transparent hover:bg-[#1B6DB4] hover:text-[#222] focus:ring-[#1B6DB4]",
    "custom-order":
      "bg-[#1B6DB4] text-white hover:bg-[#1B6DB4]/90 focus:ring-[#1B6DB4] shadow-lg",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    main: "bg-blue w-[140px] h-[40px] text-sm md:w-[172px] md:h-[57px] md:text-base text-white hover:bg-[#1B6DB4]/90 focus:ring-[#1B6DB4]",
  };

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-6 py-3 text-lg ",
    xxl: "px-6 py-3 text-2xl",
  };

  const roundedStyles = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${roundedStyles[rounded]}
    ${fullWidth ? "w-full" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  const buttonContent = (
    <>
      {icon && iconPosition === "left" && (
        <span className="mr-2 flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="ml-2 flex-shrink-0">{icon}</span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="inline-block">
        <motion.button
          className={buttonClasses}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={disabled}
          onClick={onClick}
        >
          {buttonContent}
        </motion.button>
      </Link>
    );
  }

  return (
    <motion.button
      className={buttonClasses}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      onClick={onClick}
    >
      {buttonContent}
    </motion.button>
  );
}
