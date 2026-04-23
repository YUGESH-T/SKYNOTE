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
    <Card className="weather-panel weather-panel-primary weather-card-enter transition-all duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 md:pb-4">
        <div className="weather-copy-zone rounded-2xl px-4 py-3 md:px-5">
          <CardTitle className="weather-text-strong text-3xl font-bold tracking-tight md:text-4xl">
            {data.location}
          </CardTitle>
          <CardDescription className="weather-text-soft mt-1 text-base text-white/90 md:text-lg">
            {data.currentDateLabel} at {data.currentTime}
          </CardDescription>
          <p className="weather-text-soft mt-3 text-[11px] uppercase tracking-[0.26em] text-white/66 md:text-xs">
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
          className="h-11 w-11 rounded-full border border-white/15 bg-white/12 hover:bg-white/18"
        >
          <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="weather-copy-zone rounded-[1.75rem] px-5 py-4 md:px-6 md:py-5">
            <div className="flex items-start">
              <p className="weather-text-strong text-7xl font-bold tracking-[-0.08em] text-white sm:text-8xl md:text-[6.6rem]">
                {temperatureLabel.replace(/°[CF]/, "")}
              </p>
              <span className="weather-text-soft mt-2 text-3xl font-medium text-white/92">
                {unit === "fahrenheit" ? "°F" : "°C"}
              </span>
            </div>
            <p className="weather-text-soft -mt-2 text-xl text-white/90 md:text-2xl">
              {data.condition}
            </p>
          </div>
          <WeatherIcon
            condition={data.condition}
            className="h-28 w-28 text-white drop-shadow-lg md:h-32 md:w-32"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg pt-1 text-center md:grid-cols-4 md:gap-3">
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-2xl p-3 md:p-4">
            <Thermometer className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {formatTemperature(data.feelsLikeC, unit)}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-white/68 md:text-sm md:normal-case md:tracking-normal">
              Feels Like
            </p>
          </div>
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-2xl p-3 md:p-4">
            <Droplets className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {data.humidity}%
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-white/68 md:text-sm md:normal-case md:tracking-normal">
              Humidity
            </p>
          </div>
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-2xl p-3 md:p-4">
            <Wind className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {formatWindSpeed(data.windSpeedKph, unit)}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-white/68 md:text-sm md:normal-case md:tracking-normal">
              Wind
            </p>
          </div>
          <div className="weather-data-chip flex flex-col items-center gap-1 rounded-2xl p-3 md:p-4">
            <CloudRain className="h-6 w-6 text-white/85" />
            <p className="weather-text-soft text-base font-bold text-white">
              {data.precipitationChance ?? 0}%
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-white/68 md:text-sm md:normal-case md:tracking-normal">
              Rain Chance
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
