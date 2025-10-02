
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { WeatherData } from "@/lib/weather-data";

interface DailyTemperatureTrendProps {
  data: WeatherData;
}

export default function DailyTemperatureTrend({ data }: DailyTemperatureTrendProps) {
  const chartData = data.forecast.map(item => ({
    day: item.day,
    high: item.tempHigh,
    low: item.tempLow,
  }));

  const chartConfig = {
    high: {
      label: "High",
      color: "hsl(var(--primary))",
    },
    low: {
        label: "Low",
        color: "hsl(var(--chart-2))",
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-lg transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">7-Day Temperature Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(var(--foreground), 0.1)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}°`}
              className="text-xs fill-muted-foreground"
            />
            <Tooltip
              cursor={{ stroke: 'hsla(var(--foreground), 0.2)', strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="high"
              type="monotone"
              stroke="var(--color-high)"
              strokeWidth={2}
              dot={false}
            />
             <Line
              dataKey="low"
              type="monotone"
              stroke="var(--color-low)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
