"use client";

import { useState } from "react";
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
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className="weather-panel weather-panel-tertiary relative z-[120] isolate overflow-visible rounded-[1.75rem] p-4 md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5">
        <div className="min-w-0 flex-1 xl:min-w-[28rem]">
          <LocationSelector
            onLocationSearch={onSearch}
            isLoading={isLoading}
            initialLocation={currentLocation}
            onSuggestionsOpenChange={setIsSearching}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:shrink-0 xl:justify-end">
          <div className="flex rounded-full border border-white/12 bg-slate-950/16 p-1 shadow-inner shadow-black/5 backdrop-blur-sm">
            <Button
              type="button"
              size="sm"
              variant={unit === "celsius" ? "secondary" : "ghost"}
              className="min-w-12 rounded-full px-4 text-sm font-semibold text-white hover:text-white md:text-base"
              onClick={() => onUnitChange("celsius")}
            >
              °C
            </Button>
            <Button
              type="button"
              size="sm"
              variant={unit === "fahrenheit" ? "secondary" : "ghost"}
              className="min-w-12 rounded-full px-4 text-sm font-semibold text-white/78 hover:text-white md:text-base"
              onClick={() => onUnitChange("fahrenheit")}
            >
              °F
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 border-white/12 bg-slate-900/14 px-4 text-sm font-semibold text-white/90 hover:border-sky-200/28 hover:bg-slate-800/26 md:px-5 md:text-base"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {recentSearches.length > 0 && !isSearching ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/82">
          <span className="inline-flex items-center gap-2 font-medium text-white/62">
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
                className="cursor-pointer border-white/12 bg-slate-900/14 px-3 py-1 text-sm font-semibold text-white/88 hover:border-sky-200/28 hover:bg-slate-800/26"
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
