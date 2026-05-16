import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { AppState, Pet, Settings, HistoryEntry, Weather } from "./types";

const KEY = "bowlbuddy.state.v1";

const defaultSettings: Settings = {
  sensitivity: "medium",
  tone: "drop",
  nightStart: 22,
  nightEnd: 7,
  notificationsEnabled: false,
  darkMode: "auto",
  largeText: false,
  highContrast: false,
};

const initial: AppState = {
  pets: [],
  activePetId: null,
  weather: null,
  history: [],
  settings: defaultSettings,
  onboarded: false,
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    return { ...initial, ...parsed, settings: { ...defaultSettings, ...(parsed.settings ?? {}) } };
  } catch {
    return initial;
  }
}

interface Ctx {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  activePet: Pet | null;
  refillActive: () => void;
  addPet: (pet: Omit<Pet, "id" | "createdAt" | "lastRefill">) => Pet;
  removePet: (id: string) => void;
  updatePet: (id: string, patch: Partial<Pet>) => void;
  setActivePet: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setWeather: (w: Weather | null) => void;
  setOnboarded: (v: boolean) => void;
  clearHistory: () => void;
}

const BBCtx = createContext<Ctx | null>(null);

export function BBProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load());

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const activePet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0] ?? null;

  const addPet: Ctx["addPet"] = useCallback((pet) => {
    const newPet: Pet = {
      ...pet,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      lastRefill: Date.now(),
    };
    setState((s) => ({ ...s, pets: [...s.pets, newPet], activePetId: s.activePetId ?? newPet.id }));
    return newPet;
  }, []);

  const removePet = useCallback((id: string) => {
    setState((s) => {
      const pets = s.pets.filter((p) => p.id !== id);
      return { ...s, pets, activePetId: s.activePetId === id ? (pets[0]?.id ?? null) : s.activePetId };
    });
  }, []);

  const updatePet = useCallback((id: string, patch: Partial<Pet>) => {
    setState((s) => ({ ...s, pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }, []);

  const setActivePet = useCallback((id: string) => {
    setState((s) => ({ ...s, activePetId: id }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const setWeather = useCallback((w: Weather | null) => {
    setState((s) => ({ ...s, weather: w }));
  }, []);

  const setOnboarded = useCallback((v: boolean) => {
    setState((s) => ({ ...s, onboarded: v }));
  }, []);

  const clearHistory = useCallback(() => {
    setState((s) => ({ ...s, history: [] }));
  }, []);

  const refillActive = useCallback(() => {
    setState((s) => {
      const pid = s.activePetId ?? s.pets[0]?.id;
      if (!pid) return s;
      const pet = s.pets.find((p) => p.id === pid)!;
      const now = Date.now();
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        petId: pid,
        petName: pet.name,
        at: now,
      };
      return {
        ...s,
        pets: s.pets.map((p) => (p.id === pid ? { ...p, lastRefill: now } : p)),
        history: [entry, ...s.history].slice(0, 500),
      };
    });
  }, []);

  return (
    <BBCtx.Provider
      value={{
        state, setState, activePet, refillActive,
        addPet, removePet, updatePet, setActivePet,
        updateSettings, setWeather, setOnboarded, clearHistory,
      }}
    >
      {children}
    </BBCtx.Provider>
  );
}

export function useBB() {
  const ctx = useContext(BBCtx);
  if (!ctx) throw new Error("useBB must be used inside BBProvider");
  return ctx;
}
