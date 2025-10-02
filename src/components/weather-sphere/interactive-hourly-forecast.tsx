import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeatherData } from "@/lib/weather-data";
import WeatherIcon from "./weather-icon";
import { Wind, Droplets } from "lucide-react";

interface InteractiveHourlyForecastProps {
  data: WeatherData;
}

export default function InteractiveHourlyForecast({ data }: InteractiveHourlyForecastProps) {
  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-lg transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Next 24 Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
          {data.hourly.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-shrink-0 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200 w-28 text-center">
              <p className="text-sm font-medium text-foreground/90">{item.time}</p>
              <WeatherIcon condition={item.condition} className="w-9 h-9 text-white drop-shadow-lg" />
              <p className="text-xl font-bold">{item.temperature}°C</p>
              <div className="flex flex-col items-center text-xs text-foreground/70 space-y-1 pt-1 w-full">
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5" />
                    <span>{item.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{item.humidity}%</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
