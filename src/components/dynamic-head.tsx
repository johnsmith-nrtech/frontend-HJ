"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

const getPageMetadata = (pathname: string): PageMetadata => {
  const baseTitle = "Sofa Deal";
  const baseDescription =
    "Premium furniture and sofas with exceptional quality and design. Shop our collection of modern and classic furniture pieces.";

  switch (pathname) {
    case "/":
      return {
        title: `${baseTitle} - Premium Furniture & Sofas`,
        description: baseDescription,
        keywords:
          "furniture, sofas, home decor, premium furniture, modern sofas, classic furniture",
        ogImage: "/hero-img.png",
      };

    case "/products":
      return {
        title: `Products - ${baseTitle}`,
        description:
          "Browse our extensive collection of premium furniture and sofas. Find the perfect piece for your home.",
        keywords:
          "furniture products, sofa collection, home furniture, premium sofas",
        ogImage: "/product-img.png",
      };

    case "/cart":
      return {
        title: `Shopping Cart - ${baseTitle}`,
        description: "Review your selected items and proceed to checkout.",
        keywords: "shopping cart, checkout, furniture purchase",
      };

    case "/wishlist":
      return {
        title: `Wishlist - ${baseTitle}`,
        description: "Your saved furniture items and favorite pieces.",
        keywords: "wishlist, saved items, favorite furniture",
      };

    case "/about-us":
      return {
        title: `About Us - ${baseTitle}`,
        description:
          "Learn about Sofa Deal's commitment to quality furniture and exceptional customer service.",
        keywords: "about sofa deal, furniture company, quality furniture",
      };

    case "/contact-us":
      return {
        title: `Contact Us - ${baseTitle}`,
        description:
          "Get in touch with our team for any questions about our furniture collection.",
        keywords: "contact, customer service, furniture support",
      };

    case "/login":
      return {
        title: `Login - ${baseTitle}`,
        description:
          "Sign in to your Sofa Deal account to access your orders and wishlist.",
        keywords: "login, sign in, account access",
      };

    case "/register":
      return {
        title: `Register - ${baseTitle}`,
        description:
          "Create a new Sofa Deal account to start shopping premium furniture.",
        keywords: "register, sign up, create account",
      };

    case "/forgot-password":
      return {
        title: `Forgot Password - ${baseTitle}`,
        description: "Reset your Sofa Deal account password.",
        keywords: "forgot password, password reset",
      };

    case "/reset-password":
      return {
        title: `Reset Password - ${baseTitle}`,
        description: "Set a new password for your Sofa Deal account.",
        keywords: "reset password, new password",
      };

    default:
      // Handle dynamic routes
      if (pathname.startsWith("/products/")) {
        return {
          title: `Product Details - ${baseTitle}`,
          description:
            "View detailed information about this premium furniture piece.",
          keywords: "product details, furniture specifications, sofa details",
        };
      }

      if (pathname.startsWith("/admin")) {
        return {
          title: `Admin Dashboard - ${baseTitle}`,
          description:
            "Sofa Deal admin panel for managing products and orders.",
          keywords: "admin, dashboard, management",
        };
      }

      // Handle 404 and other unknown routes
      if (pathname === "/not-found" || !pathname.startsWith("/")) {
        return {
          title: `Page Not Found - ${baseTitle}`,
          description:
            "The page you're looking for doesn't exist. Browse our premium furniture collection or return to the homepage.",
          keywords: "404, page not found, furniture, sofas, home decor",
        };
      }

      return {
        title: baseTitle,
        description: baseDescription,
        keywords: "furniture, sofas, home decor",
      };
  }
};

export function DynamicHead() {
  const pathname = usePathname();
  const [metadata, setMetadata] = useState<PageMetadata>(() =>
    getPageMetadata(pathname)
  );

  useEffect(() => {
    setMetadata(getPageMetadata(pathname));
  }, [pathname]);

  useEffect(() => {
    // Update document title
    document.title = metadata.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", metadata.description);
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = metadata.description;
      document.head.appendChild(newMetaDescription);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metadata.keywords) {
      if (metaKeywords) {
        metaKeywords.setAttribute("content", metadata.keywords);
      } else {
        const newMetaKeywords = document.createElement("meta");
        newMetaKeywords.name = "keywords";
        newMetaKeywords.content = metadata.keywords;
        document.head.appendChild(newMetaKeywords);
      }
    }

    // Update Open Graph meta tags
    const updateOrCreateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (metaTag) {
        metaTag.setAttribute("content", content);
      } else {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("property", property);
        metaTag.setAttribute("content", content);
        document.head.appendChild(metaTag);
      }
    };

    updateOrCreateMetaTag("og:title", metadata.title);
    updateOrCreateMetaTag("og:description", metadata.description);
    updateOrCreateMetaTag("og:type", "website");
    updateOrCreateMetaTag("og:url", `${window.location.origin}${pathname}`);

    if (metadata.ogImage) {
      updateOrCreateMetaTag(
        "og:image",
        `${window.location.origin}${metadata.ogImage}`
      );
    }

    // Update Twitter Card meta tags
    const updateOrCreateTwitterTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (metaTag) {
        metaTag.setAttribute("content", content);
      } else {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", name);
        metaTag.setAttribute("content", content);
        document.head.appendChild(metaTag);
      }
    };

    updateOrCreateTwitterTag("twitter:card", "summary_large_image");
    updateOrCreateTwitterTag("twitter:title", metadata.title);
    updateOrCreateTwitterTag("twitter:description", metadata.description);

    if (metadata.ogImage) {
      updateOrCreateTwitterTag(
        "twitter:image",
        `${window.location.origin}${metadata.ogImage}`
      );
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = `${window.location.origin}${pathname}`;
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    } else {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("href", canonicalUrl);
      document.head.appendChild(canonicalLink);
    }
  }, [metadata, pathname]);

  return null; // All meta tags are handled in useEffect
}
