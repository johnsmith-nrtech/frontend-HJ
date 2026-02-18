import { Checkbox } from "@/components/ui/checkbox";
import SafeImage from "@/components/ui/safe-image";
import { LocalCartItem, useCart } from "@/lib/store/cart-store";
import { Loader2Icon, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { ColorSelection } from "./color-section";

export function OrderItemsList() {
  const { items } = useCart();

  return (
    <div className="mb-4 space-y-2">
      {items.map((item) => {
        return <OrderItem2 key={item.id} item={item} />;
      })}
    </div>
  );
}

export function OrderItem1({ item }: { item: LocalCartItem }) {
  const {
    updateQuantity,
    updateAssemblyRequired,
    updateItemColor,
    removeItem,
    isItemLoading,
  } = useCart();

  const handleQuantityChange = (id: string, qty: number) =>
    qty < 1 ? removeItem(id) : updateQuantity(id, qty);

  const currentItemLoading = isItemLoading(item.id);

  return (
    <div className="relative flex flex-wrap items-center gap-4 border-b border-gray-100 py-4 sm:flex-nowrap">
      {/* Image */}
      <div className="h-20 w-20 shrink-0 rounded bg-white md:h-36 md:w-36">
        <SafeImage
          src={
            item.image ||
            "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"
          }
          alt={item.name}
          width={80}
          height={80}
          className="h-full w-full rounded object-contain"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900 uppercase md:text-[27px]">
          {item.name}
          {currentItemLoading && (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          )}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Color: {item.variant?.color || item.color || "Black"}
        </p>
        {item.variant?.size && (
          <p className="text-xs text-gray-500">Size: {item.variant.size}</p>
        )}

        {item.assemble_charges ? (
          <div className="mt-2 flex items-center gap-2">
            <Checkbox
              checked={item.assembly_required}
              onCheckedChange={(v) =>
                // handleAssembleChange(item.id, v as boolean)
                updateAssemblyRequired(item.id, v as boolean)
              }
              id={`assemble-${item.id}`}
            />
            <label
              htmlFor={`assemble-${item.id}`}
              className="text-sm text-gray-700"
            >
              Add Assembly (£{item.assemble_charges.toFixed(2)})
            </label>
          </div>
        ) : null}

        <button
          onClick={() => removeItem(item.id)}
          disabled={isItemLoading(item.id)}
          className="mt-2 flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 disabled:opacity-50"
        >
          <XIcon className="h-5 w-5" /> Remove
        </button>
      </div>

      {/* Quantity / Color / Price */}
      <div className="mt-4 flex w-full items-center justify-between gap-8 sm:mt-0 sm:w-auto sm:justify-start">
        <div className="flex items-center overflow-hidden rounded-full border border-gray-300">
          <button
            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
            className="flex h-8 w-8 items-center justify-center hover:bg-gray-50"
          >
            <MinusIcon className="h-4 w-4 text-gray-600" />
          </button>

          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>

          <button
            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
            className="flex h-8 w-8 items-center justify-center hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <ColorSelection
          availableColors={
            item.variant?.availableColors ||
            item.availableColors || [
              item.variant?.color || item.color || "Black",
            ]
          }
          selectedColor={item.variant?.color || item.color || "Black"}
          onColorChange={(color) => updateItemColor(item.id, color)}
        />

        <div className="min-w-20 text-right">
          <span className="text-lg font-medium">
            £
            {(
              (item.price +
                (item.assembly_required && item.assemble_charges
                  ? item.assemble_charges
                  : 0)) *
              item.quantity
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function OrderItem2({ item }: { item: LocalCartItem }) {
  const { updateQuantity, updateAssemblyRequired, removeItem, isItemLoading } =
    useCart();

  const handleQuantityChange = (id: string, qty: number) =>
    qty < 1 ? removeItem(id) : updateQuantity(id, qty);

  const currentItemLoading = isItemLoading(item.id);

  const { price, quantity, assembly_required, assemble_charges = 0 } = item;
  const base = price * quantity;
  const assembly = assembly_required ? assemble_charges * quantity : 0;
  const pricing = {
    unit: price,
    unitAssemble: assemble_charges,
    base,
    assembly,
    total: base + assembly,
  };

  return (
    <div key={item.id} className="rounded-md border bg-white/30 p-3">
      <div className="flex gap-3">
        {/* Image */}
        <SafeImage
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-md bg-gray-50 object-contain"
        />

        {/* Content */}
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between">
            <div>
              <h3 className="flex gap-4 text-sm font-medium uppercase">
                {item.name}
                {currentItemLoading && (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                )}
              </h3>
              <p className="text-xs text-gray-500">
                Color: {item.color || "Black"}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.id)}
              disabled={currentItemLoading}
              className="text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {item.variant?.delivery_time_days
              ? `${item.variant.delivery_time_days} days`
              : "3–4 days"}
          </div>

          {/* Assembly */}
          {item.assemble_charges ? (
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <Checkbox
                checked={item.assembly_required}
                onCheckedChange={(v) =>
                  updateAssemblyRequired(item.id, v as boolean)
                }
              />
              Assembly (£{item.assemble_charges.toFixed(2)})
            </label>
          ) : null}

          {/* Bottom Row: Qty + Price */}
          <div className="flex items-center justify-between pt-1">
            {/* Qty Controls */}
            <div className="flex items-center rounded-full border">
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center"
              >
                <MinusIcon className="h-4 w-4 text-gray-700" />
              </button>

              <span className="w-10 text-center text-sm">{item.quantity}</span>

              <button
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center"
              >
                <PlusIcon className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            {/* Price Inline */}
            <div className="text-right">
              <p className="text-sm font-semibold">
                £{pricing.total.toFixed(2)}
              </p>

              {item.assembly_required && (
                <p className="text-xs text-gray-500">
                  incl. £{pricing.assembly.toFixed(2)} assembly
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
