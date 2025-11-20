import { Button } from "@/components/button-custom";
import React from "react";

export const GuestCheckoutOptions = ({
  user,
  onContinueAsGuest,
  onLoginRedirect,
}: {
  user: { data?: { user?: { email?: string } } } | null;
  onContinueAsGuest: () => void;
  onLoginRedirect: () => void;
}) => {
  const checkoutOptionsRef = React.useRef<HTMLDivElement>(null);

  // Scroll to checkout options when component mounts
  React.useEffect(() => {
    if (checkoutOptionsRef.current) {
      checkoutOptionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  if (user) return null;

  return (
    <div
      ref={checkoutOptionsRef}
      className="mb-8 rounded-xl border border-[#e9ecef] bg-[#f8f9fa] p-6"
    >
      <h2 className="mb-4 text-xl font-semibold text-[#222222]">
        Choose Your Checkout Method
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#dee2e6] bg-white p-4">
          <h3 className="mb-2 font-medium text-[#222222]">Continue as Guest</h3>
          <p className="mb-4 text-sm text-[#666666]">
            Quick checkout without creating an account. You can create an
            account after your purchase.
          </p>
          <Button
            onClick={onContinueAsGuest}
            className="bg-blue w-full text-white hover:bg-[#0056b3]"
          >
            Continue as Guest
          </Button>
        </div>
        <div className="rounded-lg border border-[#dee2e6] bg-white p-4">
          <h3 className="mb-2 font-medium text-[#222222]">
            Login to Your Account
          </h3>
          <p className="mb-4 text-sm text-[#666666]">
            Access saved addresses and view your order history. Enjoy a faster
            checkout experience with your saved details.{" "}
          </p>
          <Button
            onClick={onLoginRedirect}
            variant="outline"
            className="border-blue text-blue hover:bg-blue w-full hover:text-white"
          >
            Login / Register
          </Button>
        </div>
      </div>
    </div>
  );
};
