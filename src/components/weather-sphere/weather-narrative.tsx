import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface WeatherNarrativeProps {
  narrative: string | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function WeatherNarrative({ narrative, isLoading, onRefresh }: WeatherNarrativeProps) {
  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-lg transition-all duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <CardTitle className="text-xl">AI Summary</CardTitle>
        </div>
        <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-8 h-8 rounded-full hover:bg-white/10"
            aria-label="Refresh AI summary"
        >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && !narrative ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-5/6 bg-white/10" />
            </div>
        ) : (
            <p className="text-base text-foreground/80">{narrative}</p>
        )}
      </CardContent>
    </Card>
  );
}
