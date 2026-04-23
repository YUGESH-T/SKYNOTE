"use client";

import { History, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TemperatureUnit } from "@/lib/weather-data";
import LocationSelector from "./location-selector";

interface WeatherToolbarProps {
  isLoading: boolean;
  unit: TemperatureUnit;
  currentLocation?: string;
  recentSearches: string[];
  onSearch: (location: string) => void;
  onRefresh: () => void;
  onUnitChange: (unit: TemperatureUnit) => void;
}

export default function WeatherToolbar({
  isLoading,
  unit,
  currentLocation,
  recentSearches,
  onSearch,
  onRefresh,
  onUnitChange,
}: WeatherToolbarProps) {
  return (
    <div className="weather-panel space-y-4 rounded-3xl p-4 md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <LocationSelector
            onLocationSearch={onSearch}
            isLoading={isLoading}
            initialLocation={currentLocation}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-white/15 bg-slate-950/28 p-1 shadow-inner shadow-black/10 backdrop-blur-sm">
            <Button
              type="button"
              size="sm"
              variant={unit === "celsius" ? "secondary" : "ghost"}
              className="min-w-12 rounded-full px-4 text-base font-semibold text-white hover:text-white"
              onClick={() => onUnitChange("celsius")}
            >
              °C
            </Button>
            <Button
              type="button"
              size="sm"
              variant={unit === "fahrenheit" ? "secondary" : "ghost"}
              className="min-w-12 rounded-full px-4 text-base font-semibold text-white/78 hover:text-white"
              onClick={() => onUnitChange("fahrenheit")}
            >
              °F
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-12 border-white/15 bg-slate-900/22 px-5 text-base font-semibold text-white hover:border-sky-200/30 hover:bg-slate-800/36"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      {recentSearches.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/82">
          <span className="inline-flex items-center gap-2 font-medium text-white/68">
            <History className="h-4 w-4" />
            Recent
          </span>
          {recentSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSearch(item)}
              className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Badge
                variant="outline"
                className="cursor-pointer border-white/15 bg-slate-900/20 px-3 py-1 text-sm font-semibold text-white/90 hover:border-sky-200/30 hover:bg-slate-800/34"
              >
                <MapPin className="mr-1 h-3 w-3" />
                {item}
              </Badge>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
