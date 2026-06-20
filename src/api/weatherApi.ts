//const BASE_URL = "https://api.weather-ai.co/v1";
//const API_KEY = process.env.REACT_APP_WEATHERAI_KEY;

const BASE_URL =
  "https://weatherproxy-o6366efzxq-uc.a.run.app";

type ResolvedPlace = {
  label: string;
  lat: number;
  lon: number;
  city: string;
  county?: string;
  country?: string;
  displayName: string;
};


async function request(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Weather API error: ${res.status}`);
  }

  return res.json();
}


async function geocodeQuery(query: string): Promise<ResolvedPlace | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data?.length) return null;

  const best = data[0];
  return {
    label: best.display_name || query,
    displayName: best.display_name || query,
    lat: Number(best.lat),
    lon: Number(best.lon),
    city: best.address?.city || best.address?.town || best.address?.village || query,
    county: best.address?.county,
    country: best.address?.country,
  };
}

export async function resolvePlace(city: string, county: string) {
  const cleanCity = city.trim();
  const cleanCounty = county.trim();

  if (!cleanCity) {
    throw new Error("Enter a city name.");
  }

  const attempts = [
    [cleanCity, cleanCounty].filter(Boolean).join(", "),
    [cleanCity, cleanCounty, "Kenya"].filter(Boolean).join(", "),
    cleanCity,
  ].filter(Boolean);

  for (const query of attempts) {
    const result = await geocodeQuery(query);
    if (result) return result;
  }

  throw new Error(`Could not find a match for "${cleanCity}${cleanCounty ? `, ${cleanCounty}` : ""}".`);
}

export async function getWeather(lat: number, lon: number, days = 7, ai = true) {
  return request(`/weather?lat=${lat}&lon=${lon}&days=${days}&ai=${ai}&units=metric`);
}

export async function getWeatherByPlace(city: string, county: string, days = 7, ai = true) {
  const place = await resolvePlace(city, county);
  const weather = await getWeather(place.lat, place.lon, days, ai);
  return { place, weather };
}

export async function getUsage() {
  return request(`/usage`);
}