import { Button } from "@/components/button-custom";
import Image from "next/image";

export function AuthLoading() {
  return (
    <div className="px-8 py-12">
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Image
            src="/favicon.ico"
            alt="Loading"
            width={48}
            height={48}
            className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-pulse"
          />
          <p className="text-lg font-medium">Loading cart details...</p>
          <p className="text-muted-foreground text-sm">
            Please wait while we fetch your cart information
          </p>
        </div>
      </div>
    </div>
  );
}

export function CartError({ cartError }: { cartError: string }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-red-50 px-4 py-12">
        <div className="mb-4 text-6xl">⚠️</div>
        <h1 className="mb-4 text-2xl font-bold">Error Loading Cart</h1>
        <p className="mb-8 text-center text-gray-600">{cartError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue hover:bg-blue/90 rounded px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function EmptyCart() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-gray-50 px-4 py-12">
        <div className="mb-4 text-6xl">🛒</div>
        <h1 className="font-bebas mb-4 text-2xl">Your cart is empty</h1>
        <p className="mb-8 text-center text-gray-600">
          Looks like you haven&apos;t added any products to your cart yet. Start
          shopping to add products.
        </p>
        <Button
          onClick={() => (window.location.href = "/products")}
          className="bg-blue hover:bg-blue/90"
        >
          Shop Now
        </Button>
      </div>
    </div>
  );
}
