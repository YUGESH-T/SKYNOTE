"use client";

import dynamic from "next/dynamic";
import { Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CurrentWeather from "./current-weather";
import SunriseSunset from "./sunrise-sunset";
import WeatherNarrative from "./weather-narrative";
import WeatherStatus from "./weather-status";
import WeatherToolbar from "./weather-toolbar";
import { useTemperatureUnit } from "@/hooks/use-temperature-unit";
import { useWeatherDashboard } from "@/hooks/use-weather-dashboard";
import type { TimeOfDay, WeatherCondition } from "@/lib/weather-data";

const WeatherVisualization = dynamic(() => import("./weather-visualization"), {
  ssr: false,
  loading: () => null,
});

const DailyTemperatureTrend = dynamic(() => import("./daily-temperature-trend"), {
  loading: () => (
    <div className="h-[220px] w-full animate-pulse rounded-lg bg-white/10" />
  ),
});

const WeatherForecast = dynamic(() => import("./weather-forecast"), {
  loading: () => (
    <div className="h-[320px] w-full animate-pulse rounded-lg bg-white/10" />
  ),
});

const InteractiveHourlyForecast = dynamic(
  () => import("./interactive-hourly-forecast"),
  {
    loading: () => (
      <div className="h-[180px] w-full animate-pulse rounded-lg bg-white/10" />
    ),
  }
);

const weatherColorClasses: Record<WeatherCondition, Record<TimeOfDay, string>> = {
  Sunny: {
    morning: "from-amber-200 via-sky-300 to-blue-500",
    afternoon: "from-sky-300 via-cyan-400 to-blue-700",
    night: "from-slate-950 via-blue-950 to-sky-900",
  },
  Cloudy: {
    morning: "from-slate-300 via-slate-400 to-sky-600",
    afternoon: "from-slate-500 via-slate-600 to-slate-900",
    night: "from-slate-900 via-slate-950 to-black",
  },
  Rainy: {
    morning: "from-slate-500 via-blue-700 to-slate-900",
    afternoon: "from-slate-700 via-indigo-900 to-slate-950",
    night: "from-slate-950 via-black to-blue-950",
  },
  Snowy: {
    morning: "from-sky-100 via-cyan-200 to-blue-400",
    afternoon: "from-cyan-100 via-sky-300 to-blue-500",
    night: "from-slate-900 via-blue-900 to-cyan-900",
  },
  Thunderstorm: {
    morning: "from-slate-700 via-indigo-900 to-slate-950",
    afternoon: "from-slate-900 via-violet-950 to-black",
    night: "from-black via-slate-950 to-indigo-950",
  },
  Fog: {
    morning: "from-slate-200 via-slate-400 to-slate-600",
    afternoon: "from-slate-400 via-slate-600 to-slate-800",
    night: "from-slate-800 via-slate-900 to-black",
  },
  Haze: {
    morning: "from-amber-100 via-orange-200 to-sky-400",
    afternoon: "from-amber-200 via-yellow-300 to-orange-500",
    night: "from-slate-900 via-amber-950 to-slate-950",
  },
};

export default function WeatherDashboard() {
  const { unit, setUnit } = useTemperatureUnit();
  const {
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
  } = useWeatherDashboard();

  const backgroundClass = weather
    ? weatherColorClasses[weather.condition][weather.timeOfDay]
    : "from-gray-900 to-slate-900";

  const emptyTitle = isInitialLoading
    ? "Fetching local weather"
    : weatherError
      ? "Weather lookup unavailable"
      : "Welcome to SKYNOTE";

  const emptyDescription = isInitialLoading
    ? "Checking your location and loading the latest forecast."
    : weatherError ||
      statusMessage ||
      "Search for a city to explore the latest forecast with a visual weather scene.";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div
        className={cn(
          "absolute inset-0 z-0 bg-gradient-to-br transition-colors duration-1000",
          backgroundClass
        )}
      >
        {weather ? (
          <WeatherVisualization
            weatherCondition={weather.condition}
            timeOfDay={weather.timeOfDay}
            localHour={weather.localHour}
          />
        ) : null}
        <div className="weather-vignette pointer-events-none absolute inset-0" />
        <div className="weather-noise pointer-events-none absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10 min-h-screen w-full overflow-y-auto no-scrollbar">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:p-6 lg:p-8">
          <WeatherToolbar
            isLoading={isInitialLoading || isRefreshing}
            unit={unit}
            currentLocation={weather?.location}
            recentSearches={recentSearches}
            onSearch={(location) => search({ location })}
            onRefresh={refresh}
            onUnitChange={setUnit}
          />

          {statusMessage ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/15 bg-white/10 px-3 py-1 text-white/88 backdrop-blur-md"
              >
                <Compass className="mr-1 h-3 w-3" />
                {geolocationState.charAt(0).toUpperCase() + geolocationState.slice(1)}
              </Badge>
              <p className="text-sm text-white/80">{statusMessage}</p>
            </div>
          ) : null}

          {weather ? (
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
              <div className="flex flex-col gap-4 md:gap-6 lg:col-span-3">
                <CurrentWeather
                  data={weather}
                  unit={unit}
                  isRefreshing={isRefreshing}
                  onRefresh={refresh}
                />
                <WeatherNarrative
                  narrative={narrative}
                  isLoading={isGeneratingNarrative}
                  onRefresh={refreshNarrative}
                  isDisabled={!weather}
                />
                <InteractiveHourlyForecast data={weather} unit={unit} />
                <SunriseSunset sunrise={weather.sunrise} sunset={weather.sunset} />
              </div>
              <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
                <DailyTemperatureTrend data={weather} unit={unit} />
                <WeatherForecast data={weather} unit={unit} />
              </div>
            </div>
          ) : (
            <WeatherStatus
              isLoading={isInitialLoading}
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
        </div>
      </div>
    </div>
  );
}
