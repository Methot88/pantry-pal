import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Settings as SettingsIcon, History as HistoryIcon, Droplets, RefreshCw, Share2, Thermometer } from "lucide-react";
import { toast } from "sonner";
import { useBB } from "@/lib/bb/store";
import { predict, formatHoursAgo, formatHoursUntil } from "@/lib/bb/prediction";
import { DEFAULT_WEATHER, refreshWeather } from "@/lib/bb/weather";
import { isQuietHour, notify, playTone } from "@/lib/bb/notifications";
import { PetSwitcher } from "./PetSwitcher";
import { BowlVisual } from "./BowlVisual";
import type { PetType } from "@/lib/bb/types";

const emojiFor = (t: PetType, mood: "happy" | "sad") => {
  if (mood === "sad") return t === "dog" ? "🥺" : t === "cat" ? "😿" : "😟";
  return t === "dog" ? "🐶" : t === "cat" ? "🐱" : "🐾";
};

export function Home() {
  const { state, activePet, refillActive, setWeather } = useBB();
  const [now, setNow] = useState(Date.now());
  const [refilling, setRefilling] = useState(false);
  const lastWarnRef = useRef<{ petId: string; kind: "pre" | "post" } | null>(null);

  // Tick every 30s for live updates
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Refresh weather every 15 min if we have permission
  useEffect(() => {
    let cancelled = false;
    const tryRefresh = async () => {
      try {
        const w = await refreshWeather();
        if (!cancelled) setWeather(w);
      } catch {}
    };
    if (!state.weather || Date.now() - state.weather.fetchedAt > 15 * 60_000) tryRefresh();
    const id = setInterval(tryRefresh, 15 * 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []); // eslint-disable-line

  const weather = state.weather ?? DEFAULT_WEATHER;
  const prediction = useMemo(
    () => (activePet ? predict(activePet, weather, state.settings.sensitivity) : null),
    [activePet, weather, state.settings.sensitivity, now]
  );

  // Notification scheduler — checks every tick
  useEffect(() => {
    if (!activePet || !prediction) return;
    if (!state.settings.notificationsEnabled) return;
    if (isQuietHour(new Date(), state.settings.nightStart, state.settings.nightEnd)) return;

    const msUntilEmpty = prediction.emptyAt - Date.now();
    const minutesUntil = msUntilEmpty / 60_000;

    const key = activePet.id;
    // 30 min before
    if (minutesUntil <= 30 && minutesUntil > 15 && lastWarnRef.current?.kind !== "pre") {
      notify("Bowl Buddy", `🐶 ${activePet.name}'s bowl is running low. Time to top it up!`);
      playTone(state.settings.tone);
      lastWarnRef.current = { petId: key, kind: "pre" };
    }
    // 15 min after empty
    if (minutesUntil <= -15 && lastWarnRef.current?.kind !== "post") {
      notify("Bowl Buddy", `💧 ${activePet.name}'s bowl looks dry — a quick refill?`);
      playTone(state.settings.tone);
      lastWarnRef.current = { petId: key, kind: "post" };
    }
  }, [now, prediction, activePet, state.settings]);

  if (!activePet || !prediction) return null;

  const handleRefill = () => {
    setRefilling(true);
    refillActive();
    lastWarnRef.current = null;
    playTone(state.settings.tone);
    toast.success(`${activePet.name}'s bowl refilled 💧`);
    setTimeout(() => setRefilling(false), 800);
  };

  const handleShare = async () => {
    const code = btoa(`${activePet.id.slice(0, 6)}-${Date.now().toString(36)}`).slice(0, 8);
    const url = `${window.location.origin}/?join=${code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bowl Buddy", text: `Watch ${activePet.name}'s bowl with me!`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied");
      }
    } catch {}
  };

  const fill = prediction.fillFraction;
  const ringColor = fill > 0.5 ? "hsl(var(--primary))" : fill > 0.18 ? "hsl(38 95% 55%)" : "hsl(var(--destructive))";
  const mood: "happy" | "sad" = fill < 0.18 ? "sad" : "happy";
  const petFace = emojiFor(activePet.type, mood);

  return (
    <div className="min-h-screen bg-gradient-sky">
      <header className="safe-top px-5 pb-2 flex items-center gap-2">
        <PetSwitcher />
        <div className="ml-auto flex items-center gap-1">
          <button onClick={handleShare} className="h-11 w-11 grid place-items-center rounded-2xl hover:bg-muted tap-44" aria-label="Share bowl">
            <Share2 className="h-5 w-5" />
          </button>
          <Link to="/history" className="h-11 w-11 grid place-items-center rounded-2xl hover:bg-muted tap-44" aria-label="History">
            <HistoryIcon className="h-5 w-5" />
          </Link>
          <Link to="/settings" className="h-11 w-11 grid place-items-center rounded-2xl hover:bg-muted tap-44" aria-label="Settings">
            <SettingsIcon className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="px-5 pt-2 flex flex-col items-center">
        {/* Status pill */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-muted-foreground py-3">
          <Thermometer className="h-3.5 w-3.5" />
          {Math.round(weather.tempC)}°C · {Math.round(weather.humidity)}% humidity
          {state.weather ? "" : " (estimate)"}
        </div>

        {/* Big visual — square frame so ring + bowl share the same center */}
        <div className="relative grid place-items-center" style={{ width: 300, height: 300 }}>
          {/* Pet face peeking from top-right of the bowl */}
          <div
            className="absolute z-10 grid place-items-center rounded-full bg-card border-2 border-border shadow-elev animate-bob"
            style={{ top: 4, right: 4, width: 72, height: 72, fontSize: 44, lineHeight: 1 }}
            aria-label={`${activePet.name} is ${mood}`}
            title={mood === "sad" ? "Bowl is low — please refill!" : "Happy and hydrated"}
          >
            <span>{petFace}</span>
          </div>
          <svg
            className="absolute inset-0"
            width="300"
            height="300"
            viewBox="0 0 100 100"
            style={{ transform: "rotate(-90deg)" }}
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
            <circle
              cx="50" cy="50" r="46" fill="none"
              stroke={ringColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - fill)}
              style={{ transition: "stroke-dashoffset 0.8s var(--ease-spring), stroke 0.4s" }}
            />
          </svg>
          <BowlVisual fillFraction={fill} size={230} />
        </div>

        {/* Stats */}
        <div className="mt-4 text-center space-y-1">
          <p className="font-display text-3xl font-black text-balance">
            {fill > 0.5 ? "Bowl looks great" : fill > 0.18 ? "Getting low" : fill > 0.02 ? "Almost empty" : "Bowl is dry"}
          </p>
          <p className="text-muted-foreground">
            Last refill {formatHoursAgo(prediction.hoursSinceRefill)}
          </p>
          <p className="text-muted-foreground">
            Likely dry in <span className="text-foreground font-semibold">{formatHoursUntil(prediction.hoursUntilEmpty)}</span>
          </p>
        </div>

        {/* Refill button — giant, at least ~1/3 screen */}
        <div className="relative w-full max-w-md mt-8 px-2">
          {refilling && (
            <span className="absolute inset-0 rounded-3xl bg-accent/30 animate-ripple pointer-events-none" />
          )}
          <button
            onClick={handleRefill}
            className="relative w-full rounded-3xl bg-gradient-coral text-accent-foreground font-display font-black text-2xl shadow-coral active:scale-[0.98] transition-transform py-10 px-6 flex flex-col items-center gap-2"
            style={{ minHeight: "30vh" }}
            aria-label={`I just refilled ${activePet.name}'s bowl`}
          >
            <Droplets className="h-10 w-10" />
            I just refilled the bowl
            <span className="text-base font-bold opacity-90">{petFace} 💧</span>
          </button>
        </div>

        <button
          onClick={async () => {
            try { const w = await refreshWeather(); setWeather(w); toast.success("Weather refreshed"); }
            catch { toast.error("Couldn't get location"); }
          }}
          className="mt-4 mb-8 text-sm text-muted-foreground inline-flex items-center gap-1.5 tap-44 px-3"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Update weather
        </button>
      </main>
    </div>
  );
}
