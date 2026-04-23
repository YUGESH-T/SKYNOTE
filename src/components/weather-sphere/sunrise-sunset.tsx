import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sunset } from "lucide-react";

interface SunriseSunsetProps {
  sunrise: string;
  sunset: string;
}

export default function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  return (
    <Card className="weather-panel weather-panel-secondary transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="weather-text-strong text-lg md:text-xl">
          Sunrise & Sunset
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="weather-copy-zone space-y-4 rounded-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sunrise className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-base text-white/80">Sunrise</p>
                <p className="weather-text-soft text-xl font-bold text-white">{sunrise}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-base text-white/80">Sunset</p>
                <p className="weather-text-soft text-xl font-bold text-white">{sunset}</p>
              </div>
              <Sunset className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 w-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
