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
    <div className="flex flex-col items-center text-sm text-gray-700 sm:flex-row sm:justify-between">
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
    <div className="flex flex-col items-center border-t border-gray-300 pt-2 text-lg font-bold sm:flex-row sm:justify-between">
      <span>{label}</span>
      <span className="font-extrabold text-2xl sm:text-lg sm:font-bold">£{value.toFixed(2)}</span>
    </div>
  );
}