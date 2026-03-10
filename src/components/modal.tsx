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
  const { isSuccessModalOpen, closeSuccessModal, addedItemType } = useCartAnimationStore();

  return (
    <Dialog open={isSuccessModalOpen} onOpenChange={closeSuccessModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {addedItemType === "bundle" ? "Bundle Added" : "Product Added"}
          </DialogTitle>
          <DialogDescription>
            {addedItemType === "bundle"
              ? "The bundle has been successfully added to your cart."
              : "The product has been successfully added to your cart."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}