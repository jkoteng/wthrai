import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useWeather } from "../hooks/useWeather";
import WeatherMetrics from "../components/weather/WeatherMetrics";
import AiSummaryCard from "../components/weather/AiSummaryCard";
import styles from "../style/dashboard.module.css";

type SavedCity = {
  label: string;
  lat: number;
  lon: number;
};

const SAVED_KEY = "wthrai-saved-cities";

const QUICK_EXAMPLES = [
  { city: "Nairobi", county: "Nairobi County" },
  { city: "Mombasa", county: "Mombasa County" },
  { city: "Kisumu", county: "Kisumu County" },
];

function readSavedCities(): SavedCity[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getWearAdvice(current: any, aiSummary?: string) {
  const temp = Number(current?.temperature);
  const wind = Number(current?.wind ?? current?.windSpeed ?? 0);
  const humidity = Number(current?.humidity ?? 0);
  const condition = String(
    current?.condition ?? current?.description ?? ""
  ).toLowerCase();

  const bullets: string[] = [];

  if (Number.isFinite(temp)) {
    if (temp >= 30) {
      bullets.push("Light, breathable clothing.");
      bullets.push("Sunglasses and sunscreen.");
      bullets.push("Carry water.");
    } else if (temp >= 24) {
      bullets.push("A T-shirt or light shirt should be enough.");
      bullets.push("Keep a light layer nearby for later.");
    } else if (temp >= 18) {
      bullets.push("A light jacket or hoodie is a good idea.");
      bullets.push("Comfortable long sleeves will work well.");
    } else {
      bullets.push("Wear warm layers.");
      bullets.push("A jacket or coat will help.");
    }
  }

  if (wind >= 20) {
    bullets.push("It looks breezy, so a light jacket will help.");
  }

  if (humidity >= 75 && temp >= 24) {
    bullets.push("The air may feel muggy, so choose breathable fabric.");
  }

  if (
    condition.includes("rain") ||
    condition.includes("shower") ||
    condition.includes("drizzle")
  ) {
    bullets.push("Carry an umbrella or rain jacket.");
  }

  if (condition.includes("cloud")) {
    bullets.push("It may feel cooler than it looks, so keep a layer nearby.");
  }

  return {
    title: "What should I wear today?",
    bullets,
    note: aiSummary ? aiSummary.slice(0, 160) : "",
  };
}

function formatWeatherValue(value: unknown, suffix = "") {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return `${Math.round(num)}${suffix}`;
}

function formatTimeLabel(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const {
    data,
    loading,
    loadingAction,
    error,
    lastResolvedPlace,
    loadBrowserLocationWeather,
    loadByLocation,
    loadByCoords,
  } = useWeather();

  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [savedCities, setSavedCities] = useState<SavedCity[]>(() =>
    readSavedCities()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedCities));
  }, [savedCities]);

  const location = data?.location;
  const current = data?.current;

  const displayLocation = useMemo(() => {
    return (
      location?.displayName ||
      [location?.city || location?.name, location?.country]
        .filter(Boolean)
        .join(", ") ||
      "Search a city to begin"
    );
  }, [location]);

  const temperatureLabel = useMemo(() => {
    const value = Number(current?.temperature);
    return Number.isFinite(value) ? Math.round(value) : null;
  }, [current?.temperature]);

  const wearAdvice = useMemo(
    () => getWearAdvice(current, data?.aiSummary || data?.summary),
    [current, data?.aiSummary, data?.summary]
  );

  const saveCurrentCity = () => {
    if (!lastResolvedPlace) return;

    setSavedCities((prev) => {
      const next = [
        {
          label: lastResolvedPlace.label,
          lat: lastResolvedPlace.lat,
          lon: lastResolvedPlace.lon,
        },
        ...prev.filter((item) => item.label !== lastResolvedPlace.label),
      ];
      return next.slice(0, 8);
    });
  };

  const removeSavedCity = (label: string) => {
    setSavedCities((prev) =>
      prev.filter((cityItem) => cityItem.label !== label)
    );
  };

  const openSavedCity = async (cityItem: SavedCity) => {
    await loadByCoords(cityItem.lat, cityItem.lon, cityItem.label);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!city.trim()) return;

    await loadByLocation(city, county);
  };

  const currentCondition =
    current?.condition ??
    current?.description ??
    data?.raw?.current?.condition ??
    data?.raw?.current?.description ??
    "—";

  const aiSummary =
    data?.aiSummary ??
    data?.summary ??
    data?.raw?.ai_summary ??
    data?.raw?.summary ??
    "";

  const currentTimeLabel = formatTimeLabel(current?.time);
  const isBusy = loadingAction || loading;
  const weatherIcon = current?.icon;

  return (
    <div className={styles.page}>
      {error ? (
        <div className={styles.bannerError}>
          <strong>Lookup issue:</strong> {error}
          <div className={styles.bannerErrorText}>
            The dashboard is still usable. Try a nearby city, check spelling,
            or use one of the quick examples below.
          </div>
        </div>
      ) : null}

      <section className={styles.heroCard}>
        <div className={styles.heroTop}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Weather intelligence dashboard</p>
            <h1 className={styles.title}>{displayLocation}</h1>
            <p className={styles.subtitle}>{currentCondition}</p>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>
                Wind {formatWeatherValue(current?.windSpeed, " km/h")}
              </span>
              <span className={styles.metaPill}>
                Humidity {formatWeatherValue(current?.humidity, "%")}
              </span>
              {currentTimeLabel ? (
                <span className={styles.metaPill}>{currentTimeLabel}</span>
              ) : null}
            </div>
          </div>

          <div className={styles.temperatureWrap}>
            {weatherIcon ? (
              <img
                src={weatherIcon}
                alt={currentCondition}
                className={styles.weatherIcon}
              />
            ) : null}
            <div className={styles.temperatureBlock}>
              <span className={styles.temperatureValue}>
                {temperatureLabel !== null ? temperatureLabel : "—"}
              </span>
              <span className={styles.temperatureUnit}>°C</span>
            </div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button
            onClick={loadBrowserLocationWeather}
            className={styles.primaryButton}
            disabled={isBusy}
          >
            {isBusy ? "Loading..." : "Use My Location"}
          </button>

          <button
            onClick={saveCurrentCity}
            className={styles.secondaryButton}
            disabled={!lastResolvedPlace}
          >
            Save Current City
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Search weather</h2>

        <form onSubmit={handleSubmit} className={styles.searchGrid}>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className={styles.input}
          />

          <input
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            placeholder="County / region"
            className={styles.input}
          />

          <button
            type="submit"
            disabled={isBusy || !city.trim()}
            className={styles.submitButton}
          >
            {isBusy ? "Checking weather..." : "Check weather"}
          </button>
        </form>

        <p className={styles.helperText}>
          Start with a city and county. If the lookup fails, refine the spelling
          or pick a quick example below.
        </p>

        <div className={styles.chipRow}>
          {QUICK_EXAMPLES.map((item) => (
            <button
              key={`${item.city}-${item.county}`}
              type="button"
              onClick={() => {
                setCity(item.city);
                setCounty(item.county);
              }}
              className={styles.chip}
            >
              {item.city}, {item.county}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.twoColumnGrid}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Current summary</h2>
          <div className={styles.summaryStack}>
            <div className={styles.summaryValue}>
              {temperatureLabel !== null ? `${temperatureLabel}°C` : "—"}
            </div>
            <div className={styles.summaryCondition}>{currentCondition}</div>
            <div className={styles.summarySubtext}>
              {currentTimeLabel
                ? `Updated ${currentTimeLabel}`
                : "Weather snapshot for the selected location"}
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Saved cities</h2>

          {savedCities.length === 0 ? (
            <p className={styles.emptyText}>No saved cities yet.</p>
          ) : (
            <div className={styles.savedList}>
              {savedCities.map((cityItem) => (
                <div
                  key={`${cityItem.label}-${cityItem.lat}-${cityItem.lon}`}
                  className={styles.savedCityRow}
                >
                  <button
                    type="button"
                    onClick={() => openSavedCity(cityItem)}
                    className={styles.savedCityButton}
                  >
                    {cityItem.label}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeSavedCity(cityItem.label)}
                    className={styles.dangerButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.panel}>
          <WeatherMetrics data={data} />
        </div>

        <div className={styles.panel}>
          <AiSummaryCard data={data} />
        </div>
      </div>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>{wearAdvice.title}</h2>

        {wearAdvice.bullets.length > 0 ? (
          <ul className={styles.list}>
            {wearAdvice.bullets.map((item, index) => (
              <li key={index} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyText}>No outfit suggestion available yet.</p>
        )}

        {wearAdvice.note ? (
          <p className={styles.noteText}>AI note: {wearAdvice.note}</p>
        ) : null}

        {aiSummary ? (
          <div className={styles.aiFootnote}>
            <strong>Summary:</strong> {aiSummary}
          </div>
        ) : null}
      </section>
    </div>
  );
}