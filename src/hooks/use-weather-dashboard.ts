"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWeatherData } from "@/ai/flows/get-weather-data";
import { getWeatherNarrative } from "@/ai/flows/get-weather-narrative";
import type { GetWeatherDataInput } from "@/ai/flows/weather-contracts";
import type { WeatherData } from "@/lib/weather-data";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { useToast } from "@/hooks/use-toast";

type GeolocationState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "failed";

type SearchSource = "manual" | "geolocation" | "refresh";

export function useWeatherDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [geolocationState, setGeolocationState] =
    useState<GeolocationState>("idle");
  const [lastQuery, setLastQuery] = useState<GetWeatherDataInput | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const hasRequestedInitialLocation = useRef(false);

  const { toast } = useToast();
  const { recentSearches, addRecentSearch } = useRecentSearches();

  const fetchNarrative = useCallback(async (nextWeather: WeatherData) => {
    setIsGeneratingNarrative(true);

    try {
      const result = await getWeatherNarrative(nextWeather);
      setNarrative(result.narrative);
    } finally {
      setIsGeneratingNarrative(false);
    }
  }, []);

  const search = useCallback(async (
    params: GetWeatherDataInput,
    source: SearchSource = "manual"
  ) => {
    setIsSearching(true);
    setWeatherError(null);

    if (source !== "refresh") {
      setStatusMessage(null);
    }

    try {
      const nextWeather = await getWeatherData(params);
      setWeather(nextWeather);
      setLastQuery(params);

      if (source !== "refresh") {
        setNarrative(null);
      }

      void fetchNarrative(nextWeather);

      if (params.location) {
        addRecentSearch(nextWeather.location);
      }

      if (source === "geolocation") {
        setGeolocationState("granted");
        setStatusMessage("Using your current location.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not fetch weather data right now.";

      setWeatherError(message);
      setStatusMessage(message);

      toast({
        variant: "destructive",
        title: "Weather unavailable",
        description: message,
      });
    } finally {
      setIsSearching(false);
    }
  }, [addRecentSearch, fetchNarrative, toast]);

  const refresh = useCallback(async () => {
    if (!lastQuery) {
      return;
    }

    await search(lastQuery, "refresh");
  }, [lastQuery, search]);

  const refreshNarrative = useCallback(async () => {
    if (!weather) {
      return;
    }

    await fetchNarrative(weather);
  }, [fetchNarrative, weather]);

  useEffect(() => {
    if (hasRequestedInitialLocation.current) {
      return;
    }

    hasRequestedInitialLocation.current = true;

    if (!navigator.geolocation) {
      setGeolocationState("unavailable");
      setStatusMessage(
        "Location access is unavailable on this device. Showing a default city."
      );
      void search({ location: "New York" }, "manual");
      setHasBootstrapped(true);
      return;
    }

    setGeolocationState("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void search(
          {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          "geolocation"
        );
        setHasBootstrapped(true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeolocationState("denied");
          setStatusMessage(
            "Location permission was denied. Search for a city or use a recent location."
          );
        } else {
          setGeolocationState("failed");
          setStatusMessage(
            "Location lookup failed, so SKYNOTE is showing a default city."
          );
        }

        void search({ location: "New York" }, "manual");
        setHasBootstrapped(true);
      },
      { timeout: 5000 }
    );
  }, [search]);

  const isInitialLoading = !hasBootstrapped || (isSearching && !weather);
  const isRefreshing = isSearching && Boolean(weather);

  return {
    weather,
    narrative,
    weatherError,
    statusMessage,
    geolocationState,
    isInitialLoading,
    isRefreshing,
    isGeneratingNarrative,
    recentSearches,
    search,
    refresh,
    refreshNarrative,
  };
}
