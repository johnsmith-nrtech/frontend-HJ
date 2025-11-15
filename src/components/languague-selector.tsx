"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
];

interface LanguageSelectorProps {
  className?: string;
  variant?: "default" | "mobile";
  onLanguageChange?: (language: Language) => void;
}

export function LanguageSelector({
  className = "",
  variant = "default",
  onLanguageChange,
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selected-language");
    if (savedLanguage) {
      const language = languages.find((lang) => lang.code === savedLanguage);
      if (language) {
        setSelectedLanguage(language);
      }
    }
  }, []);

  const handleLanguageChange = async (language: Language) => {
    setIsLoading(true);

    try {
      // Save to localStorage
      localStorage.setItem("selected-language", language.code);

      // Update state
      setSelectedLanguage(language);

      // Update document language
      document.documentElement.lang = language.code;

      // Call the callback if provided
      onLanguageChange?.(language);

      console.log(`Language changed to: ${language.name}`);
    } catch (error) {
      console.error("Failed to change language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "mobile") {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-muted-foreground font-open-sans text-xs font-medium uppercase">
          Language
        </p>
        <div className="space-y-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              disabled={isLoading}
              className={`font-open-sans flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors ${
                selectedLanguage.code === language.code
                  ? "bg-blue/10 text-blue font-medium"
                  : "hover:bg-muted/50"
              } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span className="text-2xl">{language.flag}</span>
              <span className="text-base">{language.nativeName}</span>
              {selectedLanguage.code === language.code && (
                <div className="bg-blue ml-auto h-2 w-2 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`text-gray hover:text-navy hidden items-center gap-2 md:flex ${className}`}
          disabled={isLoading}
        >
          {/* Dynamic flag based on selected language */}
          <span className="text-3xl">{selectedLanguage.flag}</span>
          <span className="font-open-sans text-sm">
            {isLoading ? "Loading..." : selectedLanguage.name}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`font-open-sans cursor-pointer ${
              selectedLanguage.code === language.code
                ? "bg-blue/10 text-blue font-medium"
                : ""
            }`}
            onClick={() => handleLanguageChange(language)}
            disabled={isLoading}
          >
            <span className="mr-2 text-lg">{language.flag}</span>
            <span>{language.nativeName}</span>
            {selectedLanguage.code === language.code && (
              <div className="bg-blue ml-auto h-2 w-2 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
