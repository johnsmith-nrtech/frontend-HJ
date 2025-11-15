"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCartAnimationStore } from "@/lib/store/cart-store";

export function CartSuccessModal() {
  const { isSuccessModalOpen, closeSuccessModal } = useCartAnimationStore();

  return (
    <Dialog open={isSuccessModalOpen} onOpenChange={closeSuccessModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product Added</DialogTitle>
          <DialogDescription>
            The product has been successfully added to your cart.
          </DialogDescription>
        </DialogHeader>

        {/* Optional actions */}
        {/* <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeSuccessModal}>Close</Button>
          <Button asChild>
            <Link href="/cart">Go to Cart</Link>
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
