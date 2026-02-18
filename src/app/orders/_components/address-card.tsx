import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/lib/types/orders";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export const AddressCard = ({
  icon: Icon,
  title,
  address,
}: {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  address: Order["shipping_address"];
}) => {
  return (
    <Card className="border-muted/40 shadow-sm">
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="text-muted-foreground h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-muted-foreground space-y-1.5 text-xs leading-snug">
        <p className="text-foreground font-medium">{address.recipient_name}</p>

        {address.street_address && <p>{address.street_address}</p>}
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}

        <p>
          {address.city}
          {address.state && `, ${address.state}`}, {address.postal_code}
        </p>

        <p>{address.country_name || address.country}</p>

        {address.phone && (
          <p className="text-muted-foreground pt-1 text-[11px]">
            📞 {address.phone}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
