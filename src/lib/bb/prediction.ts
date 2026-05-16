import type { Pet, Weather, Sensitivity, PetSize, BowlSize } from "./types";

// Approx pet weight in kg by size category
const WEIGHT_KG: Record<PetSize, number> = { small: 7, medium: 18, large: 35 };

// Default bowl volume in ml
export const BOWL_ML: Record<BowlSize, number> = { small: 350, medium: 700, large: 1400 };

// Bowl surface diameter (cm) for evaporation estimate
const BOWL_DIAM_CM: Record<BowlSize, number> = { small: 13, medium: 18, large: 24 };

const SENS_MULT: Record<Sensitivity, number> = { low: 0.8, medium: 1, high: 1.25 };

// Base water need ~50 ml/kg/day -> ml/hour
function consumptionMlPerHour(pet: Pet): number {
  const kg = WEIGHT_KG[pet.size];
  const daily = 50 * kg;
  return daily / 24;
}

// Rough evaporation model: faster when warm + dry
function evaporationMlPerHour(bowlSize: BowlSize, w: Weather): number {
  const d = BOWL_DIAM_CM[bowlSize];
  const area = Math.PI * (d / 2) ** 2; // cm²
  // ~0.05 ml per cm² per hour at 20C / 50% humidity baseline
  const tempFactor = Math.max(0.4, 1 + (w.tempC - 20) * 0.04);
  const humFactor = Math.max(0.3, 1 - (w.humidity - 50) * 0.008);
  return area * 0.05 * tempFactor * humFactor;
}

export interface Prediction {
  drainMlPerHour: number;
  hoursUntilEmpty: number;
  emptyAt: number; // epoch ms
  fillFraction: number; // 0..1 current
  hoursSinceRefill: number;
}

export function predict(pet: Pet, weather: Weather, sensitivity: Sensitivity): Prediction {
  const drain =
    (consumptionMlPerHour(pet) + evaporationMlPerHour(pet.bowlSize, weather)) *
    SENS_MULT[sensitivity];
  const hoursSinceRefill = (Date.now() - pet.lastRefill) / 3_600_000;
  const usedMl = drain * hoursSinceRefill;
  const fillFraction = Math.max(0, Math.min(1, 1 - usedMl / pet.bowlMl));
  const remainingMl = Math.max(0, pet.bowlMl - usedMl);
  const hoursUntilEmpty = remainingMl / drain;
  const emptyAt = pet.lastRefill + (pet.bowlMl / drain) * 3_600_000;
  return { drainMlPerHour: drain, hoursUntilEmpty, emptyAt, fillFraction, hoursSinceRefill };
}

export function formatHoursAgo(hours: number): string {
  if (hours < 1 / 60) return "just now";
  if (hours < 1) return `${Math.round(hours * 60)} min ago`;
  if (hours < 2) return `1 hr ago`;
  if (hours < 24) return `${Math.round(hours)} hrs ago`;
  const d = Math.round(hours / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

export function formatHoursUntil(hours: number): string {
  if (hours <= 0) return "now";
  if (hours < 1) return `~${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 2) return `~1 hr`;
  if (hours < 24) return `~${Math.round(hours)} hrs`;
  return `~${Math.round(hours / 24)} day(s)`;
}
