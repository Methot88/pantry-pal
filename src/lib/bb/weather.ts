import type { Weather } from "./types";

// Open-Meteo: free, no API key required.
export async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const json = await res.json();
  const c = json.current ?? {};
  return {
    tempC: Number(c.temperature_2m ?? 20),
    humidity: Number(c.relative_humidity_2m ?? 50),
    fetchedAt: Date.now(),
    lat, lon,
  };
}

export function getPositionAsync(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("Geolocation unsupported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 30 * 60 * 1000,
      timeout: 10000,
    });
  });
}

export async function refreshWeather(): Promise<Weather> {
  const pos = await getPositionAsync();
  return fetchWeather(pos.coords.latitude, pos.coords.longitude);
}

// Fallback when location is denied
export const DEFAULT_WEATHER: Weather = {
  tempC: 22,
  humidity: 50,
  fetchedAt: Date.now(),
};
