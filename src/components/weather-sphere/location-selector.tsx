
"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getLocationSuggestions } from '@/ai/flows/get-location-suggestions';

interface LocationSelectorProps {
  onLocationSearch: (location: string) => void;
  isLoading: boolean;
  initialLocation?: string;
}

export default function LocationSelector({ onLocationSearch, isLoading, initialLocation = '' }: LocationSelectorProps) {
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, startSuggestion] = useTransition();

  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  const handleSearch = () => {
    if (location && !isLoading) {
      onLocationSearch(location);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
  };

  const fetchSuggestions = useCallback((input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    startSuggestion(async () => {
        try {
            const result = await getLocationSuggestions({ input });
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
            setSuggestions([]);
        }
    });
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (location && showSuggestions) {
        fetchSuggestions(location);
      } else {
        setSuggestions([]);
      }
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [location, fetchSuggestions, showSuggestions]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    onLocationSearch(suggestion);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full" ref={suggestionBoxRef}>
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-grow">
            <Input
              ref={inputRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter a city..."
              className="text-base bg-black/20 backdrop-blur-xl border-white/10 shadow-lg h-12"
              disabled={isLoading}
              autoComplete="off"
            />
            {isSuggesting && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-white/50" />
            )}
        </div>
        <Button type="submit" onClick={handleSearch} disabled={isLoading || !location} className="h-12 shrink-0 bg-black/20 backdrop-blur-xl border-white/10 hover:bg-card">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          <span className="sr-only">Search</span>
        </Button>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-2 bg-black/50 backdrop-blur-xl border-white/10 shadow-xl animate-in fade-in-0 zoom-in-95">
          <CardContent className="p-2">
            <ul>
              {suggestions.map((s, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-4 py-2 cursor-pointer rounded-md hover:bg-white/20 text-sm sm:text-base"
                >
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
