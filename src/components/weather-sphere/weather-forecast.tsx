import { CloudRain, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatTemperature,
  type TemperatureUnit,
  type WeatherData,
} from "@/lib/weather-data";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import WeatherIcon from "./weather-icon";

interface WeatherForecastProps {
  data: WeatherData;
  unit: TemperatureUnit;
}

export default function WeatherForecast({ data, unit }: WeatherForecastProps) {
  const globalLow = Math.min(...data.forecast.map((item) => item.tempLowC));
  const globalHigh = Math.max(...data.forecast.map((item) => item.tempHighC));
  const range = Math.max(globalHigh - globalLow, 1);

  return (
    <Card className="weather-panel transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="weather-text-strong text-lg md:text-xl">
          5-Day Outlook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] md:h-auto">
          <div className="space-y-2 pr-4 md:space-y-4">
            {data.forecast.map((item, index) => (
              <div
                key={`${item.day}-${index}`}
                className={cn(
                  "weather-panel-interactive grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg p-2 text-sm md:text-base"
                )}
              >
                <div className="min-w-0">
                  <p className="weather-text-soft font-semibold text-white">{item.day}</p>
                  <p className="text-xs text-white/70">{item.dateLabel}</p>
                </div>
                <WeatherIcon
                  condition={item.condition}
                  className="h-7 w-7 text-white drop-shadow-lg md:h-8 md:w-8"
                />
                <div className="flex items-center gap-2 text-xs text-white/82 md:text-sm">
                  <Droplets className="h-4 w-4 text-white/70" />
                  <span>{item.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/82 md:text-sm">
                  <CloudRain className="h-4 w-4 text-white/70" />
                  <span>{item.precipitationChance ?? 0}%</span>
                </div>
                <div className="col-span-3 flex items-center gap-2 md:col-span-1">
                  <span className="weather-text-soft w-16 text-right font-semibold text-white">
                    {formatTemperature(item.tempLowC, unit)}
                  </span>
                  <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-orange-400"
                      style={{
                        width: `${((item.tempHighC - item.tempLowC) / range) * 100}%`,
                        marginLeft: `${((item.tempLowC - globalLow) / range) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="weather-text-soft w-16 text-left font-semibold text-white">
                    {formatTemperature(item.tempHighC, unit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
