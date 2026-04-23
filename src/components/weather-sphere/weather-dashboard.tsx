"use client";

import type { CSSProperties } from "react";
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

const weatherUiTokens: Record<
  WeatherCondition,
  Record<
    TimeOfDay,
    {
      accent: string;
      accentSoft: string;
      accentRgb: string;
      edgeRgb: string;
    }
  >
> = {
  Sunny: {
    morning: { accent: "#fbbf24", accentSoft: "#fde68a", accentRgb: "251 191 36", edgeRgb: "253 224 71" },
    afternoon: { accent: "#38bdf8", accentSoft: "#bae6fd", accentRgb: "56 189 248", edgeRgb: "125 211 252" },
    night: { accent: "#c4b5fd", accentSoft: "#dbeafe", accentRgb: "196 181 253", edgeRgb: "191 219 254" },
  },
  Cloudy: {
    morning: { accent: "#cbd5e1", accentSoft: "#e2e8f0", accentRgb: "203 213 225", edgeRgb: "226 232 240" },
    afternoon: { accent: "#94a3b8", accentSoft: "#cbd5e1", accentRgb: "148 163 184", edgeRgb: "203 213 225" },
    night: { accent: "#93c5fd", accentSoft: "#cbd5e1", accentRgb: "147 197 253", edgeRgb: "191 219 254" },
  },
  Rainy: {
    morning: { accent: "#38bdf8", accentSoft: "#bfdbfe", accentRgb: "56 189 248", edgeRgb: "191 219 254" },
    afternoon: { accent: "#60a5fa", accentSoft: "#bfdbfe", accentRgb: "96 165 250", edgeRgb: "147 197 253" },
    night: { accent: "#818cf8", accentSoft: "#bfdbfe", accentRgb: "129 140 248", edgeRgb: "165 180 252" },
  },
  Snowy: {
    morning: { accent: "#a5f3fc", accentSoft: "#e0f2fe", accentRgb: "165 243 252", edgeRgb: "224 242 254" },
    afternoon: { accent: "#7dd3fc", accentSoft: "#e0f2fe", accentRgb: "125 211 252", edgeRgb: "186 230 253" },
    night: { accent: "#bfdbfe", accentSoft: "#e0f2fe", accentRgb: "191 219 254", edgeRgb: "219 234 254" },
  },
  Thunderstorm: {
    morning: { accent: "#a78bfa", accentSoft: "#c4b5fd", accentRgb: "167 139 250", edgeRgb: "196 181 253" },
    afternoon: { accent: "#8b5cf6", accentSoft: "#c4b5fd", accentRgb: "139 92 246", edgeRgb: "196 181 253" },
    night: { accent: "#7c3aed", accentSoft: "#c4b5fd", accentRgb: "124 58 237", edgeRgb: "167 139 250" },
  },
  Fog: {
    morning: { accent: "#e2e8f0", accentSoft: "#f8fafc", accentRgb: "226 232 240", edgeRgb: "248 250 252" },
    afternoon: { accent: "#cbd5e1", accentSoft: "#e2e8f0", accentRgb: "203 213 225", edgeRgb: "226 232 240" },
    night: { accent: "#94a3b8", accentSoft: "#cbd5e1", accentRgb: "148 163 184", edgeRgb: "203 213 225" },
  },
  Haze: {
    morning: { accent: "#fb923c", accentSoft: "#fed7aa", accentRgb: "251 146 60", edgeRgb: "253 186 116" },
    afternoon: { accent: "#f59e0b", accentSoft: "#fde68a", accentRgb: "245 158 11", edgeRgb: "252 211 77" },
    night: { accent: "#f97316", accentSoft: "#fdba74", accentRgb: "249 115 22", edgeRgb: "251 146 60" },
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

  const weatherSceneKey = weather
    ? `${weather.location}-${weather.condition}-${weather.timeOfDay}-${weather.lastUpdated}`
    : "empty-state";

  const sceneStyle = (weather
    ? {
        "--weather-accent": weatherUiTokens[weather.condition][weather.timeOfDay].accent,
        "--weather-accent-soft": weatherUiTokens[weather.condition][weather.timeOfDay].accentSoft,
        "--weather-accent-rgb": weatherUiTokens[weather.condition][weather.timeOfDay].accentRgb,
        "--weather-edge-rgb": weatherUiTokens[weather.condition][weather.timeOfDay].edgeRgb,
      }
    : undefined) as CSSProperties | undefined;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div
        className={cn(
          "absolute inset-0 z-0 bg-gradient-to-br transition-colors duration-[1400ms]",
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

      <div
        className="relative z-10 min-h-screen w-full overflow-y-auto no-scrollbar"
        style={sceneStyle}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:gap-6 lg:p-8">
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
            <div
              key={weatherSceneKey}
              className="weather-stage-enter grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-5 lg:gap-6"
            >
              <div className="flex flex-col gap-4 md:gap-5 lg:col-span-3 lg:gap-6">
                <CurrentWeather
                  data={weather}
                  unit={unit}
                  isRefreshing={isRefreshing}
                  onRefresh={refresh}
                />
                <div className="weather-card-enter weather-card-enter-delay-1">
                  <WeatherNarrative
                    narrative={narrative}
                    isLoading={isGeneratingNarrative}
                    onRefresh={refreshNarrative}
                    isDisabled={!weather}
                  />
                </div>
                <div className="weather-card-enter weather-card-enter-delay-2">
                  <InteractiveHourlyForecast data={weather} unit={unit} />
                </div>
                <div className="weather-card-enter weather-card-enter-delay-3">
                  <SunriseSunset sunrise={weather.sunrise} sunset={weather.sunset} />
                </div>
              </div>
              <div className="flex flex-col gap-4 md:gap-5 lg:col-span-2 lg:gap-6">
                <div className="weather-card-enter weather-card-enter-delay-2">
                  <DailyTemperatureTrend data={weather} unit={unit} />
                </div>
                <div className="weather-card-enter weather-card-enter-delay-4">
                  <WeatherForecast data={weather} unit={unit} />
                </div>
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
