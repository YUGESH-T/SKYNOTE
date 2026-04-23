"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLocationSuggestions } from "@/ai/flows/get-location-suggestions";

interface LocationSelectorProps {
  onLocationSearch: (location: string) => void;
  isLoading: boolean;
  initialLocation?: string;
  onSuggestionsOpenChange?: (isOpen: boolean) => void;
}

export default function LocationSelector({
  onLocationSearch,
  isLoading,
  initialLocation = "",
  onSuggestionsOpenChange,
}: LocationSelectorProps) {
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  const handleSearch = useCallback(
    (value = location) => {
      const normalized = value.trim();

      if (!normalized || isLoading) {
        return;
      }

      onLocationSearch(normalized);
      setShowSuggestions(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    },
    [isLoading, location, onLocationSearch]
  );

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    setIsSuggesting(true);

    try {
      const result = await getLocationSuggestions({ input });
      setSuggestions(result.suggestions);
      setActiveIndex(result.suggestions.length > 0 ? 0 : -1);
    } catch {
      setSuggestions([]);
      setActiveIndex(-1);
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  useEffect(() => {
    if (!showSuggestions) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchSuggestions(location);
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [fetchSuggestions, location, showSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSuggestionClick(suggestion: string) {
    setLocation(suggestion);
    handleSearch(suggestion);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
        handleSuggestionClick(suggestions[activeIndex]);
        return;
      }

      handleSearch();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((current) =>
        suggestions.length === 0 ? -1 : (current + 1) % suggestions.length
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((current) =>
        suggestions.length === 0
          ? -1
          : current <= 0
            ? suggestions.length - 1
            : current - 1
      );
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }

  const showEmptyState =
    showSuggestions &&
    !isSuggesting &&
    location.trim().length >= 2 &&
    suggestions.length === 0;

  const shouldShowSuggestions =
    showSuggestions && (isSuggesting || suggestions.length > 0 || showEmptyState);

  useEffect(() => {
    onSuggestionsOpenChange?.(shouldShowSuggestions);
  }, [onSuggestionsOpenChange, shouldShowSuggestions]);

  return (
    <div ref={selectorRef} className="w-full space-y-3">
      <div className="group relative flex w-full items-center rounded-[1.6rem] border border-white/16 bg-slate-950/34 shadow-[0_16px_40px_rgba(2,6,23,0.2)] backdrop-blur-md transition-all duration-300 focus-within:border-white/24 focus-within:bg-slate-950/42 focus-within:shadow-[0_20px_48px_rgba(2,6,23,0.26)]">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/58 transition-colors duration-300 group-focus-within:text-white/82">
          <MapPin className="h-[18px] w-[18px]" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={shouldShowSuggestions}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          value={location}
          onChange={(event) => {
            setLocation(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city, town, or place"
          className="h-14 flex-1 border-0 bg-transparent pl-12 pr-4 text-[1.02rem] font-medium text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
          autoComplete="off"
        />

        {isSuggesting ? (
          <Loader2 className="absolute right-[4.7rem] top-1/2 h-4.5 w-4.5 -translate-y-1/2 animate-spin text-white/65" />
        ) : null}

        <div className="mr-2 flex items-center">
          <Button
            type="button"
            onClick={() => handleSearch()}
            disabled={isLoading || !location.trim()}
            className="h-10 rounded-[1rem] border border-white/16 bg-white/16 px-4 text-sm font-semibold text-white shadow-none backdrop-blur-sm transition-all duration-300 hover:border-white/24 hover:bg-white/24"
          >
            {isLoading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Search className="h-4.5 w-4.5" />
            )}
            <span className="ml-2 hidden sm:inline">Search</span>
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>

      {shouldShowSuggestions ? (
        <Card className="w-full border-white/14 bg-slate-950/76 shadow-xl shadow-slate-950/24 backdrop-blur-xl">
          <CardContent className="p-2">
            <ul id={listboxId} role="listbox" className="space-y-1">
              {suggestions.map((suggestion, index) => {
                const isActive = index === activeIndex;

                return (
                  <li
                    id={`${listboxId}-option-${index}`}
                    key={suggestion}
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSuggestionClick(suggestion);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/88 transition-colors sm:text-base ${
                      isActive
                        ? "bg-white/14 text-white shadow-inner shadow-white/5"
                        : "hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-white/58" />
                    <span className="truncate">{suggestion}</span>
                  </li>
                );
              })}

              {showEmptyState ? (
                <li className="px-4 py-3 text-sm font-medium text-white/65">
                  No matching cities found yet.
                </li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
