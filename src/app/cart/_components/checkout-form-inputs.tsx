import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Select } from "@radix-ui/react-select";
import React from "react";

export function FormInputWithLabel({
  label,
  type = "text",
  value,
  placeholder,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = React.useId();
  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[#999999]"
      >
        {label}
      </Label>
      <Input
        type={type}
        id={id}
        placeholder={placeholder || label}
        className="rounded-full border-[#999]"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function FormSelectWithLabel({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const id = React.useId();
  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[#999999]"
      >
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={(val) =>
          onChange({
            target: { value: val },
          } as React.ChangeEvent<HTMLSelectElement>)
        }
      >
        <SelectTrigger id={id} className="w-full rounded-full border-[#999]">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent className="w-full">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
