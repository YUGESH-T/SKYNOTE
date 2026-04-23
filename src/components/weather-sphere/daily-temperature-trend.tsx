import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  celsiusToFahrenheit,
  type TemperatureUnit,
  type WeatherData,
} from "@/lib/weather-data";

interface DailyTemperatureTrendProps {
  data: WeatherData;
  unit: TemperatureUnit;
}

export default function DailyTemperatureTrend({
  data,
  unit,
}: DailyTemperatureTrendProps) {
  const chartData = data.forecast.map((item) => ({
    day: item.day,
    high:
      unit === "fahrenheit"
        ? celsiusToFahrenheit(item.tempHighC)
        : item.tempHighC,
    low:
      unit === "fahrenheit"
        ? celsiusToFahrenheit(item.tempLowC)
        : item.tempLowC,
  }));

  const chartConfig = {
    high: {
      label: "High",
      color: "#f97316",
    },
    low: {
      label: "Low",
      color: "#7dd3fc",
    },
  };

  return (
    <Card className="weather-panel transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="text-lg text-white md:text-xl">
          5-Day Temperature Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <LineChart
            data={chartData}
            margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.12)"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs fill-white/72"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}°`}
              className="text-xs fill-white/72"
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="high"
              type="monotone"
              stroke="var(--color-high)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              dataKey="low"
              type="monotone"
              stroke="var(--color-low)"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
