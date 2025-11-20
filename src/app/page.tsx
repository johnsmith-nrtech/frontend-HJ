"use client";

import FeaturedProducts from "@/components/landing-page/feature-products";
// import TopSellingProducts from "@/components/landing-page/top-selling-products";
import HeroSection from "@/components/landing-page/hero-section";
import WhyChooseUs from "@/components/landing-page/why-choose-us";
import FeaturedCategories from "@/components/landing-page/featured-categories";
import Testimonials from "@/components/landing-page/testimonials";

import PayInSlicesSection from "@/components/landing-page/pay-in-slices";
import NewArrivals from "@/components/landing-page/new-arrivals";
import ShopOurBestSeller from "@/components/landing-page/shop-our-best-seller";

const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />
        <WhyChooseUs />
        <FeaturedCategories />
        <PayInSlicesSection />
        <FeaturedProducts />
        <NewArrivals />
        <ShopOurBestSeller />
        {/* <TopSellingProducts limit={4} period="month" /> */}
        <Testimonials />
      </main>
    </div>
  );
};

export default LandingPage;
