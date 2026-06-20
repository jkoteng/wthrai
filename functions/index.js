const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const WEATHER_AI_API_KEY = defineSecret("WEATHER_AI_API_KEY");

exports.weatherProxy = onRequest(
  {
    secrets: [WEATHER_AI_API_KEY],
    cors: true,
  },
  async (req, res) => {
    try {
      const lat = String(req.query.lat || "");
      const lon = String(req.query.lon || "");
      const days = String(req.query.days || "7");
      const ai = String(req.query.ai || "true");
      const units = String(req.query.units || "metric");

      if (!lat || !lon) {
        return res.status(400).json({
          error: "lat and lon are required",
        });
      }

      const upstreamUrl = new URL(
        "https://api.weather-ai.co/v1/weather"
      );

      upstreamUrl.searchParams.set("lat", lat);
      upstreamUrl.searchParams.set("lon", lon);
      upstreamUrl.searchParams.set("days", days);
      upstreamUrl.searchParams.set("ai", ai);
      upstreamUrl.searchParams.set("units", units);

      const upstreamRes = await fetch(upstreamUrl.toString(), {
        headers: {
          Authorization: `Bearer ${WEATHER_AI_API_KEY.value()}`,
        },
      });

      const text = await upstreamRes.text();

      return res
        .status(upstreamRes.status)
        .type("application/json")
        .send(text);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: error.message || "Weather proxy failed",
      });
    }
  }
);