export type PetType = "dog" | "cat" | "other";
export type PetSize = "small" | "medium" | "large";
export type BowlSize = "small" | "medium" | "large";

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  size: PetSize;
  bowlSize: BowlSize;
  bowlMl: number; // adjustable volume
  lastRefill: number; // epoch ms
  createdAt: number;
}

export interface Weather {
  tempC: number;
  humidity: number; // 0-100
  fetchedAt: number;
  lat?: number;
  lon?: number;
  locationName?: string;
}

export interface HistoryEntry {
  id: string;
  petId: string;
  petName: string;
  at: number;
}

export type Sensitivity = "low" | "medium" | "high";
export type AlertTone = "drop" | "bell" | "bark" | "meow" | "chime";
export type Theme = "default" | "oled" | "midnight" | "forest" | "plum" | "espresso" | "slate";

export interface Settings {
  sensitivity: Sensitivity;
  tone: AlertTone;
  nightStart: number; // hour 0-23
  nightEnd: number;
  notificationsEnabled: boolean;
  darkMode: "auto" | "light" | "dark";
  largeText: boolean;
  highContrast: boolean;
  theme: Theme;
}

export interface AppState {
  pets: Pet[];
  activePetId: string | null;
  weather: Weather | null;
  history: HistoryEntry[];
  settings: Settings;
  onboarded: boolean;
}
