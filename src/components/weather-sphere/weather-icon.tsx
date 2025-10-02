import type { FC } from 'react';
import type { LucideProps } from 'lucide-react';
import { weatherIcons, type WeatherCondition } from '@/lib/weather-data';
import { cn } from '@/lib/utils';

interface WeatherIconProps extends LucideProps {
  condition: WeatherCondition;
}

const animationClasses: Record<WeatherCondition, string> = {
    Sunny: 'animate-sun',
    Cloudy: 'animate-cloud',
    Rainy: 'animate-rain',
    Snowy: 'animate-snow',
    Thunderstorm: 'animate-thunder',
    Fog: 'animate-cloud',
    Haze: 'animate-cloud',
};

const WeatherIcon: FC<WeatherIconProps> = ({ condition, className, ...props }) => {
  const Icon = weatherIcons[condition];
  if (!Icon) return null;

  const animationClass = animationClasses[condition];

  return <Icon className={cn(animationClass, className)} {...props} />;
};

export default WeatherIcon;
