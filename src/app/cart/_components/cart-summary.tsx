export function SummaryLineItem({
  label,
  value,
  textIfEmpty,
}: {
  label: string;
  value: number | undefined;
  textIfEmpty?: string;
}) {
  const valueToDisplay =
    value !== undefined ? `£${value.toFixed(2)}` : (textIfEmpty ?? "£0.00");
  return (
    <div className="flex justify-between text-sm text-gray-700">
      <span>{label}</span>
      <span className="font-medium">{valueToDisplay}</span>
    </div>
  );
}

export function SummaryTotalLineItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold">
      <span>{label}</span>
      <span className="font-medium">£{value.toFixed(2)}</span>
    </div>
  );
}