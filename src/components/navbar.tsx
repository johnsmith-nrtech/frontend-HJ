"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Heart,
  ChevronDown,
  Trash2,
  ArrowRight,
  Loader2,
  MenuIcon,
  ShoppingCart,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useAuth } from "@/lib/providers/auth-provider";
import { SearchDropdown } from "@/components/search/search-dropdown";
import Logo from "../../public/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { toast } from "sonner";
import { LanguageSelector } from "./languague-selector";
import { useCartAnimationStore } from "@/lib/store/cart-store";
import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Memoize pathname-dependent calculations
  const isHomePage = useMemo(() => {
    return (
      pathname === "/" ||
      pathname === "/products" ||
      pathname === "/contact-us" ||
      pathname === "/about-us"
    );
  }, [pathname]);

  const {
    items: cartItems,
    totalItems,
    getCartTotal,
    removeItem: removeFromCart,
    isItemLoading,
  } = useCart();
  const {
    items: wishlistItems,
    totalItems: wishlistCount,
    removeItem: removeFromWishlist,
    isItemLoading: isWishlistItemLoading,
  } = useWishlist();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isWishlistDropdownOpen, setIsWishlistDropdownOpen] = useState(false);
  const { isOpen, toggleCart } = useCartAnimationStore();

  // Track client-side hydration to prevent SSR mismatches
  useEffect(() => {
    setIsClient(true);
    // Immediately check scroll position on hydration
    if (typeof window !== "undefined" && window.scrollY > 20) {
      setIsScrolled(true);
    }
  }, []);

  // Handle navbar background change on scroll with hydration safety
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      if (typeof window !== "undefined" && window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check initial scroll position on mount
    const checkInitialScroll = () => {
      if (typeof window !== "undefined" && window.scrollY > 20) {
        setIsScrolled(true);
      }
    };

    // Check scroll position immediately after hydration
    checkInitialScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId);
      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
      toast.error("Failed to remove item");
    }
  };

  const categoriesQuery = useCategories(true);

  const sizes = [
    {
      label: "1 Seater",
      url: `products/?size=${encodeURIComponent("1 seater")}`,
    },
    {
      label: "2 Seater",
      url: `products/?size=${encodeURIComponent("2 seater")}`,
    },
    {
      label: "3 Seater",
      url: `products/?size=${encodeURIComponent("3 seater")}`,
    },
    {
      label: "4 Seater",
      url: `products/?size=${encodeURIComponent("4 seater")}`,
    },
    {
      label: "5 Seater",
      url: `products/?size=${encodeURIComponent("5 seater")}`,
    },
    {
      label: "3+2 Seater",
      url: `products/?size=${encodeURIComponent("3+2 seater")}`,
    },
  ];

  const fabrics = [
    // {
    //   label: "Premium Fabric",
    //   url: `products/?material=${encodeURIComponent("premium fabric")}`,
    // },
    // {
    //   label: "High-quality fabric",
    //   url: `products/?material=${encodeURIComponent("high-quality fabric")}`,
    // },
    {
      label: "Fabric Sofas",
      url: `products/?material=${encodeURIComponent("fabric sofas")}`,
    },
    {
      label: "Leather Sofas",
      url: `products/?material=${encodeURIComponent("leather sofas")}`,
    },
    // {
    //   label: "Velvet Sofas",
    //   url: `products/?material=${encodeURIComponent("velvet sofas")}`,
    // },
  ];

  const handleLoginClick = () => {
    localStorage.setItem("redirectAfterLogin", pathname);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 h-16 w-full transition-all duration-200",
          {
            "bg-background/95 supports-backdrop-filter:bg-background/80 border-b shadow-sm backdrop-blur":
              isScrolled,
          },
          {
            "bg-background/95": !isScrolled,
          }
        )}
      >
        {/* Background for right 50% - only on desktop, home page, and when not scrolled */}
        {isClient && !isScrolled && isHomePage && (
          <div
            className="pointer-events-none absolute inset-0 hidden w-full overflow-hidden lg:block"
            style={{ height: "64px" }}
          >
            <div className="relative mx-auto h-full px-4">
              <div
                className={`bg-light-blue absolute right-0 h-full transition-all duration-200 ${
                  pathname === "/products" ||
                  pathname === "/contact-us" ||
                  pathname === "/about-us"
                    ? "md:w-[50%] 2xl:w-[50%]"
                    : "w-[50%] pl-0"
                }`}
              ></div>
            </div>
          </div>
        )}

        {/* Main navbar */}
        <div className="px:[16px] relative z-10 md:px-8">
          {/* Desktop layout */}
          <div className="hidden h-16 items-center justify-between lg:flex">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-32">
                <Image
                  src={Logo}
                  alt="Sofa Deal"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="flex items-center space-x-6 text-base">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group text-gray hover:text-[#222222]"
                    size="sm"
                    disabled={categoriesQuery.isLoading}
                  >
                    <span className="font-open-sans text-base">Sofa Type</span>
                    {categoriesQuery.isLoading ? (
                      <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {categoriesQuery.isLoading ? (
                    <DropdownMenuItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">
                          Loading categories...
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ) : categoriesQuery.error ? (
                    <DropdownMenuItem disabled>
                      <span className="text-sm text-red-500">
                        Failed to load categories
                      </span>
                    </DropdownMenuItem>
                  ) : (
                    categoriesQuery.data?.map((cat) => (
                      <DropdownMenuItem key={cat.name} asChild>
                        <Link
                          href={`/products?categoryId=${cat.id}`}
                          className="font-open-sans cursor-pointer"
                        >
                          {cat.name}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group text-gray hover:text-[#222222] md:hidden xl:flex"
                    size="sm"
                  >
                    <span className="font-open-sans text-base">Sofa Size</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {sizes.map((size) => (
                    <DropdownMenuItem key={size.label} asChild>
                      <Link
                        href={`/${size.url}`}
                        className="font-open-sans cursor-pointer"
                      >
                        {size.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group text-gray hover:text-[#222222]"
                    size="sm"
                  >
                    <span className="font-open-sans text-base">Materials</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {fabrics.map((fabric) => (
                    <DropdownMenuItem key={fabric.label} asChild>
                      <Link
                        href={`/${fabric.url}`}
                        className="font-open-sans cursor-pointer"
                      >
                        {fabric.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/products"
                className="font-open-sans text-gray hover:text-navy transition-colors hover:text-[#222222]"
              >
                All Products
              </Link>

              <Link
                href="/about-us"
                className="font-open-sans text-gray hover:text-navy transition-colors hover:text-[#222222]"
              >
                About Us
              </Link>

              <Link
                href="/contact-us"
                className="font-open-sans text-gray hover:text-navy transition-colors hover:text-[#222222]"
              >
                Contact Us
              </Link>
            </nav>

            {/* Right side actions - Desktop */}
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <LanguageSelector />

              {/* Search - Desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray hover:text-[#222222]"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                <Image
                  src="/n-1.png"
                  alt="Search"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </Button>

              {/* Wishlist Dropdown */}
              <DropdownMenu
                open={isWishlistDropdownOpen}
                onOpenChange={setIsWishlistDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray relative"
                  >
                    <Heart className="h-5 w-5 text-[#212121]" />
                    {isClient && wishlistCount > 0 && (
                      <Badge
                        className={`bg-blue absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs text-white hover:bg-blue-700 ${
                          wishlistCount > 99 ? "h-6 w-6 text-[10px]" : "h-5 w-5"
                        } p-0`}
                      >
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h2 className="font-open-sans mb-3 font-semibold">
                      Wishlist ({isClient ? wishlistCount : 0} items)
                    </h2>
                    {wishlistItems.length === 0 ? (
                      <p className="text-muted-foreground font-open-sans text-sm">
                        Your wishlist is empty
                      </p>
                    ) : (
                      <div className="max-h-96 space-y-3 overflow-y-auto">
                        {wishlistItems.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="hover:bg-muted/50 flex items-center gap-3 rounded-md p-2"
                          >
                            <div className="bg-muted relative h-12 w-12 overflow-hidden rounded border">
                              {item.image && (
                                <Image
                                  fill
                                  src={item.image}
                                  alt={item.name}
                                  className="bg-white object-contain"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-open-sans truncate text-sm font-medium">
                                {item.name}
                              </p>
                              <p className="text-muted-foreground font-open-sans text-sm">
                                £{item.price.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:text-destructive h-8 w-8"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              disabled={isWishlistItemLoading(item.variant_id)}
                            >
                              {isWishlistItemLoading(item.variant_id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                        {wishlistItems.length > 4 && (
                          <p className="text-muted-foreground font-open-sans text-center text-sm">
                            +{wishlistItems.length - 4} more items
                          </p>
                        )}
                      </div>
                    )}
                    {wishlistItems.length > 0 && (
                      <div className="mt-4 border-t pt-3">
                        <Button
                          asChild
                          className="bg-blue hover:bg-blue/90 font-open-sans w-full text-white"
                          onClick={() => setIsWishlistDropdownOpen(false)}
                        >
                          <Link href="/wishlist">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-gray focus:ring-blue relative hover:text-[#222222] focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                      <Image
                        src="/n-2.png"
                        alt="User"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                      <span className="sr-only">User menu - Logged in</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                    sideOffset={5}
                  >
                    <div className="flex flex-col space-y-1 p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="font-open-sans text-sm font-medium">
                          {user?.data?.user?.email?.split("@")[0]}
                        </p>
                      </div>
                      <p className="text-muted-foreground font-open-sans ml-4 text-xs">
                        {user?.data?.user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="font-open-sans w-full cursor-pointer"
                      >
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/orders"
                        className="font-open-sans w-full cursor-pointer"
                      >
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/wishlist"
                        className="font-open-sans w-full cursor-pointer"
                      >
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        signOut();
                      }}
                      className="font-open-sans cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-2"
                    onClick={handleLoginClick}
                  >
                    <Image
                      src="/n-2.png"
                      alt="User"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                    <span className="font-open-sans text-gray text-sm">
                      Login
                    </span>
                  </Link>
                </div>
              )}

              {/* Cart */}
              <DropdownMenu open={isOpen} onOpenChange={toggleCart}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray relative hover:text-[#222222]"
                  >
                    <ShoppingCart
                      className="!h-10 !w-10 text-black"
                      size={100}
                    />
                    {isClient && totalItems > 0 && (
                      <Badge
                        className={`bg-blue absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs text-white hover:bg-blue-700 ${
                          totalItems > 99 ? "h-6 w-6 text-[10px]" : "h-5 w-5"
                        } p-0`}
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h2 className="font-open-sans mb-3 font-semibold">
                      Cart ({isClient ? totalItems : 0} items)
                    </h2>
                    {cartItems.length === 0 ? (
                      <p className="text-muted-foreground font-open-sans text-sm">
                        Your cart is empty
                      </p>
                    ) : (
                      <div className="max-h-96 space-y-3 overflow-y-auto">
                        {cartItems.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="hover:bg-muted/50 flex items-center gap-3 rounded-md p-2"
                          >
                            <div className="bg-muted relative h-12 w-12 overflow-hidden rounded border">
                              {item.image && (
                                <Image
                                  fill
                                  src={item.image}
                                  alt={item.name}
                                  className="bg-white object-contain"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-open-sans truncate text-sm font-medium">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground font-open-sans text-sm">
                                  £{item.price.toFixed(2)} x {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground font-open-sans text-sm">
                                  ⌚ Delivery: {item.delivery_time_days}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground font-open-sans text-sm">
                                  Assembly Required:{" "}
                                  {item.assembly_required ? "✔️" : "❌"}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:text-destructive h-8 w-8"
                              onClick={() => handleRemoveFromCart(item.id)}
                              disabled={isItemLoading(item.id)}
                            >
                              {isItemLoading(item.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                        {cartItems.length > 4 && (
                          <p className="text-muted-foreground font-open-sans text-center text-sm">
                            +{cartItems.length - 4} more items
                          </p>
                        )}
                      </div>
                    )}
                    {cartItems.length > 0 && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        <div className="font-open-sans flex items-center justify-between font-semibold">
                          <span>Total:</span>
                          <span>£{getCartTotal().toFixed(2)}</span>
                        </div>
                        <Button
                          asChild
                          className="bg-blue hover:bg-blue/90 font-open-sans w-full text-white"
                          onClick={() => toggleCart()}
                        >
                          <Link href="/cart">
                            View Cart <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex h-16 items-center justify-between px-4 lg:hidden">
            {/* Left - Menu Icon (Large) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-dark-gray p-2"
                >
                  <MenuIcon className="!h-10 !w-10" size={100} />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="h-full w-[80vw] max-w-md overflow-y-auto p-0 sm:w-[350px]"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b px-4 py-4">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <div className="relative h-10 w-32">
                        <Image
                          src={Logo}
                          alt="Sofa Deal"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </Link>
                  </div>

                  <nav className="flex flex-grow flex-col gap-5 overflow-y-auto px-4 py-6">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="sofa-types" className="border-b">
                        <AccordionTrigger className="font-open-sans py-3">
                          <div className="flex items-center gap-2">
                            Sofa Types
                            {categoriesQuery.isLoading && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="flex flex-col space-y-2">
                            {categoriesQuery.isLoading ? (
                              <div className="flex items-center gap-2 py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-gray-500">
                                  Loading categories...
                                </span>
                              </div>
                            ) : (
                              categoriesQuery.data?.map((cat) => (
                                <Link
                                  key={cat.id}
                                  href={`/products?categoryId=${cat.id}`}
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  {cat.name}
                                </Link>
                              ))
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="sofa-sizes" className="border-b">
                        <AccordionTrigger className="font-open-sans py-3">
                          Sofa Sizes
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="flex flex-col space-y-2">
                            {sizes.map((size) => (
                              <Link
                                key={size.label}
                                href={`/${size.url}`}
                                className="font-open-sans text-base"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                {size.label}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="materials" className="border-b">
                        <AccordionTrigger className="font-open-sans py-3">
                          Materials
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="flex flex-col space-y-2">
                            {fabrics.map((fabric) => (
                              <Link
                                key={fabric.label}
                                href={`/${fabric.url}`}
                                className="font-open-sans text-base"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                {fabric.label}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="space-y-3 border-b pb-5">
                      <Link
                        href="/products"
                        className="font-open-sans flex items-center text-base font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        All Products
                      </Link>
                      <Link
                        href="/about-us"
                        className="font-open-sans flex items-center text-base font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        About Us
                      </Link>
                      <Link
                        href="/contact-us"
                        className="font-open-sans flex items-center text-base font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Contact Us
                      </Link>
                    </div>

                    {user ? (
                      <div className="border-b pb-5">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <p className="text-muted-foreground font-open-sans text-xs font-medium uppercase">
                            Account - Logged In
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="rounded-md border border-green-200 bg-green-50 p-3">
                            <p className="font-open-sans text-sm font-medium text-green-800">
                              Signed in as
                            </p>
                            <p className="font-open-sans text-sm font-bold text-green-900">
                              {user?.data?.user?.email}
                            </p>
                          </div>
                          <Link
                            href="/profile"
                            className="font-open-sans flex items-center text-base font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            My Account
                          </Link>
                          <Link
                            href="/orders"
                            className="font-open-sans flex items-center text-base font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            href="/wishlist"
                            className="font-open-sans flex items-center text-base font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            Wishlist ({isClient ? wishlistCount : 0})
                          </Link>
                          <Link
                            href="/cart"
                            className="font-open-sans flex items-center text-base font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            Cart ({isClient ? totalItems : 0})
                          </Link>
                          <Button
                            variant="ghost"
                            className="font-open-sans justify-start px-0 text-base font-medium"
                            onClick={() => {
                              signOut();
                              setIsSheetOpen(false);
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-b pb-5">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                          <p className="text-muted-foreground font-open-sans text-xs font-medium uppercase">
                            Account - Not Logged In
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                            <p className="font-open-sans mb-2 text-sm text-blue-800">
                              Sign in to access your account, orders, and
                              wishlist.
                            </p>
                          </div>
                          <Link
                            href="/login"
                            className="font-open-sans flex items-center text-base font-medium"
                            // onClick={() => setIsSheetOpen(false)}
                            onClick={() => {
                              setIsSheetOpen(false);
                              handleLoginClick();
                            }}
                          >
                            Login
                          </Link>
                          <Button
                            asChild
                            className="bg-blue hover:bg-blue/90 font-open-sans w-full text-white"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <Link href="/register">Register</Link>
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-muted-foreground font-open-sans mb-3 text-xs font-medium uppercase">
                        Customer Support
                      </p>
                      <div className="space-y-3">
                        <Link
                          href="/contact"
                          className="font-open-sans flex items-center text-base font-medium"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          Contact Us
                        </Link>
                        <Link
                          href="#"
                          className="font-open-sans flex items-center text-base font-medium"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          FAQs
                        </Link>
                        <Link
                          href="#"
                          className="font-open-sans flex items-center text-base font-medium"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          Returns Policy
                        </Link>
                      </div>
                    </div>
                  </nav>

                  <div className="text-muted-foreground mt-auto border-t px-4 py-4 text-center text-sm">
                    <p className="font-open-sans">
                      © 2025 Sofa Deal. All rights reserved.
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Center - Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 transform">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative h-8 w-24">
                  <Image
                    src={Logo}
                    alt="Sofa Deal"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Right - Cart Icon (Large) */}
            <div className="flex items-center">
              {/* Cart Icon (Large) */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray relative p-2 hover:text-[#222222]"
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="!h-10 !w-10 text-black" size={100} />

                  {/* <Image
                    src="/n-3.png"
                    alt="Cart"
                    width={28}
                    height={28}
                    className="no-style object-contain"
                  /> */}
                  {isClient && totalItems > 0 && (
                    <Badge
                      className={`bg-blue absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs text-white hover:bg-blue-700 ${
                        totalItems > 99 ? "h-6 w-6 text-[10px]" : "h-5 w-5"
                      } p-0`}
                    >
                      {totalItems > 99 ? "99+" : totalItems}
                    </Badge>
                  )}
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Full Width */}
        <div className="bg-background border-t px-4 py-3 lg:hidden">
          <SearchDropdown
            placeholder="Search for products..."
            onResultClick={() => {}}
          />
        </div>

        {/* Desktop Search dropdown */}
        {isMobileSearchOpen && (
          <div className="bg-background flex hidden w-[100%] justify-center border-t p-3 lg:block">
            <SearchDropdown
              className="m-auto w-[60%] items-center justify-center"
              placeholder="Search for products..."
              onResultClick={() => setIsMobileSearchOpen(false)}
            />
          </div>
        )}
      </header>
    </>
  );
}
