import { CloudRain, Droplets, RefreshCw, Thermometer, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatTemperature,
  formatWindSpeed,
  type TemperatureUnit,
  type WeatherData,
} from "@/lib/weather-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WeatherIcon from "./weather-icon";

interface CurrentWeatherProps {
  data: WeatherData;
  unit: TemperatureUnit;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function CurrentWeather({
  data,
  unit,
  isRefreshing,
  onRefresh,
}: CurrentWeatherProps) {
  const temperatureLabel = formatTemperature(data.temperatureC, unit);

  return (
    <Card className="weather-panel transition-all duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="weather-copy-zone rounded-2xl px-4 py-3">
          <CardTitle className="weather-text-strong text-2xl font-bold">
            {data.location}
          </CardTitle>
          <CardDescription className="weather-text-soft text-base text-white/90">
            {data.currentDateLabel} at {data.currentTime}
          </CardDescription>
          <p className="weather-text-soft mt-2 text-xs uppercase tracking-[0.2em] text-white/68">
            Last updated{" "}
            {new Date(data.lastUpdated).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh weather data"
          className="h-10 w-10 rounded-full border border-white/15 bg-white/12 hover:bg-white/18"
        >
          <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="weather-copy-zone rounded-3xl px-5 py-4">
            <div className="flex items-start">
              <p className="weather-text-strong text-6xl font-bold tracking-tighter text-white sm:text-7xl">
                {temperatureLabel.replace(/°[CF]/, "")}
              </p>
              <span className="weather-text-soft mt-1 text-2xl font-medium text-white/92">
                {unit === "fahrenheit" ? "°F" : "°C"}
              </span>
            </div>
            <p className="weather-text-soft -mt-2 text-lg text-white/90">
              {data.condition}
            </p>
          </div>
          <WeatherIcon
            condition={data.condition}
            className="h-24 w-24 text-white drop-shadow-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg p-3 text-center md:grid-cols-4">
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-lg p-3">
            <Thermometer className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {formatTemperature(data.feelsLikeC, unit)}
            </p>
            <p className="text-sm text-white/74">Feels Like</p>
          </div>
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-lg p-3">
            <Droplets className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {data.humidity}%
            </p>
            <p className="text-sm text-white/74">Humidity</p>
          </div>
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-lg p-3">
            <Wind className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {formatWindSpeed(data.windSpeedKph, unit)}
            </p>
            <p className="text-sm text-white/74">Wind</p>
          </div>
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-lg p-3">
            <CloudRain className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {data.precipitationChance ?? 0}%
            </p>
            <p className="text-sm text-white/74">Rain Chance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
