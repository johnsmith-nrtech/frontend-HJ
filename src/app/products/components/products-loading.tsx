import Image from "next/image";

import { Button } from "@/components/button-custom";
import { MarqueeStrip } from "@/components/marquee-strip";
export function ProductsLoading() {
  return (
    <div className="w-full">
      {/* Hero Section */}
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

          <div className="absolute left-4 flex-col justify-center px-[32px] py-8 sm:py-12 md:bottom-[4px] md:mt-[-60px] md:py-16 lg:py-26 2xl:bottom-[-50px] 2xl:mt-[0px]">
            <div className="max-w-full sm:max-w-md lg:max-w-xl 2xl:max-w-2xl">
              <h1 className="sm:text-[85px]">OUR PRODUCTS</h1>
              <div className="font-open-sans mb-8 text-sm leading-relaxed text-[#999] sm:text-base">
                <p>
                  &quot;Malvern style&quot; is not a single defined style but
                  refers to designs from specific companies like G Plan and Oak
                  Furnitureland, which offer classic, comfortable, and elegant
                  furniture with features like high backs and curved arms. It
                  can also describe contemporary designs, such as modern
                  farmhouse styles using neutral tones and natural textures or
                  contemporary architectural styles with linear forms and earthy
                  materials.
                </p>
                <p>
                  The term is also applied to contemporary quartz countertops by
                  Cambria, which use a warm vanilla palette and gray accents,
                  and even to specific features on a product, like a
                  &quot;modern Malvern style&quot; cabinet knob.
                </p>
              </div>
              <Button
                variant="main"
                size="xl"
                rounded="full"
                className="bg-blue relative items-center justify-start"
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

      {/* Marquee Strip */}
      <MarqueeStrip
        items={[
          { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
          { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
          { text: "EASY RETURN", icon: "/sofa-icon.png" },
          { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
          { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
        ]}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
      />

      {/* Loading Products Section */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="px-[32px]">
          <div className="mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-16 w-[280px] animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-16 w-[280px] animate-pulse rounded-full bg-gray-200"></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-200"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
