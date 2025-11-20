const COLOR_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Gray: "#808080",
  Grey: "#808080",
  Brown: "#8B4513",
  Beige: "#F5F5DC",
  Navy: "#000080",
  Blue: "#0000FF",
  Green: "#008000",
  Red: "#FF0000",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Orange: "#FFA500",
  Yellow: "#FFFF00",
  Cream: "#FFFDD0",
  Charcoal: "#36454F",
  Emerald: "#50C878",
  Burgundy: "#800020",
  Teal: "#008080",
  Olive: "#808000",
  Maroon: "#800000",
};

// Dynamic Color Selection Component
export const ColorSelection = ({
  availableColors,
  selectedColor,
  onColorChange,
}: {
  availableColors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}) => {
  // Filter out colors that don't have a valid hex code
  const validColors = availableColors.filter((color) => COLOR_MAP[color]);

  if (validColors.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: COLOR_MAP[selectedColor] || "#000000" }}
          title={selectedColor || "Default Color"}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {validColors.map((colorName) => {
        const isSelected = selectedColor === colorName;
        const colorHex = COLOR_MAP[colorName];

        return (
          <button
            key={colorName}
            onClick={() => onColorChange(colorName)}
            className={`relative h-6 w-6 rounded-full border-2 transition-all duration-200 ${
              isSelected
                ? "ring-blue scale-110 shadow-lg ring-1 ring-offset-1"
                : "border-gray-300 hover:border-gray-400"
            }`}
            style={{ backgroundColor: colorHex }}
            title={colorName}
          />
        );
      })}
    </div>
  );
};
