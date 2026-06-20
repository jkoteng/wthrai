import { useCallback, useState } from "react";
import { getWeather, resolvePlace } from "../api/weatherApi";

type NormalizedWeather = {
  location: {
    city?: string;
    country?: string;
    countryCode?: string;
    name?: string;
    displayName?: string;
    timezone?: string;
  };
  current: {
    temperature?: number | string;
    humidity?: number | string;
    wind?: number | string;
    windSpeed?: number | string;
    condition?: string;
    description?: string;
    icon?: string;
    time?: string;
    feelsLike?: number | string;
    windGust?: number | string;
    uvIndex?: number | string;
    precipitationProbability?: number | string;
  };
  forecast?: any[];
  aiSummary?: string;
  summary?: string;
  raw?: any;
};

type ResolvedPlace = {
  label: string;
  lat: number;
  lon: number;
  city: string;
  county?: string;
  country?: string;
  displayName: string;
};

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function buildDisplayName(location: any, fallbackLabel?: string) {
  if (fallbackLabel?.trim()) return fallbackLabel;

  const parts = [
    location?.displayName ||
      location?.display_name ||
      location?.city ||
      location?.name,
    location?.country || location?.country_code,
  ].filter(Boolean);

  return parts.join(", ");
}

function normalizeWeather(res: any, displayName?: string): NormalizedWeather {
    const location = res?.location ?? {};
    const current = res?.current ?? {};
    const firstHourly = Array.isArray(res?.hourly) ? res.hourly[0] : undefined;
  
    const condition =
      current.condition ??
      current.description ??
      current.weather ??
      "";
  
    const wind =
      current.wind ??
      current.wind_speed ??
      current.windSpeed ??
      "";
  
    const humidity =
      current.humidity ??
      current.relative_humidity ??
      firstHourly?.humidity ??
      "";

const precipitationProbability =
  current.precipitation_probability ??
  current.precipitationProbability ??
  firstHourly?.precipitation_probability ??
  firstHourly?.precipitationProbability ??
  "";
  
    return {
      location: {
        city: location.city ?? location.name ?? "",
        country: location.country ?? location.country_code ?? "",
        countryCode: location.country_code ?? "",
        name: location.name ?? "",
        displayName:
          displayName ||
          location.displayName ||
          location.display_name ||
          "",
      },
      current: {
        temperature: current.temperature ?? current.temp ?? "",
        humidity,
        wind,
        windSpeed: wind,
        condition,
        description: condition,
        precipitationProbability,
      },
      forecast: res?.forecast ?? res?.daily ?? [],
      aiSummary: res?.ai_summary ?? res?.summary ?? res?.aiSummary ?? "",
      summary: res?.ai_summary ?? res?.summary ?? res?.aiSummary ?? "",
      raw: res,
    };
  }
   

export function useWeather() {
  const [data, setData] = useState<NormalizedWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResolvedPlace, setLastResolvedPlace] = useState<ResolvedPlace | null>(null);

  const fetchWeatherForCoords = useCallback(
    async (lat: number, lon: number, displayName?: string) => {
      setLoading(true);
      try {
        const res = await getWeather(lat, lon);
        const normalized = normalizeWeather(res, displayName);
        setData(normalized);
        return normalized;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadBrowserLocationWeather = useCallback(() => {
    setLoadingAction(true);
    setError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported in this browser.");
      setLoadingAction(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const place: ResolvedPlace = {
            label: "My location",
            displayName: "My location",
            lat: latitude,
            lon: longitude,
            city: "My location",
          };

          setLastResolvedPlace(place);
          await fetchWeatherForCoords(latitude, longitude, "My location");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to load weather.");
        } finally {
          setLoadingAction(false);
        }
      },
      (err) => {
        setError(err.message || "Location permission denied.");
        setLoadingAction(false);
      }
    );
  }, [fetchWeatherForCoords]);

  const loadByCoords = useCallback(
    async (lat: number, lon: number, displayName?: string) => {
      try {
        setLoadingAction(true);
        setError(null);

        const resolved: ResolvedPlace = {
          label: displayName || "Selected location",
          displayName: displayName || "Selected location",
          lat,
          lon,
          city: displayName || "Selected location",
        };

        setLastResolvedPlace(resolved);
        await fetchWeatherForCoords(lat, lon, displayName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load weather.");
      } finally {
        setLoadingAction(false);
      }
    },
    [fetchWeatherForCoords]
  );

  const loadByLocation = useCallback(
    async (city: string, county: string) => {
      try {
        setLoadingAction(true);
        setError(null);

        const place = await resolvePlace(city, county);
        setLastResolvedPlace(place);
        await fetchWeatherForCoords(place.lat, place.lon, place.displayName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to find that location.");
      } finally {
        setLoadingAction(false);
      }
    },
    [fetchWeatherForCoords]
  );

  return {
    data,
    loading,
    loadingAction,
    error,
    lastResolvedPlace,
    loadBrowserLocationWeather,
    loadByCoords,
    loadByLocation,
  };
}