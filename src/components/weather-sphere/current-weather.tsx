import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { WeatherData } from "@/lib/weather-data";
import WeatherIcon from "./weather-icon";
import { Droplets, Wind, Thermometer } from "lucide-react";

interface CurrentWeatherProps {
  data: WeatherData;
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-lg transition-all duration-300 ease-in-out">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">{data.location}</CardTitle>
        <CardDescription className="text-base text-foreground/80">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-start">
              <p className="text-7xl font-bold tracking-tighter">{data.temperature}</p>
              <span className="text-2xl font-medium mt-1">°C</span>
            </div>
            <p className="text-lg text-foreground/80 -mt-2">{data.condition}</p>
          </div>
          <WeatherIcon condition={data.condition} className="w-24 h-24 text-white drop-shadow-lg" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center p-3 bg-white/10 rounded-lg">
          <div className="flex flex-col items-center gap-1 p-2">
            <Thermometer className="w-6 h-6 text-foreground/80" />
            <p className="font-bold text-base">{data.feelsLike}°C</p>
            <p className="text-sm text-foreground/60">Feels Like</p>
          </div>
          <div className="flex flex-col items-center gap-1 p-2">
            <Droplets className="w-6 h-6 text-foreground/80" />
            <p className="font-bold text-base">{data.humidity}%</p>
            <p className="text-sm text-foreground/60">Humidity</p>
          </div>
          <div className="flex flex-col items-center gap-1 p-2">
            <Wind className="w-6 h-6 text-foreground/80" />
            <p className="font-bold text-base">{data.windSpeed} km/h</p>
            <p className="text-sm text-foreground/60">Wind</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
