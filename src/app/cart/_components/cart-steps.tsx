import { cn } from "@/lib/utils";

export const CartSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    {
      number: 1,
      title: "Shopping cart",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      ),
    },
    {
      number: 2,
      title: "Email",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      number: 3,
      title: "Checkout details",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      number: 4,
      title: "Order complete",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-4 flex w-full items-start justify-center gap-4 sm:mb-4 sm:gap-10 lg:gap-20">
      {steps.map((step) => (
        <div key={step.number}>
          <div
            className={cn(
              "relative flex flex-col",
              currentStep >= step.number && "border-blue-500 pb-4 sm:border-b-2"
            )}
          >
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ease-in-out sm:h-10 sm:w-10 sm:text-lg ${
                  currentStep >= step.number
                    ? "bg-blue text-white shadow-lg"
                    : "bg-[#999999] text-sm text-white"
                }`}
              >
                {/* Show icon on small screens, number on larger screens */}
                <span className="block sm:hidden">
                  {currentStep > step.number ? (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </span>
                <span className="hidden sm:block">{step.number}</span>
              </div>
              <span
                className={`ml-2 text-xs whitespace-nowrap transition-colors duration-300 ease-in-out sm:ml-3 sm:text-sm ${
                  currentStep >= step.number
                    ? "text-blue font-medium"
                    : "text-[#999]"
                }`}
              >
                {/* Hide title on small screens, show on larger screens */}
                <span className="hidden text-[18px] sm:inline">
                  {step.title}
                </span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
