import { CloudRain, Droplets, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatTemperature,
  formatWindSpeed,
  type TemperatureUnit,
  type WeatherData,
} from "@/lib/weather-data";
import WeatherIcon from "./weather-icon";

interface InteractiveHourlyForecastProps {
  data: WeatherData;
  unit: TemperatureUnit;
}

export default function InteractiveHourlyForecast({
  data,
  unit,
}: InteractiveHourlyForecastProps) {
  return (
    <Card className="weather-panel transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="weather-text-strong text-lg md:text-xl">
          Next 24 Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
          {data.hourly.map((item, index) => (
            <div
              key={`${item.time}-${index}`}
              className="weather-panel-interactive flex w-32 flex-shrink-0 flex-col items-center space-y-2 rounded-lg p-3 text-center"
            >
              <p className="weather-text-soft text-sm font-semibold text-white/92">
                {item.time}
              </p>
              <WeatherIcon
                condition={item.condition}
                className="h-9 w-9 text-white drop-shadow-lg"
              />
              <p className="weather-text-soft text-xl font-bold text-white">
                {formatTemperature(item.temperatureC, unit)}
              </p>
              <div className="flex w-full flex-col items-center space-y-1 pt-1 text-xs text-white/78">
                <div className="flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-white/70" />
                  <span>{formatWindSpeed(item.windSpeedKph, unit)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-white/70" />
                  <span>{item.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CloudRain className="h-3.5 w-3.5 text-white/70" />
                  <span>{item.precipitationChance ?? 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
