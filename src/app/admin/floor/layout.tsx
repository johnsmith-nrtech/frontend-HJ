import { ReactNode } from "react";

export default function floorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="p-6">{children}</div>;
}
