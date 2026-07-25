// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { useCartAnimationStore } from "@/lib/store/cart-store";


// export function CartSuccessModal() {
//   const { isSuccessModalOpen, closeSuccessModal, addedItemType } = useCartAnimationStore();

//   return (
//     <Dialog open={isSuccessModalOpen} onOpenChange={closeSuccessModal}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>
//             {addedItemType === "bundle" ? "Bundle Added" : "Product Added"}
//           </DialogTitle>
//           <DialogDescription>
//             {addedItemType === "bundle"
//               ? "The bundle has been successfully added to your cart."
//               : "The product has been successfully added to your cart."}
//           </DialogDescription>
//         </DialogHeader>
//       </DialogContent>
//     </Dialog>
//   );
// }



"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
      <DialogContent className="sm:max-w-md rounded-2xl p-6 text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-blue-600" />
          </div>
          <DialogTitle className="font-bebas text-2xl uppercase tracking-wide text-dark-gray">
            {addedItemType === "bundle" ? "Bundle Added" : "Product Added"}
          </DialogTitle>
          <DialogDescription className="font-open-sans mt-1 text-sm text-gray-500">
            {addedItemType === "bundle"
              ? "The bundle has been successfully added to your cart."
              : "The product has been successfully added to your cart."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}