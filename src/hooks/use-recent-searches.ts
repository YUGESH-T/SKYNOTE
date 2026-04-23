"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "skynote-recent-searches";
const MAX_RECENT_SEARCHES = 5;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addRecentSearch = useCallback((location: string) => {
    const normalized = location.trim();

    if (!normalized) {
      return;
    }

    setRecentSearches((current) => {
      const next = [
        normalized,
        ...current.filter(
          (item) => item.toLowerCase() !== normalized.toLowerCase()
        ),
      ];

      return next.slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  return {
    recentSearches,
    addRecentSearch,
  };
}
