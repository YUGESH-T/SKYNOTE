import { Compass, Loader2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WeatherStatusProps {
  isLoading: boolean;
  title: string;
  description: string;
}

export default function WeatherStatus({
  isLoading,
  title,
  description,
}: WeatherStatusProps) {
  return (
    <div className="mx-auto mt-12 max-w-xl">
      <Alert className="weather-panel border-white/15 bg-slate-950/70 text-white">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : title.toLowerCase().includes("welcome") ? (
          <Compass className="h-4 w-4" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <AlertTitle className="text-base font-semibold text-white">
          {title}
        </AlertTitle>
        <AlertDescription className="text-sm leading-6 text-white/78">
          {description}
        </AlertDescription>
      </Alert>
    </div>
  );
}
