type WeatherMetricsProps = {
  data?: any;
};

export default function WeatherMetrics({ data }: WeatherMetricsProps) {
  const current = data?.current;
  const raw = data?.raw;
  const hourlyHumidity = raw?.hourly?.[0]?.humidity;

  if (!current) return null;

  const humidity = current.humidity ?? hourlyHumidity;
  const wind = current.windSpeed ?? current.wind;
  const temperature = current.temperature;
 // const condition = current.description ?? current.condition ?? "—";
 const rainChance =
 current.precipitationProbability ??
 raw?.hourly?.[0]?.precipitation_probability ??
 raw?.hourly?.[0]?.precipitationProbability;

  return (
    <div style={container}>
      <Metric
        label="Humidity"
        value={
          humidity !== undefined && humidity !== null && humidity !== ""
            ? `${humidity}%`
            : "—"
        }
      />
      <Metric
        label="Wind"
        value={
          wind !== undefined && wind !== null && wind !== ""
            ? `${wind} km/h`
            : "—"
        }
      />
      <Metric
        label="Temperature"
        value={
          temperature !== undefined && temperature !== null && temperature !== ""
            ? `${temperature}°C`
            : "—"
        }
      />
<Metric
  label="Rain Chance"
  value={
    rainChance !== undefined &&
    rainChance !== null &&
    rainChance !== ""
      ? `${rainChance}%`
      : "—"
  }
/>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div style={card}>
      <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 600, margin: "6px 0 0" }}>
        {value}
      </p>
    </div>
  );
}

const container: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 12,
};

const card: React.CSSProperties = {
  background: "white",
  padding: 14,
  borderRadius: 14,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  border: "1px solid #eef2f7",
};