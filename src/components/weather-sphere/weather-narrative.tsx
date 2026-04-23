import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

interface WeatherNarrativeProps {
  narrative: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  isDisabled?: boolean;
}

export default function WeatherNarrative({
  narrative,
  isLoading,
  onRefresh,
  isDisabled,
}: WeatherNarrativeProps) {
  return (
    <Card className="weather-panel weather-panel-secondary transition-all duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-200" />
          <CardTitle className="weather-text-strong text-xl">AI Summary</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading || isDisabled}
          className="h-8 w-8 rounded-full hover:bg-white/10"
          aria-label="Refresh AI summary"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && !narrative ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-5/6 bg-white/10" />
          </div>
        ) : (
          <div className="weather-copy-zone rounded-2xl px-4 py-3">
            <p className="weather-text-soft text-base leading-7 text-white/92">
              {narrative ?? "Weather guidance will appear here once conditions load."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
