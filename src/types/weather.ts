export interface CurrentWeather {
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
  }
  
  export interface DailyForecast {
    date: string;
    minTemp: number;
    maxTemp: number;
    description: string;
  }
  
  export interface WeatherResponse {
    current: CurrentWeather;
    daily: DailyForecast[];
    summary?: string;
  }
