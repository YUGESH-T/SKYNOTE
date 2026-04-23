"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLocationSuggestions } from "@/ai/flows/get-location-suggestions";

interface LocationSelectorProps {
  onLocationSearch: (location: string) => void;
  isLoading: boolean;
  initialLocation?: string;
}

export default function LocationSelector({
  onLocationSearch,
  isLoading,
  initialLocation = "",
}: LocationSelectorProps) {
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestionBoxRef = useRef<HTMLDivElement>(null);
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
    const timeoutId = window.setTimeout(() => {
      if (showSuggestions) {
        void fetchSuggestions(location);
      }
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [fetchSuggestions, location, showSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
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

  const shouldShowDropdown =
    showSuggestions && (isSuggesting || suggestions.length > 0 || showEmptyState);

  return (
    <div className="relative w-full" ref={suggestionBoxRef}>
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showSuggestions}
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
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Enter a city..."
            className="h-12 border-white/15 bg-slate-950/70 pr-12 text-base font-medium text-white placeholder:text-white/55 shadow-lg shadow-slate-950/25 backdrop-blur-xl"
            disabled={isLoading}
            autoComplete="off"
          />
          {isSuggesting ? (
            <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-white/65" />
          ) : null}
        </div>
        <Button
          type="submit"
          onClick={() => handleSearch()}
          disabled={isLoading || !location.trim()}
          className="h-12 shrink-0 border-white/15 bg-slate-900/70 px-4 text-white shadow-lg shadow-slate-950/25 backdrop-blur-xl hover:border-sky-200/30 hover:bg-slate-800/80"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          <span className="sr-only">Search</span>
        </Button>
      </div>
      {shouldShowDropdown ? (
        <Card className="absolute z-20 mt-2 w-full animate-in border-white/15 bg-slate-950/88 shadow-2xl shadow-slate-950/30 fade-in-0 zoom-in-95 backdrop-blur-xl">
          <CardContent className="p-2">
            <ul id={listboxId} role="listbox">
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
                    className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-white/88 transition-colors sm:text-base ${
                      isActive
                        ? "bg-slate-800/95 text-white shadow-inner shadow-white/5"
                        : "hover:bg-slate-800/70 hover:text-white"
                    }`}
                  >
                    {suggestion}
                  </li>
                );
              })}
              {showEmptyState ? (
                <li className="px-4 py-2.5 text-sm font-medium text-white/65">
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
