"use client";

import { useEffect, useState } from "react";
import type { TemperatureUnit } from "@/lib/weather-data";

const STORAGE_KEY = "skynote-temperature-unit";

export function useTemperatureUnit() {
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "celsius" || saved === "fahrenheit") {
      setUnit(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, unit);
  }, [unit]);

  return {
    unit,
    setUnit,
    toggleUnit: () =>
      setUnit((current) =>
        current === "celsius" ? "fahrenheit" : "celsius"
      ),
  };
}
