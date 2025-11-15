import { Button } from "@/components/button-custom";
import Image from "next/image";

export function ProductsPageHeroSection() {
  return (
    <div className="relative">
      {/* Light blue background for right side extending from navbar */}
      <div className="absolute inset-0 hidden w-full overflow-hidden lg:block">
        <div className="relative mx-auto h-full px-4">
          <div className="bg-light-blue absolute right-0 mt-[-70px] h-full md:w-[50%] 2xl:w-[50%]"></div>
        </div>
      </div>

      <div className="relative min-h-[400px] overflow-hidden sm:min-h-[500px] md:min-h-[640px] 2xl:min-h-[820px]">
        {/* Hero Image - Background for entire section */}
        <div className="absolute inset-0 h-full w-full md:mt-[-80px] md:ml-[46px] 2xl:mt-[0px] 2xl:ml-[68px]">
          <Image
            src="/product-img1.png"
            alt="Sofa Deals Product Page"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="absolute left-4 flex-col justify-center px-2 py-8 sm:px-[32px] sm:py-12 md:bottom-[10px] md:mt-[-60px] md:py-16 lg:py-26 2xl:bottom-[-50px] 2xl:mt-[0px]">
          <div className="max-w-full sm:max-w-md lg:max-w-xl 2xl:max-w-2xl">
            <h1 className="mt-10 sm:text-[85px] lg:mt-0">OUR PRODUCTS</h1>
            <div className="font-open-sans mb-8 text-sm leading-relaxed text-[#999] sm:text-base">
              <p>
                Browse our collection of modern and timeless sofa designs for
                your living space.
              </p>
              {/* <p>
                    The term is also applied to contemporary quartz countertops by
                    Cambria, which use a warm vanilla palette and gray accents,
                    and even to specific features on a product, like a
                    &quot;modern Malvern style&quot; cabinet knob.
                  </p> */}
            </div>
            <Button
              variant="main"
              size="xl"
              rounded="full"
              className="bg-blue relative items-center justify-start"
              onClick={() => {
                document
                  .getElementById("filters-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              icon={
                <Image
                  src="/arrow-right.png"
                  alt="arrow-right"
                  width={20}
                  height={20}
                  className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 sm:h-[40px] sm:w-[40px]"
                />
              }
            >
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
