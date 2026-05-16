import { useState } from "react";
import { useBB } from "@/lib/bb/store";
import { BOWL_ML } from "@/lib/bb/prediction";
import { refreshWeather } from "@/lib/bb/weather";
import { requestNotificationPermission } from "@/lib/bb/notifications";
import { Bone, Cat, PawPrint, Droplets, MapPin, Bell, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { PetType, PetSize, BowlSize } from "@/lib/bb/types";

const STEPS = 5;

export function Onboarding() {
  const { addPet, setOnboarded, setWeather, updateSettings } = useBB();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [type, setType] = useState<PetType>("dog");
  const [petSize, setPetSize] = useState<PetSize>("medium");
  const [bowlSize, setBowlSize] = useState<BowlSize>("medium");
  const [loading, setLoading] = useState(false);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    if (!name.trim()) { toast.error("Give your pet a name"); return; }
    addPet({
      name: name.trim(),
      type,
      size: petSize,
      bowlSize,
      bowlMl: BOWL_ML[bowlSize],
    });
    setOnboarded(true);
  };

  const askLocation = async () => {
    setLoading(true);
    try {
      const w = await refreshWeather();
      setWeather(w);
      toast.success("Got your local weather");
      next();
    } catch {
      toast.message("No worries — we'll use a typical estimate.");
      next();
    } finally { setLoading(false); }
  };

  const askNotifications = async () => {
    const ok = await requestNotificationPermission();
    updateSettings({ notificationsEnabled: ok });
    if (ok) toast.success("Reminders on");
    finish();
  };

  return (
    <div className="min-h-screen bg-gradient-sky flex flex-col">
      <header className="safe-top px-6 pb-2 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-water grid place-items-center shadow-water">
          <Droplets className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-xl">Bowl Buddy</span>
        <div className="ml-auto text-xs text-muted-foreground">{step + 1} / {STEPS}</div>
      </header>

      <div className="px-6 pt-2">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-water transition-all duration-500" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
        </div>
      </div>

      <main className="flex-1 px-6 pt-10 pb-8 flex flex-col">
        {step === 0 && (
          <div className="animate-float-up space-y-6">
            <h1 className="font-display text-4xl font-black leading-tight text-balance">
              What kind of buddy do you have?
            </h1>
            <p className="text-muted-foreground">We'll tune the bowl logic to fit.</p>
            <div className="grid grid-cols-3 gap-3 pt-4">
              {([
                { v: "dog", label: "Dog", Icon: Bone, emoji: "🐶" },
                { v: "cat", label: "Cat", Icon: Cat, emoji: "🐱" },
                { v: "other", label: "Other", Icon: PawPrint, emoji: "🐾" },
              ] as const).map(({ v, label, emoji }) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={`aspect-square rounded-3xl border-2 transition-all active:scale-95 grid place-items-center ${
                    type === v ? "border-primary bg-primary/10 shadow-water" : "border-border bg-card"
                  }`}
                >
                  <div className="text-5xl mb-1">{emoji}</div>
                  <div className="font-semibold">{label}</div>
                </button>
              ))}
            </div>
            <div className="pt-4">
              <label className="text-sm font-semibold mb-2 block">What's their name?</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === "cat" ? "e.g. Whiskers" : type === "dog" ? "e.g. Bella" : "e.g. Buddy"}
                className="w-full h-14 px-5 rounded-2xl bg-card border border-border text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-float-up space-y-6">
            <h1 className="font-display text-4xl font-black leading-tight text-balance">
              How big is {name || "your pet"}?
            </h1>
            <div className="space-y-3 pt-2">
              {([
                { v: "small", label: "Small", sub: "under 20 lbs" },
                { v: "medium", label: "Medium", sub: "20 – 60 lbs" },
                { v: "large", label: "Large", sub: "60+ lbs" },
              ] as const).map(({ v, label, sub }) => (
                <button
                  key={v}
                  onClick={() => setPetSize(v)}
                  className={`w-full p-5 rounded-3xl border-2 flex items-center gap-4 active:scale-[0.99] transition-all ${
                    petSize === v ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <div className="text-4xl">{v === "small" ? "🐾" : v === "medium" ? "🐕" : "🦮"}</div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-lg">{label}</div>
                    <div className="text-sm text-muted-foreground">{sub}</div>
                  </div>
                  {petSize === v && <Check className="h-6 w-6 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-float-up space-y-6">
            <h1 className="font-display text-4xl font-black leading-tight text-balance">
              And their bowl?
            </h1>
            <p className="text-muted-foreground">You can adjust this anytime.</p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {([
                { v: "small", label: "Small", emoji: "🥣", ml: 350 },
                { v: "medium", label: "Medium", emoji: "🍲", ml: 700 },
                { v: "large", label: "Large", emoji: "🥘", ml: 1400 },
              ] as const).map(({ v, label, emoji, ml }) => (
                <button
                  key={v}
                  onClick={() => setBowlSize(v)}
                  className={`aspect-square rounded-3xl border-2 grid place-items-center active:scale-95 ${
                    bowlSize === v ? "border-primary bg-primary/10 shadow-water" : "border-border bg-card"
                  }`}
                >
                  <div className="text-5xl mb-1">{emoji}</div>
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs text-muted-foreground">{ml} ml</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-float-up space-y-6 flex-1 flex flex-col">
            <div className="text-6xl">📍</div>
            <h1 className="font-display text-4xl font-black leading-tight text-balance">
              Use your local weather?
            </h1>
            <p className="text-muted-foreground text-lg">
              Warmer, drier air dries the bowl faster. We use your location only to fetch nearby
              temperature & humidity — never stored, never shared.
            </p>
            <div className="flex-1" />
            <button
              onClick={askLocation}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-water active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <MapPin className="h-5 w-5" />
              {loading ? "Getting weather…" : "Allow location"}
            </button>
            <button onClick={next} className="text-muted-foreground text-sm py-2">
              Skip — use a typical estimate
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-float-up space-y-6 flex-1 flex flex-col">
            <div className="text-6xl">🔔</div>
            <h1 className="font-display text-4xl font-black leading-tight text-balance">
              Send a friendly nudge when the bowl runs low?
            </h1>
            <p className="text-muted-foreground text-lg">
              We'll only ping when {name || "your buddy"} needs water — quiet between 10pm and 7am.
            </p>
            <div className="flex-1" />
            <button
              onClick={askNotifications}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-water active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Bell className="h-5 w-5" />
              Allow reminders
            </button>
            <button onClick={finish} className="text-muted-foreground text-sm py-2">
              Maybe later
            </button>
          </div>
        )}
      </main>

      <footer className="safe-bottom px-6 pb-4 flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="h-12 px-5 rounded-xl text-muted-foreground disabled:opacity-0 font-semibold"
        >
          Back
        </button>
        {step < 3 && (
          <button
            onClick={next}
            disabled={step === 0 && !name.trim()}
            className="h-12 px-6 rounded-2xl bg-foreground text-background font-bold shadow-elev disabled:opacity-40 flex items-center gap-1 active:scale-95"
          >
            Next <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </footer>
    </div>
  );
}
